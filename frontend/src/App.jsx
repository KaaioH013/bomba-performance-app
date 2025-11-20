import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import NovoTestePage from './pages/NovoTestePage';
import EditarTestePage from './pages/EditarTestePage';
import VisualizarTestePage from './pages/VisualizarTestePage';
import LoginPage from './pages/LoginPage';
import { authAPI, databaseAPI } from './services/api';

function NavBar({ onLogout, userName }) {
  const location = useLocation();
  const [downloading, setDownloading] = useState(false);
  
  const isActive = (path) => {
    return location.pathname === path ? 'bg-blue-700' : '';
  };

  const handleDownload = async () => {
    try {
      setDownloading(true);
      const response = await databaseAPI.downloadBackup();
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const dataAtual = new Date().toISOString().split('T')[0];
      link.setAttribute('download', `bomba_performance_${dataAtual}.db`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      alert('Backup baixado com sucesso!');
    } catch (error) {
      console.error('Erro ao baixar backup:', error);
      alert('Erro ao baixar backup do banco de dados');
    } finally {
      setDownloading(false);
    }
  };
  
  return (
    <nav className="bg-blue-600 text-white shadow-lg print:hidden">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
            </svg>
            <h1 className="text-xl font-bold">Sistema de Performance de Bombas</h1>
          </div>
          <div className="flex items-center space-x-2">
            {userName && (
              <span className="text-sm bg-blue-700 px-3 py-1 rounded">👤 {userName}</span>
            )}
            <Link 
              to="/" 
              className={`px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors ${isActive('/')}`}
            >
              Início
            </Link>
            <Link 
              to="/novo" 
              className={`px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors ${isActive('/novo')}`}
            >
              Novo Teste
            </Link>
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors bg-blue-500"
            >
              {downloading ? '⏳ Baixando...' : '💾 Backup'}
            </button>
            <button
              onClick={onLogout}
              className="px-4 py-2 rounded-lg hover:bg-red-600 transition-colors bg-red-500"
            >
              🚪 Sair
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

function PrivateRoute({ children, isAuthenticated }) {
  return isAuthenticated ? children : <Navigate to="/login" />;
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(authAPI.isAuthenticated());
  const [userName, setUserName] = useState(localStorage.getItem('userName') || '');

  const handleLogin = (token) => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    authAPI.logout();
    setIsAuthenticated(false);
    setUserName('');
  };

  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        {isAuthenticated && <NavBar onLogout={handleLogout} userName={userName} />}
        <main className="flex-1 container mx-auto px-4 py-8">
          <Routes>
            <Route path="/login" element={
              isAuthenticated ? <Navigate to="/" /> : <LoginPage onLogin={handleLogin} />
            } />
            <Route path="/" element={
              <PrivateRoute isAuthenticated={isAuthenticated}>
                <HomePage userName={userName} setUserName={setUserName} />
              </PrivateRoute>
            } />
            <Route path="/novo" element={
              <PrivateRoute isAuthenticated={isAuthenticated}>
                <NovoTestePage userName={userName} />
              </PrivateRoute>
            } />
            <Route path="/editar/:id" element={
              <PrivateRoute isAuthenticated={isAuthenticated}>
                <EditarTestePage />
              </PrivateRoute>
            } />
            <Route path="/visualizar/:id" element={
              <PrivateRoute isAuthenticated={isAuthenticated}>
                <VisualizarTestePage />
              </PrivateRoute>
            } />
          </Routes>
        </main>
        {isAuthenticated && (
          <footer className="bg-gray-800 text-white py-4 mt-8">
            <div className="container mx-auto px-4 text-center">
              <p>© 2025 Sistema de Performance de Bombas - Desenvolvido para Eng</p>
            </div>
          </footer>
        )}
      </div>
    </BrowserRouter>
  );
}

export default App;
