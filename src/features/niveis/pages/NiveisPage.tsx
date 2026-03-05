import React, { useState } from 'react';
import { Layers, Plus, Edit2, Trash2 } from 'lucide-react';
import { useSupabaseCrud } from '@/hooks/useSupabaseCrud';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { cn } from '@/lib/utils';

const nivelSchema = z.object({
  descricao: z.string().min(3, 'Descrição deve ter pelo menos 3 caracteres'),
});

type NivelFormValues = z.infer<typeof nivelSchema>;

interface Nivel {
  id: string;
  descricao: string;
  created_at: string;
}

export default function NiveisPage() {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const { items: niveis, isLoading, create, update, remove } = useSupabaseCrud<Nivel>('niveis', ['niveis']);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<NivelFormValues>({
    resolver: zodResolver(nivelSchema),
  });

  const onSubmit = async (data: NivelFormValues) => {
    if (editingId) {
      await update({ id: editingId, ...data });
    } else {
      await create(data);
    }
    handleCancel();
  };

  const handleEdit = (nivel: Nivel) => {
    setEditingId(nivel.id);
    setValue('descricao', nivel.descricao);
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
            <Layers className="text-blue-600" /> Níveis de Ensino
          </h1>
          <p className="text-gray-500">Gerencie os níveis educacionais oferecidos.</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-all"
          >
            <Plus size={18} /> Novo Nível
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 animate-in fade-in slide-in-from-top-4">
          <h2 className="text-lg font-semibold mb-4">{editingId ? 'Editar Nível' : 'Novo Nível'}</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
              <input
                {...register('descricao')}
                className={cn(
                  "w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all",
                  errors.descricao ? "border-red-500" : "border-gray-300"
                )}
                placeholder="Ex: Ensino Médio Integrado"
              />
              {errors.descricao && <p className="text-red-500 text-xs mt-1">{errors.descricao.message}</p>}
            </div>
            <div className="flex items-end gap-2">
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
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">Descrição</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr>
                <td colSpan={2} className="px-6 py-8 text-center text-gray-400">Carregando níveis...</td>
              </tr>
            ) : niveis.length === 0 ? (
              <tr>
                <td colSpan={2} className="px-6 py-8 text-center text-gray-400">Nenhum nível cadastrado.</td>
              </tr>
            ) : (
              niveis.map((nivel) => (
                <tr key={nivel.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-gray-700 font-medium">{nivel.descricao}</td>
                  <td className="px-6 py-4 text-right flex justify-end gap-2">
                    <button
                      onClick={() => handleEdit(nivel)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                      title="Editar"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Tem certeza que deseja excluir este nível?')) {
                          remove(nivel.id);
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
