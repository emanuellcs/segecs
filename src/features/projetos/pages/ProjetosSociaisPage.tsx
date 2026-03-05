import { useState } from 'react';
import { Heart, Plus, Edit2, Trash2, CheckCircle } from 'lucide-react';
import { useSupabaseCrud } from '@/hooks/useSupabaseCrud';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { ProjetoSocial, Aluno } from '@/types/database';

const projetoSchema = z.object({
  aluno_id: z.string().uuid('Selecione um aluno válido'),
  titulo: z.string().min(5, 'Título deve ter pelo menos 5 caracteres'),
  descricao: z.string().optional().or(z.literal('')),
  horas_estimadas: z.number().min(1, 'Mínimo 1 hora'),
  data_execucao: z.string().optional().or(z.literal('')),
  status: z.enum(['planejado', 'executado']),
});

type ProjetoFormValues = z.infer<typeof projetoSchema>;

export default function ProjetosSociaisPage() {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const {
    items: projetos,
    isLoading,
    create,
    update,
    remove,
  } = useSupabaseCrud<ProjetoSocial>('projetos_sociais', ['projetos_sociais']);

  const { data: alunos = [] } = useQuery<Aluno[]>({
    queryKey: ['alunos-simples'],
    queryFn: async () => {
      const { data } = await supabase.from('alunos').select('id, nome');
      return (data || []) as Aluno[];
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ProjetoFormValues>({
    resolver: zodResolver(projetoSchema),
    defaultValues: { horas_estimadas: 30, status: 'planejado' },
  });

  const onSubmit = async (data: ProjetoFormValues) => {
    if (editingId) {
      await update({ id: editingId, ...data });
    } else {
      await create(data);
    }
    handleCancel();
  };

  const handleEdit = (proj: ProjetoSocial) => {
    setEditingId(proj.id);
    setValue('aluno_id', proj.aluno_id);
    setValue('titulo', proj.titulo);
    setValue('descricao', proj.descricao || '');
    setValue('horas_estimadas', proj.horas_estimadas);
    setValue('data_execucao', proj.data_execucao || '');
    setValue('status', proj.status);
    setShowForm(true);
  };

  const handleCancel = () => {
    setEditingId(null);
    setShowForm(false);
    reset();
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Heart className="text-red-500" /> Projetos Sociais
          </h1>
          <p className="text-gray-500">Gestão dos projetos obrigatórios (após 300h de estágio).</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-all"
          >
            <Plus size={18} /> Novo Projeto
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 animate-in fade-in slide-in-from-top-4">
          <h2 className="text-lg font-semibold mb-4">
            {editingId ? 'Editar Projeto' : 'Novo Projeto'}
          </h2>
          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Título do Projeto
              </label>
              <input
                {...register('titulo')}
                className={cn(
                  'w-full p-2 border rounded-lg',
                  errors.titulo ? 'border-red-500' : 'border-gray-300'
                )}
                placeholder="Ex: Manutenção de computadores na APAE"
              />
              {errors.titulo && (
                <p className="text-red-500 text-xs mt-1">{errors.titulo.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Aluno Responsável
              </label>
              <select
                {...register('aluno_id')}
                className={cn(
                  'w-full p-2 border rounded-lg',
                  errors.aluno_id ? 'border-red-500' : 'border-gray-300'
                )}
              >
                <option value="">Selecione o aluno</option>
                {alunos.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.nome}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Horas Estimadas
              </label>
              <input
                type="number"
                {...register('horas_estimadas', { valueAsNumber: true })}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data de Execução
              </label>
              <input
                type="date"
                {...register('data_execucao')}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                {...register('status')}
                className="w-full p-2 border border-gray-300 rounded-lg"
              >
                <option value="planejado">Planejado</option>
                <option value="executado">Executado</option>
              </select>
            </div>
            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descrição do Projeto
              </label>
              <textarea
                {...register('descricao')}
                className="w-full p-2 border border-gray-300 rounded-lg h-24"
                placeholder="O que será/foi realizado no projeto?"
              />
            </div>

            <div className="md:col-span-3 flex justify-end gap-2 mt-4">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all"
              >
                {editingId ? 'Atualizar Projeto' : 'Salvar Projeto'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">Título / Aluno</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">Horas</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">Data</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">Status</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                  Carregando projetos...
                </td>
              </tr>
            ) : projetos.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                  Nenhum projeto social registrado.
                </td>
              </tr>
            ) : (
              projetos.map((proj) => (
                <tr key={proj.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="text-gray-700 font-medium">{proj.titulo}</div>
                    <div className="text-xs text-gray-400">
                      {alunos.find((a) => a.id === proj.aluno_id)?.nome}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{proj.horas_estimadas}h</td>
                  <td className="px-6 py-4 text-gray-500 text-sm">
                    {proj.data_execucao
                      ? new Date(proj.data_execucao).toLocaleDateString('pt-BR')
                      : '-'}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={cn(
                        'px-2 py-1 rounded-full text-[10px] font-bold uppercase flex items-center gap-1 w-fit',
                        proj.status === 'executado'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      )}
                    >
                      {proj.status === 'executado' && <CheckCircle size={10} />}
                      {proj.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right flex justify-end gap-2">
                    <button
                      onClick={() => handleEdit(proj)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => confirm('Excluir?') && remove(proj.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
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
