import React, { useState } from 'react';
import { UserCog, Plus, Edit2, Trash2 } from 'lucide-react';
import { useSupabaseCrud } from '@/hooks/useSupabaseCrud';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { cn } from '@/lib/utils';

const supervisorSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  empresa_id: z.string().uuid('Selecione uma empresa válida'),
  cargo: z.string().optional(),
  formacao: z.string().optional(),
});

type SupervisorFormValues = z.infer<typeof supervisorSchema>;

interface Supervisor {
  id: string;
  nome: string;
  empresa_id: string;
  cargo: string | null;
  formacao: string | null;
  created_at: string;
}

export default function SupervisoresPage() {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  
  const { items: supervisores, isLoading, create, update, remove } = useSupabaseCrud<Supervisor>('supervisores', ['supervisores']);
  const { items: empresas } = useSupabaseCrud<any>('empresas', ['empresas']);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<SupervisorFormValues>({
    resolver: zodResolver(supervisorSchema),
  });

  const onSubmit = async (data: SupervisorFormValues) => {
    if (editingId) {
      await update({ id: editingId, ...data });
    } else {
      await create(data);
    }
    handleCancel();
  };

  const handleEdit = (sup: Supervisor) => {
    setEditingId(sup.id);
    setValue('nome', sup.nome);
    setValue('empresa_id', sup.empresa_id);
    setValue('cargo', sup.cargo || '');
    setValue('formacao', sup.formacao || '');
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
            <UserCog className="text-blue-600" /> Supervisores de Campo
          </h1>
          <p className="text-gray-500">Gerencie os profissionais que acompanham os alunos nas empresas.</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-all"
          >
            <Plus size={18} /> Novo Supervisor
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 animate-in fade-in slide-in-from-top-4">
          <h2 className="text-lg font-semibold mb-4">{editingId ? 'Editar Supervisor' : 'Novo Supervisor'}</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
              <input {...register('nome')} className={cn("w-full p-2 border rounded-lg", errors.nome ? "border-red-500" : "border-gray-300")} />
              {errors.nome && <p className="text-red-500 text-xs mt-1">{errors.nome.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Empresa</label>
              <select {...register('empresa_id')} className={cn("w-full p-2 border rounded-lg", errors.empresa_id ? "border-red-500" : "border-gray-300")}>
                <option value="">Selecione a empresa</option>
                {empresas.map(e => <option key={e.id} value={e.id}>{e.razao_social}</option>)}
              </select>
              {errors.empresa_id && <p className="text-red-500 text-xs mt-1">{errors.empresa_id.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cargo/Função</label>
              <input {...register('cargo')} className="w-full p-2 border border-gray-300 rounded-lg" placeholder="Ex: Analista de Sistemas" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Formação Acadêmica</label>
              <input {...register('formacao')} className="w-full p-2 border border-gray-300 rounded-lg" placeholder="Ex: Bacharel em Ciência da Computação" />
            </div>

            <div className="md:col-span-2 flex justify-end gap-2 mt-4">
              <button type="button" onClick={handleCancel} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancelar</button>
              <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">
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
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">Supervisor</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">Empresa</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">Cargo</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-400">Carregando supervisores...</td></tr>
            ) : supervisores.length === 0 ? (
              <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-400">Nenhum supervisor cadastrado.</td></tr>
            ) : (
              supervisores.map((sup) => (
                <tr key={sup.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-gray-700 font-medium">{sup.nome}</td>
                  <td className="px-6 py-4 text-gray-600">
                    {empresas.find(e => e.id === sup.empresa_id)?.razao_social || 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-gray-600 text-sm">{sup.cargo || '-'}</td>
                  <td className="px-6 py-4 text-right flex justify-end gap-2">
                    <button onClick={() => handleEdit(sup)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 size={16} /></button>
                    <button onClick={() => confirm('Excluir?') && remove(sup.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
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
