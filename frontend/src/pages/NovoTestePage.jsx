import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { testesAPI } from '../services/api';
import TesteForm from '../components/TesteForm';

export default function NovoTestePage({ userName }) {
  const navigate = useNavigate();
  const [proximoRPB, setProximoRPB] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const buscarProximoRPB = async () => {
      try {
        const response = await testesAPI.proximoRPB();
        setProximoRPB(response.data.proximoRPB);
      } catch (error) {
        console.error('Erro ao buscar próximo RPB:', error);
        setProximoRPB(1); // Fallback para 1 se houver erro
      } finally {
        setCarregando(false);
      }
    };

    buscarProximoRPB();
  }, []);

  const handleSubmit = async (dados) => {
    try {
      // Adicionar nome do usuário que preencheu
      const dadosComUsuario = {
        ...dados,
        preenchido_por: userName || localStorage.getItem('userName') || 'Anônimo'
      };
      
      await testesAPI.criar(dadosComUsuario);
      alert('Teste criado com sucesso!');
      navigate('/');
    } catch (error) {
      console.error('Erro ao criar teste:', error);
      if (error.response?.data?.error) {
        alert(`Erro: ${error.response.data.error}`);
      } else {
        alert('Erro ao criar teste. Verifique os dados e tente novamente.');
      }
    }
  };

  if (carregando) {
    return (
      <div className="max-w-6xl mx-auto text-center py-8">
        <p className="text-gray-600">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Novo Teste de Performance</h1>
        <p className="text-gray-600 mt-2">Preencha os dados do teste abaixo • RPB será gerado automaticamente</p>
      </div>

      <TesteForm 
        onSubmit={handleSubmit}
        proximoRPB={proximoRPB}
        onCancel={() => navigate('/')}
      />
    </div>
  );
}
