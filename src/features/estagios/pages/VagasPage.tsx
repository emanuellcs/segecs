import { useState } from 'react';
import { Briefcase, Plus, Edit2, Trash2, Search, Building2, BookOpen, Layers } from 'lucide-react';
import { useSupabaseCrud } from '@/hooks/useSupabaseCrud';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { cn } from '@/lib/utils';
import { FormModal } from '@/components/ui/FormModal';
import { ConfirmDeleteModal } from '@/components/ui/ConfirmDeleteModal';
import { ListLayoutToggle } from '@/components/ui/ListLayoutToggle';
import { useListLayout } from '@/hooks/useListLayout';
import { toast } from 'sonner';

const vagaSchema = z.object({
  empresa_id: z.string().uuid('Selecione uma empresa válida'),
  curso_id: z.string().uuid('Selecione um curso válido'),
  titulo: z.string().min(3, 'O título deve ter pelo menos 3 caracteres'),
  descricao: z.string().optional().or(z.literal('')),
  quantidade: z.number().min(1, 'Mínimo 1 vaga'),
  status: z.enum(['aberta', 'preenchida', 'cancelada'], {
    errorMap: () => ({ message: 'Selecione um status válido' }),
  }),
});

type VagaFormValues = z.infer<typeof vagaSchema>;

interface Vaga {
  id: string;
  empresa_id: string;
  curso_id: string;
  titulo: string;
  descricao?: string | null;
  quantidade: number;
  status: 'aberta' | 'preenchida' | 'cancelada';
  created_at: string;
}

