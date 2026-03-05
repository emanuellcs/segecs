import { useState } from "react";
import {
  UserCheck,
  Plus,
  Edit2,
  Trash2,
  Search,
  School,
  Phone,
} from "lucide-react";
import { useSupabaseCrud, translateError } from "@/hooks/useSupabaseCrud";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { cn } from "@/lib/utils";
import { FormModal } from "@/components/ui/FormModal";
import { ConfirmDeleteModal } from "@/components/ui/ConfirmDeleteModal";
import { InputMask } from "@/components/ui/InputMask";
import { ListLayoutToggle } from "@/components/ui/ListLayoutToggle";
import { useListLayout } from "@/hooks/useListLayout";
import { toast } from "sonner";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { usePagination } from "@/hooks/usePagination";
import { Pagination } from "@/components/ui/Pagination";

const orientadorSchema = z.object({
  nome: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
  cpf: z.string().min(14, "CPF inválido"),
  telefone: z.string().optional().default(""),
  escola_id: z.string().uuid("Selecione uma escola válida"),
});

type OrientadorFormValues = z.infer<typeof orientadorSchema>;

interface Orientador {
  id: string;
  nome: string;
  cpf?: string | null;
  telefone?: string | null;
  escola_id: string;
  created_at: string;
}

export default function OrientadoresPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedOrientador, setSelectedOrientador] =
    useState<Orientador | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const {
    items: orientadores,
    isLoading,
    create,
    update,
    remove,
  } = useSupabaseCrud<Orientador>("orientadores", ["orientadores"]);

  const { items: escolas } = useSupabaseCrud<any>("escolas", ["escolas"]);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<OrientadorFormValues>({
    resolver: zodResolver(orientadorSchema) as any,
    defaultValues: {
      nome: "",
      cpf: "",
      telefone: "",
      escola_id: "",
    },
  });

  const onSubmit = async (data: any) => {
    try {
      if (selectedOrientador) {
        await update({ id: selectedOrientador.id, ...data });
        toast.success("Orientador atualizado com sucesso!");
      } else {
        await create(data);
        toast.success("Orientador cadastrado com sucesso!");
      }
      handleCloseForm();
    } catch (error) {
      toast.error(translateError(error));
    }
  };

  const handleEdit = (orientador: Orientador) => {
    setSelectedOrientador(orientador);
    reset({
      nome: orientador.nome,
      cpf: orientador.cpf || "",
      telefone: orientador.telefone || "",
      escola_id: orientador.escola_id,
    });
    setIsFormOpen(true);
  };

  const handleDeleteClick = (orientador: Orientador) => {
    setSelectedOrientador(orientador);
    setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedOrientador) return;
    try {
      await remove(selectedOrientador.id);
      toast.success("Orientador removido com sucesso!");
      setIsDeleteOpen(false);
      setSelectedOrientador(null);
    } catch (error) {
      toast.error(translateError(error));
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedOrientador(null);
    reset();
  };

  const filteredOrientadores = orientadores.filter(
    (orientador) =>
      (orientador.nome?.toLowerCase() || "").includes(
        searchTerm.toLowerCase(),
      ) || (orientador.cpf || "").includes(searchTerm),
  );

  const pagination = usePagination(filteredOrientadores);

  const { listLayout } = useListLayout();

  if (isLoading) return <LoadingScreen />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-black text-blue-900 flex items-center gap-2">
            <UserCheck className="text-blue-600" size={28} /> Orientadores
          </h1>
          <p className="text-gray-500 font-medium">
            Gestão de professores orientadores
          </p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl flex items-center justify-center gap-2 font-bold transition-all shadow-lg shadow-blue-200 active:scale-95"
        >
          <Plus size={20} /> Novo Orientador
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
            placeholder="Buscar por nome ou CPF..."
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
            Nenhum orientador encontrado.
          </div>
        ) : (
          pagination.currentItems.map((orientador) => (
            <div
              key={orientador.id}
              className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-4"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                    <UserCheck size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 leading-tight">
                      {orientador.nome}
                    </h3>
                    <p className="text-xs text-gray-500 font-medium">
                      CPF: {orientador.cpf || "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <div className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 p-2 rounded-lg">
                  <School size={14} className="text-blue-500" />
                  <span className="truncate">
                    {escolas.find((e: any) => e.id === orientador.escola_id)
                      ?.nome || "N/A"}
                  </span>
                </div>
                {orientador.telefone && (
                  <div className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 p-2 rounded-lg">
                    <Phone size={14} className="text-blue-500" />
                    <span>{orientador.telefone}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-2 border-t border-gray-50">
                <button
                  onClick={() => handleEdit(orientador)}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-50 text-blue-700 font-bold text-sm hover:bg-blue-100 transition-colors"
                >
                  <Edit2 size={16} /> Editar
                </button>
                <button
                  onClick={() => handleDeleteClick(orientador)}
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
                  Orientador
                </th>
                <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest">
                  CPF
                </th>
                <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest">
                  Escola
                </th>
                <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest">
                  Telefone
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
                    colSpan={4}
                    className="px-6 py-12 text-center text-gray-400 font-bold"
                  >
                    Nenhum orientador cadastrado.
                  </td>
                </tr>
              ) : (
                pagination.currentItems.map((orientador) => (
                  <tr
                    key={orientador.id}
                    className="hover:bg-blue-50/30 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs uppercase">
                          {orientador.nome.substring(0, 2)}
                        </div>
                        <span className="text-gray-900 font-bold">
                          {orientador.nome}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 font-medium">
                      {orientador.cpf || "-"}
                    </td>
                    <td className="px-6 py-4 text-gray-600 font-medium">
                      {escolas.find((e: any) => e.id === orientador.escola_id)
                        ?.nome || "N/A"}
                    </td>
                    <td className="px-6 py-4 text-gray-600 font-medium">
                      {orientador.telefone || "-"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEdit(orientador)}
                          className="p-2 text-blue-600 hover:bg-white rounded-lg shadow-sm border border-transparent hover:border-blue-100 transition-all"
                          title="Editar"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(orientador)}
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
        title={
          selectedOrientador
            ? "Editar Orientador"
            : "Novo Cadastro de Orientador"
        }
        description="Preencha os dados do professor orientador de estágio."
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="text-sm font-bold text-gray-700 ml-1">
                Nome Completo
              </label>
              <div className="relative mt-1">
                <UserCheck
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
                  placeholder="Ex: Prof. Dr. Carlos Silva"
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
                  value={field.value || ""}
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
                  value={field.value || ""}
                  onChange={field.onChange}
                  error={errors.telefone?.message}
                  placeholder="(00) 00000-0000"
                />
              )}
            />

            <div className="md:col-span-2">
              <label className="text-sm font-bold text-gray-700 ml-1">
                Escola de Vínculo
              </label>
              <div className="relative mt-1">
                <School
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={16}
                />
                <select
                  {...register("escola_id")}
                  className={cn(
                    "w-full pl-10 pr-3 py-2.5 rounded-lg border text-sm focus:ring-2 outline-none transition-all appearance-none bg-white font-medium",
                    errors.escola_id
                      ? "border-red-500 focus:ring-red-200"
                      : "border-gray-200 focus:ring-blue-100 focus:border-blue-500",
                  )}
                >
                  <option value="">Selecione a escola...</option>
                  {escolas.map((e: any) => (
                    <option key={e.id} value={e.id}>
                      {e.nome}
                    </option>
                  ))}
                </select>
              </div>
              {errors.escola_id && (
                <p className="text-[11px] font-bold text-red-500 mt-1 ml-1">
                  {errors.escola_id.message}
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
                : selectedOrientador
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
        itemName={selectedOrientador?.nome}
      />
    </div>
  );
}
