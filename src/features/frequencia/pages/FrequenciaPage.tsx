import { useState } from "react";
import {
  Clock,
  Plus,
  Edit2,
  Trash2,
  Search,
  CheckCircle2,
  User,
  Calendar,
  Activity,
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
import { useSelection } from "@/hooks/useSelection";
import { toast } from "sonner";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { usePagination } from "@/hooks/usePagination";
import { Pagination } from "@/components/ui/Pagination";
import { ListSortControl, SortOption } from "@/components/ui/ListSortControl";
import { ListFilterControl } from "@/components/ui/ListFilterControl";

const frequenciaSortOptions: SortOption[] = [
  { label: "Data", column: "data" },
  { label: "Horas", column: "horas_realizadas" },
  { label: "Cadastro", column: "created_at" },
];

interface FrequenciaFilters {
  estagio_id: string;
  validado_supervisor: string;
  validado_orientador: string;
}

const initialFilters: FrequenciaFilters = {
  estagio_id: "",
  validado_supervisor: "",
  validado_orientador: "",
};

const frequenciaSchema = z.object({
  estagio_id: z.string().uuid("Selecione um estágio válido"),
  data: z.string().min(1, "A data é obrigatória"),
  horas_realizadas: z
    .number()
    .min(1, "Mínimo 1 hora")
    .max(10, "Máximo 10 horas"),
  atividades: z
    .string()
    .min(10, "Descreva as atividades com pelo menos 10 caracteres"),
  validado_supervisor: z.boolean().default(false),
  validado_orientador: z.boolean().default(false),
});

const bulkEditSchema = z.object({
  validado_supervisor: z.boolean().optional(),
  validado_orientador: z.boolean().optional(),
});

type FrequenciaFormValues = z.infer<typeof frequenciaSchema>;
type BulkEditValues = z.infer<typeof bulkEditSchema>;

interface Frequencia {
  id: string;
  estagio_id: string;
  data: string;
  horas_realizadas: number;
  atividades: string;
  validado_supervisor: boolean;
  validado_orientador: boolean;
  created_at: string;
}

export default function FrequenciaPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
  const [isBulkEditOpen, setIsBulkEditOpen] = useState(false);
  const [selectedFreq, setSelectedFreq] = useState<Frequencia | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortColumn, setSortColumn] = useState("data");
  const [isSortAsc, setIsSortAsc] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState<FrequenciaFilters>(initialFilters);

  const {
    items: frequencias,
    isLoading,
    create,
    update,
    remove,
    bulkRemove,
    bulkUpdate,
    isBulkDeleting,
  } = useSupabaseCrud<Frequencia>("frequencias", ["frequencias"], {
    orderBy: { column: sortColumn, ascending: isSortAsc },
  });

  const { items: estagios } = useSupabaseCrud<any>("estagios", ["estagios"]);
  const { items: alunos } = useSupabaseCrud<any>("alunos", ["alunos"]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FrequenciaFormValues>({
    resolver: zodResolver(frequenciaSchema) as any,
    defaultValues: {
      horas_realizadas: 6,
      validado_supervisor: false,
      validado_orientador: false,
      data: new Date().toISOString().split("T")[0],
      atividades: "",
      estagio_id: "",
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

  const onSubmit = async (data: any) => {
    try {
      if (selectedFreq) {
        await update({ id: selectedFreq.id, ...data });
        toast.success("Registro de frequência atualizado!");
      } else {
        await create(data);
        toast.success("Frequência lançada com sucesso!");
      }
      handleCloseForm();
    } catch (error) {
      toast.error(translateError(error));
    }
  };

  const onBulkEditSubmit = async (data: BulkEditValues) => {
    const updateData = Object.fromEntries(
      Object.entries(data).filter(([_, v]) => v !== undefined),
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

  const handleEdit = (freq: Frequencia) => {
    setSelectedFreq(freq);
    reset({
      estagio_id: freq.estagio_id,
      data: freq.data,
      horas_realizadas: freq.horas_realizadas,
      atividades: freq.atividades,
      validado_supervisor: freq.validado_supervisor,
      validado_orientador: freq.validado_orientador,
    });
    setIsFormOpen(true);
  };

  const handleDeleteClick = (freq: Frequencia) => {
    setSelectedFreq(freq);
    setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedFreq) return;
    try {
      await remove(selectedFreq.id);
      toast.success("Registro removido com sucesso!");
      setIsDeleteOpen(false);
      setSelectedFreq(null);
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
    setSelectedFreq(null);
    reset();
  };

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  const handleFilterChange = (key: keyof FrequenciaFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters(initialFilters);
  };

  const filteredFrequencias = frequencias.filter((freq) => {
    const estagio = estagios.find((e) => e.id === freq.estagio_id);
    const alunoNome =
      alunos.find((a) => a.id === estagio?.aluno_id)?.nome || "";
    const matchesSearch =
      (alunoNome?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (freq.atividades?.toLowerCase() || "").includes(searchTerm.toLowerCase());

    const matchesEstagio =
      !filters.estagio_id || freq.estagio_id === filters.estagio_id;
    const matchesSupervisor =
      !filters.validado_supervisor ||
      freq.validado_supervisor === (filters.validado_supervisor === "true");
    const matchesOrientador =
      !filters.validado_orientador ||
      freq.validado_orientador === (filters.validado_orientador === "true");

    return (
      matchesSearch && matchesEstagio && matchesSupervisor && matchesOrientador
    );
  });

  const totalHoras = filteredFrequencias.reduce(
    (acc, f) => acc + f.horas_realizadas,
    0,
  );

  const selection = useSelection(filteredFrequencias);
  const pagination = usePagination(filteredFrequencias);

  const { listLayout } = useListLayout();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-black text-blue-900 flex items-center gap-2">
            <Clock className="text-blue-600" size={28} /> Frequência
          </h1>
          <p className="text-gray-500 font-medium">
            Acompanhamento diário de atividades
          </p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl flex items-center justify-center gap-2 font-bold transition-all shadow-lg shadow-blue-200 active:scale-95"
        >
          <Plus size={20} /> Lançar Horas
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-blue-600 p-6 rounded-2xl shadow-lg shadow-blue-100 flex justify-between items-center text-white">
          <div>
            <p className="text-blue-100 text-xs font-black uppercase tracking-widest mb-1">
              Total Acumulado
            </p>
            <h2 className="text-4xl font-black">{totalHoras}h</h2>
          </div>
          <div className="bg-blue-500/30 p-3 rounded-xl">
            <Clock size={32} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
          <div>
            <p className="text-gray-400 text-xs font-black uppercase tracking-widest mb-1">
              Meta Obrigatória
            </p>
            <h2 className="text-4xl font-black text-gray-800">400h</h2>
          </div>
          <div className="bg-green-50 p-3 rounded-xl text-green-500">
            <CheckCircle2 size={32} />
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
            placeholder="Buscar por atividades ou nome do aluno..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <ListSortControl
            options={frequenciaSortOptions}
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
            Estágio / Aluno
          </label>
          <select
            value={filters.estagio_id}
            onChange={(e) => handleFilterChange("estagio_id", e.target.value)}
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos os alunos ativos</option>
            {estagios
              .filter((e: any) => e.status === "ativo")
              .map((est: any) => (
                <option key={est.id} value={est.id}>
                  {alunos.find((a: any) => a.id === est.aluno_id)?.nome}
                </option>
              ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
            Status Supervisor
          </label>
          <select
            value={filters.validado_supervisor}
            onChange={(e) =>
              handleFilterChange("validado_supervisor", e.target.value)
            }
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos</option>
            <option value="true">Validado</option>
            <option value="false">Pendente</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
            Status Orientador
          </label>
          <select
            value={filters.validado_orientador}
            onChange={(e) =>
              handleFilterChange("validado_orientador", e.target.value)
            }
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos</option>
            <option value="true">Validado</option>
            <option value="false">Pendente</option>
          </select>
        </div>
      </ListFilterControl>

      {/* Listagem Responsiva (Cards) */}
      <div
        className={cn(
          "grid grid-cols-1 gap-4",
          listLayout === "table"
            ? "lg:hidden"
            : "lg:grid-cols-2 xl:grid-cols-3",
        )}
      >
        {filteredFrequencias.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl text-center text-gray-400 font-bold border-2 border-dashed border-gray-100 col-span-full">
            Nenhum registro encontrado.
          </div>
        ) : (
          pagination.currentItems.map((frequencia) => {
            const estagio = estagios.find(
              (e) => e.id === frequencia.estagio_id,
            );
            const aluno = alunos.find((a) => a.id === estagio?.aluno_id);

            return (
              <div
                key={frequencia.id}
                className={cn(
                  "bg-white p-5 rounded-2xl shadow-sm border transition-all relative group space-y-4",
                  selection.isSelected(frequencia.id)
                    ? "border-blue-500 ring-2 ring-blue-50"
                    : "border-gray-100",
                )}
              >
                <button
                  onClick={() => selection.toggleSelect(frequencia.id)}
                  className={cn(
                    "absolute top-4 right-4 p-2 rounded-lg transition-all z-10",
                    selection.isSelected(frequencia.id)
                      ? "text-blue-600 bg-blue-50"
                      : "text-gray-300 hover:text-gray-400 opacity-0 group-hover:opacity-100",
                  )}
                >
                  {selection.isSelected(frequencia.id) ? (
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
                        {new Date(frequencia.data).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <span
                      className={cn(
                        "px-1.5 py-0.5 rounded text-[8px] font-black border",
                        frequencia.validado_supervisor
                          ? "bg-green-50 text-green-700 border-green-100"
                          : "bg-gray-50 text-gray-400 border-gray-100",
                      )}
                    >
                      SUP
                    </span>
                    <span
                      className={cn(
                        "px-1.5 py-0.5 rounded text-[8px] font-black border",
                        frequencia.validado_orientador
                          ? "bg-blue-50 text-blue-700 border-blue-100"
                          : "bg-gray-50 text-gray-400 border-gray-100",
                      )}
                    >
                      ORI
                    </span>
                  </div>
                </div>

                <p className="text-sm text-gray-600 line-clamp-2 bg-gray-50 p-3 rounded-xl border border-gray-100 italic">
                  "{frequencia.atividades}"
                </p>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2 text-blue-700 font-black">
                    <Clock size={16} />
                    <span>{frequencia.horas_realizadas}h realizadas</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(frequencia)}
                      className="p-2.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(frequencia)}
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
                  Data / Aluno
                </th>
                <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest">
                  Atividades
                </th>
                <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest text-center">
                  Horas
                </th>
                <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest text-center">
                  Validação
                </th>
                <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest text-right">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredFrequencias.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-gray-400 font-bold"
                  >
                    Nenhum lançamento encontrado.
                  </td>
                </tr>
              ) : (
                pagination.currentItems.map((frequencia) => {
                  const estagio = estagios.find(
                    (e) => e.id === frequencia.estagio_id,
                  );
                  const aluno = alunos.find((a) => a.id === estagio?.aluno_id);

                  return (
                    <tr
                      key={frequencia.id}
                      className={cn(
                        "hover:bg-blue-50/30 transition-colors group",
                        selection.isSelected(frequencia.id) && "bg-blue-50/50",
                      )}
                    >
                      <td className="px-6 py-4">
                        <button
                          onClick={() => selection.toggleSelect(frequencia.id)}
                          className={cn(
                            "p-1 rounded transition-colors",
                            selection.isSelected(frequencia.id)
                              ? "text-blue-600"
                              : "text-gray-300 hover:text-gray-400 opacity-0 group-hover:opacity-100",
                          )}
                        >
                          {selection.isSelected(frequencia.id) ? (
                            <CheckSquare size={20} />
                          ) : (
                            <Square size={20} />
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-gray-900 font-bold">
                            {new Date(frequencia.data).toLocaleDateString(
                              "pt-BR",
                            )}
                          </span>
                          <span className="text-xs text-gray-500 font-medium">
                            {aluno?.nome}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p
                          className="text-gray-600 text-sm max-w-md truncate"
                          title={frequencia.atividades}
                        >
                          {frequencia.atividades}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg font-black text-sm">
                          {frequencia.horas_realizadas}h
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-2">
                          <span
                            className={cn(
                              "px-2 py-1 rounded text-[9px] font-black border",
                              frequencia.validado_supervisor
                                ? "bg-green-50 text-green-700 border-green-100"
                                : "bg-gray-50 text-gray-400 border-gray-100",
                            )}
                          >
                            SUP
                          </span>
                          <span
                            className={cn(
                              "px-2 py-1 rounded text-[9px] font-black border",
                              frequencia.validado_orientador
                                ? "bg-blue-50 text-blue-700 border-blue-100"
                                : "bg-gray-50 text-gray-400 border-gray-100",
                            )}
                          >
                            ORI
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleEdit(frequencia)}
                            className="p-2 text-blue-600 hover:bg-white rounded-lg shadow-sm border border-transparent hover:border-blue-100 transition-all"
                            title="Editar"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(frequencia)}
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
        title={selectedFreq ? "Editar Lançamento" : "Novo Lançamento de Horas"}
        description="Registre as horas e atividades realizadas no dia de estágio."
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
                  {estagios
                    .filter((e: any) => e.status === "ativo")
                    .map((est: any) => (
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
                Data
              </label>
              <div className="relative mt-1">
                <Calendar
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={16}
                />
                <input
                  type="date"
                  {...register("data")}
                  className={cn(
                    "w-full pl-10 pr-3 py-2.5 rounded-lg border text-sm focus:ring-2 outline-none transition-all",
                    errors.data
                      ? "border-red-500 focus:ring-red-200"
                      : "border-gray-200 focus:ring-blue-100 focus:border-blue-500",
                  )}
                />
              </div>
              {errors.data && (
                <p className="text-[11px] font-bold text-red-500 mt-1 ml-1">
                  {errors.data.message}
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-bold text-gray-700 ml-1">
                Horas Realizadas
              </label>
              <div className="relative mt-1">
                <Clock
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={16}
                />
                <input
                  type="number"
                  {...register("horas_realizadas", { valueAsNumber: true })}
                  className={cn(
                    "w-full pl-10 pr-3 py-2.5 rounded-lg border text-sm focus:ring-2 outline-none transition-all",
                    errors.horas_realizadas
                      ? "border-red-500 focus:ring-red-200"
                      : "border-gray-200 focus:ring-blue-100 focus:border-blue-500",
                  )}
                />
              </div>
              {errors.horas_realizadas && (
                <p className="text-[11px] font-bold text-red-500 mt-1 ml-1">
                  {errors.horas_realizadas.message}
                </p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-bold text-gray-700 ml-1">
                Atividades Desempenhadas
              </label>
              <div className="relative mt-1">
                <Activity
                  className="absolute left-3 top-3 text-gray-400"
                  size={16}
                />
                <textarea
                  {...register("atividades")}
                  rows={3}
                  className={cn(
                    "w-full pl-10 pr-3 py-2.5 rounded-lg border text-sm focus:ring-2 outline-none transition-all",
                    errors.atividades
                      ? "border-red-500 focus:ring-red-200"
                      : "border-gray-200 focus:ring-blue-100 focus:border-blue-500",
                  )}
                  placeholder="Ex: Instalação de softwares, suporte aos usuários..."
                />
              </div>
              {errors.atividades && (
                <p className="text-[11px] font-bold text-red-500 mt-1 ml-1">
                  {errors.atividades.message}
                </p>
              )}
            </div>

            <div className="md:col-span-2 flex gap-4 bg-gray-50 p-4 rounded-xl">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  {...register("validado_supervisor")}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-xs font-bold text-gray-600 group-hover:text-blue-600 transition-colors">
                  Validado pelo Supervisor
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  {...register("validado_orientador")}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-xs font-bold text-gray-600 group-hover:text-blue-600 transition-colors">
                  Validado pelo Orientador
                </span>
              </label>
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
                : selectedFreq
                  ? "Salvar Alterações"
                  : "Confirmar Lançamento"}
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
            <div className="flex flex-col gap-4 bg-gray-50 p-4 rounded-xl">
              <p className="text-sm font-bold text-gray-700 mb-2">
                Validar registros selecionados:
              </p>
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  {...registerBulk("validado_supervisor")}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-bold text-gray-600 group-hover:text-blue-600 transition-colors">
                  Validado pelo Supervisor
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  {...registerBulk("validado_orientador")}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-bold text-gray-600 group-hover:text-blue-600 transition-colors">
                  Validado pelo Orientador
                </span>
              </label>
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
        itemName="este registro de frequência"
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
