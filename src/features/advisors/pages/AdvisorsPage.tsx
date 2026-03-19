import { useState } from "react";
import {
  UserCheck,
  Plus,
  Edit2,
  Trash2,
  Search,
  School,
  Phone,
  CheckSquare,
  Square,
} from "lucide-react";
import {
  useSupabaseCrud,
  getFriendlyErrorMessage,
} from "@/hooks/useSupabaseCrud";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { cn } from "@/lib/utils";
import { FormModal } from "@/components/ui/FormModal";
import { ConfirmDeleteModal } from "@/components/ui/ConfirmDeleteModal";
import { ConfirmBulkDeleteModal } from "@/components/ui/ConfirmBulkDeleteModal";
import { BulkEditModal } from "@/components/ui/BulkEditModal";
import { BulkActionsToolbar } from "@/components/ui/BulkActionsToolbar";
import { InputMask } from "@/components/ui/InputMask";
import { ListLayoutToggle } from "@/components/ui/ListLayoutToggle";
import { useListLayout } from "@/hooks/useListLayout";
import { useSelection } from "@/hooks/useSelection";
import { toast } from "sonner";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { usePagination } from "@/hooks/usePagination";
import { Pagination } from "@/components/ui/Pagination";
import { ListSortControl, SortOption } from "@/components/ui/ListSortControl";
import { ListFilterControl } from "@/components/ui/ListFilterControl";
import { useTranslation } from "react-i18next";

// Sort options for advisors
const advisorSortOptions = (t: any): SortOption[] => [
  { label: t("advisors.fields.name"), column: "name" },
  { label: t("advisors.fields.cpf"), column: "cpf" },
  { label: t("common.createdAt"), column: "created_at" },
];

interface AdvisorFilters {
  schoolId: string;
}

const initialFilters: AdvisorFilters = {
  schoolId: "",
};

// Zod schema for advisor form
const advisorSchema = (t: any) =>
  z.object({
    name: z.string().min(3, t("advisors.validations.nameMin")),
    cpf: z.string().min(14, t("advisors.validations.cpfInvalid")),
    phone: z.string().optional().default(""),
    school_id: z.string().uuid(t("advisors.validations.schoolRequired")),
  });

const bulkEditSchema = z.object({
  school_id: z.string().optional(),
});

type AdvisorFormValues = z.infer<ReturnType<typeof advisorSchema>>;
type BulkEditValues = z.infer<typeof bulkEditSchema>;

interface Advisor {
  id: string;
  name: string;
  cpf?: string | null;
  phone?: string | null;
  school_id: string;
  created_at: string;
}

