import { useState } from "react";
import {
  MapPin,
  Plus,
  Edit2,
  Trash2,
  Search,
  Map,
  CheckSquare,
  Square,
} from "lucide-react";
import { useSupabaseCrud, translateError } from "@/hooks/useSupabaseCrud";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { cn } from "@/lib/utils";
import { FormModal } from "@/components/ui/FormModal";
import { ConfirmDeleteModal } from "@/components/ui/ConfirmDeleteModal";
import { ConfirmBulkDeleteModal } from "@/components/ui/ConfirmBulkDeleteModal";
import { BulkEditModal } from "@/components/ui/BulkEditModal";
import { BulkActionsToolbar } from "@/components/ui/BulkActionsToolbar";
import { ListLayoutToggle } from "@/components/ui/ListLayoutToggle";
import { useListLayout } from "@/hooks/useListLayout";
import { usePagination } from "@/hooks/usePagination";
import { Pagination } from "@/components/ui/Pagination";
import { useSelection } from "@/hooks/useSelection";
import { toast } from "sonner";
import { LoadingScreen } from "@/components/ui/LoadingScreen";

const cidadeSchema = z.object({
  nome: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
  uf: z
    .string()
    .length(2, "A UF deve ter exatamente 2 caracteres")
    .toUpperCase(),
});

const bulkEditSchema = z.object({
  uf: z
    .string()
    .length(2, "A UF deve ter exatamente 2 caracteres")
    .toUpperCase()
    .optional(),
});

type CidadeFormValues = z.infer<typeof cidadeSchema>;
type BulkEditValues = z.infer<typeof bulkEditSchema>;

interface Cidade {
  id: string;
  nome: string;
  uf: string;
  created_at: string;
}

