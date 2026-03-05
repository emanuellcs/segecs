import { useState } from 'react';
import { Users, Plus, Edit2, Trash2, Search, User, Phone, Fingerprint } from 'lucide-react';
import { useSupabaseCrud } from '@/hooks/useSupabaseCrud';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { cn } from '@/lib/utils';
import { FormModal } from '@/components/ui/FormModal';
import { ConfirmDeleteModal } from '@/components/ui/ConfirmDeleteModal';
import { InputMask } from '@/components/ui/InputMask';
import { toast } from 'sonner';

const responsavelSchema = z.object({
  nome: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres'),
  cpf: z.string().min(14, 'CPF inválido'),
  telefone: z.string().min(14, 'Telefone inválido'),
});

type ResponsavelFormValues = z.infer<typeof responsavelSchema>;

interface Responsavel {
  id: string;
  nome: string;
  cpf: string;
  telefone: string;
  created_at: string;
}

export default function ResponsaveisPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedResp, setSelectedResp] = useState<Responsavel | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const {
    items: responsaveis,
    isLoading,
    create,
    update,
    remove,
  } = useSupabaseCrud<Responsavel>('responsaveis', ['responsaveis']);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ResponsavelFormValues>({
    resolver: zodResolver(responsavelSchema),
  });

  const onSubmit = async (data: ResponsavelFormValues) => {
    try {
      if (selectedResp) {
        await update({ id: selectedResp.id, ...data });
        toast.success('Responsável atualizado com sucesso!');
      } else {
        await create(data);
        toast.success('Responsável cadastrado com sucesso!');
      }
      handleCloseForm();
    } catch (error) {
      toast.error('Erro ao salvar responsável');
    }
  };

  const handleEdit = (resp: Responsavel) => {
    setSelectedResp(resp);
    reset({
      nome: resp.nome,
      cpf: resp.cpf,
      telefone: resp.telefone,
    });
    setIsFormOpen(true);
  };

  const handleDeleteClick = (resp: Responsavel) => {
    setSelectedResp(resp);
    setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedResp) return;
    try {
      await remove(selectedResp.id);
      toast.success('Responsável removido com sucesso!');
      setIsDeleteOpen(false);
      setSelectedResp(null);
    } catch (error) {
      toast.error('Erro ao remover responsável');
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedResp(null);
    reset();
  };

  const filteredResponsaveis = responsaveis.filter(resp => 
    (resp.nome?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (resp.cpf || '').includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-black text-blue-900 flex items-center gap-2">
            <Users className="text-blue-600" size={28} /> Responsáveis
          </h1>
          <p className="text-gray-500 font-medium">Gestão de pais e tutores</p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl flex items-center justify-center gap-2 font-bold transition-all shadow-lg shadow-blue-200 active:scale-95"
        >
          <Plus size={20} /> Novo Responsável
        </button>
      </div>

      {/* Busca */}
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={20} />
        <input
          type="text"
          placeholder="Buscar por nome ou CPF..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
        />
      </div>

      {/* Listagem Mobile */}
      <div className="grid grid-cols-1 gap-4 lg:hidden">
        {isLoading ? (
          <div className="bg-white p-8 rounded-2xl text-center text-gray-400 animate-pulse font-bold">
            Carregando responsáveis...
          </div>
        ) : filteredResponsaveis.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl text-center text-gray-400 font-bold border-2 border-dashed border-gray-100">
            Nenhum responsável encontrado.
          </div>
        ) : (
          filteredResponsaveis.map((resp) => (
            <div key={resp.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                  <User size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 leading-tight">{resp.nome}</h3>
                  <div className="flex flex-col gap-1 mt-1">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                      <Fingerprint size={12} className="text-blue-400" /> {resp.cpf}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                      <Phone size={12} className="text-blue-400" /> {resp.telefone}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t border-gray-50">
                <button
                  onClick={() => handleEdit(resp)}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-50 text-blue-700 font-bold text-sm hover:bg-blue-100 transition-colors"
                >
                  <Edit2 size={16} /> Editar
                </button>
                <button
                  onClick={() => handleDeleteClick(resp)}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-50 text-red-700 font-bold text-sm hover:bg-red-100 transition-colors"
                >
                  <Trash2 size={16} /> Excluir
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Tabela Desktop */}
      <div className="hidden lg:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest">Responsável</th>
              <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest">CPF</th>
              <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest">Telefone</th>
              <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-gray-400 font-bold animate-pulse">
                  Carregando lista de responsáveis...
                </td>
              </tr>
            ) : filteredResponsaveis.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-gray-400 font-bold">
                  Nenhum responsável cadastrado.
                </td>
              </tr>
            ) : (
              filteredResponsaveis.map((resp) => (
                <tr key={resp.id} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs uppercase">
                        {resp.nome.substring(0, 2)}
                      </div>
                      <span className="text-gray-900 font-bold">{resp.nome}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600 font-medium">{resp.cpf}</td>
                  <td className="px-6 py-4 text-gray-600 font-medium">{resp.telefone}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEdit(resp)}
                        className="p-2 text-blue-600 hover:bg-white rounded-lg shadow-sm border border-transparent hover:border-blue-100 transition-all"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(resp)}
                        className="p-2 text-red-600 hover:bg-white rounded-lg shadow-sm border border-transparent hover:border-red-100 transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Form Modal */}
      <FormModal
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        title={selectedResp ? 'Editar Responsável' : 'Novo Cadastro de Responsável'}
        description="Informações de contato do pai ou tutor legal do aluno."
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-bold text-gray-700 ml-1">Nome Completo</label>
              <div className="relative mt-1">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  {...register('nome')}
                  className={cn(
                    "w-full pl-10 pr-3 py-2.5 rounded-lg border text-sm focus:ring-2 outline-none transition-all",
                    errors.nome ? "border-red-500 focus:ring-red-200" : "border-gray-200 focus:ring-blue-100 focus:border-blue-500"
                  )}
                  placeholder="Ex: Maria das Dores"
                />
              </div>
              {errors.nome && <p className="text-[11px] font-bold text-red-500 mt-1 ml-1">{errors.nome.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Controller
                name="cpf"
                control={control}
                render={({ field }) => (
                  <InputMask
                    mask="cpf"
                    label="CPF"
                    value={field.value || ''}
                    onChange={field.onChange}
                    error={errors.cpf?.message}
                    placeholder="000.000.000-00"
                  />
                )}
              />

              <Controller
                name="telefone"
                control={control}
                render={({ field }) => (
                  <InputMask
                    mask="phone"
                    label="Telefone/WhatsApp"
                    value={field.value || ''}
                    onChange={field.onChange}
                    error={errors.telefone?.message}
                    placeholder="(00) 00000-0000"
                  />
                )}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={handleCloseForm}
              className="flex-1 px-4 py-3 text-sm font-bold text-gray-500 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-[2] px-4 py-3 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-100 transition-all active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? 'Salvando...' : selectedResp ? 'Salvar Alterações' : 'Confirmar Cadastro'}
            </button>
          </div>
        </form>
      </FormModal>

      {/* Delete Confirmation */}
      <ConfirmDeleteModal
        isOpen={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onConfirm={confirmDelete}
        itemName={selectedResp?.nome}
      />
    </div>
  );
}