export default function VagasPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedVaga, setSelectedVaga] = useState<Vaga | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const {
    items: vagas,
    isLoading,
    create,
    update,
    remove,
  } = useSupabaseCrud<Vaga>('vagas', ['vagas']);

  const { items: empresas } = useSupabaseCrud<any>('empresas', ['empresas']);
  const { items: cursos } = useSupabaseCrud<any>('cursos', ['cursos']);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<VagaFormValues>({
    resolver: zodResolver(vagaSchema),
    defaultValues: {
      quantidade: 1,
      status: 'aberta',
    },
  });

  const onSubmit = async (data: VagaFormValues) => {
    try {
      if (selectedVaga) {
        await update({ id: selectedVaga.id, ...data });
        toast.success('Vaga atualizada com sucesso!');
      } else {
        await create(data);
        toast.success('Vaga cadastrada com sucesso!');
      }
      handleCloseForm();
    } catch (error) {
      toast.error('Erro ao salvar vaga');
    }
  };

  const handleEdit = (vaga: Vaga) => {
    setSelectedVaga(vaga);
    reset({
      empresa_id: vaga.empresa_id,
      curso_id: vaga.curso_id,
      titulo: vaga.titulo,
      descricao: vaga.descricao || '',
      quantidade: vaga.quantidade,
      status: vaga.status,
    });
    setIsFormOpen(true);
  };

  const handleDeleteClick = (vaga: Vaga) => {
    setSelectedVaga(vaga);
    setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedVaga) return;
    try {
      await remove(selectedVaga.id);
      toast.success('Vaga removida com sucesso!');
      setIsDeleteOpen(false);
      setSelectedVaga(null);
    } catch (error) {
      toast.error('Erro ao remover vaga');
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedVaga(null);
    reset();
  };

  const filteredVagas = vagas.filter((vaga) => {
    const empresa = empresas.find((e) => e.id === vaga.empresa_id)?.razao_social || '';
    const curso = cursos.find((c) => c.id === vaga.curso_id)?.nome || '';
    return (
      (vaga.titulo?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (empresa?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (curso?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );
  });

  const { listLayout } = useListLayout();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-black text-blue-900 flex items-center gap-2">
            <Briefcase className="text-blue-600" size={28} /> Ofertas de Vagas
          </h1>
          <p className="text-gray-500 font-medium">Gerencie as oportunidades de estágio</p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl flex items-center justify-center gap-2 font-bold transition-all shadow-lg shadow-blue-200 active:scale-95"
        >
          <Plus size={20} /> Nova Vaga
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
            placeholder="Buscar por título, empresa ou curso..."
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
        {isLoading ? (
          <div className="bg-white p-8 rounded-2xl text-center text-gray-400 animate-pulse font-bold col-span-full">
            Carregando vagas...
          </div>
        ) : filteredVagas.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl text-center text-gray-400 font-bold border-2 border-dashed border-gray-100 col-span-full">
            Nenhuma vaga encontrada.
          </div>
        ) : (
          filteredVagas.map((vaga) => (
            <div
              key={vaga.id}
              className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-4"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                    <Briefcase size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 leading-tight">{vaga.titulo}</h3>
                    <p className="text-xs text-gray-500 font-medium">
                      {empresas.find((e) => e.id === vaga.empresa_id)?.razao_social}
                    </p>
                  </div>
                </div>
                <span
                  className={cn(
                    'px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider',
                    vaga.status === 'aberta'
                      ? 'bg-green-100 text-green-700'
                      : vaga.status === 'preenchida'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-700'
                  )}
                >
                  {vaga.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 p-2 rounded-lg">
                  <BookOpen size={14} className="text-blue-500" />
                  <span className="truncate">
                    {cursos.find((c) => c.id === vaga.curso_id)?.nome || 'N/A'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 p-2 rounded-lg">
                  <Layers size={14} className="text-blue-500" />
                  <span>{vaga.quantidade} vaga(s)</span>
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t border-gray-50">
                <button
                  onClick={() => handleEdit(vaga)}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-50 text-blue-700 font-bold text-sm hover:bg-blue-100 transition-colors"
                >
                  <Edit2 size={16} /> Editar
                </button>
                <button
                  onClick={() => handleDeleteClick(vaga)}
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
                  Título / Empresa
                </th>
                <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest">
                  Curso
                </th>
                <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest text-center">
                  Vagas
                </th>
                <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest">
                  Status
                </th>
                <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest text-right">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-gray-400 font-bold animate-pulse"
                  >
                    Carregando lista de vagas...
                  </td>
                </tr>
              ) : filteredVagas.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400 font-bold">
                    Nenhuma vaga cadastrada.
                  </td>
                </tr>
              ) : (
                filteredVagas.map((vaga) => (
                  <tr key={vaga.id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-gray-900 font-bold">{vaga.titulo}</span>
                        <span className="text-xs text-gray-500 font-medium">
                          {empresas.find((e) => e.id === vaga.empresa_id)?.razao_social}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 font-medium">
                      {cursos.find((c) => c.id === vaga.curso_id)?.nome || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-gray-600 font-bold text-center">
                      {vaga.quantidade}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={cn(
                          'px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider',
                          vaga.status === 'aberta'
                            ? 'bg-green-100 text-green-700'
                            : vaga.status === 'preenchida'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-gray-100 text-gray-700'
                        )}
                      >
                        {vaga.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEdit(vaga)}
                          className="p-2 text-blue-600 hover:bg-white rounded-lg shadow-sm border border-transparent hover:border-blue-100 transition-all"
                          title="Editar"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(vaga)}
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

      {/* Form Modal */}
      <FormModal
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        title={selectedVaga ? 'Editar Vaga' : 'Nova Vaga de Estágio'}
        description="Preencha as informações da oportunidade de estágio."
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="text-sm font-bold text-gray-700 ml-1">Título da Vaga</label>
              <div className="relative mt-1">
                <Briefcase
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={16}
                />
                <input
                  {...register('titulo')}
                  className={cn(
                    'w-full pl-10 pr-3 py-2.5 rounded-lg border text-sm focus:ring-2 outline-none transition-all',
                    errors.titulo
                      ? 'border-red-500 focus:ring-red-200'
                      : 'border-gray-200 focus:ring-blue-100 focus:border-blue-500'
                  )}
                  placeholder="Ex: Estagiário de Desenvolvimento"
                />
              </div>
              {errors.titulo && (
                <p className="text-[11px] font-bold text-red-500 mt-1 ml-1">
                  {errors.titulo.message}
                </p>
              )}
            </div>

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
                    'w-full pl-10 pr-3 py-2.5 rounded-lg border text-sm focus:ring-2 outline-none transition-all appearance-none bg-white',
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

            <div className="md:col-span-2">
              <label className="text-sm font-bold text-gray-700 ml-1">Curso Destinado</label>
              <div className="relative mt-1">
                <BookOpen
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={16}
                />
                <select
                  {...register('curso_id')}
                  className={cn(
                    'w-full pl-10 pr-3 py-2.5 rounded-lg border text-sm focus:ring-2 outline-none transition-all appearance-none bg-white',
                    errors.curso_id
                      ? 'border-red-500 focus:ring-red-200'
                      : 'border-gray-200 focus:ring-blue-100 focus:border-blue-500'
                  )}
                >
                  <option value="">Selecione o curso...</option>
                  {cursos.map((c: any) => (
                    <option key={c.id} value={c.id}>
                      {c.nome}
                    </option>
                  ))}
                </select>
              </div>
              {errors.curso_id && (
                <p className="text-[11px] font-bold text-red-500 mt-1 ml-1">
                  {errors.curso_id.message}
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-bold text-gray-700 ml-1">Quantidade</label>
              <input
                type="number"
                {...register('quantidade', { valueAsNumber: true })}
                className={cn(
                  'w-full px-3 py-2.5 mt-1 rounded-lg border text-sm focus:ring-2 outline-none transition-all',
                  errors.quantidade
                    ? 'border-red-500 focus:ring-red-200'
                    : 'border-gray-200 focus:ring-blue-100 focus:border-blue-500'
                )}
              />
              {errors.quantidade && (
                <p className="text-[11px] font-bold text-red-500 mt-1 ml-1">
                  {errors.quantidade.message}
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-bold text-gray-700 ml-1">Status</label>
              <select
                {...register('status')}
                className="w-full px-3 py-2.5 mt-1 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all appearance-none bg-white font-bold"
              >
                <option value="aberta">🟢 ABERTA</option>
                <option value="preenchida">🔵 PREENCHIDA</option>
                <option value="cancelada">🔴 CANCELADA</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-bold text-gray-700 ml-1">Descrição</label>
              <textarea
                {...register('descricao')}
                rows={3}
                className="w-full px-3 py-2.5 mt-1 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                placeholder="Detalhes sobre a vaga e requisitos..."
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
              {isSubmitting ? 'Salvando...' : selectedVaga ? 'Salvar Alterações' : 'Criar Vaga'}
            </button>
          </div>
        </form>
      </FormModal>

      {/* Delete Confirmation */}
      <ConfirmDeleteModal
        isOpen={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onConfirm={confirmDelete}
        itemName={selectedVaga?.titulo}
      />
    </div>
  );
}
