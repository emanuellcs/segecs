import React, { useState } from 'react';
import { Award, Plus, Edit2, Trash2, TrendingUp } from 'lucide-react';
import { useSupabaseCrud } from '@/hooks/useSupabaseCrud';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

const avaliacaoSchema = z.object({
  estagio_id: z.string().uuid('Selecione um estágio válido'),
  tipo: z.number().min(1).max(3), // 1ª, 2ª ou 3ª avaliação
  nota: z.number().min(0).max(10),
  comentarios: z.string().optional(),
  data_avaliacao: z.string(),
});

type AvaliacaoFormValues = z.infer<typeof avaliacaoSchema>;

interface Avaliacao {
  id: string;
  estagio_id: string;
  tipo: number;
  nota: number;
  comentarios: string | null;
  data_avaliacao: string;
  created_at: string;
}

export default function AvaliacoesPage() {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedEstagioId, setSelectedEstagioId] = useState<string>('');

  const { items: avaliacoes, isLoading, create, update, remove } = useSupabaseCrud<Avaliacao>('avaliacoes', ['avaliacoes', selectedEstagioId]);
  
  const { data: estagios = [] } = useQuery({
    queryKey: ['estagios-simples'],
    queryFn: async () => {
      const { data } = await supabase.from('estagios').select('id, aluno_id, status');
      return data || [];
    }
  });

  const { data: alunos = [] } = useQuery({
    queryKey: ['alunos-simples'],
    queryFn: async () => {
      const { data } = await supabase.from('alunos').select('id, nome');
      return data || [];
    }
  });

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<AvaliacaoFormValues>({
    resolver: zodResolver(avaliacaoSchema),
    defaultValues: { tipo: 1, data_avaliacao: new Date().toISOString().split('T')[0] }
  });

  const onSubmit = async (data: AvaliacaoFormValues) => {
    if (editingId) {
      await update({ id: editingId, ...data });
    } else {
      await create(data);
    }
    handleCancel();
  };

  const handleEdit = (av: Avaliacao) => {
    setEditingId(av.id);
    setValue('estagio_id', av.estagio_id);
    setValue('tipo', av.tipo);
    setValue('nota', av.nota);
    setValue('comentarios', av.comentarios || '');
    setValue('data_avaliacao', av.data_avaliacao);
    setShowForm(true);
  };

  const handleCancel = () => {
    setEditingId(null);
    setShowForm(false);
    reset();
  };

  const mediaGeral = avaliacoes.length > 0 
    ? (avaliacoes.reduce((acc, a) => acc + a.nota, 0) / avaliacoes.length).toFixed(1)
    : '0';

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Award className="text-blue-600" /> Avaliações de Desempenho
          </h1>
          <p className="text-gray-500">Registro das 3 notas obrigatórias por período de estágio.</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-all"
          >
            <Plus size={18} /> Lançar Nota
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Filtrar por Estágio</label>
          <select 
            className="w-full p-2 border border-gray-300 rounded-lg text-sm"
            value={selectedEstagioId}
            onChange={(e) => setSelectedEstagioId(e.target.value)}
          >
            <option value="">Todos os estágios</option>
            {estagios.map((est: any) => (
              <option key={est.id} value={est.id}>
                {alunos.find((a: any) => a.id === est.aluno_id)?.nome}
              </option>
            ))}
          </select>
        </div>
        <div className="bg-orange-500 text-white p-4 rounded-xl shadow-md flex justify-between items-center">
          <div>
            <p className="text-orange-100 text-xs font-bold uppercase tracking-wider">Média de Notas</p>
            <h2 className="text-3xl font-black">{mediaGeral}</h2>
          </div>
          <div className="opacity-20"><TrendingUp size={48} /></div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
          <div>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Total de Lançamentos</p>
            <h2 className="text-3xl font-black text-gray-700">{avaliacoes.length}</h2>
          </div>
          <div className="text-blue-100"><Award size={48} /></div>
        </div>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 animate-in fade-in slide-in-from-top-4">
          <h2 className="text-lg font-semibold mb-4">{editingId ? 'Editar Avaliação' : 'Nova Avaliação'}</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estágio / Aluno</label>
              <select {...register('estagio_id')} className={cn("w-full p-2 border rounded-lg", errors.estagio_id ? "border-red-500" : "border-gray-300")}>
                <option value="">Selecione o estágio</option>
                {estagios.map((est: any) => (
                  <option key={est.id} value={est.id}>
                    {alunos.find((a: any) => a.id === est.aluno_id)?.nome}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Avaliação</label>
              <select {...register('tipo', { valueAsNumber: true })} className="w-full p-2 border border-gray-300 rounded-lg">
                <option value={1}>1ª Avaliação</option>
                <option value={2}>2ª Avaliação</option>
                <option value={3}>3ª Avaliação (Final)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nota (0 a 10)</label>
              <input type="number" step="0.1" {...register('nota', { valueAsNumber: true })} className="w-full p-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data da Avaliação</label>
              <input type="date" {...register('data_avaliacao')} className="w-full p-2 border border-gray-300 rounded-lg" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Comentários / Observações</label>
              <input {...register('comentarios')} className="w-full p-2 border border-gray-300 rounded-lg" placeholder="Pontos fortes e fracos do estagiário..." />
            </div>

            <div className="md:col-span-3 flex justify-end gap-2 mt-4">
              <button type="button" onClick={handleCancel} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-all">Cancelar</button>
              <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all">
                {editingId ? 'Atualizar Avaliação' : 'Salvar Nota'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">Aluno</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">Avaliação</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">Data</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">Nota</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-400">Carregando avaliações...</td></tr>
            ) : avaliacoes.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-400">Nenhuma avaliação registrada.</td></tr>
            ) : (
              avaliacoes
                .filter(a => !selectedEstagioId || a.estagio_id === selectedEstagioId)
                .map((av) => (
                <tr key={av.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-gray-700 font-medium">
                    {alunos.find((a: any) => a.id === estagios.find((e: any) => e.id === av.estagio_id)?.aluno_id)?.nome}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    <span className="px-2 py-1 bg-gray-100 rounded text-xs font-bold">{av.tipo}ª NOTA</span>
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-sm">
                    {new Date(av.data_avaliacao).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-6 py-4 font-black text-blue-800 text-lg">{av.nota.toFixed(1)}</td>
                  <td className="px-6 py-4 text-right flex justify-end gap-2">
                    <button onClick={() => handleEdit(av)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><Edit2 size={16} /></button>
                    <button onClick={() => confirm('Excluir?') && remove(av.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
