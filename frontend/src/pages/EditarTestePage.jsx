import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { testesAPI } from '../services/api';
import TesteForm from '../components/TesteForm';

export default function EditarTestePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [teste, setTeste] = useState(null);
  const [loading, setLoading] = useState(true);

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

  const handleSubmit = async (dados) => {
    try {
      await testesAPI.atualizar(id, dados);
      alert('Teste atualizado com sucesso!');
      navigate('/');
    } catch (error) {
      console.error('Erro ao atualizar teste:', error);
      if (error.response?.data?.error) {
        alert(`Erro: ${error.response.data.error}`);
      } else {
        alert('Erro ao atualizar teste. Verifique os dados e tente novamente.');
      }
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Editar Teste RPB {teste?.rpb}</h1>
        <p className="text-gray-600 mt-2">Atualize os dados do teste abaixo</p>
      </div>

      <TesteForm 
        onSubmit={handleSubmit}
        dadosIniciais={teste}
        onCancel={() => navigate('/')}
      />
    </div>
  );
}
