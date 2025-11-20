import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { testesAPI } from '../services/api';

export default function HomePage({ userName, setUserName }) {
  const [testes, setTestes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNameModal, setShowNameModal] = useState(false);
  const [tempName, setTempName] = useState('');
  const [filtros, setFiltros] = useState({
    cliente: '',
    modelo: '',
    numero_serie: '',
  });

  useEffect(() => {
    // Perguntar nome do usuário se não estiver salvo
    if (!userName) {
      setShowNameModal(true);
    }
    carregarTestes();
  }, [userName]);

  const carregarTestes = async () => {
    try {
      setLoading(true);
      const response = await testesAPI.listar(filtros);
      setTestes(response.data);
    } catch (error) {
      console.error('Erro ao carregar testes:', error);
      alert('Erro ao carregar testes. Verifique se o backend está rodando.');
    } finally {
      setLoading(false);
    }
  };

  const aplicarFiltros = () => {
    carregarTestes();
  };

  const limparFiltros = () => {
    setFiltros({ cliente: '', modelo: '', numero_serie: '' });
    setTimeout(() => carregarTestes(), 100);
  };

  const deletarTeste = async (id, rpb) => {
    if (window.confirm(`Deseja realmente deletar o teste RPB ${rpb}?`)) {
      try {
        await testesAPI.deletar(id);
        alert('Teste deletado com sucesso!');
        carregarTestes();
      } catch (error) {
        console.error('Erro ao deletar teste:', error);
        alert('Erro ao deletar teste.');
      }
    }
  };

  const formatarData = (data) => {
    if (!data) return '-';
    return new Date(data).toLocaleDateString('pt-BR');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Testes de Performance</h1>
        <Link to="/novo" className="btn-primary">
          + Novo Teste
        </Link>
      </div>

      {/* Filtros */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Filtros</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cliente
            </label>
            <input
              type="text"
              className="input-field"
              value={filtros.cliente}
              onChange={(e) => setFiltros({ ...filtros, cliente: e.target.value })}
              placeholder="Buscar por cliente"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Modelo
            </label>
            <input
              type="text"
              className="input-field"
              value={filtros.modelo}
              onChange={(e) => setFiltros({ ...filtros, modelo: e.target.value })}
              placeholder="Buscar por modelo"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              N° Série
            </label>
            <input
              type="text"
              className="input-field"
              value={filtros.numero_serie}
              onChange={(e) => setFiltros({ ...filtros, numero_serie: e.target.value })}
              placeholder="Buscar por número de série"
            />
          </div>
          <div className="flex items-end space-x-2">
            <button onClick={aplicarFiltros} className="btn-primary flex-1">
              Aplicar
            </button>
            <button onClick={limparFiltros} className="btn-secondary flex-1">
              Limpar
            </button>
          </div>
        </div>
      </div>

      {/* Tabela de Testes */}
      <div className="card">
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Carregando testes...</p>
          </div>
        ) : testes.length === 0 ? (
          <div className="text-center py-8">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum teste encontrado</h3>
            <p className="mt-1 text-sm text-gray-500">Comece criando um novo teste de performance.</p>
            <div className="mt-6">
              <Link to="/novo" className="btn-primary">
                + Criar Novo Teste
              </Link>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    RPB
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Modelo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    N° Série
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Resultado
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {testes.map((teste) => (
                  <tr key={teste.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {teste.rpb}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatarData(teste.data)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {teste.cliente || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {teste.modelo || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {teste.numero_serie || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {teste.resultado === 'Aprovado' ? (
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Aprovado
                        </span>
                      ) : teste.resultado === 'Reprovado' ? (
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                          Reprovado
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <Link
                        to={`/visualizar/${teste.id}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Ver
                      </Link>
                      <Link
                        to={`/editar/${teste.id}`}
                        className="text-green-600 hover:text-green-900"
                      >
                        Editar
                      </Link>
                      <button
                        onClick={() => deletarTeste(teste.id, teste.rpb)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Deletar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal para nome do usuário */}
      {showNameModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Bem-vindo!</h2>
            <p className="text-gray-600 mb-4">Por favor, informe seu nome para registrar nos testes:</p>
            <input
              type="text"
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              className="input-field mb-4"
              placeholder="Seu nome completo"
              autoFocus
            />
            <button
              onClick={() => {
                if (tempName.trim()) {
                  localStorage.setItem('userName', tempName.trim());
                  setUserName(tempName.trim());
                  setShowNameModal(false);
                } else {
                  alert('Por favor, informe seu nome');
                }
              }}
              className="btn-primary w-full"
            >
              Continuar
            </button>
          </div>
        </div>
      )}

      <div className="text-sm text-gray-500 text-center">
        Total de testes: {testes.length}
      </div>
    </div>
  );
}
