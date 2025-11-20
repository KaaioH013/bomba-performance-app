import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import db from './db-sqlite.js';
import { verificarAutenticacao, login } from './auth.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares - Configurar CORS para produção
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://bomba-performance-app.vercel.app',
    'https://bomba-performance-app-*.vercel.app' // Preview deployments
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Função auxiliar para calcular potência consumida em CV
function calcularPotenciaCV(vazao, pressao, rotacao) {
  if (!vazao || !pressao || !rotacao) return null;
  const H = pressao * 10;
  const potencia = (vazao * H) / (270 * 0.65);
  return parseFloat(potencia.toFixed(3));
}

// Função auxiliar para calcular potência em kW
function calcularPotenciaKW(potenciaCV) {
  if (!potenciaCV) return null;
  return parseFloat((potenciaCV * 0.7457).toFixed(2));
}

// ROTAS

// Login (sem autenticação)
app.post('/api/login', (req, res) => {
  const { senha } = req.body;
  console.log(`🔐 Tentativa de login - Senha recebida: "${senha}"`);
  console.log(`🔐 Senha esperada: "${process.env.SENHA_ACESSO || 'bomba2025'}"`);
  
  if (login(senha)) {
    console.log('✅ Login bem-sucedido');
    res.json({ success: true, token: senha });
  } else {
    console.log('❌ Senha incorreta');
    res.status(401).json({ success: false, error: 'Senha incorreta' });
  }
});

