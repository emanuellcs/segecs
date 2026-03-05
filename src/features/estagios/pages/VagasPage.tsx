import { useState } from 'react';
import { Briefcase, Plus, Edit2, Trash2 } from 'lucide-react';
import { useSupabaseCrud } from '@/hooks/useSupabaseCrud';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { cn } from '@/lib/utils';

const vagaSchema = z.object({
  empresa_id: z.string().uuid('Selecione uma empresa válida'),
  curso_id: z.string().uuid('Selecione um curso válido'),
  titulo: z.string().min(3, 'Título deve ter pelo menos 3 caracteres'),
  descricao: z.string().optional().or(z.literal('')),
  quantidade: z.number().min(1, 'Mínimo 1 vaga'),
  status: z.enum(['aberta', 'preenchida', 'cancelada']),
});

type VagaFormValues = z.infer<typeof vagaSchema>;

interface Vaga {
  id: string;
  empresa_id: string;
  curso_id: string;
  titulo: string;
  descricao?: string | null;
  quantidade: number;
  status: string;
  created_at: string;
}

export default function VagasPage() {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const {
    items: vagas,
    isLoading,
    create,
    update,
    remove,
  } = useSupabaseCrud<Vaga>('vagas', ['vagas']);
  const { items: empresas } = useSupabaseCrud<any>('empresas', ['empresas']);
  const { items: cursos } = useSupabaseCrud<any>('cursos', ['cursos']);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<VagaFormValues>({
    resolver: zodResolver(vagaSchema),
    defaultValues: { quantidade: 1, status: 'aberta' },
  });

  const onSubmit = async (data: VagaFormValues) => {
    if (editingId) {
      await update({ id: editingId, ...data });
    } else {
      await create(data);
    }
    handleCancel();
  };

  const handleEdit = (vaga: Vaga) => {
    setEditingId(vaga.id);
    setValue('empresa_id', vaga.empresa_id);
    setValue('curso_id', vaga.curso_id);
    setValue('titulo', vaga.titulo);
    setValue('descricao', vaga.descricao || '');
    setValue('quantidade', vaga.quantidade);
    setValue('status', vaga.status as any);
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
            <Briefcase className="text-blue-600" /> Ofertas de Vagas
          </h1>
          <p className="text-gray-500">Gerencie as vagas de estágio ofertadas pelas empresas.</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-all"
          >
            <Plus size={18} /> Nova Vaga
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 animate-in fade-in slide-in-from-top-4">
          <h2 className="text-lg font-semibold mb-4">{editingId ? 'Editar Vaga' : 'Nova Vaga'}</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Título da Vaga</label>
              <input
                {...register('titulo')}
                className={cn(
                  'w-full p-2 border rounded-lg',
                  errors.titulo ? 'border-red-500' : 'border-gray-300'
                )}
                placeholder="Ex: Estágio em Desenvolvimento Web"
              />
              {errors.titulo && (
                <p className="text-red-500 text-xs mt-1">{errors.titulo.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Empresa</label>
              <select
                {...register('empresa_id')}
                className={cn(
                  'w-full p-2 border rounded-lg',
                  errors.empresa_id ? 'border-red-500' : 'border-gray-300'
                )}
              >
                <option value="">Selecione a empresa</option>
                {empresas.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.razao_social}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Curso Destinado
              </label>
              <select
                {...register('curso_id')}
                className={cn(
                  'w-full p-2 border rounded-lg',
                  errors.curso_id ? 'border-red-500' : 'border-gray-300'
                )}
              >
                <option value="">Selecione o curso</option>
                {cursos.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantidade</label>
              <input
                type="number"
                {...register('quantidade', { valueAsNumber: true })}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                {...register('status')}
                className="w-full p-2 border border-gray-300 rounded-lg"
              >
                <option value="aberta">Aberta</option>
                <option value="preenchida">Preenchida</option>
                <option value="cancelada">Cancelada</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descrição das Atividades
              </label>
              <textarea
                {...register('descricao')}
                className="w-full p-2 border border-gray-300 rounded-lg h-24"
                placeholder="O que o estagiário irá fazer?"
              />
            </div>

            <div className="md:col-span-2 flex justify-end gap-2 mt-4">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
              >
                {editingId ? 'Atualizar' : 'Salvar'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">Título / Empresa</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">Curso</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">Quantidade</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">Status</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                  Carregando vagas...
                </td>
              </tr>
            ) : vagas.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                  Nenhuma vaga cadastrada.
                </td>
              </tr>
            ) : (
              vagas.map((vaga) => (
                <tr key={vaga.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-gray-700 font-medium">{vaga.titulo}</div>
                    <div className="text-xs text-gray-400">
                      {empresas.find((e) => e.id === vaga.empresa_id)?.razao_social}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600 text-sm">
                    {cursos.find((c) => c.id === vaga.curso_id)?.nome || 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-gray-600 text-center md:text-left">
                    {vaga.quantidade}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={cn(
                        'px-2 py-1 rounded-full text-[10px] font-bold uppercase',
                        vaga.status === 'aberta'
                          ? 'bg-green-100 text-green-700'
                          : vaga.status === 'preenchida'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-700'
                      )}
                    >
                      {vaga.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right flex justify-end gap-2">
                    <button
                      onClick={() => handleEdit(vaga)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => confirm('Excluir?') && remove(vaga.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
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
