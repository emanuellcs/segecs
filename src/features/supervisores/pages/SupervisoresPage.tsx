import { useState } from 'react';
import {
  UserCog,
  Plus,
  Edit2,
  Trash2,
  Search,
  Building2,
  Briefcase,
  GraduationCap,
  Phone,
} from 'lucide-react';
import { useSupabaseCrud } from '@/hooks/useSupabaseCrud';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { cn } from '@/lib/utils';
import { FormModal } from '@/components/ui/FormModal';
import { ConfirmDeleteModal } from '@/components/ui/ConfirmDeleteModal';
import { InputMask } from '@/components/ui/InputMask';
import { ListLayoutToggle } from '@/components/ui/ListLayoutToggle';
import { useListLayout } from '@/hooks/useListLayout';
import { toast } from 'sonner';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { usePagination } from '@/hooks/usePagination';
import { Pagination } from '@/components/ui/Pagination';

const supervisorSchema = z.object({
  nome: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres'),
  cpf: z.string().min(14, 'CPF inválido').optional().or(z.literal('')),
  telefone: z.string().min(14, 'Telefone inválido').optional().or(z.literal('')),
  empresa_id: z.string().uuid('Selecione uma empresa válida'),
  cargo: z.string().min(1, 'O cargo é obrigatório'),
  formacao: z.string().optional(),
});

type SupervisorFormValues = z.infer<typeof supervisorSchema>;

interface Supervisor {
  id: string;
  nome: string;
  cpf?: string | null;
  telefone?: string | null;
  empresa_id: string;
  cargo: string;
  formacao?: string | null;
  created_at: string;
}

