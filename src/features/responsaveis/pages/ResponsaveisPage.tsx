import React, { useState } from 'react';
import { Users, Plus, Edit2, Trash2 } from 'lucide-react';
import { useSupabaseCrud } from '@/hooks/useSupabaseCrud';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { cn } from '@/lib/utils';

const responsavelSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  cpf: z.string().optional(),
  telefone: z.string().optional(),
});

type ResponsavelFormValues = z.infer<typeof responsavelSchema>;

interface Responsavel {
  id: string;
  nome: string;
  cpf: string | null;
  telefone: string | null;
  created_at: string;
}

export default function ResponsaveisPage() {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  
  const { items: responsaveis, isLoading, create, update, remove } = useSupabaseCrud<Responsavel>('responsaveis', ['responsaveis']);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<ResponsavelFormValues>({
    resolver: zodResolver(responsavelSchema),
  });

  const onSubmit = async (data: ResponsavelFormValues) => {
    if (editingId) {
      await update({ id: editingId, ...data });
    } else {
      await create(data);
    }
    handleCancel();
  };

  const handleEdit = (resp: Responsavel) => {
    setEditingId(resp.id);
    setValue('nome', resp.nome);
    setValue('cpf', resp.cpf || '');
    setValue('telefone', resp.telefone || '');
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
            <Users className="text-blue-600" /> Responsáveis
          </h1>
          <p className="text-gray-500">Gerencie os pais ou tutores dos alunos.</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-all"
          >
            <Plus size={18} /> Novo Responsável
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 animate-in fade-in slide-in-from-top-4">
          <h2 className="text-lg font-semibold mb-4">{editingId ? 'Editar Responsável' : 'Novo Responsável'}</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
              <input
                {...register('nome')}
                className={cn(
                  "w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all",
                  errors.nome ? "border-red-500" : "border-gray-300"
                )}
                placeholder="Ex: João da Silva"
              />
              {errors.nome && <p className="text-red-500 text-xs mt-1">{errors.nome.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CPF</label>
              <input
                {...register('cpf')}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="000.000.000-00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
              <input
                {...register('telefone')}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="(00) 00000-0000"
              />
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
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">Nome</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">CPF</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">Telefone</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-400">Carregando responsáveis...</td>
              </tr>
            ) : responsaveis.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-400">Nenhum responsável cadastrado.</td>
              </tr>
            ) : (
              responsaveis.map((resp) => (
                <tr key={resp.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-gray-700 font-medium">{resp.nome}</td>
                  <td className="px-6 py-4 text-gray-600">{resp.cpf || '-'}</td>
                  <td className="px-6 py-4 text-gray-600">{resp.telefone || '-'}</td>
                  <td className="px-6 py-4 text-right flex justify-end gap-2">
                    <button
                      onClick={() => handleEdit(resp)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                      title="Editar"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Tem certeza que deseja excluir este responsável?')) {
                          remove(resp.id);
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
