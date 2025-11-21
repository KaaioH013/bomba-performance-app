import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { testesAPI } from '../services/api';
import GraficoCurvaPerformance from '../components/GraficoCurvaPerformance';

export default function VisualizarTestePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [teste, setTeste] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imprimirPressao, setImprimirPressao] = useState(true);
  const [imprimirPotencia, setImprimirPotencia] = useState(false);

  useEffect(() => {
    carregarTeste();
  }, [id]);

  const carregarTeste = async () => {
    try {
      const response = await testesAPI.buscarPorId(id);
      setTeste(response.data);
    } catch (error) {
      console.error('Erro ao carregar teste:', error);
      alert('Erro ao carregar teste.');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const formatarData = (data) => {
    if (!data) return '-';
    return new Date(data).toLocaleDateString('pt-BR');
  };

  const imprimirRelatorio = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600">Carregando...</p>
      </div>
    );
  }

  if (!teste) {
    return <div>Teste não encontrado</div>;
  }

  // Preparar dados para o gráfico
  const dadosGrafico = [];
  for (let i = 1; i <= 5; i++) {
    const vazao = teste[`vazao_0${i}`];
    const pressao = teste[`pressao_0${i}`];
    const corrente = teste[`corrente_0${i}`];
    const potencia = teste[`potencia_consumida_0${i}`];
    
    if (vazao !== null && vazao !== undefined) {
      dadosGrafico.push({
        ponto: i,
        vazao: parseFloat(vazao),
        pressao: parseFloat(pressao || 0),
        corrente: parseFloat(corrente || 0),
        potencia: parseFloat(potencia || 0),
      });
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Botões de ação - não imprime */}
      <div className="mb-6 flex justify-between items-center print:hidden">
        <Link to="/" className="text-blue-600 hover:text-blue-800">
          ← Voltar
        </Link>
        <div className="space-x-2">
          <Link to={`/editar/${id}`} className="btn-secondary">
            Editar
          </Link>
          <button onClick={imprimirRelatorio} className="btn-primary">
            🖨️ Imprimir
          </button>
        </div>
      </div>

      {/* Relatório - área de impressão */}
      <div className="bg-white p-8 rounded-lg shadow-lg print:shadow-none print:p-4">
        {/* Cabeçalho */}
        <div className="text-center border-b-2 border-gray-300 pb-4 mb-6 print:pb-2 print:mb-4">
          <div className="hidden print:block mb-4">
            <img src="/logo.png" alt="Logo" className="h-16 mx-auto" />
          </div>
          <h1 className="text-2xl font-bold print:text-xl">RELATÓRIO DE PERFORMANCE DA BOMBA</h1>
          <p className="text-lg mt-2 print:text-base print:mt-1">RPB nº: <strong>{teste.rpb}</strong></p>
        </div>

        {/* Informações Gerais */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <h2 className="text-lg font-semibold mb-3 text-blue-600">Informações Gerais</h2>
            <div className="space-y-2 text-sm">
              <p><strong>Data:</strong> {new Date().toLocaleDateString('pt-BR')}</p>
              <p><strong>OP/OF:</strong> {teste.op_of || '-'}</p>
              <p><strong>Cliente:</strong> {teste.cliente || '-'}</p>
              <p><strong>N° Proposta:</strong> {teste.n_proposta || '-'}</p>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-3 text-blue-600">Bomba</h2>
            <div className="space-y-2 text-sm">
              <p><strong>Modelo:</strong> {teste.modelo || '-'}</p>
              <p><strong>Rotor:</strong> {teste.rcd_rotor || '-'} ({teste.tipo_rotor || '-'})</p>
              <p><strong>Estator:</strong> {teste.rcd_estator || '-'} ({teste.tipo_estator || '-'})</p>
              <p><strong>Elastômero:</strong> {teste.elastomero || '-'}</p>
            </div>
          </div>
        </div>

        {/* Dados Elétricos */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3 text-blue-600">Dados Elétricos</h2>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <p><strong>Corrente Nominal:</strong> {teste.corrente_nominal || '-'} A</p>
            <p><strong>Tensão da Rede:</strong> {teste.tensao_rede || '-'} V</p>
            <p><strong>Rotação:</strong> {teste.rotacao || '-'} RPM</p>
          </div>
        </div>

        {/* Pontos de Teste */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3 text-blue-600">Pontos Avaliados</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse border border-gray-300">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border border-gray-300 px-4 py-2 text-sm">Pressão (Kgf/cm²)</th>
                  <th className="border border-gray-300 px-4 py-2 text-sm">Vazão (m³/h)</th>
                  <th className="border border-gray-300 px-4 py-2 text-sm">Corrente (A)</th>
                  <th className="border border-gray-300 px-4 py-2 text-sm">Pot. Consumida (CV)</th>
                  <th className="border border-gray-300 px-4 py-2 text-sm">Pot. Consumida (kW)</th>
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3, 4, 5].map(i => {
                  const pressao = teste[`pressao_0${i}`];
                  const vazao = teste[`vazao_0${i}`];
                  const corrente = teste[`corrente_0${i}`];
                  const potenciaCV = teste[`potencia_consumida_0${i}`];
                  const potenciaKW = potenciaCV ? (potenciaCV * 0.7457).toFixed(2) : null;
                  
                  if (!vazao && !pressao) return null;
                  
                  return (
                    <tr key={i}>
                      <td className="border border-gray-300 px-4 py-2 text-center">{pressao ?? '-'}</td>
                      <td className="border border-gray-300 px-4 py-2 text-center">{vazao ?? '-'}</td>
                      <td className="border border-gray-300 px-4 py-2 text-center">{corrente ?? '-'}</td>
                      <td className="border border-gray-300 px-4 py-2 text-center">{potenciaCV ?? '-'}</td>
                      <td className="border border-gray-300 px-4 py-2 text-center">{potenciaKW ?? '-'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Opções de Impressão de Gráficos - não imprime */}
        {dadosGrafico.length > 0 && (
          <div className="mb-4 print:hidden">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-blue-900 mb-2">Gráficos para Impressão:</h3>
              <div className="flex gap-4">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={imprimirPressao}
                    onChange={(e) => setImprimirPressao(e.target.checked)}
                    className="mr-2 h-4 w-4"
                  />
                  <span className="text-sm">Vazão x Pressão</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={imprimirPotencia}
                    onChange={(e) => setImprimirPotencia(e.target.checked)}
                    className="mr-2 h-4 w-4"
                  />
                  <span className="text-sm">Vazão x Potência</span>
                </label>
              </div>
              <p className="text-xs text-gray-600 mt-2">
                💡 Selecione qual(is) gráfico(s) deseja imprimir. Recomendado: apenas 1 para melhor legibilidade.
              </p>
            </div>
          </div>
        )}

        {/* Gráfico de Performance */}
        {dadosGrafico.length > 0 && (
          <div className={`mb-6 page-break-inside-avoid ${imprimirPressao && imprimirPotencia ? '' : 'print:mt-4'}`}>
            <h2 className="text-lg font-semibold mb-3 text-blue-600 print:text-base print:mb-2">Curva de Performance</h2>
            <GraficoCurvaPerformance 
              dados={dadosGrafico}
              mostrarPressao={imprimirPressao}
              mostrarPotencia={imprimirPotencia}
            />
          </div>
        )}

        {/* Teste com Sucção */}
        {(teste.rotacao_suc || teste.pressao_descarga_suc || teste.vazao_suc) && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3 text-blue-600">Teste com Sucção</h2>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <p><strong>Rotação:</strong> {teste.rotacao_suc || '-'} RPM</p>
              <p><strong>Pressão Descarga:</strong> {teste.pressao_descarga_suc || '-'} Kgf/cm²</p>
              <p><strong>Pressão Sucção:</strong> {teste.pressao_succao_suc || '-'} Kgf/cm²</p>
              <p><strong>Vazão:</strong> {teste.vazao_suc || '-'} m³/h</p>
              <p><strong>Corrente:</strong> {teste.corrente_suc || '-'} A</p>
              <p><strong>Tensão:</strong> {teste.tensao_suc || '-'} V</p>
            </div>
          </div>
        )}

        {/* Dados da Plaqueta */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <h2 className="text-lg font-semibold mb-3 text-blue-600">Dados da Plaqueta</h2>
            <div className="space-y-2 text-sm">
              <p><strong>N° Série:</strong> {teste.numero_serie || '-'}</p>
              <p><strong>Vazão Nominal:</strong> {teste.vazao_nominal || '-'} m³/h</p>
              <p><strong>Pressão Nominal:</strong> {teste.pressao_nominal || '-'} Kgf/cm²</p>
              <p><strong>RPM Nominal:</strong> {teste.rpm_nominal || '-'}</p>
              <p><strong>Potência Instalada:</strong> {teste.potencia_instalada || '-'} CV</p>
              <p><strong>Motoredutor:</strong> {teste.motoredutor || '-'}</p>
              <p><strong>Motor:</strong> {teste.motor || '-'}</p>
              <p><strong>Redutor:</strong> {teste.redutor || '-'}</p>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-3 text-blue-600">Instrumentos</h2>
            <div className="space-y-2 text-sm">
              <p><strong>Tacômetro:</strong> {teste.tacometro || '-'}</p>
              <p><strong>Wattímetro:</strong> {teste.wattimetro || '-'}</p>
              <p><strong>Manômetro:</strong> {teste.manometro || '-'}</p>
              <p><strong>Medidor de Vazão:</strong> {teste.medidor_vazao || '-'}</p>
              <p><strong>Rotâmetro:</strong> {teste.rotametro || '-'}</p>
            </div>
          </div>
        </div>

        {/* Resultado e Observações */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3 text-blue-600">Resultado</h2>
          <div className="flex items-center space-x-4">
            <div className={`px-4 py-2 rounded-lg font-semibold ${
              teste.resultado === 'Aprovado' 
                ? 'bg-green-100 text-green-800' 
                : teste.resultado === 'Reprovado'
                ? 'bg-red-100 text-red-800'
                : 'bg-gray-100 text-gray-800'
            }`}>
              {teste.resultado || 'Não definido'}
            </div>
          </div>
          
          {teste.observacoes && (
            <div className="mt-4">
              <p className="text-sm font-semibold mb-2">Observações:</p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{teste.observacoes}</p>
            </div>
          )}
        </div>

        {/* Assinatura */}
        <div className="border-t-2 border-gray-300 pt-6 mt-8 print:pt-1.5 print:mt-2">
          <div className="grid grid-cols-2 gap-8 print:gap-2">
            <div>
              <p className="text-sm mb-2 print:text-xs print:mb-0.5">Ass. Responsável:</p>
              {(teste.resultado === 'Aprovado' || teste.resultado === 'Reprovado') && (
                <img src="/assinatura.jpg" alt="Assinatura" className="h-16 mb-2 print:h-8 print:mb-0.5" />
              )}
              <div className="border-t border-gray-400"></div>
            </div>
            <div>
              <p className="text-sm mb-12 print:text-xs print:mb-5">Data:</p>
              <p className="text-sm font-semibold print:text-xs">{new Date().toLocaleDateString('pt-BR')}</p>
              <div className="border-t border-gray-400 mt-8 print:mt-3"></div>
            </div>
          </div>
          
          {/* CS Analytics® branding */}
          <div className="text-center mt-6 print:mt-2 text-gray-500 print:text-[8px] text-xs">
            <p>Powered by <strong className="text-blue-600">CS Analytics®</strong></p>
          </div>
        </div>
      </div>
    </div>
  );
}