export default function CidadesPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
  const [isBulkEditOpen, setIsBulkEditOpen] = useState(false);
  const [selectedCidade, setSelectedCidade] = useState<Cidade | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const {
    items: cidades,
    isLoading,
    create,
    update,
    remove,
    bulkRemove,
    bulkUpdate,
    isBulkDeleting,
  } = useSupabaseCrud<Cidade>("cidades", ["cidades"]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CidadeFormValues>({
    resolver: zodResolver(cidadeSchema),
    defaultValues: { uf: "CE" },
  });

  const {
    register: registerBulk,
    handleSubmit: handleSubmitBulk,
    reset: resetBulk,
    formState: { isSubmitting: isSubmittingBulk },
  } = useForm<BulkEditValues>({
    resolver: zodResolver(bulkEditSchema),
  });

  const filteredCidades = cidades.filter(
    (cidade) =>
      (cidade.nome?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (cidade.uf?.toLowerCase() || "").includes(searchTerm.toLowerCase()),
  );

  const selection = useSelection(filteredCidades);

  const onSubmit = async (data: CidadeFormValues) => {
    try {
      if (selectedCidade) {
        await update({ id: selectedCidade.id, ...data });
        toast.success("Cidade atualizada com sucesso!");
      } else {
        await create(data);
        toast.success("Cidade cadastrada com sucesso!");
      }
      handleCloseForm();
    } catch (error) {
      toast.error(translateError(error));
    }
  };

  const onBulkEditSubmit = async (data: BulkEditValues) => {
    const updateData = Object.fromEntries(
      Object.entries(data).filter(([_, v]) => (v as unknown) !== "" && v !== undefined),
    );

    if (Object.keys(updateData).length === 0) {
      toast.error("Selecione pelo menos um campo para atualizar.");
      return;
    }

    try {
      await bulkUpdate({
        ids: selection.selectedIds,
        updateData,
      });
      toast.success("Registros atualizados com sucesso!");
      setIsBulkEditOpen(false);
      selection.clearSelection();
      resetBulk();
    } catch (error) {
      toast.error(translateError(error));
    }
  };

  const handleEdit = (cidade: Cidade) => {
    setSelectedCidade(cidade);
    reset({
      nome: cidade.nome,
      uf: cidade.uf,
    });
    setIsFormOpen(true);
  };

  const handleDeleteClick = (cidade: Cidade) => {
    setSelectedCidade(cidade);
    setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedCidade) return;
    try {
      await remove(selectedCidade.id);
      toast.success("Cidade removida com sucesso!");
      setIsDeleteOpen(false);
      setSelectedCidade(null);
    } catch (error) {
      toast.error(translateError(error));
    }
  };

  const confirmBulkDelete = async () => {
    try {
      await bulkRemove(selection.selectedIds);
      toast.success("Registros removidos com sucesso!");
      setIsBulkDeleteOpen(false);
      selection.clearSelection();
    } catch (error) {
      toast.error(translateError(error));
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedCidade(null);
    reset();
  };

  const pagination = usePagination(filteredCidades);
  const { listLayout } = useListLayout();

  if (isLoading) return <LoadingScreen />;

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-black text-blue-900 flex items-center gap-2">
            <MapPin className="text-blue-600" size={28} /> Municípios
          </h1>
          <p className="text-gray-500 font-medium">
            Gestão de cidades e estados
          </p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl flex items-center justify-center gap-2 font-bold transition-all shadow-lg shadow-blue-200 active:scale-95"
        >
          <Plus size={20} /> Nova Cidade
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
            placeholder="Buscar por nome ou UF..."
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
          "grid grid-cols-1 gap-4",
          listLayout === "table"
            ? "lg:hidden"
            : "lg:grid-cols-2 xl:grid-cols-3",
        )}
      >
        {filteredCidades.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl text-center text-gray-400 font-bold border-2 border-dashed border-gray-100 col-span-full">
            Nenhuma cidade encontrada.
          </div>
        ) : (
          pagination.currentItems.map((cidade) => (
            <div
              key={cidade.id}
              className={cn(
                "bg-white p-5 rounded-2xl shadow-sm border transition-all relative group space-y-4",
                selection.isSelected(cidade.id)
                  ? "border-blue-500 ring-2 ring-blue-50"
                  : "border-gray-100",
              )}
            >
              <button
                onClick={() => selection.toggleSelect(cidade.id)}
                className={cn(
                  "absolute top-4 right-4 p-2 rounded-lg transition-all z-10",
                  selection.isSelected(cidade.id)
                    ? "text-blue-600 bg-blue-50"
                    : "text-gray-300 hover:text-gray-400 opacity-0 group-hover:opacity-100",
                )}
              >
                {selection.isSelected(cidade.id) ? (
                  <CheckSquare size={20} />
                ) : (
                  <Square size={20} />
                )}
              </button>

              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold">
                    {cidade.uf}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 leading-tight">
                      {cidade.nome}
                    </h3>
                    <p className="text-xs text-gray-500 font-medium">
                      Estado: {cidade.uf}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t border-gray-50">
                <button
                  onClick={() => handleEdit(cidade)}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-50 text-blue-700 font-bold text-sm hover:bg-blue-100 transition-colors"
                >
                  <Edit2 size={16} /> Editar
                </button>
                <button
                  onClick={() => handleDeleteClick(cidade)}
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
      {listLayout === "table" && (
        <div className="hidden lg:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 w-10">
                  <button
                    onClick={selection.handleSelectAllToggle}
                    className={cn(
                      "p-1 rounded transition-colors",
                      selection.isAllSelected
                        ? "text-blue-600"
                        : "text-gray-300 hover:text-gray-400",
                    )}
                  >
                    {selection.isAllSelected ? (
                      <CheckSquare size={20} />
                    ) : (
                      <Square size={20} />
                    )}
                  </button>
                </th>
                <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest">
                  Cidade
                </th>
                <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest">
                  UF
                </th>
                <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest text-right">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredCidades.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-12 text-center text-gray-400 font-bold"
                  >
                    Nenhuma cidade cadastrada.
                  </td>
                </tr>
              ) : (
                pagination.currentItems.map((cidade) => (
                  <tr
                    key={cidade.id}
                    className={cn(
                      "hover:bg-blue-50/30 transition-colors group",
                      selection.isSelected(cidade.id) && "bg-blue-50/50",
                    )}
                  >
                    <td className="px-6 py-4">
                      <button
                        onClick={() => selection.toggleSelect(cidade.id)}
                        className={cn(
                          "p-1 rounded transition-colors",
                          selection.isSelected(cidade.id)
                            ? "text-blue-600"
                            : "text-gray-300 hover:text-gray-400 opacity-0 group-hover:opacity-100",
                        )}
                      >
                        {selection.isSelected(cidade.id) ? (
                          <CheckSquare size={20} />
                        ) : (
                          <Square size={20} />
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs uppercase">
                          {cidade.nome.substring(0, 2)}
                        </div>
                        <span className="text-gray-900 font-bold">
                          {cidade.nome}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 font-medium">
                      {cidade.uf}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEdit(cidade)}
                          className="p-2 text-blue-600 hover:bg-white rounded-lg shadow-sm border border-transparent hover:border-blue-100 transition-all"
                          title="Editar"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(cidade)}
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

      {/* Bulk Actions Toolbar */}
      <BulkActionsToolbar
        selectedCount={selection.selectedIds.length}
        onClearSelection={selection.clearSelection}
        onBulkDelete={() => setIsBulkDeleteOpen(true)}
        onBulkEdit={() => setIsBulkEditOpen(true)}
      />

      {/* Form Modal */}
      <FormModal
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        title={selectedCidade ? "Editar Cidade" : "Novo Cadastro de Cidade"}
        description="Preencha os dados da localização."
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-3">
              <label className="text-sm font-bold text-gray-700 ml-1">
                Nome da Cidade
              </label>
              <div className="relative mt-1">
                <MapPin
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={16}
                />
                <input
                  {...register("nome")}
                  className={cn(
                    "w-full pl-10 pr-3 py-2.5 rounded-lg border text-sm focus:ring-2 outline-none transition-all",
                    errors.nome
                      ? "border-red-500 focus:ring-red-200"
                      : "border-gray-200 focus:ring-blue-100 focus:border-blue-500",
                  )}
                  placeholder="Ex: Fortaleza"
                />
              </div>
              {errors.nome && (
                <p className="text-[11px] font-bold text-red-500 mt-1 ml-1">
                  {errors.nome.message}
                </p>
              )}
            </div>

            <div className="md:col-span-1">
              <label className="text-sm font-bold text-gray-700 ml-1">UF</label>
              <div className="relative mt-1">
                <Map
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={16}
                />
                <input
                  {...register("uf")}
                  maxLength={2}
                  className={cn(
                    "w-full pl-10 pr-3 py-2.5 rounded-lg border text-sm focus:ring-2 outline-none transition-all uppercase",
                    errors.uf
                      ? "border-red-500 focus:ring-red-200"
                      : "border-gray-200 focus:ring-blue-100 focus:border-blue-500",
                  )}
                  placeholder="CE"
                />
              </div>
              {errors.uf && (
                <p className="text-[11px] font-bold text-red-500 mt-1 ml-1">
                  {errors.uf.message}
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
                ? "Salvando..."
                : selectedCidade
                  ? "Salvar Alterações"
                  : "Confirmar Cadastro"}
            </button>
          </div>
        </form>
      </FormModal>

      {/* Bulk Edit Modal */}
      <BulkEditModal
        isOpen={isBulkEditOpen}
        onOpenChange={setIsBulkEditOpen}
        count={selection.selectedIds.length}
      >
        <form onSubmit={handleSubmitBulk(onBulkEditSubmit)} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-bold text-gray-700 ml-1">
                Nova UF (Opcional)
              </label>
              <input
                {...registerBulk("uf")}
                maxLength={2}
                className="w-full px-3 py-2.5 mt-1 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all uppercase"
                placeholder="Ex: SP"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setIsBulkEditOpen(false)}
              className="flex-1 px-4 py-3 text-sm font-bold text-gray-500 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmittingBulk}
              className="flex-[2] px-4 py-3 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-100 transition-all active:scale-95 disabled:opacity-50"
            >
              {isSubmittingBulk ? "Atualizando..." : "Aplicar Alterações"}
            </button>
          </div>
        </form>
      </BulkEditModal>

      {/* Delete Confirmation */}
      <ConfirmDeleteModal
        isOpen={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onConfirm={confirmDelete}
        itemName={selectedCidade?.nome}
      />

      {/* Bulk Delete Confirmation */}
      <ConfirmBulkDeleteModal
        isOpen={isBulkDeleteOpen}
        onOpenChange={setIsBulkDeleteOpen}
        onConfirm={confirmBulkDelete}
        count={selection.selectedIds.length}
        isLoading={isBulkDeleting}
      />
    </div>
  );
}
