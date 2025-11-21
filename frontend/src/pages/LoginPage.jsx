import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';

export default function LoginPage({ onLogin }) {
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    setLoading(true);

    try {
      const response = await authAPI.login(senha);
      const data = response.data;

      if (data.token) {
        localStorage.setItem('token', data.token);
        onLogin(data.token);
        navigate('/');
      } else {
        setErro('Senha incorreta');
      }
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      if (error.code === 'ECONNABORTED') {
        setErro('Servidor demorando muito para responder. Aguarde 1 minuto e tente novamente.');
      } else if (error.response?.status === 401) {
        setErro('Senha incorreta');
      } else {
        setErro('Erro ao conectar com o servidor. O servidor pode estar acordando (aguarde 1 min).');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="card max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-600 mb-2">🔒 Sistema de Testes de Performance</h1>
          <p className="text-gray-600">Digite a senha para acessar o sistema</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Senha de Acesso
            </label>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="input-field"
              placeholder="Digite a senha"
              required
              autoFocus
            />
          </div>

          {erro && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {erro}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>💡 Entre em contato com o administrador para obter a senha</p>
        </div>
      </div>
    </div>
  );
}
