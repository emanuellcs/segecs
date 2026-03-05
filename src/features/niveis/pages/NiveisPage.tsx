import { useState } from 'react';
import { Layers, Plus, Edit2, Trash2, Search } from 'lucide-react';
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

const nivelSchema = z.object({
  descricao: z.string().min(3, 'A descrição deve ter pelo menos 3 caracteres'),
});

type NivelFormValues = z.infer<typeof nivelSchema>;

interface Nivel {
  id: string;
  descricao: string;
  created_at: string;
}

export default function NiveisPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedNivel, setSelectedNivel] = useState<Nivel | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const {
    items: niveis,
    isLoading,
    create,
    update,
    remove,
  } = useSupabaseCrud<Nivel>('niveis', ['niveis']);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<NivelFormValues>({
    resolver: zodResolver(nivelSchema),
  });

  const onSubmit = async (data: NivelFormValues) => {
    try {
      if (selectedNivel) {
        await update({ id: selectedNivel.id, ...data });
        toast.success('Nível atualizado com sucesso!');
      } else {
        await create(data);
        toast.success('Nível cadastrado com sucesso!');
      }
      handleCloseForm();
    } catch (error) {
      toast.error('Erro ao salvar nível');
    }
  };

  const handleEdit = (nivel: Nivel) => {
    setSelectedNivel(nivel);
    reset({
      descricao: nivel.descricao,
    });
    setIsFormOpen(true);
  };

  const handleDeleteClick = (nivel: Nivel) => {
    setSelectedNivel(nivel);
    setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedNivel) return;
    try {
      await remove(selectedNivel.id);
      toast.success('Nível removido com sucesso!');
      setIsDeleteOpen(false);
      setSelectedNivel(null);
    } catch (error) {
      toast.error('Erro ao remover nível');
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedNivel(null);
    reset();
  };

  const filteredNiveis = niveis.filter((nivel) =>
    (nivel.descricao?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  const { listLayout } = useListLayout();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-black text-blue-900 flex items-center gap-2">
            <Layers className="text-blue-600" size={28} /> Níveis
          </h1>
          <p className="text-gray-500 font-medium">Gestão de níveis de ensino</p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl flex items-center justify-center gap-2 font-bold transition-all shadow-lg shadow-blue-200 active:scale-95"
        >
          <Plus size={20} /> Novo Nível
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
            placeholder="Buscar por descrição..."
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
            Carregando níveis...
          </div>
        ) : filteredNiveis.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl text-center text-gray-400 font-bold border-2 border-dashed border-gray-100 col-span-full">
            Nenhum nível encontrado.
          </div>
        ) : (
          filteredNiveis.map((nivel) => (
            <div
              key={nivel.id}
              className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-4"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                    <Layers size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 leading-tight">{nivel.descricao}</h3>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t border-gray-50">
                <button
                  onClick={() => handleEdit(nivel)}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-50 text-blue-700 font-bold text-sm hover:bg-blue-100 transition-colors"
                >
                  <Edit2 size={16} /> Editar
                </button>
                <button
                  onClick={() => handleDeleteClick(nivel)}
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
                  Descrição
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
                    colSpan={2}
                    className="px-6 py-12 text-center text-gray-400 font-bold animate-pulse"
                  >
                    Carregando lista de níveis...
                  </td>
                </tr>
              ) : filteredNiveis.length === 0 ? (
                <tr>
                  <td colSpan={2} className="px-6 py-12 text-center text-gray-400 font-bold">
                    Nenhum nível cadastrado.
                  </td>
                </tr>
              ) : (
                filteredNiveis.map((nivel) => (
                  <tr key={nivel.id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs uppercase">
                          {nivel.descricao.substring(0, 2)}
                        </div>
                        <span className="text-gray-900 font-bold">{nivel.descricao}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEdit(nivel)}
                          className="p-2 text-blue-600 hover:bg-white rounded-lg shadow-sm border border-transparent hover:border-blue-100 transition-all"
                          title="Editar"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(nivel)}
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
        title={selectedNivel ? 'Editar Nível' : 'Novo Cadastro de Nível'}
        description="Preencha a descrição do nível de ensino."
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-bold text-gray-700 ml-1">Descrição</label>
              <div className="relative mt-1">
                <Layers
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={16}
                />
                <input
                  {...register('descricao')}
                  className={cn(
                    'w-full pl-10 pr-3 py-2.5 rounded-lg border text-sm focus:ring-2 outline-none transition-all',
                    errors.descricao
                      ? 'border-red-500 focus:ring-red-200'
                      : 'border-gray-200 focus:ring-blue-100 focus:border-blue-500'
                  )}
                  placeholder="Ex: Ensino Médio Integrado"
                />
              </div>
              {errors.descricao && (
                <p className="text-[11px] font-bold text-red-500 mt-1 ml-1">
                  {errors.descricao.message}
                </p>
              )}
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
                : selectedNivel
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
        itemName={selectedNivel?.descricao}
      />
    </div>
  );
}