// Download do banco de dados
app.get('/api/download-database', verificarAutenticacao, (req, res) => {
  try {
    const dbPath = join(__dirname, 'bomba_performance.db');
    const buffer = readFileSync(dbPath);
    const dataAtual = new Date().toISOString().split('T')[0];
    
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename=bomba_performance_${dataAtual}.db`);
    res.send(buffer);
  } catch (error) {
    console.error('Erro ao fazer download do banco:', error);
    res.status(500).json({ error: 'Erro ao fazer download do banco de dados' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'API funcionando' });
});

// Listar todos os testes (protegido)
app.get('/api/testes', verificarAutenticacao, (req, res) => {
  try {
    const { cliente, modelo, numero_serie, data_inicio, data_fim } = req.query;
    
    let query = 'SELECT * FROM testes_bomba WHERE 1=1';
    const params = [];
    
    if (cliente) {
      query += ` AND cliente LIKE ?`;
      params.push(`%${cliente}%`);
    }
    
    if (modelo) {
      query += ` AND modelo LIKE ?`;
      params.push(`%${modelo}%`);
    }
    
    if (numero_serie) {
      query += ` AND numero_serie LIKE ?`;
      params.push(`%${numero_serie}%`);
    }
    
    if (data_inicio) {
      query += ` AND date(data) >= date(?)`;
      params.push(data_inicio);
    }
    
    if (data_fim) {
      query += ` AND date(data) <= date(?)`;
      params.push(data_fim);
    }
    
    query += ' ORDER BY data DESC, rpb DESC';
    
    const stmt = db.prepare(query);
    const testes = stmt.all(...params);
    res.json(testes);
  } catch (error) {
    console.error('Erro ao buscar testes:', error);
    res.status(500).json({ error: 'Erro ao buscar testes' });
  }
});

// Buscar teste por ID
app.get('/api/testes/:id', verificarAutenticacao, (req, res) => {
  try {
    const { id } = req.params;
    const stmt = db.prepare('SELECT * FROM testes_bomba WHERE id = ?');
    const teste = stmt.get(id);
    
    if (!teste) {
      return res.status(404).json({ error: 'Teste não encontrado' });
    }
    
    res.json(teste);
  } catch (error) {
    console.error('Erro ao buscar teste:', error);
    res.status(500).json({ error: 'Erro ao buscar teste' });
  }
});

// Buscar próximo número RPB disponível
app.get('/api/testes/proximo-rpb', verificarAutenticacao, (req, res) => {
  try {
    const result = db.prepare('SELECT COALESCE(MAX(rpb), 0) + 1 as proximo_rpb FROM testes_bomba').get();
    const proximoRPB = result ? result.proximo_rpb : 1;
    console.log(`📊 Próximo RPB solicitado: ${proximoRPB}`);
    res.json({ proximo_rpb: proximoRPB });
  } catch (error) {
    console.error('Erro ao buscar próximo RPB:', error);
    res.status(500).json({ error: 'Erro ao buscar próximo RPB' });
  }
});

// Criar novo teste (protegido)
app.post('/api/testes', verificarAutenticacao, (req, res) => {
  try {
    const dados = req.body;
    
    // Se não vier RPB, gerar automaticamente
    if (!dados.rpb) {
      const result = db.prepare('SELECT COALESCE(MAX(rpb), 0) + 1 as proximo_rpb FROM testes_bomba').get();
      dados.rpb = result ? result.proximo_rpb : 1;
      console.log(`🔢 RPB gerado automaticamente: ${dados.rpb}`);
    }
    
    // Calcular potências automaticamente se não fornecidas
    for (let i = 1; i <= 5; i++) {
      const vazaoKey = `vazao_0${i}`;
      const pressaoKey = `pressao_0${i}`;
      const potenciaKey = `potencia_consumida_0${i}`;
      
      if (dados[vazaoKey] && dados[pressaoKey] && dados.rotacao && !dados[potenciaKey]) {
        dados[potenciaKey] = calcularPotenciaCV(dados[vazaoKey], dados[pressaoKey], dados.rotacao);
      }
    }
    
    const stmt = db.prepare(`
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
        resultado, observacoes, preenchido_por
      ) VALUES (
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?
      )
    `);
    
    const info = stmt.run(
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
      dados.resultado, dados.observacoes, dados.preenchido_por
    );
    
    const novoTeste = db.prepare('SELECT * FROM testes_bomba WHERE id = ?').get(info.lastInsertRowid);
    res.status(201).json(novoTeste);
  } catch (error) {
    console.error('Erro ao criar teste:', error);
    if (error.message.includes('UNIQUE constraint failed')) {
      res.status(400).json({ error: 'RPB já existe' });
    } else {
      res.status(500).json({ error: 'Erro ao criar teste' });
    }
  }
});

// Atualizar teste (protegido)
app.put('/api/testes/:id', verificarAutenticacao, (req, res) => {
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
    
    const stmt = db.prepare(`
      UPDATE testes_bomba SET
        rpb = ?, data = ?, op_of = ?, cliente = ?, modelo = ?,
        rcd_rotor = ?, tipo_rotor = ?, rcd_estator = ?, tipo_estator = ?, elastomero = ?,
        n_proposta = ?, corrente_nominal = ?, tensao_rede = ?, rotacao = ?,
        vazao_01 = ?, vazao_02 = ?, vazao_03 = ?, vazao_04 = ?, vazao_05 = ?,
        pressao_01 = ?, pressao_02 = ?, pressao_03 = ?, pressao_04 = ?, pressao_05 = ?,
        potencia_consumida_01 = ?, potencia_consumida_02 = ?, potencia_consumida_03 = ?, potencia_consumida_04 = ?, potencia_consumida_05 = ?,
        corrente_01 = ?, corrente_02 = ?, corrente_03 = ?, corrente_04 = ?, corrente_05 = ?,
        tensao = ?, rotacao_suc = ?, pressao_descarga_suc = ?, pressao_succao_suc = ?, vazao_suc = ?, corrente_suc = ?, tensao_suc = ?,
        numero_serie = ?, vazao_nominal = ?, pressao_nominal = ?, rpm_nominal = ?, potencia_instalada = ?,
        motoredutor = ?, motor = ?, redutor = ?,
        tacometro = ?, wattimetro = ?, manometro = ?, medidor_vazao = ?, rotametro = ?,
        resultado = ?, observacoes = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    
    const info = stmt.run(
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
    );
    
    if (info.changes === 0) {
      return res.status(404).json({ error: 'Teste não encontrado' });
    }
    
    const testeAtualizado = db.prepare('SELECT * FROM testes_bomba WHERE id = ?').get(id);
    res.json(testeAtualizado);
  } catch (error) {
    console.error('Erro ao atualizar teste:', error);
    res.status(500).json({ error: 'Erro ao atualizar teste' });
  }
});

// Deletar teste (protegido)
app.delete('/api/testes/:id', verificarAutenticacao, (req, res) => {
  try {
    const { id } = req.params;
    const stmt = db.prepare('DELETE FROM testes_bomba WHERE id = ?');
    const info = stmt.run(id);
    
    if (info.changes === 0) {
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
app.listen(PORT, () => {
  console.log(`\n🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📡 API disponível em http://localhost:${PORT}/api`);
  console.log(`💚 Health check: http://localhost:${PORT}/api/health`);
  console.log(`💾 Banco de dados: SQLite (bomba_performance.db)\n`);
});