export default function AdvisorsPage() {
  const { t } = useTranslation();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
  const [isBulkEditOpen, setIsBulkEditOpen] = useState(false);
  const [selectedAdvisor, setSelectedAdvisor] = useState<Advisor | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortColumn, setSortColumn] = useState("name");
  const [isSortAsc, setIsSortAsc] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState<AdvisorFilters>(initialFilters);

  // CRUD hook for advisors
  const {
    items: advisors,
    isLoading,
    create,
    update,
    remove,
    bulkRemove,
    bulkUpdate,
    isBulkDeleting,
  } = useSupabaseCrud<Advisor>("advisors", ["advisors"], {
    orderBy: { column: sortColumn, ascending: isSortAsc },
  });

  // Fetch schools for selects
  const { items: schools } = useSupabaseCrud<any>("schools", ["schools"]);

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  const handleFilterChange = (key: keyof AdvisorFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters(initialFilters);
  };

  // Filter advisors based on search and filters
  const filteredAdvisors = advisors.filter((advisor) => {
    const matchesSearch =
      (advisor.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (advisor.cpf || "").includes(searchTerm);

    const matchesSchool =
      !filters.schoolId || advisor.school_id === filters.schoolId;

    return matchesSearch && matchesSchool;
  });

  const selection = useSelection(filteredAdvisors);
  const pagination = usePagination(filteredAdvisors);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<AdvisorFormValues>({
    resolver: zodResolver(advisorSchema(t)) as any,
    defaultValues: {
      name: "",
      cpf: "",
      phone: "",
      school_id: "",
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
      if (selectedAdvisor) {
        await update({ id: selectedAdvisor.id, ...data });
        toast.success(t("advisors.messages.updateSuccess"));
      } else {
        await create(data);
        toast.success(t("advisors.messages.createSuccess"));
      }
      handleCloseForm();
    } catch (error) {
      toast.error(getFriendlyErrorMessage(error, t));
    }
  };

  const onBulkEditSubmit = async (data: BulkEditValues) => {
    const updateData = Object.fromEntries(
      Object.entries(data).filter(
        ([_, v]) => (v as unknown) !== "" && v !== undefined,
      ),
    );

    if (Object.keys(updateData).length === 0) {
      toast.error(t("courses.messages.selectFieldToUpdate"));
      return;
    }

    try {
      await bulkUpdate({
        ids: selection.selectedIds,
        updateData,
      });
      toast.success(t("advisors.messages.bulkUpdateSuccess"));
      setIsBulkEditOpen(false);
      selection.clearSelection();
      resetBulk();
    } catch (error) {
      toast.error(getFriendlyErrorMessage(error, t));
    }
  };

  const handleEdit = (advisor: Advisor) => {
    setSelectedAdvisor(advisor);
    reset({
      name: advisor.name,
      cpf: advisor.cpf || "",
      phone: advisor.phone || "",
      school_id: advisor.school_id,
    });
    setIsFormOpen(true);
  };

  const handleDeleteClick = (advisor: Advisor) => {
    setSelectedAdvisor(advisor);
    setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedAdvisor) return;
    try {
      await remove(selectedAdvisor.id);
      toast.success(t("advisors.messages.deleteSuccess"));
      setIsDeleteOpen(false);
      setSelectedAdvisor(null);
    } catch (error) {
      toast.error(getFriendlyErrorMessage(error, t));
    }
  };

  const confirmBulkDelete = async () => {
    try {
      await bulkRemove(selection.selectedIds);
      toast.success(t("advisors.messages.bulkDeleteSuccess"));
      setIsBulkDeleteOpen(false);
      selection.clearSelection();
    } catch (error) {
      toast.error(getFriendlyErrorMessage(error, t));
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedAdvisor(null);
    reset();
  };

  const { listLayout } = useListLayout();

  if (isLoading) return <LoadingScreen />;

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-black text-blue-900 flex items-center gap-2">
            <UserCheck className="text-blue-600" size={28} />{" "}
            {t("advisors.title")}
          </h1>
          <p className="text-gray-500 font-medium">{t("advisors.subtitle")}</p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl flex items-center justify-center gap-2 font-bold transition-all shadow-lg shadow-blue-200 active:scale-95"
        >
          <Plus size={20} /> {t("advisors.new")}
        </button>
      </div>

      {/* Search and Layout Toggle */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative group flex-1">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors"
            size={20}
          />
          <input
            type="text"
            placeholder={t("advisors.searchPlaceholder")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <ListSortControl
            options={advisorSortOptions(t)}
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
            {t("advisors.fields.school")}
          </label>
          <select
            value={filters.schoolId}
            onChange={(e) => handleFilterChange("schoolId", e.target.value)}
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">{t("common.allSchools")}</option>
            {schools.map((e: any) => (
              <option key={e.id} value={e.id}>
                {e.name}
              </option>
            ))}
          </select>
        </div>
      </ListFilterControl>

      {/* Responsive Listing (Cards) */}
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
            {t("common.noItemsFound")}
          </div>
        ) : (
          pagination.currentItems.map((advisor) => (
            <div
              key={advisor.id}
              className={cn(
                "bg-white p-5 rounded-2xl shadow-sm border transition-all relative group space-y-4",
                selection.isSelected(advisor.id)
                  ? "border-blue-500 ring-2 ring-blue-50"
                  : "border-gray-100",
              )}
            >
              <button
                onClick={() => selection.toggleSelect(advisor.id)}
                className={cn(
                  "absolute top-4 right-4 p-2 rounded-lg transition-all z-10",
                  selection.isSelected(advisor.id)
                    ? "text-blue-600 bg-blue-50"
                    : "text-gray-300 hover:text-gray-400 opacity-0 group-hover:opacity-100",
                )}
              >
                {selection.isSelected(advisor.id) ? (
                  <CheckSquare size={20} />
                ) : (
                  <Square size={20} />
                )}
              </button>

              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                    <UserCheck size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 leading-tight">
                      {advisor.name}
                    </h3>
                    <p className="text-xs text-gray-500 font-medium">
                      CPF: {advisor.cpf || "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <div className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 p-2 rounded-lg">
                  <School size={14} className="text-blue-500" />
                  <span className="truncate">
                    {schools.find((e: any) => e.id === advisor.school_id)
                      ?.name || "N/A"}
                  </span>
                </div>
                {advisor.phone && (
                  <div className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 p-2 rounded-lg">
                    <Phone size={14} className="text-blue-500" />
                    <span>{advisor.phone}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-2 border-t border-gray-50">
                <button
                  onClick={() => handleEdit(advisor)}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-50 text-blue-700 font-bold text-sm hover:bg-blue-100 transition-colors"
                >
                  <Edit2 size={16} /> {t("common.edit")}
                </button>
                <button
                  onClick={() => handleDeleteClick(advisor)}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-50 text-red-700 font-bold text-sm hover:bg-red-100 transition-colors"
                >
                  <Trash2 size={16} /> {t("common.delete")}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop Table */}
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
                  {t("advisors.fields.name")}
                </th>
                <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest">
                  {t("advisors.fields.cpf")}
                </th>
                <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest">
                  {t("advisors.fields.school")}
                </th>
                <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest">
                  {t("advisors.fields.phone")}
                </th>
                <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest text-right">
                  {t("common.actions")}
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
                    {t("common.noItemsFound")}
                  </td>
                </tr>
              ) : (
                pagination.currentItems.map((advisor) => (
                  <tr
                    key={advisor.id}
                    className={cn(
                      "hover:bg-blue-50/30 transition-colors group",
                      selection.isSelected(advisor.id) && "bg-blue-50/50",
                    )}
                  >
                    <td className="px-6 py-4">
                      <button
                        onClick={() => selection.toggleSelect(advisor.id)}
                        className={cn(
                          "p-1 rounded transition-colors",
                          selection.isSelected(advisor.id)
                            ? "text-blue-600"
                            : "text-gray-300 hover:text-gray-400 opacity-0 group-hover:opacity-100",
                        )}
                      >
                        {selection.isSelected(advisor.id) ? (
                          <CheckSquare size={20} />
                        ) : (
                          <Square size={20} />
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs uppercase">
                          {advisor.name.substring(0, 2)}
                        </div>
                        <span className="text-gray-900 font-bold">
                          {advisor.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 font-medium">
                      {advisor.cpf || "-"}
                    </td>
                    <td className="px-6 py-4 text-gray-600 font-medium">
                      {schools.find((e: any) => e.id === advisor.school_id)
                        ?.name || "N/A"}
                    </td>
                    <td className="px-6 py-4 text-gray-600 font-medium">
                      {advisor.phone || "-"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEdit(advisor)}
                          className="p-2 text-blue-600 hover:bg-white rounded-lg shadow-sm border border-transparent hover:border-blue-100 transition-all"
                          title={t("common.edit")}
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(advisor)}
                          className="p-2 text-red-600 hover:bg-white rounded-lg shadow-sm border border-transparent hover:border-red-100 transition-all"
                          title={t("common.delete")}
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
        title={
          selectedAdvisor ? t("advisors.editTitle") : t("advisors.newTitle")
        }
        description={t("advisors.formDescription")}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="text-sm font-bold text-gray-700 ml-1">
                {t("advisors.fields.name")}
              </label>
              <div className="relative mt-1">
                <UserCheck
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={16}
                />
                <input
                  {...register("name")}
                  className={cn(
                    "w-full pl-10 pr-3 py-2.5 rounded-lg border text-sm focus:ring-2 outline-none transition-all",
                    errors.name
                      ? "border-red-500 focus:ring-red-200"
                      : "border-gray-200 focus:ring-blue-100 focus:border-blue-500",
                  )}
                  placeholder={t("advisors.placeholders.advisorNameExample")}
                />
              </div>
              {errors.name && (
                <p className="text-[11px] font-bold text-red-500 mt-1 ml-1">
                  {errors.name.message}
                </p>
              )}
            </div>

            <Controller
              name="cpf"
              control={control}
              render={({ field }) => (
                <InputMask
                  mask="cpf"
                  label={t("advisors.fields.cpf")}
                  value={field.value || ""}
                  onChange={field.onChange}
                  error={errors.cpf?.message}
                  placeholder="000.000.000-00"
                />
              )}
            />

            <Controller
              name="phone"
              control={control}
              render={({ field }) => (
                <InputMask
                  mask="phone"
                  label={t("advisors.fields.phone")}
                  value={field.value || ""}
                  onChange={field.onChange}
                  error={errors.phone?.message}
                  placeholder="(00) 00000-0000"
                />
              )}
            />

            <div className="md:col-span-2">
              <label className="text-sm font-bold text-gray-700 ml-1">
                {t("advisors.fields.school")}
              </label>
              <div className="relative mt-1">
                <School
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={16}
                />
                <select
                  {...register("school_id")}
                  className={cn(
                    "w-full pl-10 pr-3 py-2.5 rounded-lg border text-sm focus:ring-2 outline-none transition-all appearance-none bg-white font-medium",
                    errors.school_id
                      ? "border-red-500 focus:ring-red-200"
                      : "border-gray-200 focus:ring-blue-100 focus:border-blue-500",
                  )}
                >
                  <option value="">
                    {t("schools.placeholders.selectSchool")}
                  </option>
                  {schools.map((e: any) => (
                    <option key={e.id} value={e.id}>
                      {e.name}
                    </option>
                  ))}
                </select>
              </div>
              {errors.school_id && (
                <p className="text-[11px] font-bold text-red-500 mt-1 ml-1">
                  {errors.school_id.message}
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
              {t("common.cancel")}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-[2] px-4 py-3 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-100 transition-all active:scale-95 disabled:opacity-50"
            >
              {isSubmitting
                ? t("common.saving")
                : selectedAdvisor
                  ? t("common.saveChanges")
                  : t("common.confirmRegistration")}
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
                {t("advisors.bulkEdit.newSchool")}
              </label>
              <select
                {...registerBulk("school_id")}
                className="w-full px-3 py-2.5 mt-1 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all appearance-none bg-white font-medium"
              >
                <option value="">{t("common.keepCurrent")}</option>
                {schools.map((e: any) => (
                  <option key={e.id} value={e.id}>
                    {e.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setIsBulkEditOpen(false)}
              className="flex-1 px-4 py-3 text-sm font-bold text-gray-500 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
            >
              {t("common.cancel")}
            </button>
            <button
              type="submit"
              disabled={isSubmittingBulk}
              className="flex-[2] px-4 py-3 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-100 transition-all active:scale-95 disabled:opacity-50"
            >
              {isSubmittingBulk
                ? t("common.updating")
                : t("common.applyChanges")}
            </button>
          </div>
        </form>
      </BulkEditModal>

      {/* Delete Confirmation */}
      <ConfirmDeleteModal
        isOpen={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onConfirm={confirmDelete}
        itemName={selectedAdvisor?.name}
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
