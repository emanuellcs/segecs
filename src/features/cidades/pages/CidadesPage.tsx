import React, { useState } from 'react';
import { MapPin, Plus, Edit2, Trash2 } from 'lucide-react';
import { useSupabaseCrud } from '@/hooks/useSupabaseCrud';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { cn } from '@/lib/utils';

const cidadeSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  uf: z.string().length(2, 'UF deve ter exatamente 2 caracteres').toUpperCase(),
});

type CidadeFormValues = z.infer<typeof cidadeSchema>;

interface Cidade {
  id: string;
  nome: string;
  uf: string;
  created_at: string;
}

export default function CidadesPage() {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const { items: cidades, isLoading, create, update, remove } = useSupabaseCrud<Cidade>('cidades', ['cidades']);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<CidadeFormValues>({
    resolver: zodResolver(cidadeSchema),
    defaultValues: { uf: 'CE' }
  });

  const onSubmit = async (data: CidadeFormValues) => {
    if (editingId) {
      await update({ id: editingId, ...data });
    } else {
      await create(data);
    }
    handleCancel();
  };

  const handleEdit = (cidade: Cidade) => {
    setEditingId(cidade.id);
    setValue('nome', cidade.nome);
    setValue('uf', cidade.uf);
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
            <MapPin className="text-blue-600" /> Municípios
          </h1>
          <p className="text-gray-500">Gerencie as cidades e estados atendidos pelo sistema.</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-all"
          >
            <Plus size={18} /> Nova Cidade
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 animate-in fade-in slide-in-from-top-4">
          <h2 className="text-lg font-semibold mb-4">{editingId ? 'Editar Cidade' : 'Nova Cidade'}</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Cidade</label>
              <input
                {...register('nome')}
                className={cn(
                  "w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all",
                  errors.nome ? "border-red-500" : "border-gray-300"
                )}
                placeholder="Ex: Fortaleza"
              />
              {errors.nome && <p className="text-red-500 text-xs mt-1">{errors.nome.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">UF</label>
              <input
                {...register('uf')}
                className={cn(
                  "w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all",
                  errors.uf ? "border-red-500" : "border-gray-300"
                )}
                placeholder="Ex: CE"
                maxLength={2}
              />
              {errors.uf && <p className="text-red-500 text-xs mt-1">{errors.uf.message}</p>}
            </div>
            <div className="md:col-span-3 flex justify-end gap-2 mt-2">
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
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">Cidade</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">UF</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr>
                <td colSpan={3} className="px-6 py-8 text-center text-gray-400">Carregando cidades...</td>
              </tr>
            ) : cidades.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-6 py-8 text-center text-gray-400">Nenhuma cidade cadastrada.</td>
              </tr>
            ) : (
              cidades.map((cidade) => (
                <tr key={cidade.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-gray-700 font-medium">{cidade.nome}</td>
                  <td className="px-6 py-4 text-gray-600">{cidade.uf}</td>
                  <td className="px-6 py-4 text-right flex justify-end gap-2">
                    <button
                      onClick={() => handleEdit(cidade)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                      title="Editar"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Tem certeza que deseja excluir esta cidade?')) {
                          remove(cidade.id);
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
