import axios from 'axios';
import { API_BASE_URL } from '../config';

console.log('🔧 Inicializando API client com URL:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Adicionar token de autenticação automaticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Tratar erro 401 (não autorizado)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (senha) => axios.post(`${API_BASE_URL}/login`, { senha }),
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
  },
  isAuthenticated: () => !!localStorage.getItem('token'),
};

export const databaseAPI = {
  downloadBackup: () => {
    const token = localStorage.getItem('token');
    return axios.get(`${API_BASE_URL}/download-database`, {
      headers: { Authorization: `Bearer ${token}` },
      responseType: 'blob'
    });
  }
};

export const testesAPI = {
  // Listar todos os testes
  listar: (filtros = {}) => api.get('/testes', { params: filtros }),
  
  // Buscar teste por ID
  buscarPorId: (id) => api.get(`/testes/${id}`),
  
  // Buscar próximo RPB
  proximoRPB: () => api.get('/testes/proximo-rpb'),
  
  // Criar novo teste
  criar: (dados) => api.post('/testes', dados),
  
  // Atualizar teste
  atualizar: (id, dados) => api.put(`/testes/${id}`, dados),
  
  // Deletar teste
  deletar: (id) => api.delete(`/testes/${id}`),
  
  // Calcular potência
  calcularPotencia: (vazao, pressao, rotacao) => 
    api.post('/calcular-potencia', { vazao, pressao, rotacao }),
};

export default api;
