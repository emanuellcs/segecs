import {
  Users,
  Briefcase,
  CheckCircle2,
  AlertTriangle,
  Clock,
  TrendingUp,
  FileSpreadsheet,
  LayoutDashboard,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

export default function DashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const [alunos, estagios, frequencias, vagas] = await Promise.all([
        supabase.from('alunos').select('id', { count: 'exact' }),
        supabase.from('estagios').select('id, status', { count: 'exact' }),
        supabase.from('frequencias').select('horas_realizadas'),
        supabase.from('vagas').select('id', { count: 'exact' }).eq('status', 'aberta'),
      ]);

      const totalHoras = frequencias.data?.reduce((acc, f) => acc + f.horas_realizadas, 0) || 0;
      const estagiosAtivos = estagios.data?.filter((e) => e.status === 'ativo').length || 0;

      return {
        totalAlunos: alunos.count || 0,
        estagiosAtivos,
        totalHoras,
        vagasAbertas: vagas.count || 0,
        concluidos: estagios.data?.filter((e) => e.status === 'concluido').length || 0,
      };
    },
  });

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
          <p className="text-gray-500 font-bold animate-pulse">Carregando painel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header Section */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-900 rounded-xl text-white">
            <LayoutDashboard size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-blue-900 leading-tight">Painel de Controle</h1>
            <p className="text-gray-500 font-medium">Visão estratégica do sistema SEGECS</p>
          </div>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {cards.map((card, i) => (
          <div
            key={i}
            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 transition-all hover:shadow-md hover:-translate-y-1 active:scale-95 group"
          >
            <div className={cn('p-4 rounded-2xl transition-colors group-hover:scale-110 duration-300', card.bg)}>
              <card.icon className={card.color} size={28} />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                {card.label}
              </p>
              <h2 className="text-3xl font-black text-blue-900 tracking-tighter">{card.value}</h2>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Alertas */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
          <h3 className="text-lg font-black text-blue-900 mb-6 flex items-center gap-2">
            <AlertTriangle className="text-orange-500" size={20} /> Alertas de Conformidade
          </h3>
          <div className="space-y-4 flex-1">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 bg-orange-50 rounded-2xl border border-orange-100 gap-4">
              <div className="flex items-center gap-4">
                <div className="bg-orange-500 text-white p-3 rounded-xl shadow-lg shadow-orange-200">
                  <Clock size={20} />
                </div>
                <div>
                  <p className="text-sm font-black text-orange-950 uppercase tracking-tight">Contratos Vencendo</p>
                  <p className="text-xs text-orange-800 font-medium">
                    3 alunos com contrato terminando em menos de 15 dias.
                  </p>
                </div>
              </div>
              <button className="w-full sm:w-auto px-4 py-2 bg-white text-[10px] font-black text-orange-600 rounded-lg shadow-sm border border-orange-200 hover:bg-orange-100 transition-all uppercase tracking-widest">
                VER ALUNOS
              </button>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 bg-blue-50 rounded-2xl border border-blue-100 gap-4">
              <div className="flex items-center gap-4">
                <div className="bg-blue-600 text-white p-3 rounded-xl shadow-lg shadow-blue-200">
                  <TrendingUp size={20} />
                </div>
                <div>
                  <p className="text-sm font-black text-blue-950 uppercase tracking-tight">Avaliações Pendentes</p>
                  <p className="text-xs text-blue-800 font-medium">
                    8 estágios ativos sem a 1ª avaliação lançada.
                  </p>
                </div>
              </div>
              <button className="w-full sm:w-auto px-4 py-2 bg-white text-[10px] font-black text-blue-600 rounded-lg shadow-sm border border-blue-200 hover:bg-blue-100 transition-all uppercase tracking-widest">
                LANÇAR
              </button>
            </div>
          </div>
        </div>

        {/* Metas */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-black text-blue-900 mb-6 flex items-center gap-2">
            <CheckCircle2 className="text-green-500" size={20} /> Metas SEDUC-CE
          </h3>
          <div className="space-y-8">
            <div className="group">
              <div className="flex justify-between text-xs font-black uppercase tracking-widest mb-3">
                <span className="text-gray-500">Alunos Estagiando</span>
                <span className="text-green-600">85%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-green-400 to-green-600 h-full rounded-full transition-all duration-1000" 
                  style={{ width: '85%' }}
                ></div>
              </div>
            </div>
            
            <div className="group">
              <div className="flex justify-between text-xs font-black uppercase tracking-widest mb-3">
                <span className="text-gray-500">Horas Médias (Meta 400h)</span>
                <span className="text-blue-600">240h</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-blue-400 to-blue-600 h-full rounded-full transition-all duration-1000" 
                  style={{ width: '60%' }}
                ></div>
              </div>
            </div>

            <button className="w-full mt-6 flex items-center justify-center gap-3 py-4 border-2 border-dashed border-gray-200 text-gray-500 rounded-2xl hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all font-black text-xs uppercase tracking-widest">
              <FileSpreadsheet size={18} /> Exportar Relatório SICE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
