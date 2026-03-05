import { useState } from 'react';
import { UserCheck, Plus, Edit2, Trash2 } from 'lucide-react';
import { useSupabaseCrud } from '@/hooks/useSupabaseCrud';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { cn } from '@/lib/utils';

const orientadorSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  cpf: z.string().optional(),
  escola_id: z.string().uuid('Selecione uma escola válida'),
});

type OrientadorFormValues = z.infer<typeof orientadorSchema>;

interface Orientador {
  id: string;
  nome: string;
  cpf?: string | null;
  escola_id: string;
  created_at: string;
}

export default function OrientadoresPage() {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const {
    items: orientadores,
    isLoading,
    create,
    update,
    remove,
  } = useSupabaseCrud<Orientador>('orientadores', ['orientadores']);
  const { items: escolas } = useSupabaseCrud<any>('escolas', ['escolas']);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<OrientadorFormValues>({
    resolver: zodResolver(orientadorSchema),
  });

  const onSubmit = async (data: OrientadorFormValues) => {
    if (editingId) {
      await update({ id: editingId, ...data });
    } else {
      await create(data);
    }
    handleCancel();
  };

  const handleEdit = (ori: Orientador) => {
    setEditingId(ori.id);
    setValue('nome', ori.nome);
    setValue('cpf', ori.cpf || '');
    setValue('escola_id', ori.escola_id);
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
            <UserCheck className="text-blue-600" /> Orientadores
          </h1>
          <p className="text-gray-500">Gerencie os professores orientadores de estágio.</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-all"
          >
            <Plus size={18} /> Novo Orientador
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 animate-in fade-in slide-in-from-top-4">
          <h2 className="text-lg font-semibold mb-4">
            {editingId ? 'Editar Orientador' : 'Novo Orientador'}
          </h2>
          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
              <input
                {...register('nome')}
                className={cn(
                  'w-full p-2 border rounded-lg',
                  errors.nome ? 'border-red-500' : 'border-gray-300'
                )}
              />
              {errors.nome && <p className="text-red-500 text-xs mt-1">{errors.nome.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CPF</label>
              <input
                {...register('cpf')}
                className="w-full p-2 border border-gray-300 rounded-lg"
                placeholder="000.000.000-00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Escola</label>
              <select
                {...register('escola_id')}
                className={cn(
                  'w-full p-2 border rounded-lg',
                  errors.escola_id ? 'border-red-500' : 'border-gray-300'
                )}
              >
                <option value="">Selecione a escola</option>
                {escolas.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.nome}
                  </option>
                ))}
              </select>
              {errors.escola_id && (
                <p className="text-red-500 text-xs mt-1">{errors.escola_id.message}</p>
              )}
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
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">Nome</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">CPF</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">Escola</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-400">
                  Carregando orientadores...
                </td>
              </tr>
            ) : orientadores.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-400">
                  Nenhum orientador cadastrado.
                </td>
              </tr>
            ) : (
              orientadores.map((ori) => (
                <tr key={ori.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-gray-700 font-medium">{ori.nome}</td>
                  <td className="px-6 py-4 text-gray-600">{ori.cpf || '-'}</td>
                  <td className="px-6 py-4 text-gray-600">
                    {escolas.find((e) => e.id === ori.escola_id)?.nome || 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-right flex justify-end gap-2">
                    <button
                      onClick={() => handleEdit(ori)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => confirm('Excluir?') && remove(ori.id)}
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
