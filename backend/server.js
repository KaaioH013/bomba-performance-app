import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './db.js';
import { verificarAutenticacao, login } from './auth.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares - Configurar CORS para produção
app.use(cors({
  origin: function(origin, callback) {
    // Permitir requisições sem origin (mobile apps, curl, etc)
    if (!origin) return callback(null, true);
    
    // Permitir localhost e todos os domínios do Vercel
    const allowedOrigins = [
      'http://localhost:5173',
      'https://bomba-performance-app.vercel.app'
    ];
    
    // Permitir qualquer subdomínio do Vercel
    if (origin.includes('.vercel.app') || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Função auxiliar para calcular potência consumida em CV
function calcularPotenciaCV(vazao, pressao, rotacao) {
  if (!vazao || !pressao || !rotacao) return null;
  // Fórmula simplificada: P(CV) = (Q * H * γ) / (270 * η)
  // onde Q = vazão (m³/h), H = pressão (mca), γ = peso específico (1000 kg/m³ para água)
  // η = eficiência (assumindo 0.65 como exemplo)
  const H = pressao * 10; // converter kgf/cm² para mca
  const potencia = (vazao * H) / (270 * 0.65);
  return parseFloat(potencia.toFixed(3));
}

// Função auxiliar para calcular potência em kW
function calcularPotenciaKW(potenciaCV) {
  if (!potenciaCV) return null;
  return parseFloat((potenciaCV * 0.7457).toFixed(2));
}

// Testar conexão com o banco ao iniciar
async function testarConexao() {
  try {
    const result = await pool.query('SELECT NOW()');
    console.log('✓ Conectado ao banco de dados PostgreSQL');
    console.log('✓ Hora do servidor de banco:', result.rows[0].now);
  } catch (error) {
    console.error('✗ Erro ao conectar ao banco de dados:');
    console.error('  Mensagem:', error.message);
    console.error('  Verifique se o PostgreSQL está rodando e as credenciais em .env estão corretas');
  }
}

// ROTAS

// Login (sem autenticação)
app.post('/api/login', login);

// Rota para limpar banco de dados (protegida)
app.delete('/api/reset-database', verificarAutenticacao, async (req, res) => {
  try {
    await pool.query('DELETE FROM testes_bomba');
    res.json({ success: true, message: 'Banco de dados limpo com sucesso' });
  } catch (error) {
    console.error('Erro ao limpar banco:', error);
    res.status(500).json({ error: 'Erro ao limpar banco de dados' });
  }
});

// Rota para download do backup (protegida)
app.get('/api/download-database', verificarAutenticacao, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM testes_bomba ORDER BY id');
    const dados = result.rows;
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=backup_${new Date().toISOString().split('T')[0]}.json`);
    res.json(dados);
  } catch (error) {
    console.error('Erro ao fazer backup:', error);
    res.status(500).json({ error: 'Erro ao gerar backup' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'API funcionando' });
});

// Listar todos os testes (protegido)
app.get('/api/testes', verificarAutenticacao, async (req, res) => {
  try {
    const { cliente, modelo, numero_serie, data_inicio, data_fim } = req.query;
    
    let query = 'SELECT * FROM testes_bomba WHERE 1=1';
    const params = [];
    let paramCount = 1;
    
    if (cliente) {
      query += ` AND cliente ILIKE $${paramCount}`;
      params.push(`%${cliente}%`);
      paramCount++;
    }
    
    if (modelo) {
      query += ` AND modelo ILIKE $${paramCount}`;
      params.push(`%${modelo}%`);
      paramCount++;
    }
    
    if (numero_serie) {
      query += ` AND numero_serie ILIKE $${paramCount}`;
      params.push(`%${numero_serie}%`);
      paramCount++;
    }
    
    if (data_inicio) {
      query += ` AND data >= $${paramCount}`;
      params.push(data_inicio);
      paramCount++;
    }
    
    if (data_fim) {
      query += ` AND data <= $${paramCount}`;
      params.push(data_fim);
      paramCount++;
    }
    
    query += ' ORDER BY data DESC, rpb DESC';
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar testes:', error);
    res.status(500).json({ error: 'Erro ao buscar testes' });
  }
});

// Buscar próximo número RPB disponível (protegido) - DEVE VIR ANTES de /:id
app.get('/api/testes/proximo-rpb', verificarAutenticacao, async (req, res) => {
  try {
    const result = await pool.query('SELECT COALESCE(MAX(rpb), 0) + 1 as proximo_rpb FROM testes_bomba');
    const proximoRPB = result.rows[0].proximo_rpb;
    console.log(`📊 Próximo RPB solicitado: ${proximoRPB}`);
    res.json({ proximoRPB: proximoRPB });
  } catch (error) {
    console.error('Erro ao buscar próximo RPB:', error);
    res.status(500).json({ error: 'Erro ao buscar próximo RPB' });
  }
});

// Buscar teste por ID (protegido)
app.get('/api/testes/:id', verificarAutenticacao, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM testes_bomba WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Teste não encontrado' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar teste:', error);
    res.status(500).json({ error: 'Erro ao buscar teste' });
  }
});

// Criar novo teste (protegido)
app.post('/api/testes', verificarAutenticacao, async (req, res) => {
  try {
    const dados = req.body;
    
    // Calcular potências automaticamente se não fornecidas
    for (let i = 1; i <= 5; i++) {
      const vazaoKey = `vazao_0${i}`;
      const pressaoKey = `pressao_0${i}`;
      const potenciaKey = `potencia_consumida_0${i}`;
      
      if (dados[vazaoKey] && dados[pressaoKey] && dados.rotacao && !dados[potenciaKey]) {
        dados[potenciaKey] = calcularPotenciaCV(dados[vazaoKey], dados[pressaoKey], dados.rotacao);
      }
    }
    
    const query = `
      INSERT INTO testes_bomba (
        rpb, data, op_of, cliente, modelo,
        rcd_rotor, tipo_rotor, rcd_estator, tipo_estator, elastomero,
        n_proposta, corrente_nominal, tensao_rede, rotacao,
        vazao_01, vazao_02, vazao_03, vazao_04, vazao_05,
        pressao_01, pressao_02, pressao_03, pressao_04, pressao_05,
        potencia_consumida_01, potencia_consumida_02, potencia_consumida_03, potencia_consumida_04, potencia_consumida_05,
        corrente_01, corrente_02, corrente_03, corrente_04, corrente_05,
        tensao, rotacao_suc, pressao_descarga_suc, pressao_succao_suc, vazao_suc, corrente_suc, tensao_suc,
        numero_serie, vazao_nominal, pressao_nominal, rpm_nominal, potencia_instalada,
        motoredutor, motor, redutor,
        tacometro, wattimetro, manometro, medidor_vazao, rotametro,
        resultado, observacoes
      ) VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, $8, $9, $10,
        $11, $12, $13, $14,
        $15, $16, $17, $18, $19,
        $20, $21, $22, $23, $24,
        $25, $26, $27, $28, $29,
        $30, $31, $32, $33, $34,
        $35, $36, $37, $38, $39, $40, $41,
        $42, $43, $44, $45, $46,
        $47, $48, $49,
        $50, $51, $52, $53, $54,
        $55, $56
      ) RETURNING *
    `;
    
    const values = [
      dados.rpb, dados.data, dados.op_of, dados.cliente, dados.modelo,
      dados.rcd_rotor, dados.tipo_rotor, dados.rcd_estator, dados.tipo_estator, dados.elastomero,
      dados.n_proposta, dados.corrente_nominal, dados.tensao_rede, dados.rotacao,
      dados.vazao_01, dados.vazao_02, dados.vazao_03, dados.vazao_04, dados.vazao_05,
      dados.pressao_01, dados.pressao_02, dados.pressao_03, dados.pressao_04, dados.pressao_05,
      dados.potencia_consumida_01, dados.potencia_consumida_02, dados.potencia_consumida_03, dados.potencia_consumida_04, dados.potencia_consumida_05,
      dados.corrente_01, dados.corrente_02, dados.corrente_03, dados.corrente_04, dados.corrente_05,
      dados.tensao, dados.rotacao_suc, dados.pressao_descarga_suc, dados.pressao_succao_suc, dados.vazao_suc, dados.corrente_suc, dados.tensao_suc,
      dados.numero_serie, dados.vazao_nominal, dados.pressao_nominal, dados.rpm_nominal, dados.potencia_instalada,
      dados.motoredutor, dados.motor, dados.redutor,
      dados.tacometro, dados.wattimetro, dados.manometro, dados.medidor_vazao, dados.rotametro,
      dados.resultado, dados.observacoes
    ];
    
    const result = await pool.query(query, values);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar teste:', error);
    if (error.code === '23505') { // Unique violation
      res.status(400).json({ error: 'RPB já existe' });
    } else {
      res.status(500).json({ error: 'Erro ao criar teste' });
    }
  }
});

// Atualizar teste (protegido)
app.put('/api/testes/:id', verificarAutenticacao, async (req, res) => {
  try {
    const { id } = req.params;
    const dados = req.body;
    
    // Calcular potências automaticamente se não fornecidas
    for (let i = 1; i <= 5; i++) {
      const vazaoKey = `vazao_0${i}`;
      const pressaoKey = `pressao_0${i}`;
      const potenciaKey = `potencia_consumida_0${i}`;
      
      if (dados[vazaoKey] && dados[pressaoKey] && dados.rotacao && !dados[potenciaKey]) {
        dados[potenciaKey] = calcularPotenciaCV(dados[vazaoKey], dados[pressaoKey], dados.rotacao);
      }
    }
    
    const query = `
      UPDATE testes_bomba SET
        rpb = $1, data = $2, op_of = $3, cliente = $4, modelo = $5,
        rcd_rotor = $6, tipo_rotor = $7, rcd_estator = $8, tipo_estator = $9, elastomero = $10,
        n_proposta = $11, corrente_nominal = $12, tensao_rede = $13, rotacao = $14,
        vazao_01 = $15, vazao_02 = $16, vazao_03 = $17, vazao_04 = $18, vazao_05 = $19,
        pressao_01 = $20, pressao_02 = $21, pressao_03 = $22, pressao_04 = $23, pressao_05 = $24,
        potencia_consumida_01 = $25, potencia_consumida_02 = $26, potencia_consumida_03 = $27, potencia_consumida_04 = $28, potencia_consumida_05 = $29,
        corrente_01 = $30, corrente_02 = $31, corrente_03 = $32, corrente_04 = $33, corrente_05 = $34,
        tensao = $35, rotacao_suc = $36, pressao_descarga_suc = $37, pressao_succao_suc = $38, vazao_suc = $39, corrente_suc = $40, tensao_suc = $41,
        numero_serie = $42, vazao_nominal = $43, pressao_nominal = $44, rpm_nominal = $45, potencia_instalada = $46,
        motoredutor = $47, motor = $48, redutor = $49,
        tacometro = $50, wattimetro = $51, manometro = $52, medidor_vazao = $53, rotametro = $54,
        resultado = $55, observacoes = $56
      WHERE id = $57
      RETURNING *
    `;
    
    const values = [
      dados.rpb, dados.data, dados.op_of, dados.cliente, dados.modelo,
      dados.rcd_rotor, dados.tipo_rotor, dados.rcd_estator, dados.tipo_estator, dados.elastomero,
      dados.n_proposta, dados.corrente_nominal, dados.tensao_rede, dados.rotacao,
      dados.vazao_01, dados.vazao_02, dados.vazao_03, dados.vazao_04, dados.vazao_05,
      dados.pressao_01, dados.pressao_02, dados.pressao_03, dados.pressao_04, dados.pressao_05,
      dados.potencia_consumida_01, dados.potencia_consumida_02, dados.potencia_consumida_03, dados.potencia_consumida_04, dados.potencia_consumida_05,
      dados.corrente_01, dados.corrente_02, dados.corrente_03, dados.corrente_04, dados.corrente_05,
      dados.tensao, dados.rotacao_suc, dados.pressao_descarga_suc, dados.pressao_succao_suc, dados.vazao_suc, dados.corrente_suc, dados.tensao_suc,
      dados.numero_serie, dados.vazao_nominal, dados.pressao_nominal, dados.rpm_nominal, dados.potencia_instalada,
      dados.motoredutor, dados.motor, dados.redutor,
      dados.tacometro, dados.wattimetro, dados.manometro, dados.medidor_vazao, dados.rotametro,
      dados.resultado, dados.observacoes,
      id
    ];
    
    const result = await pool.query(query, values);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Teste não encontrado' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar teste:', error);
    res.status(500).json({ error: 'Erro ao atualizar teste' });
  }
});

// Deletar teste (protegido)
app.delete('/api/testes/:id', verificarAutenticacao, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM testes_bomba WHERE id = $1 RETURNING id', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Teste não encontrado' });
    }
    
    res.json({ message: 'Teste deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar teste:', error);
    res.status(500).json({ error: 'Erro ao deletar teste' });
  }
});

// Calcular potência (endpoint auxiliar)
app.post('/api/calcular-potencia', (req, res) => {
  try {
    const { vazao, pressao, rotacao } = req.body;
    
    if (!vazao || !pressao || !rotacao) {
      return res.status(400).json({ error: 'Vazão, pressão e rotação são obrigatórios' });
    }
    
    const potenciaCV = calcularPotenciaCV(vazao, pressao, rotacao);
    const potenciaKW = calcularPotenciaKW(potenciaCV);
    
    res.json({
      potencia_cv: potenciaCV,
      potencia_kw: potenciaKW
    });
  } catch (error) {
    console.error('Erro ao calcular potência:', error);
    res.status(500).json({ error: 'Erro ao calcular potência' });
  }
});

// Iniciar servidor
app.listen(PORT, async () => {
  console.log(`\n🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📡 API disponível em http://localhost:${PORT}/api`);
  console.log(`💚 Health check: http://localhost:${PORT}/api/health\n`);
  
  // Testar conexão com banco de dados
  await testarConexao();
});
