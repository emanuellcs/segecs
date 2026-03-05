import React from 'react';
import { 
  Users, 
  Briefcase, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  TrendingUp,
  FileSpreadsheet
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
        supabase.from('vagas').select('id', { count: 'exact' }).eq('status', 'aberta')
      ]);

      const totalHoras = frequencias.data?.reduce((acc, f) => acc + f.horas_realizadas, 0) || 0;
      const estagiosAtivos = estagios.data?.filter(e => e.status === 'ativo').length || 0;

      return {
        totalAlunos: alunos.count || 0,
        estagiosAtivos,
        totalHoras,
        vagasAbertas: vagas.count || 0,
        concluidos: estagios.data?.filter(e => e.status === 'concluido').length || 0
      };
    }
  });

  const cards = [
    { label: 'Total de Alunos', value: stats?.totalAlunos, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Estágios Ativos', value: stats?.estagiosAtivos, icon: Briefcase, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Horas Acumuladas', value: `${stats?.totalHoras}h`, icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Vagas Abertas', value: stats?.vagasAbertas, icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  if (isLoading) {
    return (
      <div className="p-8 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-900"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">Visão geral do sistema de estágios SEGECS.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className={cn("p-3 rounded-xl", card.bg)}>
              <card.icon className={card.color} size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{card.label}</p>
              <h2 className="text-2xl font-black text-gray-800">{card.value}</h2>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <AlertTriangle className="text-orange-500" size={20} /> Alertas de Conformidade
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-orange-50 rounded-xl border border-orange-100">
              <div className="flex items-center gap-3">
                <div className="bg-orange-500 text-white p-2 rounded-lg"><Clock size={16} /></div>
                <div>
                  <p className="text-sm font-bold text-orange-900">Contratos Vencendo</p>
                  <p className="text-xs text-orange-700">3 alunos com contrato terminando em menos de 15 dias.</p>
                </div>
              </div>
              <button className="text-xs font-bold text-orange-600 hover:underline">VER ALUNOS</button>
            </div>
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-100">
              <div className="flex items-center gap-3">
                <div className="bg-blue-500 text-white p-2 rounded-lg"><TrendingUp size={16} /></div>
                <div>
                  <p className="text-sm font-bold text-blue-900">Avaliações Pendentes</p>
                  <p className="text-xs text-blue-700">8 estágios ativos sem a 1ª avaliação lançada.</p>
                </div>
              </div>
              <button className="text-xs font-bold text-blue-600 hover:underline">LANÇAR</button>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <CheckCircle2 className="text-green-500" size={20} /> Metas SEDUC-CE
          </h3>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600 font-medium">Alunos Estagiando</span>
                <span className="text-gray-900 font-bold">85%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '85%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600 font-medium">Horas Médias (Meta 400h)</span>
                <span className="text-gray-900 font-bold">240h</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '60%' }}></div>
              </div>
            </div>
            <button className="w-full mt-4 flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-200 text-gray-500 rounded-xl hover:bg-gray-50 hover:text-blue-600 transition-all font-medium text-sm">
              <FileSpreadsheet size={18} /> Exportar Relatório SICE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
