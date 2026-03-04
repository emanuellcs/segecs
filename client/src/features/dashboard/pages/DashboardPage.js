import React, { useEffect, useState } from 'react';
import api from '@/services/api';
import { FaUserGraduate, FaLayerGroup, FaUsers, FaChartLine } from 'react-icons/fa';
import PageHeader from '@/components/common/PageHeader';
import Card from '@/components/common/Card';

function DashboardPage() {
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
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn space-y-8">
      <PageHeader 
        title="Painel Principal" 
        subtitle="Resumo geral das atividades do SEGECS."
        icon={FaChartLine}
      />

      {/* Grid de Cartões Responsivo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card title="Alunos" description="Total cadastrado" icon={FaUserGraduate}>
          <p className="text-4xl font-black text-gray-800 tracking-tight">{stats.totalAlunos}</p>
        </Card>

        <Card title="Níveis" description="Perfis de acesso" icon={FaLayerGroup}>
          <p className="text-4xl font-black text-gray-800 tracking-tight">{stats.totalNiveis}</p>
        </Card>

        <Card title="Usuários" description="Contas ativas" icon={FaUsers}>
          <p className="text-4xl font-black text-gray-800 tracking-tight">{stats.totalUsuarios}</p>
        </Card>
      </div>

      {/* Seção de Destaque Responsiva */}
      <div className="relative overflow-hidden bg-blue-900 rounded-3xl p-8 sm:p-12 text-white shadow-2xl">
        <div className="relative z-10 max-w-2xl">
          <h2 className="text-2xl sm:text-3xl font-black mb-4 tracking-tight uppercase">
            Gestão de Estágios Simplificada
          </h2>
          <p className="text-blue-100 text-base sm:text-lg leading-relaxed font-medium">
            O SEGECS foi projetado para otimizar o fluxo de acompanhamento dos estágios curriculares supervisionados. 
            Utilize o menu lateral para gerenciar as entidades do sistema de forma rápida e segura.
          </p>
        </div>
        
        {/* Elemento Decorativo */}
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 sm:w-96 sm:h-96 bg-blue-800 rounded-full opacity-50 blur-3xl pointer-events-none"></div>
      </div>
    </div>
  );
}

export default DashboardPage;
