import React, { useState, useEffect } from 'react';
import '../App.css';

const Home = () => {
  const [apiStatus, setApiStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Test API connection
    fetch('/api/health')
      .then(res => res.json())
      .then(data => {
        setApiStatus(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error connecting to API:', err);
        setApiStatus({ status: 'ERROR', error: 'Não foi possível conectar à API' });
        setLoading(false);
      });
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>SEGECS</h1>
        <p>Sistema Escolar de Gestão do Estágio Curricular Supervisionado</p>
      </header>
      <main className="App-main">
        <h2>Bem-vindo ao SEGECS!</h2>
        <div style={{ marginTop: '20px' }}>
          <h3>Status da API:</h3>
          {loading ? (
            <p>Carregando...</p>
          ) : (
            <div>
              <p>Status: <strong>{apiStatus?.status || 'Desconhecido'}</strong></p>
              {apiStatus?.database && (
                <p>Banco de Dados: <strong>{apiStatus.database}</strong></p>
              )}
              {apiStatus?.timestamp && (
                <p>Última atualização: {new Date(apiStatus.timestamp).toLocaleString('pt-BR')}</p>
              )}
              {apiStatus?.error && (
                <p style={{ color: 'red' }}>Erro: {apiStatus.error}</p>
              )}
            </div>
          )}
        </div>
        <div style={{ marginTop: '40px', padding: '20px', background: '#f5f5f5', borderRadius: '8px' }}>
          <h3>Próximos Passos:</h3>
          <ul style={{ textAlign: 'left', maxWidth: '600px', margin: '20px auto' }}>
            <li>Configure o banco de dados PostgreSQL</li>
            <li>Execute o script schema.sql para criar as tabelas</li>
            <li>Configure o arquivo .env com suas credenciais</li>
            <li>Instale as dependências: <code>npm install</code> (tanto no client quanto no server)</li>
            <li>Inicie o servidor: <code>npm run dev</code> (na pasta server)</li>
            <li>Inicie o frontend: <code>npm start</code> (na pasta client)</li>
          </ul>
        </div>
      </main>
    </div>
  );
};

export default Home;

