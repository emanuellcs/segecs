import { useState } from "react";
import {
  MapPin,
  Plus,
  Edit2,
  Trash2,
  Search,
  Calendar,
  User,
  MessageSquare,
  CheckCircle2,
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
import { ListSortControl, SortOption } from "@/components/ui/ListSortControl";
import { ListFilterControl } from "@/components/ui/ListFilterControl";
import { toast } from "sonner";
import { LoadingScreen } from "@/components/ui/LoadingScreen";

const visitaSortOptions: SortOption[] = [
  { label: "Data da Visita", column: "data_visita" },
  { label: "Tipo", column: "tipo" },
  { label: "Cadastro", column: "created_at" },
];

interface VisitaFilters {
  tipo: string;
  empresa_id: string;
}

const initialFilters: VisitaFilters = {
  tipo: "",
  empresa_id: "",
};

const visitaSchema = z.object({
  estagio_id: z.string().uuid("Selecione um estágio válido"),
  data_visita: z.string().min(1, "A data é obrigatória"),
  tipo: z.enum(["presencial", "remota"], {
    errorMap: () => ({ message: "Selecione o tipo de visita" }),
  }),
  resumo: z.string().min(10, "O resumo deve ter pelo menos 10 caracteres"),
  observacoes: z.string().optional().or(z.literal("")),
});

const bulkEditSchema = z.object({
  tipo: z.enum(["presencial", "remota"]).optional(),
});

type VisitaFormValues = z.infer<typeof visitaSchema>;
type BulkEditValues = z.infer<typeof bulkEditSchema>;

interface Visita {
  id: string;
  estagio_id: string;
  data_visita: string;
  tipo: "presencial" | "remota";
  resumo: string;
  observacoes?: string | null;
  created_at: string;
}

export default function VisitasPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
  const [isBulkEditOpen, setIsBulkEditOpen] = useState(false);
  const [selectedVisita, setSelectedVisita] = useState<Visita | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortColumn, setSortColumn] = useState("data_visita");
  const [isSortAsc, setIsSortAsc] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState<VisitaFilters>(initialFilters);

  const {
    items: visitas,
    isLoading,
    create,
    update,
    remove,
    bulkRemove,
    bulkUpdate,
    isBulkDeleting,
  } = useSupabaseCrud<Visita>("visitas", ["visitas"], {
    orderBy: { column: sortColumn, ascending: isSortAsc },
  });

  const { items: estagios } = useSupabaseCrud<any>("estagios", ["estagios"]);
  const { items: alunos } = useSupabaseCrud<any>("alunos", ["alunos"]);
  const { items: empresas } = useSupabaseCrud<any>("empresas", ["empresas"]);
  const { items: vagas } = useSupabaseCrud<any>("vagas", ["vagas"]);

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  const handleFilterChange = (key: keyof VisitaFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters(initialFilters);
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<VisitaFormValues>({
    resolver: zodResolver(visitaSchema),
    defaultValues: {
      tipo: "presencial",
      data_visita: new Date().toISOString().split("T")[0],
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

  const onSubmit = async (data: VisitaFormValues) => {
    try {
      if (selectedVisita) {
        await update({ id: selectedVisita.id, ...data });
        toast.success("Visita atualizada com sucesso!");
      } else {
        await create(data);
        toast.success("Visita registrada com sucesso!");
      }
      handleCloseForm();
    } catch (error) {
      toast.error(translateError(error));
    }
  };

  const onBulkEditSubmit = async (data: BulkEditValues) => {
    const updateData = Object.fromEntries(
      Object.entries(data).filter(
        ([_, v]) => (v as unknown) !== "" && v !== undefined,
      ),
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

  const handleEdit = (visita: Visita) => {
    setSelectedVisita(visita);
    reset({
      estagio_id: visita.estagio_id,
      data_visita: visita.data_visita,
      tipo: visita.tipo,
      resumo: visita.resumo,
      observacoes: visita.observacoes || "",
    });
    setIsFormOpen(true);
  };

  const handleDeleteClick = (visita: Visita) => {
    setSelectedVisita(visita);
    setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedVisita) return;
    try {
      await remove(selectedVisita.id);
      toast.success("Visita removida com sucesso!");
      setIsDeleteOpen(false);
      setSelectedVisita(null);
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
    setSelectedVisita(null);
    reset();
  };

  const filteredVisitas = visitas.filter((visita) => {
    const estagio = estagios.find((e) => e.id === visita.estagio_id);
    const vaga = vagas.find((v) => v.id === estagio?.vaga_id);
    const alunoNome =
      alunos.find((a) => a.id === estagio?.aluno_id)?.nome || "";

    const matchesSearch =
      alunoNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      visita.resumo.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTipo = !filters.tipo || visita.tipo === filters.tipo;
    const matchesEmpresa =
      !filters.empresa_id || vaga?.empresa_id === filters.empresa_id;

    return matchesSearch && matchesTipo && matchesEmpresa;
  });

  const selection = useSelection(filteredVisitas);
  const pagination = usePagination(filteredVisitas);
  const { listLayout } = useListLayout();

  if (isLoading) return <LoadingScreen />;

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-black text-blue-900 flex items-center gap-2">
            <MapPin className="text-blue-600" size={28} /> Visitas Técnicas
          </h1>
          <p className="text-gray-500 font-medium">
            Acompanhamento e monitoramento in loco
          </p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl flex items-center justify-center gap-2 font-bold transition-all shadow-lg shadow-blue-200 active:scale-95"
        >
          <Plus size={20} /> Registrar Visita
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
            placeholder="Buscar por aluno ou resumo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <ListSortControl
            options={visitaSortOptions}
            currentColumn={sortColumn}
            ascending={isSortAsc}
            onSortChange={(col, asc) => {
              setSortColumn(col);
              setIsSortAsc(asc);
            }}
          />
          <ListLayoutToggle />
        </div>
      </div>

      <ListFilterControl
        isOpen={isFilterOpen}
        onToggle={() => setIsFilterOpen(!isFilterOpen)}
        onClear={clearFilters}
        count={activeFilterCount}
      >
        <div>
          <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
            Tipo de Visita
          </label>
          <select
            value={filters.tipo}
            onChange={(e) => handleFilterChange("tipo", e.target.value)}
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos os Tipos</option>
            <option value="presencial">Presencial</option>
            <option value="remota">Remota</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
            Empresa
          </label>
          <select
            value={filters.empresa_id}
            onChange={(e) => handleFilterChange("empresa_id", e.target.value)}
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todas as Empresas</option>
            {empresas.map((e: any) => (
              <option key={e.id} value={e.id}>
                {e.razao_social}
              </option>
            ))}
          </select>
        </div>
      </ListFilterControl>

      {/* Listagem */}
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
            Nenhuma visita registrada.
          </div>
        ) : (
          pagination.currentItems.map((visita) => {
            const estagio = estagios.find((e) => e.id === visita.estagio_id);
            const aluno = alunos.find((a) => a.id === estagio?.aluno_id);
            const vaga = vagas.find((v) => v.id === estagio?.vaga_id);
            const empresa = empresas.find((e) => e.id === vaga?.empresa_id);

            return (
              <div
                key={visita.id}
                className={cn(
                  "bg-white p-5 rounded-2xl shadow-sm border transition-all relative group space-y-4",
                  selection.isSelected(visita.id)
                    ? "border-blue-500 ring-2 ring-blue-50"
                    : "border-gray-100",
                )}
              >
                <button
                  onClick={() => selection.toggleSelect(visita.id)}
                  className={cn(
                    "absolute top-4 right-4 p-2 rounded-lg transition-all z-10",
                    selection.isSelected(visita.id)
                      ? "text-blue-600 bg-blue-50"
                      : "text-gray-300 hover:text-gray-400 opacity-0 group-hover:opacity-100",
                  )}
                >
                  {selection.isSelected(visita.id) ? (
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
                        {empresa?.razao_social}
                      </p>
                    </div>
                  </div>
                  <span
                    className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                      visita.tipo === "presencial"
                        ? "bg-purple-100 text-purple-700"
                        : "bg-blue-100 text-blue-700",
                    )}
                  >
                    {visita.tipo}
                  </span>
                </div>

                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <p className="text-sm text-gray-700 line-clamp-3 font-medium">
                    {visita.resumo}
                  </p>
                </div>

                <div className="flex items-center gap-4 pt-2 text-xs text-gray-500 font-bold uppercase tracking-wider">
                  <div className="flex items-center gap-1.5">
                    <Calendar size={14} className="text-blue-500" />
                    {new Date(visita.data_visita).toLocaleDateString("pt-BR")}
                  </div>
                </div>

                <div className="flex gap-2 pt-2 border-t border-gray-50">
                  <button
                    onClick={() => handleEdit(visita)}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-50 text-blue-700 font-bold text-sm hover:bg-blue-100 transition-colors"
                  >
                    <Edit2 size={16} /> Editar
                  </button>
                  <button
                    onClick={() => handleDeleteClick(visita)}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-50 text-red-700 font-bold text-sm hover:bg-red-100 transition-colors"
                  >
                    <Trash2 size={16} /> Excluir
                  </button>
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
                  Aluno / Empresa
                </th>
                <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest">
                  Tipo
                </th>
                <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest">
                  Data
                </th>
                <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest">
                  Resumo
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
                    Nenhuma visita cadastrada.
                  </td>
                </tr>
              ) : (
                pagination.currentItems.map((visita) => {
                  const estagio = estagios.find(
                    (e) => e.id === visita.estagio_id,
                  );
                  const aluno = alunos.find((a) => a.id === estagio?.aluno_id);
                  const vaga = vagas.find((v) => v.id === estagio?.vaga_id);
                  const empresa = empresas.find(
                    (e) => e.id === vaga?.empresa_id,
                  );

                  return (
                    <tr
                      key={visita.id}
                      className={cn(
                        "hover:bg-blue-50/30 transition-colors group",
                        selection.isSelected(visita.id) && "bg-blue-50/50",
                      )}
                    >
                      <td className="px-6 py-4">
                        <button
                          onClick={() => selection.toggleSelect(visita.id)}
                          className={cn(
                            "p-1 rounded transition-colors",
                            selection.isSelected(visita.id)
                              ? "text-blue-600"
                              : "text-gray-300 hover:text-gray-400 opacity-0 group-hover:opacity-100",
                          )}
                        >
                          {selection.isSelected(visita.id) ? (
                            <CheckSquare size={20} />
                          ) : (
                            <Square size={20} />
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-gray-900 font-bold">
                            {aluno?.nome}
                          </span>
                          <span className="text-xs text-gray-500">
                            {empresa?.razao_social}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={cn(
                            "px-2 py-1 rounded text-[10px] font-black uppercase tracking-wider",
                            visita.tipo === "presencial"
                              ? "bg-purple-100 text-purple-700"
                              : "bg-blue-100 text-blue-700",
                          )}
                        >
                          {visita.tipo}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600 font-medium text-sm">
                        {new Date(visita.data_visita).toLocaleDateString(
                          "pt-BR",
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <p
                          className="text-gray-600 text-sm max-w-xs truncate"
                          title={visita.resumo}
                        >
                          {visita.resumo}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleEdit(visita)}
                            className="p-2 text-blue-600 hover:bg-white rounded-lg shadow-sm border border-transparent hover:border-blue-100 transition-all"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(visita)}
                            className="p-2 text-red-600 hover:bg-white rounded-lg shadow-sm border border-transparent hover:border-red-100 transition-all"
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
        title={selectedVisita ? "Editar Visita" : "Novo Registro de Visita"}
        description="Documente o acompanhamento técnico realizado."
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
                  {estagios.map((est: any) => {
                    const aluno = alunos.find(
                      (a: any) => a.id === est.aluno_id,
                    );
                    return (
                      <option key={est.id} value={est.id}>
                        {aluno?.nome}
                      </option>
                    );
                  })}
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
                Data da Visita
              </label>
              <div className="relative mt-1">
                <Calendar
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={16}
                />
                <input
                  type="date"
                  {...register("data_visita")}
                  className={cn(
                    "w-full pl-10 pr-3 py-2.5 rounded-lg border text-sm focus:ring-2 outline-none transition-all",
                    errors.data_visita
                      ? "border-red-500 focus:ring-red-200"
                      : "border-gray-200 focus:ring-blue-100 focus:border-blue-500",
                  )}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-bold text-gray-700 ml-1">
                Tipo
              </label>
              <select
                {...register("tipo")}
                className="w-full px-3 py-2.5 mt-1 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all appearance-none bg-white font-bold"
              >
                <option value="presencial">🟣 PRESENCIAL</option>
                <option value="remota">🔵 REMOTA</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-bold text-gray-700 ml-1">
                Resumo da Visita
              </label>
              <div className="relative mt-1">
                <CheckCircle2
                  className="absolute left-3 top-3 text-gray-400"
                  size={16}
                />
                <textarea
                  {...register("resumo")}
                  rows={3}
                  className={cn(
                    "w-full pl-10 pr-3 py-2.5 rounded-lg border text-sm focus:ring-2 outline-none transition-all",
                    errors.resumo
                      ? "border-red-500 focus:ring-red-200"
                      : "border-gray-200 focus:ring-blue-100 focus:border-blue-500",
                  )}
                  placeholder="Descreva brevemente o que foi observado..."
                />
              </div>
              {errors.resumo && (
                <p className="text-[11px] font-bold text-red-500 mt-1 ml-1">
                  {errors.resumo.message}
                </p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-bold text-gray-700 ml-1">
                Observações Adicionais
              </label>
              <div className="relative mt-1">
                <MessageSquare
                  className="absolute left-3 top-3 text-gray-400"
                  size={16}
                />
                <textarea
                  {...register("observacoes")}
                  rows={2}
                  className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                  placeholder="Pontos de melhoria, pendências, etc..."
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
                : selectedVisita
                  ? "Salvar Alterações"
                  : "Registrar Visita"}
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
        <form
          onSubmit={handleSubmitBulk(onBulkEditSubmit)}
          className="space-y-6"
        >
          <div className="space-y-4">
            <div>
              <label className="text-sm font-bold text-gray-700 ml-1">
                Novo Tipo de Visita (Opcional)
              </label>
              <select
                {...registerBulk("tipo")}
                className="w-full px-3 py-2.5 mt-1 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all appearance-none bg-white font-bold"
              >
                <option value="">Manter atual...</option>
                <option value="presencial">🟣 PRESENCIAL</option>
                <option value="remota">🔵 REMOTA</option>
              </select>
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
        itemName="este registro de visita"
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
