import { useState } from 'react';
import { Building2, Plus, Edit2, Trash2 } from 'lucide-react';
import { useSupabaseCrud } from '@/hooks/useSupabaseCrud';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { cn } from '@/lib/utils';

const empresaSchema = z.object({
  razao_social: z.string().min(3, 'Razão Social deve ter pelo menos 3 caracteres'),
  cnpj: z.string().min(14, 'CNPJ inválido'),
  endereco: z.string().optional(),
  cidade_id: z.string().uuid('Selecione uma cidade válida'),
  contato_nome: z.string().optional(),
  contato_email: z.string().email('Email inválido').optional().or(z.literal('')),
  contato_telefone: z.string().optional(),
  convenio_numero: z.string().optional(),
  convenio_validade: z.string().optional(),
});

type EmpresaFormValues = z.infer<typeof empresaSchema>;

interface Empresa {
  id: string;
  razao_social: string;
  cnpj: string;
  endereco?: string | null;
  cidade_id: string;
  contato_nome?: string | null;
  contato_email?: string | null;
  contato_telefone?: string | null;
  convenio_numero?: string | null;
  convenio_validade?: string | null;
  created_at: string;
}

export default function EmpresasPage() {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const {
    items: empresas,
    isLoading,
    create,
    update,
    remove,
  } = useSupabaseCrud<Empresa>('empresas', ['empresas']);
  const { items: cidades } = useSupabaseCrud<any>('cidades', ['cidades']);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<EmpresaFormValues>({
    resolver: zodResolver(empresaSchema),
  });

  const onSubmit = async (data: EmpresaFormValues) => {
    if (editingId) {
      await update({ id: editingId, ...data });
    } else {
      await create(data);
    }
    handleCancel();
  };

  const handleEdit = (empresa: Empresa) => {
    setEditingId(empresa.id);
    setValue('razao_social', empresa.razao_social);
    setValue('cnpj', empresa.cnpj);
    setValue('endereco', empresa.endereco || '');
    setValue('cidade_id', empresa.cidade_id);
    setValue('contato_nome', empresa.contato_nome || '');
    setValue('contato_email', empresa.contato_email || '');
    setValue('contato_telefone', empresa.contato_telefone || '');
    setValue('convenio_numero', empresa.convenio_numero || '');
    setValue('convenio_validade', empresa.convenio_validade || '');
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
            <Building2 className="text-blue-600" /> Empresas Concedentes
          </h1>
          <p className="text-gray-500">Gerencie as empresas que ofertam estágios.</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-all"
          >
            <Plus size={18} /> Nova Empresa
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 animate-in fade-in slide-in-from-top-4">
          <h2 className="text-lg font-semibold mb-4">
            {editingId ? 'Editar Empresa' : 'Nova Empresa'}
          </h2>
          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Razão Social</label>
              <input
                {...register('razao_social')}
                className={cn(
                  'w-full p-2 border rounded-lg',
                  errors.razao_social ? 'border-red-500' : 'border-gray-300'
                )}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CNPJ</label>
              <input
                {...register('cnpj')}
                className={cn(
                  'w-full p-2 border rounded-lg',
                  errors.cnpj ? 'border-red-500' : 'border-gray-300'
                )}
                placeholder="00.000.000/0000-00"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Endereço</label>
              <input
                {...register('endereco')}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
              <select
                {...register('cidade_id')}
                className={cn(
                  'w-full p-2 border rounded-lg',
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
            </div>

            <div className="pt-4 border-t border-gray-100 md:col-span-3 font-semibold text-gray-800">
              Dados de Contato
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome Contato</label>
              <input
                {...register('contato_nome')}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Contato</label>
              <input
                {...register('contato_email')}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Telefone Contato
              </label>
              <input
                {...register('contato_telefone')}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div className="pt-4 border-t border-gray-100 md:col-span-3 font-semibold text-gray-800">
              Dados do Convênio
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nº Convênio</label>
              <input
                {...register('convenio_numero')}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Validade</label>
              <input
                type="date"
                {...register('convenio_validade')}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div className="md:col-span-3 flex justify-end gap-2 mt-4">
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
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">Empresa</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">CNPJ</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">Contato</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">Validade Convênio</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                  Carregando empresas...
                </td>
              </tr>
            ) : empresas.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                  Nenhuma empresa cadastrada.
                </td>
              </tr>
            ) : (
              empresas.map((emp) => (
                <tr key={emp.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-gray-700 font-medium">{emp.razao_social}</td>
                  <td className="px-6 py-4 text-gray-600 text-sm">{emp.cnpj}</td>
                  <td className="px-6 py-4 text-gray-600 text-sm">
                    {emp.contato_nome}
                    <br />
                    <span className="text-xs text-gray-400">{emp.contato_email}</span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {emp.convenio_validade
                      ? new Date(emp.convenio_validade).toLocaleDateString('pt-BR')
                      : '-'}
                  </td>
                  <td className="px-6 py-4 text-right flex justify-end gap-2">
                    <button
                      onClick={() => handleEdit(emp)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => confirm('Excluir?') && remove(emp.id)}
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
