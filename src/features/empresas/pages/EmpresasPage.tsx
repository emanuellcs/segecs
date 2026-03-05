import { useState } from 'react';
import { Building2, Plus, Edit2, Trash2, Search, MapPin, User, Mail, Phone, Calendar, Hash } from 'lucide-react';
import { useSupabaseCrud } from '@/hooks/useSupabaseCrud';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { cn } from '@/lib/utils';
import { FormModal } from '@/components/ui/FormModal';
import { ConfirmDeleteModal } from '@/components/ui/ConfirmDeleteModal';
import { InputMask } from '@/components/ui/InputMask';
import { toast } from 'sonner';

const empresaSchema = z.object({
  razao_social: z.string().min(3, 'A razão social deve ter pelo menos 3 caracteres'),
  cnpj: z.string().min(18, 'CNPJ inválido'),
  endereco: z.string().min(1, 'O endereço é obrigatório'),
  cidade_id: z.string().uuid('Selecione uma cidade válida'),
  contato_nome: z.string().min(1, 'O nome do contato é obrigatório'),
  contato_email: z.string().email('Email inválido').or(z.literal('')),
  contato_telefone: z.string().min(14, 'Telefone inválido'),
  convenio_numero: z.string().default(''),
  convenio_validade: z.string().default(''),
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
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedEmpresa, setSelectedEmpresa] = useState<Empresa | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

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
    control,
    formState: { errors, isSubmitting },
  } = useForm<EmpresaFormValues>({
    resolver: zodResolver(empresaSchema) as any,
    defaultValues: {
      razao_social: '',
      cnpj: '',
      endereco: '',
      cidade_id: '',
      contato_nome: '',
      contato_email: '',
      contato_telefone: '',
      convenio_numero: '',
      convenio_validade: '',
    }
  });

  const onSubmit = async (data: any) => {
    try {
      if (selectedEmpresa) {
        await update({ id: selectedEmpresa.id, ...data });
        toast.success('Empresa atualizada com sucesso!');
      } else {
        await create(data);
        toast.success('Empresa cadastrada com sucesso!');
      }
      handleCloseForm();
    } catch (error) {
      toast.error('Erro ao salvar empresa');
    }
  };

  const handleEdit = (empresa: Empresa) => {
    setSelectedEmpresa(empresa);
    reset({
      razao_social: empresa.razao_social,
      cnpj: empresa.cnpj,
      endereco: empresa.endereco || '',
      cidade_id: empresa.cidade_id,
      contato_nome: empresa.contato_nome || '',
      contato_email: empresa.contato_email || '',
      contato_telefone: empresa.contato_telefone || '',
      convenio_numero: empresa.convenio_numero || '',
      convenio_validade: empresa.convenio_validade || '',
    });
    setIsFormOpen(true);
  };

  const handleDeleteClick = (empresa: Empresa) => {
    setSelectedEmpresa(empresa);
    setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedEmpresa) return;
    try {
      await remove(selectedEmpresa.id);
      toast.success('Empresa removida com sucesso!');
      setIsDeleteOpen(false);
      setSelectedEmpresa(null);
    } catch (error) {
      toast.error('Erro ao remover empresa');
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedEmpresa(null);
    reset();
  };

  const filteredEmpresas = empresas.filter(empresa => 
    (empresa.razao_social?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (empresa.cnpj || '').includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-black text-blue-900 flex items-center gap-2">
            <Building2 className="text-blue-600" size={28} /> Empresas
          </h1>
          <p className="text-gray-500 font-medium">Gestão de empresas parceiras</p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl flex items-center justify-center gap-2 font-bold transition-all shadow-lg shadow-blue-200 active:scale-95"
        >
          <Plus size={20} /> Nova Empresa
        </button>
      </div>

      {/* Busca */}
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={20} />
        <input
          type="text"
          placeholder="Buscar por razão social ou CNPJ..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
        />
      </div>

      {/* Listagem Responsiva */}
      <div className="grid grid-cols-1 gap-4 lg:hidden">
        {isLoading ? (
          <div className="bg-white p-8 rounded-2xl text-center text-gray-400 animate-pulse font-bold">
            Carregando empresas...
          </div>
        ) : filteredEmpresas.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl text-center text-gray-400 font-bold border-2 border-dashed border-gray-100">
            Nenhuma empresa encontrada.
          </div>
        ) : (
          filteredEmpresas.map((empresa) => (
            <div key={empresa.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                    <Building2 size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 leading-tight">{empresa.razao_social}</h3>
                    <p className="text-xs text-gray-500 font-medium">CNPJ: {empresa.cnpj}</p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-2 pt-2">
                <div className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 p-2 rounded-lg">
                  <User size={14} className="text-blue-500" />
                  <span className="truncate">Contato: {empresa.contato_nome}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 p-2 rounded-lg">
                  <Phone size={14} className="text-blue-500" />
                  <span>{empresa.contato_telefone}</span>
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t border-gray-50">
                <button
                  onClick={() => handleEdit(empresa)}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-50 text-blue-700 font-bold text-sm hover:bg-blue-100 transition-colors"
                >
                  <Edit2 size={16} /> Editar
                </button>
                <button
                  onClick={() => handleDeleteClick(empresa)}
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
              <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest">Empresa</th>
              <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest">CNPJ</th>
              <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest">Contato</th>
              <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest">Validade Convênio</th>
              <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-400 font-bold animate-pulse">
                  Carregando lista de empresas...
                </td>
              </tr>
            ) : filteredEmpresas.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-400 font-bold">
                  Nenhuma empresa cadastrada.
                </td>
              </tr>
            ) : (
              filteredEmpresas.map((empresa) => (
                <tr key={empresa.id} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs uppercase">
                        {empresa.razao_social.substring(0, 2)}
                      </div>
                      <span className="text-gray-900 font-bold">{empresa.razao_social}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600 font-medium">{empresa.cnpj}</td>
                  <td className="px-6 py-4 text-gray-600 font-medium">
                    <div className="flex flex-col">
                      <span>{empresa.contato_nome}</span>
                      <span className="text-xs text-gray-400">{empresa.contato_email}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600 font-medium">
                    {empresa.convenio_validade
                      ? new Date(empresa.convenio_validade).toLocaleDateString('pt-BR')
                      : '-'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEdit(empresa)}
                        className="p-2 text-blue-600 hover:bg-white rounded-lg shadow-sm border border-transparent hover:border-blue-100 transition-all"
                        title="Editar"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(empresa)}
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

      {/* Form Modal */}
      <FormModal
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        title={selectedEmpresa ? 'Editar Empresa' : 'Novo Cadastro de Empresa'}
        description="Preencha todos os dados obrigatórios para manter o registro atualizado."
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="text-sm font-bold text-gray-700 ml-1">Razão Social</label>
              <div className="relative mt-1">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  {...register('razao_social')}
                  className={cn(
                    "w-full pl-10 pr-3 py-2.5 rounded-lg border text-sm focus:ring-2 outline-none transition-all",
                    errors.razao_social ? "border-red-500 focus:ring-red-200" : "border-gray-200 focus:ring-blue-100 focus:border-blue-500"
                  )}
                  placeholder="Ex: ACME Corporation LTDA"
                />
              </div>
              {errors.razao_social && <p className="text-[11px] font-bold text-red-500 mt-1 ml-1">{errors.razao_social.message}</p>}
            </div>

            <Controller
              name="cnpj"
              control={control}
              render={({ field }) => (
                <InputMask
                  mask="cnpj"
                  label="CNPJ"
                  value={field.value || ''}
                  onChange={field.onChange}
                  error={errors.cnpj?.message}
                  placeholder="00.000.000/0000-00"
                />
              )}
            />

            <div className="md:col-span-2 text-blue-900 font-black text-xs uppercase tracking-widest mt-2">
              Localização
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-bold text-gray-700 ml-1">Endereço Completo</label>
              <div className="relative mt-1">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  {...register('endereco')}
                  className={cn(
                    "w-full pl-10 pr-3 py-2.5 rounded-lg border text-sm focus:ring-2 outline-none transition-all",
                    errors.endereco ? "border-red-500 focus:ring-red-200" : "border-gray-200 focus:ring-blue-100 focus:border-blue-500"
                  )}
                  placeholder="Rua, Número, Bairro"
                />
              </div>
              {errors.endereco && <p className="text-[11px] font-bold text-red-500 mt-1 ml-1">{errors.endereco.message}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-bold text-gray-700 ml-1">Cidade</label>
              <select
                {...register('cidade_id')}
                className={cn(
                  "w-full px-3 py-2.5 mt-1 rounded-lg border text-sm focus:ring-2 outline-none transition-all appearance-none bg-white font-medium",
                  errors.cidade_id ? "border-red-500 focus:ring-red-200" : "border-gray-200 focus:ring-blue-100 focus:border-blue-500"
                )}
              >
                <option value="">Selecione a cidade...</option>
                {cidades.map((c: any) => (
                  <option key={c.id} value={c.id}>{c.nome} - {c.uf}</option>
                ))}
              </select>
              {errors.cidade_id && <p className="text-[11px] font-bold text-red-500 mt-1 ml-1">{errors.cidade_id.message}</p>}
            </div>

            <div className="md:col-span-2 text-blue-900 font-black text-xs uppercase tracking-widest mt-2">
              Contato Principal
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-bold text-gray-700 ml-1">Nome do Contato</label>
              <div className="relative mt-1">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  {...register('contato_nome')}
                  className={cn(
                    "w-full pl-10 pr-3 py-2.5 rounded-lg border text-sm focus:ring-2 outline-none transition-all",
                    errors.contato_nome ? "border-red-500 focus:ring-red-200" : "border-gray-200 focus:ring-blue-100 focus:border-blue-500"
                  )}
                  placeholder="Nome do responsável na empresa"
                />
              </div>
              {errors.contato_nome && <p className="text-[11px] font-bold text-red-500 mt-1 ml-1">{errors.contato_nome.message}</p>}
            </div>

            <div>
              <label className="text-sm font-bold text-gray-700 ml-1">Email</label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  {...register('contato_email')}
                  className={cn(
                    "w-full pl-10 pr-3 py-2.5 rounded-lg border text-sm focus:ring-2 outline-none transition-all",
                    errors.contato_email ? "border-red-500 focus:ring-red-200" : "border-gray-200 focus:ring-blue-100 focus:border-blue-500"
                  )}
                  placeholder="contato@empresa.com"
                />
              </div>
              {errors.contato_email && <p className="text-[11px] font-bold text-red-500 mt-1 ml-1">{errors.contato_email.message}</p>}
            </div>

            <Controller
              name="contato_telefone"
              control={control}
              render={({ field }) => (
                <InputMask
                  mask="phone"
                  label="Telefone"
                  value={field.value || ''}
                  onChange={field.onChange}
                  error={errors.contato_telefone?.message}
                  placeholder="(00) 00000-0000"
                />
              )}
            />

            <div className="md:col-span-2 text-blue-900 font-black text-xs uppercase tracking-widest mt-2">
              Informações do Convênio
            </div>

            <div>
              <label className="text-sm font-bold text-gray-700 ml-1">Nº Convênio</label>
              <div className="relative mt-1">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  {...register('convenio_numero')}
                  className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                  placeholder="Ex: 123/2024"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-bold text-gray-700 ml-1">Validade</label>
              <div className="relative mt-1">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="date"
                  {...register('convenio_validade')}
                  className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
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
              {isSubmitting ? 'Salvando...' : selectedEmpresa ? 'Salvar Alterações' : 'Confirmar Cadastro'}
            </button>
          </div>
        </form>
      </FormModal>

      {/* Delete Confirmation */}
      <ConfirmDeleteModal
        isOpen={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onConfirm={confirmDelete}
        itemName={selectedEmpresa?.razao_social}
      />
    </div>
  );
}