export default function SupervisoresPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedSupervisor, setSelectedSupervisor] = useState<Supervisor | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const {
    items: supervisores,
    isLoading,
    create,
    update,
    remove,
  } = useSupabaseCrud<Supervisor>('supervisores', ['supervisores']);

  const { items: empresas } = useSupabaseCrud<any>('empresas', ['empresas']);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<SupervisorFormValues>({
    resolver: zodResolver(supervisorSchema),
  });

  const onSubmit = async (data: SupervisorFormValues) => {
    try {
      if (selectedSupervisor) {
        await update({ id: selectedSupervisor.id, ...data });
        toast.success('Supervisor atualizado com sucesso!');
      } else {
        await create(data);
        toast.success('Supervisor cadastrado com sucesso!');
      }
      handleCloseForm();
    } catch (error) {
      toast.error('Erro ao salvar supervisor');
    }
  };

  const handleEdit = (supervisor: Supervisor) => {
    setSelectedSupervisor(supervisor);
    reset({
      nome: supervisor.nome,
      cpf: supervisor.cpf || '',
      telefone: supervisor.telefone || '',
      empresa_id: supervisor.empresa_id,
      cargo: supervisor.cargo || '',
      formacao: supervisor.formacao || '',
    });
    setIsFormOpen(true);
  };

  const handleDeleteClick = (supervisor: Supervisor) => {
    setSelectedSupervisor(supervisor);
    setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedSupervisor) return;
    try {
      await remove(selectedSupervisor.id);
      toast.success('Supervisor removido com sucesso!');
      setIsDeleteOpen(false);
      setSelectedSupervisor(null);
    } catch (error) {
      toast.error('Erro ao remover supervisor');
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedSupervisor(null);
    reset();
  };

  const filteredSupervisores = supervisores.filter(
    (supervisor) =>
      (supervisor.nome?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (supervisor.cargo?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  const pagination = usePagination(filteredSupervisores);

  const { listLayout } = useListLayout();

  if (isLoading) return <LoadingScreen />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-black text-blue-900 flex items-center gap-2">
            <UserCog className="text-blue-600" size={28} /> Supervisores
          </h1>
          <p className="text-gray-500 font-medium">Gestão de supervisores de campo</p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl flex items-center justify-center gap-2 font-bold transition-all shadow-lg shadow-blue-200 active:scale-95"
        >
          <Plus size={20} /> Novo Supervisor
        </button>
      </div>

      {/* Busca e Layout Toggle */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative group flex-1">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors"
            size={20}
          />
          <input
            type="text"
            placeholder="Buscar por nome ou cargo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
          />
        </div>
        <ListLayoutToggle />
      </div>

      {/* Listagem Responsiva (Cards) */}
      <div
        className={cn(
          'grid grid-cols-1 gap-4',
          listLayout === 'table' ? 'lg:hidden' : 'lg:grid-cols-2 xl:grid-cols-3'
        )}
      >
        {pagination.currentItems.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl text-center text-gray-400 font-bold border-2 border-dashed border-gray-100 col-span-full">
            Nenhum supervisor encontrado.
          </div>
        ) : (
          pagination.currentItems.map((supervisor) => (
            <div
              key={supervisor.id}
              className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-4"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                    <UserCog size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 leading-tight">{supervisor.nome}</h3>
                    <p className="text-xs text-gray-500 font-medium">{supervisor.cargo}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2 pt-2">
                <div className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 p-2 rounded-lg">
                  <Building2 size={14} className="text-blue-500" />
                  <span className="truncate">
                    {empresas.find((e: any) => e.id === supervisor.empresa_id)?.razao_social ||
                      'N/A'}
                  </span>
                </div>
                {supervisor.telefone && (
                  <div className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 p-2 rounded-lg">
                    <Phone size={14} className="text-blue-500" />
                    <span>{supervisor.telefone}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-2 border-t border-gray-50">
                <button
                  onClick={() => handleEdit(supervisor)}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-50 text-blue-700 font-bold text-sm hover:bg-blue-100 transition-colors"
                >
                  <Edit2 size={16} /> Editar
                </button>
                <button
                  onClick={() => handleDeleteClick(supervisor)}
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
      {listLayout === 'table' && (
        <div className="hidden lg:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest">
                  Supervisor
                </th>
                <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest">
                  Cargo
                </th>
                <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest">
                  Empresa
                </th>
                <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest text-right">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pagination.currentItems.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-400 font-bold">
                    Nenhum supervisor cadastrado.
                  </td>
                </tr>
              ) : (
                pagination.currentItems.map((supervisor) => (
                  <tr key={supervisor.id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs uppercase">
                          {supervisor.nome.substring(0, 2)}
                        </div>
                        <span className="text-gray-900 font-bold">{supervisor.nome}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 font-medium">{supervisor.cargo}</td>
                    <td className="px-6 py-4 text-gray-600 font-medium">
                      {empresas.find((e: any) => e.id === supervisor.empresa_id)?.razao_social ||
                        'N/A'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEdit(supervisor)}
                          className="p-2 text-blue-600 hover:bg-white rounded-lg shadow-sm border border-transparent hover:border-blue-100 transition-all"
                          title="Editar"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(supervisor)}
                          className="p-2 text-red-600 hover:bg-white rounded-lg shadow-sm border border-transparent hover:border-red-100 transition-all"
                          title="Excluir"
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
      )}

      <Pagination
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        onPageChange={pagination.goToPage}
        itemsPerPage={pagination.itemsPerPage}
        onItemsPerPageChange={pagination.setItemsPerPage}
        totalItems={pagination.totalItems}
      />

      {/* Form Modal */}
      <FormModal
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        title={selectedSupervisor ? 'Editar Supervisor' : 'Novo Cadastro de Supervisor'}
        description="Preencha os dados do profissional responsável na empresa."
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="text-sm font-bold text-gray-700 ml-1">Nome Completo</label>
              <div className="relative mt-1">
                <UserCog
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={16}
                />
                <input
                  {...register('nome')}
                  className={cn(
                    'w-full pl-10 pr-3 py-2.5 rounded-lg border text-sm focus:ring-2 outline-none transition-all',
                    errors.nome
                      ? 'border-red-500 focus:ring-red-200'
                      : 'border-gray-200 focus:ring-blue-100 focus:border-blue-500'
                  )}
                  placeholder="Ex: João Silva"
                />
              </div>
              {errors.nome && (
                <p className="text-[11px] font-bold text-red-500 mt-1 ml-1">
                  {errors.nome.message}
                </p>
              )}
            </div>

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
                  label="Telefone"
                  value={field.value || ''}
                  onChange={field.onChange}
                  error={errors.telefone?.message}
                  placeholder="(00) 00000-0000"
                />
              )}
            />

            <div className="md:col-span-2">
              <label className="text-sm font-bold text-gray-700 ml-1">Empresa</label>
              <div className="relative mt-1">
                <Building2
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={16}
                />
                <select
                  {...register('empresa_id')}
                  className={cn(
                    'w-full pl-10 pr-3 py-2.5 rounded-lg border text-sm focus:ring-2 outline-none transition-all appearance-none bg-white font-medium',
                    errors.empresa_id
                      ? 'border-red-500 focus:ring-red-200'
                      : 'border-gray-200 focus:ring-blue-100 focus:border-blue-500'
                  )}
                >
                  <option value="">Selecione a empresa...</option>
                  {empresas.map((e: any) => (
                    <option key={e.id} value={e.id}>
                      {e.razao_social}
                    </option>
                  ))}
                </select>
              </div>
              {errors.empresa_id && (
                <p className="text-[11px] font-bold text-red-500 mt-1 ml-1">
                  {errors.empresa_id.message}
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-bold text-gray-700 ml-1">Cargo/Função</label>
              <div className="relative mt-1">
                <Briefcase
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={16}
                />
                <input
                  {...register('cargo')}
                  className={cn(
                    'w-full pl-10 pr-3 py-2.5 rounded-lg border text-sm focus:ring-2 outline-none transition-all',
                    errors.cargo
                      ? 'border-red-500 focus:ring-red-200'
                      : 'border-gray-200 focus:ring-blue-100 focus:border-blue-500'
                  )}
                  placeholder="Ex: Gerente de TI"
                />
              </div>
              {errors.cargo && (
                <p className="text-[11px] font-bold text-red-500 mt-1 ml-1">
                  {errors.cargo.message}
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-bold text-gray-700 ml-1">Formação</label>
              <div className="relative mt-1">
                <GraduationCap
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={16}
                />
                <input
                  {...register('formacao')}
                  className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                  placeholder="Ex: Engenheiro de Software"
                />
              </div>
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
              {isSubmitting
                ? 'Salvando...'
                : selectedSupervisor
                  ? 'Salvar Alterações'
                  : 'Confirmar Cadastro'}
            </button>
          </div>
        </form>
      </FormModal>

      {/* Delete Confirmation */}
      <ConfirmDeleteModal
        isOpen={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onConfirm={confirmDelete}
        itemName={selectedSupervisor?.nome}
      />
    </div>
  );
}
