import initSqlJs from 'sql.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, writeFileSync, existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dbPath = join(__dirname, 'bomba_performance.db');

// Inicializar SQL.js
const SQL = await initSqlJs();

// Carregar ou criar banco de dados
let db;
if (existsSync(dbPath)) {
  const buffer = readFileSync(dbPath);
  db = new SQL.Database(buffer);
  console.log('✓ Banco de dados SQLite carregado');
} else {
  db = new SQL.Database();
  console.log('✓ Novo banco de dados SQLite criado');
}

// Salvar banco de dados em arquivo
function saveDatabase() {
  const data = db.export();
  const buffer = Buffer.from(data);
  writeFileSync(dbPath, buffer);
}

// Criar tabela se não existir
db.exec(`
  CREATE TABLE IF NOT EXISTS testes_bomba (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
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
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_testes_rpb ON testes_bomba(rpb);
  CREATE INDEX IF NOT EXISTS idx_testes_cliente ON testes_bomba(cliente);
  CREATE INDEX IF NOT EXISTS idx_testes_data ON testes_bomba(data);
  CREATE INDEX IF NOT EXISTS idx_testes_modelo ON testes_bomba(modelo);
`);

saveDatabase();
console.log('✓ Banco de dados SQLite inicializado');

// Wrapper para executar queries e salvar automaticamente
const dbWrapper = {
  exec: (sql) => {
    const result = db.exec(sql);
    saveDatabase();
    return result;
  },
  prepare: (sql) => {
    const preparedSql = sql;
    return {
      all: (...params) => {
        const stmt = db.prepare(preparedSql);
        if (params.length > 0) {
          stmt.bind(params);
        }
        const rows = [];
        while (stmt.step()) {
          rows.push(stmt.getAsObject());
        }
        stmt.free();
        return rows;
      },
      get: (...params) => {
        const stmt = db.prepare(preparedSql);
        if (params.length > 0) {
          stmt.bind(params);
        }
        const row = stmt.step() ? stmt.getAsObject() : null;
        stmt.free();
        return row;
      },
      run: (...params) => {
        const stmt = db.prepare(preparedSql);
        if (params.length > 0) {
          stmt.bind(params);
        }
        stmt.step();
        const changes = db.getRowsModified();
        const lastInsertRowid = db.exec("SELECT last_insert_rowid() as id")[0]?.values[0][0] || 0;
        stmt.free();
        saveDatabase();
        return { changes, lastInsertRowid };
      }
    };
  }
};

export default dbWrapper;
