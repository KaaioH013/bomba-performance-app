-- Criação do banco de dados para Sistema de Performance de Bombas

CREATE TABLE IF NOT EXISTS testes_bomba (
    id SERIAL PRIMARY KEY,
    rpb INTEGER NOT NULL UNIQUE,
    data DATE NOT NULL,
    op_of VARCHAR(50),
    cliente VARCHAR(255),
    modelo VARCHAR(100),
    
    -- Dados do Rotor
    rcd_rotor VARCHAR(50),
    tipo_rotor VARCHAR(50),
    
    -- Dados do Estator
    rcd_estator VARCHAR(50),
    tipo_estator VARCHAR(50),
    elastomero VARCHAR(50),
    
    -- Dados Elétricos
    n_proposta VARCHAR(100),
    corrente_nominal DECIMAL(10,2),
    tensao_rede DECIMAL(10,2),
    
    -- Dados de Performance
    rotacao DECIMAL(10,2),
    
    -- Pontos de Teste (até 5 pontos)
    vazao_01 DECIMAL(10,2),
    vazao_02 DECIMAL(10,2),
    vazao_03 DECIMAL(10,2),
    vazao_04 DECIMAL(10,2),
    vazao_05 DECIMAL(10,2),
    
    pressao_01 DECIMAL(10,2),
    pressao_02 DECIMAL(10,2),
    pressao_03 DECIMAL(10,2),
    pressao_04 DECIMAL(10,2),
    pressao_05 DECIMAL(10,2),
    
    potencia_consumida_01 DECIMAL(10,3),
    potencia_consumida_02 DECIMAL(10,3),
    potencia_consumida_03 DECIMAL(10,3),
    potencia_consumida_04 DECIMAL(10,3),
    potencia_consumida_05 DECIMAL(10,3),
    
    corrente_01 DECIMAL(10,2),
    corrente_02 DECIMAL(10,2),
    corrente_03 DECIMAL(10,2),
    corrente_04 DECIMAL(10,2),
    corrente_05 DECIMAL(10,2),
    
    tensao DECIMAL(10,2),
    
    -- Teste com Sucção
    rotacao_suc DECIMAL(10,2),
    pressao_descarga_suc DECIMAL(10,2),
    pressao_succao_suc DECIMAL(10,2),
    vazao_suc DECIMAL(10,2),
    corrente_suc DECIMAL(10,2),
    tensao_suc DECIMAL(10,2),
    
    -- Dados da Plaqueta
    numero_serie VARCHAR(50),
    vazao_nominal DECIMAL(10,2),
    pressao_nominal DECIMAL(10,2),
    rpm_nominal DECIMAL(10,2),
    potencia_instalada DECIMAL(10,3),
    motoredutor VARCHAR(100),
    motor VARCHAR(100),
    redutor VARCHAR(100),
    
    -- Instrumentos
    tacometro VARCHAR(50),
    wattimetro VARCHAR(50),
    manometro VARCHAR(50),
    medidor_vazao VARCHAR(50),
    rotametro VARCHAR(50),
    
    -- Status e Observações
    resultado VARCHAR(20), -- 'Aprovado' ou 'Reprovado'
    observacoes TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para melhorar performance de busca
CREATE INDEX idx_testes_rpb ON testes_bomba(rpb);
CREATE INDEX idx_testes_cliente ON testes_bomba(cliente);
CREATE INDEX idx_testes_data ON testes_bomba(data);
CREATE INDEX idx_testes_modelo ON testes_bomba(modelo);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_testes_bomba_updated_at BEFORE UPDATE
    ON testes_bomba FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
