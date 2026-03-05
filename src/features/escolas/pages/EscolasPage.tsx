import { useState } from "react";
import {
  School,
  Plus,
  Edit2,
  Trash2,
  Search,
  MapPin,
  Hash,
} from "lucide-react";
import { useSupabaseCrud, translateError } from "@/hooks/useSupabaseCrud";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { cn } from "@/lib/utils";
import { FormModal } from "@/components/ui/FormModal";
import { ConfirmDeleteModal } from "@/components/ui/ConfirmDeleteModal";
import { ListLayoutToggle } from "@/components/ui/ListLayoutToggle";
import { useListLayout } from "@/hooks/useListLayout";
import { toast } from "sonner";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { usePagination } from "@/hooks/usePagination";
import { Pagination } from "@/components/ui/Pagination";

const escolaSchema = z.object({
  nome: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
  inep: z.string().optional(),
  cidade_id: z.string().uuid("Selecione uma cidade válida"),
});

type EscolaFormValues = z.infer<typeof escolaSchema>;

interface Escola {
  id: string;
  nome: string;
  inep?: string | null;
  cidade_id: string;
  created_at: string;
}

export default function EscolasPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedEscola, setSelectedEscola] = useState<Escola | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const {
    items: escolas,
    isLoading,
    create,
    update,
    remove,
  } = useSupabaseCrud<Escola>("escolas", ["escolas"]);

  const { items: cidades } = useSupabaseCrud<any>("cidades", ["cidades"]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EscolaFormValues>({
    resolver: zodResolver(escolaSchema),
  });

  const onSubmit = async (data: EscolaFormValues) => {
    try {
      if (selectedEscola) {
        await update({ id: selectedEscola.id, ...data });
        toast.success("Escola atualizada com sucesso!");
      } else {
        await create(data);
        toast.success("Escola cadastrada com sucesso!");
      }
      handleCloseForm();
    } catch (error) {
      toast.error(translateError(error));
    }
  };

  const handleEdit = (escola: Escola) => {
    setSelectedEscola(escola);
    reset({
      nome: escola.nome,
      inep: escola.inep || "",
      cidade_id: escola.cidade_id,
    });
    setIsFormOpen(true);
  };

  const handleDeleteClick = (escola: Escola) => {
    setSelectedEscola(escola);
    setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedEscola) return;
    try {
      await remove(selectedEscola.id);
      toast.success("Escola removida com sucesso!");
      setIsDeleteOpen(false);
      setSelectedEscola(null);
    } catch (error) {
      toast.error(translateError(error));
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedEscola(null);
    reset();
  };

  const filteredEscolas = escolas.filter(
    (escola) =>
      (escola.nome?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (escola.inep || "").includes(searchTerm),
  );

  const pagination = usePagination(filteredEscolas);

  const { listLayout } = useListLayout();

  if (isLoading) return <LoadingScreen />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-black text-blue-900 flex items-center gap-2">
            <School className="text-blue-600" size={28} /> Escolas
          </h1>
          <p className="text-gray-500 font-medium">
            Gestão de instituições de ensino
          </p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl flex items-center justify-center gap-2 font-bold transition-all shadow-lg shadow-blue-200 active:scale-95"
        >
          <Plus size={20} /> Nova Escola
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
            placeholder="Buscar por nome ou INEP..."
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
            Nenhuma escola encontrada.
          </div>
        ) : (
          pagination.currentItems.map((escola) => (
            <div
              key={escola.id}
              className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-4"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                    <School size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 leading-tight">
                      {escola.nome}
                    </h3>
                    <p className="text-xs text-gray-500 font-medium">
                      INEP: {escola.inep || "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 p-2 rounded-lg">
                <MapPin size={14} className="text-blue-500" />
                <span className="truncate">
                  {cidades.find((c: any) => c.id === escola.cidade_id)?.nome ||
                    "N/A"}
                </span>
              </div>

              <div className="flex gap-2 pt-2 border-t border-gray-50">
                <button
                  onClick={() => handleEdit(escola)}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-50 text-blue-700 font-bold text-sm hover:bg-blue-100 transition-colors"
                >
                  <Edit2 size={16} /> Editar
                </button>
                <button
                  onClick={() => handleDeleteClick(escola)}
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
                <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest">
                  Escola
                </th>
                <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest">
                  INEP
                </th>
                <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest">
                  Cidade
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
                    colSpan={3}
                    className="px-6 py-12 text-center text-gray-400 font-bold"
                  >
                    Nenhuma escola cadastrada.
                  </td>
                </tr>
              ) : (
                pagination.currentItems.map((escola) => (
                  <tr
                    key={escola.id}
                    className="hover:bg-blue-50/30 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs uppercase">
                          {escola.nome.substring(0, 2)}
                        </div>
                        <span className="text-gray-900 font-bold">
                          {escola.nome}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 font-medium">
                      {escola.inep || "-"}
                    </td>
                    <td className="px-6 py-4 text-gray-600 font-medium">
                      {cidades.find((c: any) => c.id === escola.cidade_id)
                        ?.nome || "N/A"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEdit(escola)}
                          className="p-2 text-blue-600 hover:bg-white rounded-lg shadow-sm border border-transparent hover:border-blue-100 transition-all"
                          title="Editar"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(escola)}
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
        title={selectedEscola ? "Editar Escola" : "Novo Cadastro de Escola"}
        description="Preencha os dados da instituição de ensino."
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-bold text-gray-700 ml-1">
                Nome da Escola
              </label>
              <div className="relative mt-1">
                <School
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
                  placeholder="Ex: EEEP Manoel Mano"
                />
              </div>
              {errors.nome && (
                <p className="text-[11px] font-bold text-red-500 mt-1 ml-1">
                  {errors.nome.message}
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-bold text-gray-700 ml-1">
                Código INEP
              </label>
              <div className="relative mt-1">
                <Hash
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={16}
                />
                <input
                  {...register("inep")}
                  className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                  placeholder="Opcional"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-bold text-gray-700 ml-1">
                Cidade
              </label>
              <select
                {...register("cidade_id")}
                className={cn(
                  "w-full px-3 py-2.5 mt-1 rounded-lg border text-sm focus:ring-2 outline-none transition-all appearance-none bg-white font-medium",
                  errors.cidade_id
                    ? "border-red-500 focus:ring-red-200"
                    : "border-gray-200 focus:ring-blue-100 focus:border-blue-500",
                )}
              >
                <option value="">Selecione a cidade...</option>
                {cidades.map((c: any) => (
                  <option key={c.id} value={c.id}>
                    {c.nome} - {c.uf}
                  </option>
                ))}
              </select>
              {errors.cidade_id && (
                <p className="text-[11px] font-bold text-red-500 mt-1 ml-1">
                  {errors.cidade_id.message}
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
                : selectedEscola
                  ? "Salvar Alterações"
                  : "Confirmar Cadastro"}
            </button>
          </div>
        </form>
      </FormModal>

      {/* Delete Confirmation */}
      <ConfirmDeleteModal
        isOpen={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onConfirm={confirmDelete}
        itemName={selectedEscola?.nome}
      />
    </div>
  );
}
