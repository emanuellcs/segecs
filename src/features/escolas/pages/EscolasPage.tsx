import { useState } from 'react';
import { School, Plus, Edit2, Trash2 } from 'lucide-react';
import { useSupabaseCrud } from '@/hooks/useSupabaseCrud';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { cn } from '@/lib/utils';

const escolaSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  inep: z.string().optional(),
  cidade_id: z.string().uuid('Selecione uma cidade válida'),
});

type EscolaFormValues = z.infer<typeof escolaSchema>;

interface Escola {
  id: string;
  nome: string;
  inep?: string | null;
  cidade_id: string;
  created_at: string;
  cidades?: { nome: string };
}

export default function EscolasPage() {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const {
    items: escolas,
    isLoading,
    create,
    update,
    remove,
  } = useSupabaseCrud<Escola>('escolas', ['escolas']);
  const { items: cidades } = useSupabaseCrud<any>('cidades', ['cidades']);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<EscolaFormValues>({
    resolver: zodResolver(escolaSchema),
  });

  const onSubmit = async (data: EscolaFormValues) => {
    if (editingId) {
      await update({ id: editingId, ...data });
    } else {
      await create(data);
    }
    handleCancel();
  };

  const handleEdit = (escola: Escola) => {
    setEditingId(escola.id);
    setValue('nome', escola.nome);
    setValue('inep', escola.inep || '');
    setValue('cidade_id', escola.cidade_id);
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
            <School className="text-blue-600" /> Escolas
          </h1>
          <p className="text-gray-500">Gerencie as instituições de ensino vinculadas.</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-all"
          >
            <Plus size={18} /> Nova Escola
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 animate-in fade-in slide-in-from-top-4">
          <h2 className="text-lg font-semibold mb-4">
            {editingId ? 'Editar Escola' : 'Nova Escola'}
          </h2>
          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Escola</label>
              <input
                {...register('nome')}
                className={cn(
                  'w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all',
                  errors.nome ? 'border-red-500' : 'border-gray-300'
                )}
                placeholder="Ex: EEEP Manoel Mano"
              />
              {errors.nome && <p className="text-red-500 text-xs mt-1">{errors.nome.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">INEP</label>
              <input
                {...register('inep')}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="Opcional"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
              <select
                {...register('cidade_id')}
                className={cn(
                  'w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all',
                  errors.cidade_id ? 'border-red-500' : 'border-gray-300'
                )}
              >
                <option value="">Selecione uma cidade</option>
                {cidades.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome} - {c.uf}
                  </option>
                ))}
              </select>
              {errors.cidade_id && (
                <p className="text-red-500 text-xs mt-1">{errors.cidade_id.message}</p>
              )}
            </div>
            <div className="md:col-span-2 flex justify-end gap-2 mt-2">
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
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">Escola</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">INEP</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">Cidade</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-400">
                  Carregando escolas...
                </td>
              </tr>
            ) : escolas.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-400">
                  Nenhuma escola cadastrada.
                </td>
              </tr>
            ) : (
              escolas.map((escola) => (
                <tr key={escola.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-gray-700 font-medium">{escola.nome}</td>
                  <td className="px-6 py-4 text-gray-600">{escola.inep || '-'}</td>
                  <td className="px-6 py-4 text-gray-600">
                    {cidades.find((c) => c.id === escola.cidade_id)?.nome || 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-right flex justify-end gap-2">
                    <button
                      onClick={() => handleEdit(escola)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                      title="Editar"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Tem certeza que deseja excluir esta escola?')) {
                          remove(escola.id);
                        }
                      }}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      title="Excluir"
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
