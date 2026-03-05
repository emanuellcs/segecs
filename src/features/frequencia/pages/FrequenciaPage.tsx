import { useState } from 'react';
import { Clock, Plus, Edit2, Trash2, CheckCircle2 } from 'lucide-react';
import { useSupabaseCrud } from '@/hooks/useSupabaseCrud';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Frequencia, Estagio, Aluno } from '@/types/database';

const frequenciaSchema = z.object({
  estagio_id: z.string().uuid('Selecione um estágio válido'),
  data: z.string(),
  horas_realizadas: z.number().min(1, 'Mínimo 1 hora').max(10, 'Máximo 10 horas'),
  atividades: z.string().min(10, 'Descreva as atividades brevemente'),
  validado_supervisor: z.boolean(),
  validado_orientador: z.boolean(),
});

type FrequenciaFormValues = z.infer<typeof frequenciaSchema>;

export default function FrequenciaPage() {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedEstagioId, setSelectedEstagioId] = useState<string>('');

  const { items: frequencias, isLoading, create, update, remove } = useSupabaseCrud<Frequencia>('frequencias', ['frequencias', selectedEstagioId]);
  
  const { data: estagios = [] } = useQuery<Estagio[]>({
    queryKey: ['estagios-ativos'],
    queryFn: async () => {
      const { data } = await supabase.from('estagios').select('id, aluno_id, status').eq('status', 'ativo');
      return (data || []) as Estagio[];
    }
  });

  const { data: alunos = [] } = useQuery<Aluno[]>({
    queryKey: ['alunos-simples'],
    queryFn: async () => {
      const { data } = await supabase.from('alunos').select('id, nome');
      return (data || []) as Aluno[];
    }
  });

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<FrequenciaFormValues>({
    resolver: zodResolver(frequenciaSchema),
    defaultValues: { horas_realizadas: 6, validado_supervisor: false, validado_orientador: false }
  });

  const onSubmit = async (data: FrequenciaFormValues) => {
    if (editingId) {
      await update({ id: editingId, ...data });
    } else {
      await create(data);
    }
    handleCancel();
  };

  const handleEdit = (freq: Frequencia) => {
    setEditingId(freq.id);
    setValue('estagio_id', freq.estagio_id);
    setValue('data', freq.data);
    setValue('horas_realizadas', freq.horas_realizadas);
    setValue('atividades', freq.atividades);
    setValue('validado_supervisor', freq.validado_supervisor);
    setValue('validado_orientador', freq.validado_orientador);
    setShowForm(true);
  };

  const handleCancel = () => {
    setEditingId(null);
    setShowForm(false);
    reset();
  };

  const totalHoras = frequencias
    .filter(f => !selectedEstagioId || f.estagio_id === selectedEstagioId)
    .reduce((acc, f) => acc + f.horas_realizadas, 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Clock className="text-blue-600" /> Registro de Frequência
          </h1>
          <p className="text-gray-500">Acompanhamento diário das horas de estágio.</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-all"
          >
            <Plus size={18} /> Novo Registro
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Filtrar por Estágio/Aluno</label>
          <select 
            className="w-full p-2 border border-gray-300 rounded-lg text-sm"
            value={selectedEstagioId}
            onChange={(e) => setSelectedEstagioId(e.target.value)}
          >
            <option value="">Todos os estágios</option>
            {estagios.map((est) => (
              <option key={est.id} value={est.id}>
                {alunos.find((a) => a.id === est.aluno_id)?.nome || 'Aluno Desconhecido'}
              </option>
            ))}
          </select>
        </div>
        <div className="bg-blue-600 text-white p-4 rounded-xl shadow-md flex justify-between items-center">
          <div>
            <p className="text-blue-100 text-xs font-bold uppercase tracking-wider">Total Acumulado</p>
            <h2 className="text-3xl font-black">{totalHoras}h</h2>
          </div>
          <div className="opacity-20"><Clock size={48} /></div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
          <div>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Meta Obrigatória</p>
            <h2 className="text-3xl font-black text-gray-700">400h</h2>
          </div>
          <div className="text-blue-100"><CheckCircle2 size={48} /></div>
        </div>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 animate-in fade-in slide-in-from-top-4">
          <h2 className="text-lg font-semibold mb-4">{editingId ? 'Editar Registro' : 'Lançar Horas'}</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Estágio / Aluno</label>
              <select {...register('estagio_id')} className={cn("w-full p-2 border rounded-lg", errors.estagio_id ? "border-red-500" : "border-gray-300")}>
                <option value="">Selecione o estágio</option>
                {estagios.map((est) => (
                  <option key={est.id} value={est.id}>
                    {alunos.find((a) => a.id === est.aluno_id)?.nome || 'Aluno Desconhecido'}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
              <input type="date" {...register('data')} className="w-full p-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Horas Realizadas</label>
              <input type="number" {...register('horas_realizadas', { valueAsNumber: true })} className="w-full p-2 border border-gray-300 rounded-lg" />
            </div>
            <div className="md:col-span-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Atividades Desempenhadas</label>
              <textarea {...register('atividades')} className="w-full p-2 border border-gray-300 rounded-lg h-24" placeholder="Ex: Manutenção de computadores no laboratório B, instalação de SO..." />
              {errors.atividades && <p className="text-red-500 text-xs mt-1">{errors.atividades.message}</p>}
            </div>

            <div className="md:col-span-4 flex justify-end gap-2 mt-4">
              <button type="button" onClick={handleCancel} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-all">Cancelar</button>
              <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all">
                {editingId ? 'Atualizar Registro' : 'Confirmar Lançamento'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">Data</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">Atividades</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">Horas</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">Validação</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-400">Carregando registros...</td></tr>
            ) : frequencias.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-400">Nenhum registro de frequência encontrado.</td></tr>
            ) : (
              frequencias
                .filter(f => !selectedEstagioId || f.estagio_id === selectedEstagioId)
                .map((freq) => (
                <tr key={freq.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-gray-700 font-medium">
                    {new Date(freq.data).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-6 py-4 text-gray-600 text-sm max-w-xs truncate">
                    {freq.atividades}
                  </td>
                  <td className="px-6 py-4 font-bold text-blue-700">{freq.horas_realizadas}h</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <span className={cn(
                        "text-[10px] font-bold px-1.5 py-0.5 rounded border",
                        freq.validado_supervisor ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-50 text-gray-400 border-gray-200"
                      )}>SUP</span>
                      <span className={cn(
                        "text-[10px] font-bold px-1.5 py-0.5 rounded border",
                        freq.validado_orientador ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-gray-50 text-gray-400 border-gray-200"
                      )}>ORI</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right flex justify-end gap-2">
                    <button onClick={() => handleEdit(freq)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><Edit2 size={16} /></button>
                    <button onClick={() => confirm('Excluir?') && remove(freq.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={16} /></button>
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
