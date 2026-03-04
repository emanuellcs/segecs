import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { FaUserGraduate, FaLayerGroup, FaUsers } from 'react-icons/fa';

function Dashboard() {
  const [stats, setStats] = useState({ totalAlunos: 0, totalNiveis: 0, totalUsuarios: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/dashboard/stats');
        setStats(response.data);
      } catch (err) {
        console.error("Erro ao carregar estatísticas do dashboard:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      <h1 className="text-3xl font-black text-gray-800 mb-2 uppercase tracking-tight">Painel Principal</h1>
      <p className="text-gray-500 mb-8 font-medium">Resumo geral das atividades do SEGECS.</p>

      {/* Grid de Cartões */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Cartão 1 - Alunos */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-6 hover:shadow-md transition-shadow">
          <div className="bg-blue-100 p-4 rounded-xl text-blue-600">
            <FaUserGraduate size={32} />
          </div>
          <div>
            <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider">Total de Alunos</h3>
            <p className="text-4xl font-black text-gray-800 mt-1">{stats.totalAlunos}</p>
          </div>
        </div>

        {/* Cartão 2 - Níveis */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-6 hover:shadow-md transition-shadow">
          <div className="bg-green-100 p-4 rounded-xl text-green-600">
            <FaLayerGroup size={32} />
          </div>
          <div>
            <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider">Níveis de Acesso</h3>
            <p className="text-4xl font-black text-gray-800 mt-1">{stats.totalNiveis}</p>
          </div>
        </div>

        {/* Cartão 3 - Usuários */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-6 hover:shadow-md transition-shadow">
          <div className="bg-purple-100 p-4 rounded-xl text-purple-600">
            <FaUsers size={32} />
          </div>
          <div>
            <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider">Usuários Ativos</h3>
            <p className="text-4xl font-black text-gray-800 mt-1">{stats.totalUsuarios}</p>
          </div>
        </div>

      </div>

      <div className="mt-12 bg-blue-900 rounded-3xl p-10 text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-2xl font-bold mb-4">Gestão de Estágios Simplificada</h2>
          <p className="text-blue-100 max-w-2xl text-lg leading-relaxed">
            Utilize o menu lateral para gerenciar alunos, cursos, escolas e acompanhar o progresso dos estágios curriculares supervisionados.
          </p>
        </div>
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-blue-800 rounded-full opacity-50 blur-3xl"></div>
      </div>
    </div>
  );
}

export default Dashboard;
