import React, { useEffect, useState } from 'react';

function Dashboard() {
  const [stats, setStats] = useState({ totalAlunos: 0, totalNiveis: 0, totalUsuarios: 0 });

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch('/api/dashboard/stats', {
      headers: { 'Authorization': token }
    })
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Painel Principal</h1>
      <p className="text-gray-600 mb-8">Bem-vindo ao SEGECS. Aqui está o resumo do sistema.</p>

      {/* Grid de Cartões */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Cartão 1 - Alunos */}
        <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-blue-500">
          <h3 className="text-gray-500 text-sm font-bold uppercase">Total de Alunos</h3>
          <p className="text-4xl font-bold text-gray-800 mt-2">{stats.totalAlunos}</p>
          <p className="text-sm text-blue-500 mt-2 font-medium">Cadastrados no sistema</p>
        </div>

        {/* Cartão 2 - Níveis */}
        <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-green-500">
          <h3 className="text-gray-500 text-sm font-bold uppercase">Níveis de Acesso</h3>
          <p className="text-4xl font-bold text-gray-800 mt-2">{stats.totalNiveis}</p>
          <p className="text-sm text-green-500 mt-2 font-medium">Perfis disponíveis</p>
        </div>

        {/* Cartão 3 - Usuários */}
        <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-purple-500">
          <h3 className="text-gray-500 text-sm font-bold uppercase">Usuários do Sistema</h3>
          <p className="text-4xl font-bold text-gray-800 mt-2">{stats.totalUsuarios}</p>
          <p className="text-sm text-purple-500 mt-2 font-medium">Logins ativos</p>
        </div>

      </div>
    </div>
  );
}

export default Dashboard;
