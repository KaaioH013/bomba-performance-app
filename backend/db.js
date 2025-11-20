import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Criar tabela se não existir
const initDB = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS testes_bomba (
        id SERIAL PRIMARY KEY,
        rpb INTEGER NOT NULL UNIQUE,
        data DATE NOT NULL,
        op_of TEXT,
        cliente TEXT,
        modelo TEXT,
        rcd_rotor TEXT,
        tipo_rotor TEXT,
        rcd_estator TEXT,
        tipo_estator TEXT,
        elastomero TEXT,
        n_proposta TEXT,
        corrente_nominal REAL,
        tensao_rede REAL,
        rotacao REAL,
        vazao_01 REAL,
        vazao_02 REAL,
        vazao_03 REAL,
        vazao_04 REAL,
        vazao_05 REAL,
        pressao_01 REAL,
        pressao_02 REAL,
        pressao_03 REAL,
        pressao_04 REAL,
        pressao_05 REAL,
        potencia_consumida_01 REAL,
        potencia_consumida_02 REAL,
        potencia_consumida_03 REAL,
        potencia_consumida_04 REAL,
        potencia_consumida_05 REAL,
        corrente_01 REAL,
        corrente_02 REAL,
        corrente_03 REAL,
        corrente_04 REAL,
        corrente_05 REAL,
        tensao REAL,
        rotacao_suc REAL,
        pressao_descarga_suc REAL,
        pressao_succao_suc REAL,
        vazao_suc REAL,
        corrente_suc REAL,
        tensao_suc REAL,
        numero_serie TEXT,
        vazao_nominal REAL,
        pressao_nominal REAL,
        rpm_nominal REAL,
        potencia_instalada REAL,
        motoredutor TEXT,
        motor TEXT,
        redutor TEXT,
        tacometro TEXT,
        wattimetro TEXT,
        manometro TEXT,
        medidor_vazao TEXT,
        rotametro TEXT,
        resultado TEXT,
        observacoes TEXT,
        preenchido_por TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_testes_rpb ON testes_bomba(rpb);
      CREATE INDEX IF NOT EXISTS idx_testes_cliente ON testes_bomba(cliente);
      CREATE INDEX IF NOT EXISTS idx_testes_data ON testes_bomba(data);
      CREATE INDEX IF NOT EXISTS idx_testes_modelo ON testes_bomba(modelo);
    `);
    console.log('✓ Banco de dados PostgreSQL inicializado');
  } catch (error) {
    console.error('Erro ao inicializar banco:', error);
    throw error;
  }
};

pool.on('connect', () => {
  console.log('✓ Conectado ao banco de dados PostgreSQL');
});

pool.on('error', (err) => {
  console.error('Erro inesperado no cliente do banco de dados', err);
  process.exit(-1);
});

initDB();

export default pool;
