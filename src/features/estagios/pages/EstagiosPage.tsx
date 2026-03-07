import { useState, useEffect } from "react";
import {
  ClipboardCheck,
  Plus,
  Edit2,
  Trash2,
  Search,
  FileText,
  User,
  Building2,
  Calendar,
  Clock,
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
import { pdf } from "@react-pdf/renderer";
import { TCETemplate } from "../templates/TCETemplate";
import { PlanoAtividadesTemplate } from "../templates/PlanoAtividadesTemplate";
import { TRETemplate } from "../templates/TRETemplate";

const estagioSchema = z.object({
  aluno_id: z.string().uuid("Selecione um aluno"),
  vaga_id: z.string().uuid("Selecione uma vaga"),
  orientador_id: z.string().uuid("Selecione um orientador"),
  supervisor_id: z.string().uuid("Selecione um supervisor"),
  data_inicio: z.string().min(1, "A data de início é obrigatória"),
  data_fim: z.string().min(1, "A data de fim é obrigatória"),
  carga_horaria_total: z.number().min(1, "Mínimo 1 hora"),
  carga_horaria_diaria: z
    .number()
    .min(1, "Mínimo 1 hora")
    .max(6, "Máximo 6 horas diárias"),
  status: z.enum(["ativo", "concluido", "interrompido"], {
    errorMap: () => ({ message: "Selecione um status válido" }),
  }),
});

const bulkEditSchema = z.object({
  orientador_id: z.string().optional(),
  supervisor_id: z.string().optional(),
  status: z.enum(["ativo", "concluido", "interrompido"]).optional(),
});

type EstagioFormValues = z.infer<typeof estagioSchema>;
type BulkEditValues = z.infer<typeof bulkEditSchema>;

interface Estagio {
  id: string;
  aluno_id: string;
  vaga_id: string;
  orientador_id: string;
  supervisor_id: string;
  data_inicio: string;
  data_fim: string;
  carga_horaria_total: number;
  carga_horaria_diaria: number;
  status: "ativo" | "concluido" | "interrompido";
  created_at: string;
}

export default function EstagiosPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
  const [isBulkEditOpen, setIsBulkEditOpen] = useState(false);
  const [selectedEstagio, setSelectedEstagio] = useState<Estagio | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const {
    items: estagios,
    isLoading,
    create,
    update,
    remove,
    bulkRemove,
    bulkUpdate,
    isBulkDeleting,
  } = useSupabaseCrud<Estagio>("estagios", ["estagios"]);

  const { items: alunos } = useSupabaseCrud<any>("alunos", ["alunos"]);
  const { items: vagas } = useSupabaseCrud<any>("vagas", ["vagas"]);
  const { items: orientadores } = useSupabaseCrud<any>("orientadores", [
    "orientadores",
  ]);
  const { items: supervisores } = useSupabaseCrud<any>("supervisores", [
    "supervisores",
  ]);
  const { items: empresas } = useSupabaseCrud<any>("empresas", ["empresas"]);
  const { items: cursos } = useSupabaseCrud<any>("cursos", ["cursos"]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<EstagioFormValues>({
    resolver: zodResolver(estagioSchema),
    defaultValues: {
      carga_horaria_total: 400,
      carga_horaria_diaria: 6,
      status: "ativo",
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

  const selectedAlunoId = watch("aluno_id");

  // Auto-preenche a carga horária baseada no curso do aluno selecionado
  useEffect(() => {
    if (selectedAlunoId && !selectedEstagio) {
      const aluno = alunos.find((a) => a.id === selectedAlunoId);
      if (aluno?.curso_id) {
        const curso = cursos.find((c) => c.id === aluno.curso_id);
        if (curso?.carga_horaria_obrigatoria) {
          setValue("carga_horaria_total", curso.carga_horaria_obrigatoria);
        }
      }
    }
  }, [selectedAlunoId, alunos, cursos, setValue, selectedEstagio]);

  const filteredEstagios = estagios.filter((estagio) => {
    const aluno = alunos.find((a) => a.id === estagio.aluno_id)?.nome || "";
    const vaga = vagas.find((v) => v.id === estagio.vaga_id);
    const empresa =
      empresas.find((e) => e.id === vaga?.empresa_id)?.razao_social || "";
    return (
      (aluno?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (empresa?.toLowerCase() || "").includes(searchTerm.toLowerCase())
    );
  });

  const selection = useSelection(filteredEstagios);

  const onSubmit = async (data: EstagioFormValues) => {
    try {
      if (selectedEstagio) {
        await update({ id: selectedEstagio.id, ...data });
        toast.success("Estágio atualizado com sucesso!");
      } else {
        await create(data);
        toast.success("Estágio alocado com sucesso!");
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

  const handleEdit = (estagio: Estagio) => {
    setSelectedEstagio(estagio);
    reset({
      aluno_id: estagio.aluno_id,
      vaga_id: estagio.vaga_id,
      orientador_id: estagio.orientador_id,
      supervisor_id: estagio.supervisor_id,
      data_inicio: estagio.data_inicio,
      data_fim: estagio.data_fim,
      carga_horaria_total: estagio.carga_horaria_total,
      carga_horaria_diaria: estagio.carga_horaria_diaria,
      status: estagio.status,
    });
    setIsFormOpen(true);
  };

  const handleDeleteClick = (estagio: Estagio) => {
    setSelectedEstagio(estagio);
    setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedEstagio) return;
    try {
      await remove(selectedEstagio.id);
      toast.success("Estágio removido com sucesso!");
      setIsDeleteOpen(false);
      setSelectedEstagio(null);
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
    setSelectedEstagio(null);
    reset();
  };

  const generatePDF = async (
    estagio: Estagio,
    type: "TCE" | "PLANO" | "TRE",
  ) => {
    const aluno = alunos.find((a) => a.id === estagio.aluno_id);
    const vaga = vagas.find((v) => v.id === estagio.vaga_id);
    const empresa = empresas.find((e) => e.id === vaga?.empresa_id);
    const orientador = orientadores.find((o) => o.id === estagio.orientador_id);
    const supervisor = supervisores.find((s) => s.id === estagio.supervisor_id);

    // Mock de escola para o template (deveria vir do banco, mas usaremos um padrão)
    const escola = { nome: "EEEP Professor Raimundo" } as any;

    const data = { aluno, empresa, escola, estagio, supervisor, orientador };

    toast.info(`Gerando ${type}...`);

    try {
      let template;
      switch (type) {
        case "TCE":
          template = <TCETemplate data={data} />;
          break;
        case "PLANO":
          template = <PlanoAtividadesTemplate data={data} />;
          break;
        case "TRE":
          template = <TRETemplate data={data} />;
          break;
      }

      const blob = await pdf(template).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${type}_${aluno?.nome.replace(/\s+/g, "_")}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success(`${type} gerado com sucesso!`);
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      toast.error(`Erro ao gerar ${type}`);
    }
  };

  const pagination = usePagination(filteredEstagios);

  const { listLayout } = useListLayout();

  if (isLoading) return <LoadingScreen />;

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-black text-blue-900 flex items-center gap-2">
            <ClipboardCheck className="text-blue-600" size={28} /> Alocação de
            Estágios
          </h1>
          <p className="text-gray-500 font-medium">
            Gestão de contratos e vínculos
          </p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl flex items-center justify-center gap-2 font-bold transition-all shadow-lg shadow-blue-200 active:scale-95"
        >
          <Plus size={20} /> Novo Estágio
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
            placeholder="Buscar por aluno ou empresa..."
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
        {filteredEstagios.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl text-center text-gray-400 font-bold border-2 border-dashed border-gray-100 col-span-full">
            Nenhum estágio encontrado.
          </div>
        ) : (
          pagination.currentItems.map((estagio) => {
            const aluno = alunos.find((a) => a.id === estagio.aluno_id);
            const vaga = vagas.find((v) => v.id === estagio.vaga_id);
            const empresa = empresas.find((e) => e.id === vaga?.empresa_id);

            return (
              <div
                key={estagio.id}
                className={cn(
                  "bg-white p-5 rounded-2xl shadow-sm border transition-all relative group space-y-4",
                  selection.isSelected(estagio.id)
                    ? "border-blue-500 ring-2 ring-blue-50"
                    : "border-gray-100",
                )}
              >
                <button
                  onClick={() => selection.toggleSelect(estagio.id)}
                  className={cn(
                    "absolute top-4 right-4 p-2 rounded-lg transition-all z-10",
                    selection.isSelected(estagio.id)
                      ? "text-blue-600 bg-blue-50"
                      : "text-gray-300 hover:text-gray-400 opacity-0 group-hover:opacity-100",
                  )}
                >
                  {selection.isSelected(estagio.id) ? (
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
                      estagio.status === "ativo"
                        ? "bg-green-100 text-green-700"
                        : estagio.status === "concluido"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-700",
                    )}
                  >
                    {estagio.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 p-2 rounded-lg">
                    <Calendar size={14} className="text-blue-500" />
                    <span className="truncate">
                      {new Date(estagio.data_inicio).toLocaleDateString(
                        "pt-BR",
                      )}{" "}
                      - {new Date(estagio.data_fim).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 p-2 rounded-lg">
                    <Clock size={14} className="text-blue-500" />
                    <span>{estagio.carga_horaria_total}h totais</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-2 border-t border-gray-50 flex-wrap">
                  <button
                    onClick={() => generatePDF(estagio, "TCE")}
                    className="p-2 rounded-lg bg-blue-50 text-blue-700 font-bold hover:bg-blue-100 transition-colors text-[10px] flex items-center gap-1"
                    title="Gerar TCE"
                  >
                    <FileText size={14} /> TCE
                  </button>
                  <button
                    onClick={() => generatePDF(estagio, "PLANO")}
                    className="p-2 rounded-lg bg-orange-50 text-orange-700 font-bold hover:bg-orange-100 transition-colors text-[10px] flex items-center gap-1"
                    title="Gerar Plano de Atividades"
                  >
                    <FileText size={14} /> PLANO
                  </button>
                  <button
                    onClick={() => generatePDF(estagio, "TRE")}
                    className="p-2 rounded-lg bg-green-50 text-green-700 font-bold hover:bg-green-100 transition-colors text-[10px] flex items-center gap-1"
                    title="Gerar TRE"
                  >
                    <FileText size={14} /> TRE
                  </button>
                  <div className="w-full flex gap-2">
                    <button
                      onClick={() => handleEdit(estagio)}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-50 text-blue-700 font-bold text-sm hover:bg-blue-100 transition-colors"
                    >
                      <Edit2 size={16} /> Editar
                    </button>
                    <button
                      onClick={() => handleDeleteClick(estagio)}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-50 text-red-700 font-bold text-sm hover:bg-red-100 transition-colors"
                    >
                      <Trash2 size={16} /> Excluir
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
                  Empresa / Vaga
                </th>
                <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest text-center">
                  Período
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
              {filteredEstagios.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-gray-400 font-bold"
                  >
                    Nenhum estágio cadastrado.
                  </td>
                </tr>
              ) : (
                pagination.currentItems.map((estagio) => {
                  const aluno = alunos.find((a) => a.id === estagio.aluno_id);
                  const vaga = vagas.find((v) => v.id === estagio.vaga_id);
                  const empresa = empresas.find(
                    (e) => e.id === vaga?.empresa_id,
                  );

                  return (
                    <tr
                      key={estagio.id}
                      className={cn(
                        "hover:bg-blue-50/30 transition-colors group",
                        selection.isSelected(estagio.id) && "bg-blue-50/50",
                      )}
                    >
                      <td className="px-6 py-4">
                        <button
                          onClick={() => selection.toggleSelect(estagio.id)}
                          className={cn(
                            "p-1 rounded transition-colors",
                            selection.isSelected(estagio.id)
                              ? "text-blue-600"
                              : "text-gray-300 hover:text-gray-400 opacity-0 group-hover:opacity-100",
                          )}
                        >
                          {selection.isSelected(estagio.id) ? (
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
                        <div className="flex flex-col">
                          <span className="text-gray-900 font-medium">
                            {vaga?.titulo}
                          </span>
                          <span className="text-xs text-gray-500">
                            {empresa?.razao_social}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600 font-medium text-center text-sm">
                        {new Date(estagio.data_inicio).toLocaleDateString(
                          "pt-BR",
                        )}{" "}
                        -{" "}
                        {new Date(estagio.data_fim).toLocaleDateString("pt-BR")}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={cn(
                            "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                            estagio.status === "ativo"
                              ? "bg-green-100 text-green-700"
                              : estagio.status === "concluido"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-gray-100 text-gray-700",
                          )}
                        >
                          {estagio.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => generatePDF(estagio, "TCE")}
                            className="p-2 text-blue-600 hover:bg-white rounded-lg shadow-sm border border-transparent hover:border-blue-100 transition-all"
                            title="Gerar TCE"
                          >
                            <FileText size={16} />
                          </button>
                          <button
                            onClick={() => generatePDF(estagio, "PLANO")}
                            className="p-2 text-orange-600 hover:bg-white rounded-lg shadow-sm border border-transparent hover:border-orange-100 transition-all"
                            title="Gerar Plano de Atividades"
                          >
                            <FileText size={16} />
                          </button>
                          <button
                            onClick={() => generatePDF(estagio, "TRE")}
                            className="p-2 text-green-600 hover:bg-white rounded-lg shadow-sm border border-transparent hover:border-green-100 transition-all"
                            title="Gerar TRE"
                          >
                            <FileText size={16} />
                          </button>
                          <button
                            onClick={() => handleEdit(estagio)}
                            className="p-2 text-blue-600 hover:bg-white rounded-lg shadow-sm border border-transparent hover:border-blue-100 transition-all"
                            title="Editar"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(estagio)}
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
        title={selectedEstagio ? "Editar Alocação" : "Nova Alocação de Estágio"}
        description="Vincule um aluno a uma vaga e defina os termos do estágio."
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="text-sm font-bold text-gray-700 ml-1">
                Aluno
              </label>
              <div className="relative mt-1">
                <User
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={16}
                />
                <select
                  {...register("aluno_id")}
                  className={cn(
                    "w-full pl-10 pr-3 py-2.5 rounded-lg border text-sm focus:ring-2 outline-none transition-all appearance-none bg-white",
                    errors.aluno_id
                      ? "border-red-500 focus:ring-red-200"
                      : "border-gray-200 focus:ring-blue-100 focus:border-blue-500",
                  )}
                >
                  <option value="">Selecione o aluno...</option>
                  {alunos.map((a: any) => (
                    <option key={a.id} value={a.id}>
                      {a.nome}
                    </option>
                  ))}
                </select>
              </div>
              {errors.aluno_id && (
                <p className="text-[11px] font-bold text-red-500 mt-1 ml-1">
                  {errors.aluno_id.message}
                </p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-bold text-gray-700 ml-1">
                Vaga / Empresa
              </label>
              <div className="relative mt-1">
                <Building2
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={16}
                />
                <select
                  {...register("vaga_id")}
                  className={cn(
                    "w-full pl-10 pr-3 py-2.5 rounded-lg border text-sm focus:ring-2 outline-none transition-all appearance-none bg-white",
                    errors.vaga_id
                      ? "border-red-500 focus:ring-red-200"
                      : "border-gray-200 focus:ring-blue-100 focus:border-blue-500",
                  )}
                >
                  <option value="">Selecione a vaga...</option>
                  {vagas.map((v: any) => {
                    const emp = empresas.find(
                      (e: any) => e.id === v.empresa_id,
                    );
                    return (
                      <option key={v.id} value={v.id}>
                        {v.titulo} ({emp?.razao_social})
                      </option>
                    );
                  })}
                </select>
              </div>
              {errors.vaga_id && (
                <p className="text-[11px] font-bold text-red-500 mt-1 ml-1">
                  {errors.vaga_id.message}
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-bold text-gray-700 ml-1">
                Orientador
              </label>
              <select
                {...register("orientador_id")}
                className={cn(
                  "w-full px-3 py-2.5 mt-1 rounded-lg border text-sm focus:ring-2 outline-none transition-all appearance-none bg-white",
                  errors.orientador_id
                    ? "border-red-500 focus:ring-red-200"
                    : "border-gray-200 focus:ring-blue-100 focus:border-blue-500",
                )}
              >
                <option value="">Selecione...</option>
                {orientadores.map((o: any) => (
                  <option key={o.id} value={o.id}>
                    {o.nome}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-bold text-gray-700 ml-1">
                Supervisor de Campo
              </label>
              <select
                {...register("supervisor_id")}
                className={cn(
                  "w-full px-3 py-2.5 mt-1 rounded-lg border text-sm focus:ring-2 outline-none transition-all appearance-none bg-white",
                  errors.supervisor_id
                    ? "border-red-500 focus:ring-red-200"
                    : "border-gray-200 focus:ring-blue-100 focus:border-blue-500",
                )}
              >
                <option value="">Selecione...</option>
                {supervisores.map((s: any) => {
                  const emp = empresas.find((e: any) => e.id === s.empresa_id);
                  return (
                    <option key={s.id} value={s.id}>
                      {s.nome} ({emp?.razao_social})
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <label className="text-sm font-bold text-gray-700 ml-1">
                Data Início
              </label>
              <input
                type="date"
                {...register("data_inicio")}
                className={cn(
                  "w-full px-3 py-2.5 mt-1 rounded-lg border text-sm focus:ring-2 outline-none transition-all",
                  errors.data_inicio
                    ? "border-red-500 focus:ring-red-200"
                    : "border-gray-200 focus:ring-blue-100 focus:border-blue-500",
                )}
              />
            </div>

            <div>
              <label className="text-sm font-bold text-gray-700 ml-1">
                Data Fim
              </label>
              <input
                type="date"
                {...register("data_fim")}
                className={cn(
                  "w-full px-3 py-2.5 mt-1 rounded-lg border text-sm focus:ring-2 outline-none transition-all",
                  errors.data_fim
                    ? "border-red-500 focus:ring-red-200"
                    : "border-gray-200 focus:ring-blue-100 focus:border-blue-500",
                )}
              />
            </div>

            <div>
              <label className="text-sm font-bold text-gray-700 ml-1">
                CH Total
              </label>
              <input
                type="number"
                {...register("carga_horaria_total", { valueAsNumber: true })}
                className="w-full px-3 py-2.5 mt-1 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="text-sm font-bold text-gray-700 ml-1">
                CH Diária
              </label>
              <input
                type="number"
                {...register("carga_horaria_diaria", { valueAsNumber: true })}
                className="w-full px-3 py-2.5 mt-1 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-bold text-gray-700 ml-1">
                Status
              </label>
              <select
                {...register("status")}
                className="w-full px-3 py-2.5 mt-1 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all appearance-none bg-white font-bold"
              >
                <option value="ativo">🟢 ATIVO</option>
                <option value="concluido">🔵 CONCLUÍDO</option>
                <option value="interrompido">🔴 INTERROMPIDO</option>
              </select>
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
                : selectedEstagio
                  ? "Salvar Alterações"
                  : "Confirmar Alocação"}
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
                Novo Orientador (Opcional)
              </label>
              <select
                {...registerBulk("orientador_id")}
                className="w-full px-3 py-2.5 mt-1 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all appearance-none bg-white"
              >
                <option value="">Manter atual...</option>
                {orientadores.map((o: any) => (
                  <option key={o.id} value={o.id}>
                    {o.nome}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-bold text-gray-700 ml-1">
                Novo Supervisor de Campo (Opcional)
              </label>
              <select
                {...registerBulk("supervisor_id")}
                className="w-full px-3 py-2.5 mt-1 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all appearance-none bg-white"
              >
                <option value="">Manter atual...</option>
                {supervisores.map((s: any) => {
                  const emp = empresas.find((e: any) => e.id === s.empresa_id);
                  return (
                    <option key={s.id} value={s.id}>
                      {s.nome} ({emp?.razao_social})
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <label className="text-sm font-bold text-gray-700 ml-1">
                Novo Status (Opcional)
              </label>
              <select
                {...registerBulk("status")}
                className="w-full px-3 py-2.5 mt-1 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all appearance-none bg-white font-bold"
              >
                <option value="">Manter atual...</option>
                <option value="ativo">🟢 ATIVO</option>
                <option value="concluido">🔵 CONCLUÍDO</option>
                <option value="interrompido">🔴 INTERROMPIDO</option>
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
        itemName="esta alocação"
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
