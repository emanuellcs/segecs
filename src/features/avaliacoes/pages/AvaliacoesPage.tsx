import { useState } from "react";
import {
  Award,
  Plus,
  Edit2,
  Trash2,
  Search,
  TrendingUp,
  User,
  Calendar,
  MessageSquare,
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

const avaliacaoSchema = z.object({
  estagio_id: z.string().uuid("Selecione um estágio válido"),
  tipo: z.number().min(1).max(3),
  nota: z.number().min(0, "Nota mínima 0").max(10, "Nota máxima 10"),
  comentarios: z.string().optional().or(z.literal("")),
  data_avaliacao: z.string().min(1, "A data é obrigatória"),
});

const bulkEditSchema = z.object({
  tipo: z.number().min(1).max(3).optional(),
  nota: z.number().min(0).max(10).optional(),
  data_avaliacao: z.string().optional(),
});

type AvaliacaoFormValues = z.infer<typeof avaliacaoSchema>;
type BulkEditValues = z.infer<typeof bulkEditSchema>;

interface Avaliacao {
  id: string;
  estagio_id: string;
  tipo: number;
  nota: number;
  comentarios?: string | null;
  data_avaliacao: string;
  created_at: string;
}

export default function AvaliacoesPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
  const [isBulkEditOpen, setIsBulkEditOpen] = useState(false);
  const [selectedAval, setSelectedAval] = useState<Avaliacao | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEstagioId, setSelectedEstagioId] = useState<string>("");

  const {
    items: avaliacoes,
    isLoading,
    create,
    update,
    remove,
    bulkRemove,
    bulkUpdate,
    isBulkDeleting,
  } = useSupabaseCrud<Avaliacao>("avaliacoes", ["avaliacoes"]);

  const { items: estagios } = useSupabaseCrud<any>("estagios", ["estagios"]);
  const { items: alunos } = useSupabaseCrud<any>("alunos", ["alunos"]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AvaliacaoFormValues>({
    resolver: zodResolver(avaliacaoSchema),
    defaultValues: {
      tipo: 1,
      data_avaliacao: new Date().toISOString().split("T")[0],
    },
  });

  const {
    register: registerBulk,
    handleSubmit: handleSubmitBulk,
    reset: resetBulk,
    formState: { isSubmitting: isSubmittingBulk },
  } = useForm<BulkEditValues>({
    resolver: zodResolver(bulkEditSchema),
  });

  const filteredAvaliacoes = avaliacoes.filter((aval) => {
    const estagio = estagios.find((e) => e.id === aval.estagio_id);
    const alunoNome =
      alunos.find((a) => a.id === estagio?.aluno_id)?.nome || "";
    const matchesSearch = (alunoNome?.toLowerCase() || "").includes(
      searchTerm.toLowerCase(),
    );
    const matchesEstagio =
      !selectedEstagioId || aval.estagio_id === selectedEstagioId;
    return matchesSearch && matchesEstagio;
  });

  const selection = useSelection(filteredAvaliacoes);

  const onSubmit = async (data: AvaliacaoFormValues) => {
    try {
      if (selectedAval) {
        await update({ id: selectedAval.id, ...data });
        toast.success("Avaliação atualizada com sucesso!");
      } else {
        await create(data);
        toast.success("Nota lançada com sucesso!");
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

  const handleEdit = (aval: Avaliacao) => {
    setSelectedAval(aval);
    reset({
      estagio_id: aval.estagio_id,
      tipo: aval.tipo,
      nota: aval.nota,
      comentarios: aval.comentarios || "",
      data_avaliacao: aval.data_avaliacao,
    });
    setIsFormOpen(true);
  };

  const handleDeleteClick = (aval: Avaliacao) => {
    setSelectedAval(aval);
    setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedAval) return;
    try {
      await remove(selectedAval.id);
      toast.success("Avaliação removida com sucesso!");
      setIsDeleteOpen(false);
      setSelectedAval(null);
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
    setSelectedAval(null);
    reset();
  };

  const pagination = usePagination(filteredAvaliacoes);

  const mediaGeral =
    filteredAvaliacoes.length > 0
      ? (
          filteredAvaliacoes.reduce((acc, a) => acc + a.nota, 0) /
          filteredAvaliacoes.length
        ).toFixed(1)
      : "0.0";

  const { listLayout } = useListLayout();

  if (isLoading) return <LoadingScreen />;

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-black text-blue-900 flex items-center gap-2">
            <Award className="text-blue-600" size={28} /> Avaliações
          </h1>
          <p className="text-gray-500 font-medium">
            Acompanhamento de desempenho acadêmico
          </p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl flex items-center justify-center gap-2 font-bold transition-all shadow-lg shadow-blue-200 active:scale-95"
        >
          <Plus size={20} /> Lançar Nota
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
            Filtrar por Estágio
          </label>
          <select
            className="w-full p-3 bg-gray-50 border-none rounded-xl text-sm font-bold text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            value={selectedEstagioId}
            onChange={(e) => setSelectedEstagioId(e.target.value)}
          >
            <option value="">Todos os estágios</option>
            {estagios.map((est: any) => (
              <option key={est.id} value={est.id}>
                {alunos.find((a: any) => a.id === est.aluno_id)?.nome}
              </option>
            ))}
          </select>
        </div>

        <div className="bg-orange-500 p-6 rounded-2xl shadow-lg shadow-orange-100 flex justify-between items-center text-white">
          <div>
            <p className="text-orange-100 text-xs font-black uppercase tracking-widest mb-1">
              Média de Notas
            </p>
            <h2 className="text-4xl font-black">{mediaGeral}</h2>
          </div>
          <div className="bg-orange-400/30 p-3 rounded-xl">
            <TrendingUp size={32} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
          <div>
            <p className="text-gray-400 text-xs font-black uppercase tracking-widest mb-1">
              Total de Lançamentos
            </p>
            <h2 className="text-4xl font-black text-gray-800">
              {filteredAvaliacoes.length}
            </h2>
          </div>
          <div className="bg-blue-50 p-3 rounded-xl text-blue-500">
            <Award size={32} />
          </div>
        </div>
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
            placeholder="Buscar por nome do aluno..."
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
        {pagination.currentItems.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl text-center text-gray-400 font-bold border-2 border-dashed border-gray-100 col-span-full">
            Nenhuma avaliação encontrada.
          </div>
        ) : (
          pagination.currentItems.map((avaliacao) => {
            const estagio = estagios.find((e) => e.id === avaliacao.estagio_id);
            const aluno = alunos.find((a) => a.id === estagio?.aluno_id);

            return (
              <div
                key={avaliacao.id}
                className={cn(
                  "bg-white p-5 rounded-2xl shadow-sm border transition-all relative group space-y-4",
                  selection.isSelected(avaliacao.id)
                    ? "border-blue-500 ring-2 ring-blue-50"
                    : "border-gray-100",
                )}
              >
                <button
                  onClick={() => selection.toggleSelect(avaliacao.id)}
                  className={cn(
                    "absolute top-4 right-4 p-2 rounded-lg transition-all z-10",
                    selection.isSelected(avaliacao.id)
                      ? "text-blue-600 bg-blue-50"
                      : "text-gray-300 hover:text-gray-400 opacity-0 group-hover:opacity-100",
                  )}
                >
                  {selection.isSelected(avaliacao.id) ? (
                    <CheckSquare size={20} />
                  ) : (
                    <Square size={20} />
                  )}
                </button>

                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-xs uppercase">
                      {aluno?.nome.substring(0, 2)}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 leading-tight">
                        {aluno?.nome}
                      </h3>
                      <p className="text-xs text-gray-500 font-medium">
                        {new Date(avaliacao.data_avaliacao).toLocaleDateString(
                          "pt-BR",
                        )}
                      </p>
                    </div>
                  </div>
                  <span className="px-2 py-1 bg-gray-100 rounded text-[10px] font-black uppercase tracking-wider text-gray-600">
                    {avaliacao.tipo}ª NOTA
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2 text-blue-900 font-black text-2xl">
                    <TrendingUp size={20} className="text-orange-500" />
                    <span>{avaliacao.nota.toFixed(1)}</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(avaliacao)}
                      className="p-2.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(avaliacao)}
                      className="p-2.5 rounded-xl bg-red-50 text-red-700 hover:bg-red-100 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
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
                  Aluno
                </th>
                <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest">
                  Avaliação
                </th>
                <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest">
                  Data
                </th>
                <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest text-center">
                  Nota
                </th>
                <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest text-right">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pagination.currentItems.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-gray-400 font-bold"
                  >
                    Nenhuma avaliação cadastrada.
                  </td>
                </tr>
              ) : (
                pagination.currentItems.map((avaliacao) => {
                  const estagio = estagios.find(
                    (e) => e.id === avaliacao.estagio_id,
                  );
                  const aluno = alunos.find((a) => a.id === estagio?.aluno_id);

                  return (
                    <tr
                      key={avaliacao.id}
                      className={cn(
                        "hover:bg-blue-50/30 transition-colors group",
                        selection.isSelected(avaliacao.id) && "bg-blue-50/50",
                      )}
                    >
                      <td className="px-6 py-4">
                        <button
                          onClick={() => selection.toggleSelect(avaliacao.id)}
                          className={cn(
                            "p-1 rounded transition-colors",
                            selection.isSelected(avaliacao.id)
                              ? "text-blue-600"
                              : "text-gray-300 hover:text-gray-400 opacity-0 group-hover:opacity-100",
                          )}
                        >
                          {selection.isSelected(avaliacao.id) ? (
                            <CheckSquare size={20} />
                          ) : (
                            <Square size={20} />
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs uppercase">
                            {aluno?.nome.substring(0, 2)}
                          </div>
                          <span className="text-gray-900 font-bold">
                            {aluno?.nome}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-gray-100 rounded text-[10px] font-black uppercase tracking-wider text-gray-600">
                          {avaliacao.tipo}ª NOTA
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600 font-medium text-sm">
                        {new Date(avaliacao.data_avaliacao).toLocaleDateString(
                          "pt-BR",
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-blue-900 font-black text-xl">
                          {avaliacao.nota.toFixed(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleEdit(avaliacao)}
                            className="p-2 text-blue-600 hover:bg-white rounded-lg shadow-sm border border-transparent hover:border-blue-100 transition-all"
                            title="Editar"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(avaliacao)}
                            className="p-2 text-red-600 hover:bg-white rounded-lg shadow-sm border border-transparent hover:border-red-100 transition-all"
                            title="Excluir"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
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
        title={selectedAval ? "Editar Avaliação" : "Lançar Nova Nota"}
        description="Registre o desempenho do estagiário neste período."
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="text-sm font-bold text-gray-700 ml-1">
                Estágio / Aluno
              </label>
              <div className="relative mt-1">
                <User
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={16}
                />
                <select
                  {...register("estagio_id")}
                  className={cn(
                    "w-full pl-10 pr-3 py-2.5 rounded-lg border text-sm focus:ring-2 outline-none transition-all appearance-none bg-white",
                    errors.estagio_id
                      ? "border-red-500 focus:ring-red-200"
                      : "border-gray-200 focus:ring-blue-100 focus:border-blue-500",
                  )}
                >
                  <option value="">Selecione o estágio...</option>
                  {estagios.map((est: any) => (
                    <option key={est.id} value={est.id}>
                      {alunos.find((a: any) => a.id === est.aluno_id)?.nome}
                    </option>
                  ))}
                </select>
              </div>
              {errors.estagio_id && (
                <p className="text-[11px] font-bold text-red-500 mt-1 ml-1">
                  {errors.estagio_id.message}
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-bold text-gray-700 ml-1">
                Tipo de Avaliação
              </label>
              <select
                {...register("tipo", { valueAsNumber: true })}
                className="w-full px-3 py-2.5 mt-1 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all appearance-none bg-white font-bold"
              >
                <option value={1}>1ª Avaliação</option>
                <option value={2}>2ª Avaliação</option>
                <option value={3}>3ª Avaliação (Final)</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-bold text-gray-700 ml-1">
                Nota (0 a 10)
              </label>
              <div className="relative mt-1">
                <TrendingUp
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={16}
                />
                <input
                  type="number"
                  step="0.1"
                  {...register("nota", { valueAsNumber: true })}
                  className={cn(
                    "w-full pl-10 pr-3 py-2.5 rounded-lg border text-sm focus:ring-2 outline-none transition-all",
                    errors.nota
                      ? "border-red-500 focus:ring-red-200"
                      : "border-gray-200 focus:ring-blue-100 focus:border-blue-500",
                  )}
                />
              </div>
              {errors.nota && (
                <p className="text-[11px] font-bold text-red-500 mt-1 ml-1">
                  {errors.nota.message}
                </p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-bold text-gray-700 ml-1">
                Data da Avaliação
              </label>
              <div className="relative mt-1">
                <Calendar
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={16}
                />
                <input
                  type="date"
                  {...register("data_avaliacao")}
                  className={cn(
                    "w-full pl-10 pr-3 py-2.5 rounded-lg border text-sm focus:ring-2 outline-none transition-all",
                    errors.data_avaliacao
                      ? "border-red-500 focus:ring-red-200"
                      : "border-gray-200 focus:ring-blue-100 focus:border-blue-500",
                  )}
                />
              </div>
              {errors.data_avaliacao && (
                <p className="text-[11px] font-bold text-red-500 mt-1 ml-1">
                  {errors.data_avaliacao.message}
                </p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-bold text-gray-700 ml-1">
                Comentários
              </label>
              <div className="relative mt-1">
                <MessageSquare
                  className="absolute left-3 top-3 text-gray-400"
                  size={16}
                />
                <textarea
                  {...register("comentarios")}
                  rows={3}
                  className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                  placeholder="Observações sobre o desempenho..."
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
                ? "Salvando..."
                : selectedAval
                  ? "Salvar Alterações"
                  : "Confirmar Nota"}
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
                Novo Tipo de Avaliação (Opcional)
              </label>
              <select
                {...registerBulk("tipo", { valueAsNumber: true })}
                className="w-full px-3 py-2.5 mt-1 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all appearance-none bg-white font-bold"
              >
                <option value="">Manter atual...</option>
                <option value={1}>1ª Avaliação</option>
                <option value={2}>2ª Avaliação</option>
                <option value={3}>3ª Avaliação (Final)</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-bold text-gray-700 ml-1">
                Nova Nota (Opcional)
              </label>
              <input
                type="number"
                step="0.1"
                {...registerBulk("nota", { valueAsNumber: true })}
                className="w-full px-3 py-2.5 mt-1 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                placeholder="0.0 a 10.0"
              />
            </div>

            <div>
              <label className="text-sm font-bold text-gray-700 ml-1">
                Nova Data da Avaliação (Opcional)
              </label>
              <input
                type="date"
                {...registerBulk("data_avaliacao")}
                className="w-full px-3 py-2.5 mt-1 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
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
        itemName="esta avaliação"
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
