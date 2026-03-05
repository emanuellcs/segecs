import {
  Users,
  Briefcase,
  AlertTriangle,
  Clock,
  TrendingUp,
  FileSpreadsheet,
  LayoutDashboard,
  ArrowRight,
  GraduationCap,
  Building2,
  CheckCircle2,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function DashboardPage() {
  const navigate = useNavigate();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const today = new Date();
      const next15Days = new Date();
      next15Days.setDate(today.getDate() + 15);

      const [alunos, estagios, frequencias, vagas, avaliacoes] = await Promise.all([
        supabase.from('alunos').select('*', { count: 'exact' }),
        supabase
          .from('estagios')
          .select('id, status, created_at, aluno_id, data_fim', { count: 'exact' })
          .order('created_at', { ascending: false }),
        supabase.from('frequencias').select('horas_realizadas'),
        supabase.from('vagas').select('id', { count: 'exact' }).eq('status', 'aberta'),
        supabase.from('avaliacoes').select('estagio_id'),
      ]);

      const totalHoras = frequencias.data?.reduce((acc, f) => acc + f.horas_realizadas, 0) || 0;
      const estagiosAtivosArr = estagios.data?.filter((e) => e.status === 'ativo') || [];
      const estagiosAtivosCount = estagiosAtivosArr.length;

      // Compliance: Contratos Vencendo (Próximos 15 dias)
      const vencendoCount = estagiosAtivosArr.filter((e) => {
        const dataFim = new Date(e.data_fim);
        return dataFim >= today && dataFim <= next15Days;
      }).length;

      // Compliance: Avaliações Pendentes (Estágios ativos sem nenhuma nota)
      const estagiosComAvaliacao = new Set(avaliacoes.data?.map((a) => a.estagio_id));
      const semAvaliacaoCount = estagiosAtivosArr.filter(
        (e) => !estagiosComAvaliacao.has(e.id)
      ).length;

      // Distribuição por status
      const statusDistribution = {
        pendente: alunos.data?.filter((a) => a.status === 'pendente').length || 0,
        estagiando: alunos.data?.filter((a) => a.status === 'estagiando').length || 0,
        concluido: alunos.data?.filter((a) => a.status === 'concluido').length || 0,
      };

      // Últimos 5 estágios com detalhes do aluno
      const recentEstagiosIds = estagios.data?.slice(0, 5).map((e) => e.aluno_id) || [];
      const { data: recentAlunos } = await supabase
        .from('alunos')
        .select('id, nome')
        .in('id', recentEstagiosIds);

      const recentActivities =
        estagios.data?.slice(0, 5).map((e) => ({
          ...e,
          aluno_nome: recentAlunos?.find((a) => a.id === e.aluno_id)?.nome || 'Aluno',
        })) || [];

      return {
        totalAlunos: alunos.count || 0,
        estagiosAtivos: estagiosAtivosCount,
        totalHoras,
        vagasAbertas: vagas.count || 0,
        statusDistribution,
        recentActivities,
        compliance: {
          vencendo: vencendoCount,
          semAvaliacao: semAvaliacaoCount,
          totalAlertas: vencendoCount + semAvaliacaoCount,
        },
      };
    },
  });

  const handleExportSICE = async () => {
    try {
      const { data: estagios, error } = await supabase.from('estagios').select(`
          id, status, data_inicio, data_fim, carga_horaria_total, carga_horaria_diaria,
          alunos (nome, matricula, cpf, cursos (nome)),
          vagas (titulo, empresas (razao_social, cnpj)),
          orientadores (nome),
          supervisores (nome)
        `);

      if (error) throw error;
      if (!estagios || estagios.length === 0) {
        toast.error('Não há dados para exportar.');
        return;
      }

      const headers = [
        'ID Estágio',
        'Nome do Aluno',
        'Matrícula',
        'CPF Aluno',
        'Curso',
        'Empresa',
        'CNPJ',
        'Vaga',
        'Orientador',
        'Supervisor',
        'Início',
        'Fim',
        'CH Total',
        'CH Diária',
        'Status',
      ];
      const csvData = estagios.map((e) => {
        const aluno = e.alunos as any;
        const vaga = e.vagas as any;
        return [
          e.id,
          aluno?.nome,
          aluno?.matricula,
          aluno?.cpf,
          aluno?.cursos?.nome,
          vaga?.empresas?.razao_social,
          vaga?.empresas?.cnpj,
          vaga?.titulo,
          (e.orientadores as any)?.nome,
          (e.supervisores as any)?.nome,
          e.data_inicio,
          e.data_fim,
          e.carga_horaria_total,
          e.carga_horaria_diaria,
          e.status,
        ];
      });

      const escapeCSV = (field: any) => `"${String(field || '').replace(/"/g, '""')}"`;
      const csvContent = [
        headers.join(','),
        ...csvData.map((row) => row.map(escapeCSV).join(',')),
      ].join('\n');
      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `relatorio_detalhado_sice_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      toast.success('Relatório exportado!');
    } catch (error) {
      toast.error('Erro ao exportar relatório.');
    }
  };

  const cards = [
    {
      label: 'Total de Alunos',
      value: stats?.totalAlunos,
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'Estágios Ativos',
      value: stats?.estagiosAtivos,
      icon: Briefcase,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      label: 'Horas Acumuladas',
      value: `${stats?.totalHoras}h`,
      icon: Clock,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
    },
    {
      label: 'Vagas Abertas',
      value: stats?.vagasAbertas,
      icon: TrendingUp,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-100 border-t-blue-600"></div>
          <p className="text-gray-500 font-semibold animate-pulse text-sm">
            Sincronizando dados...
          </p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 pb-12"
    >
      {/* Header Section */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-blue-900 rounded-2xl text-white shadow-xl shadow-blue-900/20">
            <LayoutDashboard size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-blue-900 tracking-tight leading-none">
              Dashboard
            </h1>
            <p className="text-gray-500 font-medium mt-1">
              Bem-vindo à central de inteligência SEGECS.
            </p>
          </div>
        </div>
        <button
          onClick={handleExportSICE}
          className="flex items-center gap-3 px-6 py-4 bg-blue-50 text-blue-700 rounded-2xl font-bold text-xs uppercase tracking-wider hover:bg-blue-100 transition-all active:scale-95"
        >
          <FileSpreadsheet size={18} /> Exportar SICE Completo
        </button>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4 transition-all hover:shadow-lg group"
          >
            <div className={cn('p-4 rounded-2xl transition-all group-hover:rotate-6', card.bg)}>
              <card.icon className={card.color} size={28} />
            </div>
            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1">
                {card.label}
              </p>
              <h2 className="text-3xl font-bold text-blue-900 tracking-tight">{card.value}</h2>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Distribuição & Atividades */}
        <div className="lg:col-span-2 space-y-8">
          {/* Distribuição de Alunos */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-blue-900 mb-8 flex items-center gap-2">
              <GraduationCap className="text-blue-600" size={20} /> Distribuição de Alunos
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  label: 'Pendentes',
                  value: stats?.statusDistribution.pendente ?? 0,
                  color: 'bg-amber-400',
                  total: stats?.totalAlunos,
                },
                {
                  label: 'Estagiando',
                  value: stats?.statusDistribution.estagiando ?? 0,
                  color: 'bg-green-500',
                  total: stats?.totalAlunos,
                },
                {
                  label: 'Concluídos',
                  value: stats?.statusDistribution.concluido ?? 0,
                  color: 'bg-blue-600',
                  total: stats?.totalAlunos,
                },
              ].map((item, idx) => {
                const percentage = item.total ? Math.round((item.value / item.total) * 100) : 0;
                return (
                  <div key={idx} className="space-y-3">
                    <div className="flex justify-between items-end">
                      <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                        {item.label}
                      </span>
                      <span className="text-sm font-bold text-blue-900">
                        {item.value} ({percentage}%)
                      </span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 1, delay: idx * 0.2 }}
                        className={cn('h-full rounded-full', item.color)}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Atividades Recentes */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-lg font-bold text-blue-900 flex items-center gap-2">
                <Clock className="text-orange-500" size={20} /> Últimas Alocações
              </h3>
              <button
                onClick={() => navigate('/estagios')}
                className="text-blue-600 text-[10px] font-bold uppercase tracking-widest hover:underline flex items-center gap-1"
              >
                Ver Tudo <ArrowRight size={14} />
              </button>
            </div>
            <div className="space-y-4">
              {stats?.recentActivities.map((activity, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-2xl transition-colors border border-transparent hover:border-gray-100"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-xs">
                      {activity.aluno_nome.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{activity.aluno_nome}</p>
                      <p className="text-[10px] text-gray-400 uppercase font-semibold tracking-tight">
                        Iniciado em {new Date(activity.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <span
                    className={cn(
                      'px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider',
                      activity.status === 'ativo'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-blue-100 text-blue-700'
                    )}
                  >
                    {activity.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Intelligence */}
        <div className="space-y-8">
          {/* Alertas Rápidos */}
          <div
            className={cn(
              'p-8 rounded-3xl shadow-xl transition-all duration-500 relative overflow-hidden group',
              (stats?.compliance.totalAlertas ?? 0) > 0
                ? 'bg-blue-900 text-white shadow-blue-900/30'
                : 'bg-green-600 text-white shadow-green-600/20'
            )}
          >
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 transition-transform duration-500">
              {(stats?.compliance.totalAlertas ?? 0) > 0 ? (
                <AlertTriangle size={80} />
              ) : (
                <CheckCircle2 size={80} />
              )}
            </div>

            <h3 className="text-lg font-bold mb-6 relative z-10 flex items-center gap-2">
              Compliance
              {(stats?.compliance.totalAlertas ?? 0) > 0 ? (
                <span className="bg-orange-500 text-[10px] px-2 py-0.5 rounded-full uppercase font-bold">
                  {stats?.compliance.totalAlertas} ALERTAS
                </span>
              ) : (
                <span className="bg-white/20 text-[10px] px-2 py-0.5 rounded-full uppercase font-bold">
                  SISTEMA OK
                </span>
              )}
            </h3>

            <div className="space-y-6 relative z-10">
              {(stats?.compliance.totalAlertas ?? 0) > 0 ? (
                <>
                  {stats?.compliance.vencendo ? (
                    <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/10">
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-blue-300 mb-1">
                        Prazos
                      </p>
                      <p className="text-sm font-semibold">
                        {stats.compliance.vencendo} Contratos vencendo em 15 dias
                      </p>
                      <button
                        onClick={() => navigate('/estagios')}
                        className="mt-3 text-[10px] font-bold uppercase tracking-widest text-orange-400 hover:text-orange-300 transition-colors"
                      >
                        Resolver Agora →
                      </button>
                    </div>
                  ) : null}

                  {stats?.compliance.semAvaliacao ? (
                    <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/10">
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-blue-300 mb-1">
                        Avaliações
                      </p>
                      <p className="text-sm font-semibold">
                        {stats.compliance.semAvaliacao} Estágios sem nota lançada
                      </p>
                      <button
                        onClick={() => navigate('/avaliacoes')}
                        className="mt-3 text-[10px] font-bold uppercase tracking-widest text-orange-400 hover:text-orange-300 transition-colors"
                      >
                        Lançar Notas →
                      </button>
                    </div>
                  ) : null}
                </>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm font-bold text-green-50">Tudo em ordem!</p>
                  <p className="text-[10px] font-medium text-green-100/70 mt-1 uppercase tracking-widest">
                    Nenhuma pendência crítica encontrada.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Parceiros em Destaque */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-blue-900 mb-6 flex items-center gap-2">
              <Building2 className="text-purple-600" size={20} /> Vagas em Aberto
            </h3>
            <div className="bg-purple-50 p-6 rounded-2xl text-center border border-purple-100">
              <p className="text-3xl font-bold text-purple-700">{stats?.vagasAbertas}</p>
              <p className="text-[10px] font-semibold text-purple-400 uppercase tracking-widest mt-1">
                Oportunidades Disponíveis
              </p>
              <button
                onClick={() => navigate('/vagas')}
                className="w-full mt-4 bg-white py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest text-purple-700 shadow-sm hover:shadow-md transition-all active:scale-95"
              >
                Gerenciar Vagas
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
