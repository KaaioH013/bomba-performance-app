import React, { useState, useEffect } from 'react';
import GraficoCurvaPerformance from './GraficoCurvaPerformance';

export default function TesteForm({ onSubmit, dadosIniciais = {}, proximoRPB, onCancel }) {
  const [mostrarPrevia, setMostrarPrevia] = useState(false);
  const [dados, setDados] = useState({
    rpb: '',
    data: new Date().toISOString().split('T')[0],
    op_of: '',
    cliente: '',
    modelo: '',
    rcd_rotor: '',
    tipo_rotor: '',
    rcd_estator: '',
    tipo_estator: '',
    elastomero: '',
    n_proposta: '',
    corrente_nominal: '',
    tensao_rede: '',
    rotacao: '',
    vazao_01: '',
    vazao_02: '',
    vazao_03: '',
    vazao_04: '',
    vazao_05: '',
    pressao_01: '',
    pressao_02: '',
    pressao_03: '',
    pressao_04: '',
    pressao_05: '',
    potencia_consumida_01: '',
    potencia_consumida_02: '',
    potencia_consumida_03: '',
    potencia_consumida_04: '',
    potencia_consumida_05: '',
    corrente_01: '',
    corrente_02: '',
    corrente_03: '',
    corrente_04: '',
    corrente_05: '',
    tensao: '',
    rotacao_suc: '',
    pressao_descarga_suc: '',
    pressao_succao_suc: '',
    vazao_suc: '',
    corrente_suc: '',
    tensao_suc: '',
    numero_serie: '',
    vazao_nominal: '',
    pressao_nominal: '',
    rpm_nominal: '',
    potencia_instalada: '',
    motoredutor: '',
    motor: '',
    redutor: '',
    tacometro: '',
    wattimetro: '',
    manometro: '',
    medidor_vazao: '',
    rotametro: '',
    resultado: '',
    observacoes: '',
    ...dadosIniciais
  });

  useEffect(() => {
    // Para edição, usar o RPB dos dados iniciais
    if (dadosIniciais.id && dadosIniciais.rpb) {
      setDados(prev => ({ ...prev, rpb: dadosIniciais.rpb }));
    }
  }, [dadosIniciais.id, dadosIniciais.rpb]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDados(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validações básicas
    // RPB será gerado automaticamente pelo backend para novos testes
    if (dadosIniciais.id && !dados.rpb) {
      alert('RPB é obrigatório');
      return;
    }
    if (!dados.data) {
      alert('Data é obrigatória');
      return;
    }
    
    // Converter strings vazias para null
    const dadosLimpos = {};
    Object.keys(dados).forEach(key => {
      const value = dados[key];
      dadosLimpos[key] = value === '' ? null : value;
    });
    
    onSubmit(dadosLimpos);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Informações Gerais */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4 text-blue-600">Informações Gerais</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              RPB <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="rpb"
              value={dados.rpb || 'Será gerado automaticamente'}
              className="input-field bg-gray-100 cursor-not-allowed"
              readOnly
              disabled
              title="Número gerado automaticamente (sequencial)"
            />
            <p className="text-xs text-gray-500 mt-1">🔒 Gerado automaticamente ao salvar</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="data"
              value={dados.data}
              onChange={handleChange}
              className="input-field"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              OP/OF
            </label>
            <input
              type="text"
              name="op_of"
              value={dados.op_of}
              onChange={handleChange}
              className="input-field"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cliente
            </label>
            <input
              type="text"
              name="cliente"
              value={dados.cliente}
              onChange={handleChange}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              N° Proposta
            </label>
            <input
              type="text"
              name="n_proposta"
              value={dados.n_proposta}
              onChange={handleChange}
              className="input-field"
            />
          </div>
        </div>
      </div>

      {/* Dados da Bomba */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4 text-blue-600">Dados da Bomba</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Modelo
            </label>
            <input
              type="text"
              name="modelo"
              value={dados.modelo}
              onChange={handleChange}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              RCD Rotor
            </label>
            <input
              type="text"
              name="rcd_rotor"
              value={dados.rcd_rotor}
              onChange={handleChange}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo Rotor
            </label>
            <input
              type="text"
              name="tipo_rotor"
              value={dados.tipo_rotor}
              onChange={handleChange}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              RCD Estator
            </label>
            <input
              type="text"
              name="rcd_estator"
              value={dados.rcd_estator}
              onChange={handleChange}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo Estator
            </label>
            <input
              type="text"
              name="tipo_estator"
              value={dados.tipo_estator}
              onChange={handleChange}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Elastômero
            </label>
            <input
              type="text"
              name="elastomero"
              value={dados.elastomero}
              onChange={handleChange}
              className="input-field"
            />
          </div>
        </div>
      </div>

      {/* Dados Elétricos */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4 text-blue-600">Dados Elétricos</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Corrente Nominal (A)
            </label>
            <input
              type="number"
              step="0.01"
              name="corrente_nominal"
              value={dados.corrente_nominal}
              onChange={handleChange}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tensão da Rede (V)
            </label>
            <input
              type="number"
              step="0.01"
              name="tensao_rede"
              value={dados.tensao_rede}
              onChange={handleChange}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rotação (RPM)
            </label>
            <input
              type="number"
              step="0.01"
              name="rotacao"
              value={dados.rotacao}
              onChange={handleChange}
              className="input-field"
            />
          </div>
        </div>
      </div>

      {/* Pontos de Teste */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4 text-blue-600">Pontos Avaliados</h2>
        <p className="text-sm text-gray-600 mb-4">Preencha até 5 pontos de teste</p>
        
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="mb-4 pb-4 border-b border-gray-200 last:border-b-0">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Ponto {i}</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Vazão (m³/h)
                </label>
                <input
                  type="number"
                  step="0.01"
                  name={`vazao_0${i}`}
                  value={dados[`vazao_0${i}`]}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Pressão (Kgf/cm²)
                </label>
                <input
                  type="number"
                  step="0.01"
                  name={`pressao_0${i}`}
                  value={dados[`pressao_0${i}`]}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Corrente (A)
                </label>
                <input
                  type="number"
                  step="0.01"
                  name={`corrente_0${i}`}
                  value={dados[`corrente_0${i}`]}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Pot. Cons. (CV)
                </label>
                <input
                  type="number"
                  step="0.001"
                  name={`potencia_consumida_0${i}`}
                  value={dados[`potencia_consumida_0${i}`]}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Auto"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Tensão (V)
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="tensao"
                  value={dados.tensao}
                  onChange={handleChange}
                  className="input-field"
                  disabled={i > 1}
                />
              </div>
            </div>
          </div>
        ))}
        
        {/* Botão de Prévia */}
        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={() => setMostrarPrevia(!mostrarPrevia)}
            className="btn-secondary"
          >
            {mostrarPrevia ? '🔼 Ocultar Prévia dos Gráficos' : '📊 Ver Prévia dos Gráficos'}
          </button>
        </div>
        
        {/* Prévia dos Gráficos */}
        {mostrarPrevia && (() => {
          const dadosGrafico = [];
          for (let i = 1; i <= 5; i++) {
            const vazao = dados[`vazao_0${i}`];
            const pressao = dados[`pressao_0${i}`];
            const corrente = dados[`corrente_0${i}`];
            const potencia = dados[`potencia_consumida_0${i}`];
            
            if (vazao) {
              dadosGrafico.push({
                ponto: i,
                vazao: parseFloat(vazao),
                pressao: parseFloat(pressao || 0),
                corrente: parseFloat(corrente || 0),
                potencia: parseFloat(potencia || 0),
              });
            }
          }
          
          return dadosGrafico.length > 0 ? (
            <div className="mt-6 p-6 bg-blue-50 rounded-lg border-2 border-blue-200">
              <h3 className="text-lg font-semibold mb-4 text-blue-800">📊 Prévia das Curvas de Performance</h3>
              <GraficoCurvaPerformance dados={dadosGrafico} />
              <p className="text-sm text-blue-700 mt-4 text-center">
                ℹ️ Analise os gráficos acima para definir se o teste será Aprovado ou Reprovado
              </p>
            </div>
          ) : (
            <div className="mt-6 p-6 bg-gray-50 rounded-lg border border-gray-200 text-center text-gray-500">
              Preencha pelo menos um ponto de teste para ver a prévia dos gráficos
            </div>
          );
        })()}
      </div>

      {/* Teste com Sucção */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4 text-blue-600">Teste com Sucção (Opcional)</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rotação (RPM)
            </label>
            <input
              type="number"
              step="0.01"
              name="rotacao_suc"
              value={dados.rotacao_suc}
              onChange={handleChange}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pressão Descarga (Kgf/cm²)
            </label>
            <input
              type="number"
              step="0.01"
              name="pressao_descarga_suc"
              value={dados.pressao_descarga_suc}
              onChange={handleChange}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pressão Sucção (Kgf/cm²)
            </label>
            <input
              type="number"
              step="0.01"
              name="pressao_succao_suc"
              value={dados.pressao_succao_suc}
              onChange={handleChange}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vazão (m³/h)
            </label>
            <input
              type="number"
              step="0.01"
              name="vazao_suc"
              value={dados.vazao_suc}
              onChange={handleChange}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Corrente (A)
            </label>
            <input
              type="number"
              step="0.01"
              name="corrente_suc"
              value={dados.corrente_suc}
              onChange={handleChange}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tensão (V)
            </label>
            <input
              type="number"
              step="0.01"
              name="tensao_suc"
              value={dados.tensao_suc}
              onChange={handleChange}
              className="input-field"
            />
          </div>
        </div>
      </div>

      {/* Dados da Plaqueta */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4 text-blue-600">Dados da Plaqueta</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              N° Série
            </label>
            <input
              type="text"
              name="numero_serie"
              value={dados.numero_serie}
              onChange={handleChange}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vazão Nominal (m³/h)
            </label>
            <input
              type="number"
              step="0.01"
              name="vazao_nominal"
              value={dados.vazao_nominal}
              onChange={handleChange}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pressão Nominal (Kgf/cm²)
            </label>
            <input
              type="number"
              step="0.01"
              name="pressao_nominal"
              value={dados.pressao_nominal}
              onChange={handleChange}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              RPM Nominal
            </label>
            <input
              type="number"
              step="0.01"
              name="rpm_nominal"
              value={dados.rpm_nominal}
              onChange={handleChange}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Potência Instalada (CV)
            </label>
            <input
              type="number"
              step="0.001"
              name="potencia_instalada"
              value={dados.potencia_instalada}
              onChange={handleChange}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Motoredutor
            </label>
            <input
              type="text"
              name="motoredutor"
              value={dados.motoredutor}
              onChange={handleChange}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Motor
            </label>
            <input
              type="text"
              name="motor"
              value={dados.motor}
              onChange={handleChange}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Redutor
            </label>
            <input
              type="text"
              name="redutor"
              value={dados.redutor}
              onChange={handleChange}
              className="input-field"
            />
          </div>
        </div>
      </div>

      {/* Instrumentos */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4 text-blue-600">Instrumentos Utilizados</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tacômetro
            </label>
            <input
              type="text"
              name="tacometro"
              value={dados.tacometro}
              onChange={handleChange}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Wattímetro
            </label>
            <input
              type="text"
              name="wattimetro"
              value={dados.wattimetro}
              onChange={handleChange}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Manômetro
            </label>
            <input
              type="text"
              name="manometro"
              value={dados.manometro}
              onChange={handleChange}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Medidor de Vazão
            </label>
            <input
              type="text"
              name="medidor_vazao"
              value={dados.medidor_vazao}
              onChange={handleChange}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rotâmetro
            </label>
            <input
              type="text"
              name="rotametro"
              value={dados.rotametro}
              onChange={handleChange}
              className="input-field"
            />
          </div>
        </div>
      </div>

      {/* Resultado e Observações */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4 text-blue-600">Resultado e Observações</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Resultado
            </label>
            <select
              name="resultado"
              value={dados.resultado}
              onChange={handleChange}
              className="input-field"
            >
              <option value="">Selecione...</option>
              <option value="Aprovado">Aprovado</option>
              <option value="Reprovado">Reprovado</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Observações
            </label>
            <textarea
              name="observacoes"
              value={dados.observacoes}
              onChange={handleChange}
              className="input-field"
              rows="4"
              placeholder="Observações adicionais sobre o teste..."
            ></textarea>
          </div>
        </div>
      </div>

      {/* Botões */}
      <div className="flex justify-end space-x-4">
        <button type="button" onClick={onCancel} className="btn-secondary">
          Cancelar
        </button>
        <button type="submit" className="btn-primary">
          {dadosIniciais.id ? 'Atualizar Teste' : 'Criar Teste'}
        </button>
      </div>
    </form>
  );
}
