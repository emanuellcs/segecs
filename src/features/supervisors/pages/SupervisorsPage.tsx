import { useState } from "react";
import {
  UserCog,
  Plus,
  Edit2,
  Trash2,
  Search,
  Building2,
  Briefcase,
  GraduationCap,
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
import { toast } from "sonner";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { usePagination } from "@/hooks/usePagination";
import { Pagination } from "@/components/ui/Pagination";
import { useSelection } from "@/hooks/useSelection";
import { ListSortControl, SortOption } from "@/components/ui/ListSortControl";
import { ListFilterControl } from "@/components/ui/ListFilterControl";
import { useTranslation } from "react-i18next";

// Sort options for supervisors
const supervisorSortOptions = (t: any): SortOption[] => [
  { label: t("supervisors.fields.name"), column: "name" },
  { label: t("supervisors.fields.position"), column: "position" },
  { label: t("common.createdAt"), column: "created_at" },
];

interface SupervisorFilters {
  companyId: string;
}

const initialFilters: SupervisorFilters = {
  companyId: "",
};

// Zod schema for supervisor form
const supervisorSchema = (t: any) =>
  z.object({
    name: z.string().min(3, t("supervisors.validations.nameMin")),
    cpf: z
      .string()
      .min(14, t("guardians.validations.cpfInvalid"))
      .optional()
      .or(z.literal("")),
    phone: z
      .string()
      .min(14, t("guardians.validations.phoneInvalid"))
      .optional()
      .or(z.literal("")),
    company_id: z.string().uuid(t("supervisors.validations.companyRequired")),
    position: z.string().min(1, t("supervisors.validations.positionRequired")),
    education: z.string().optional(),
  });

const bulkEditSchema = z.object({
  company_id: z.string().optional(),
});

type SupervisorFormValues = z.infer<ReturnType<typeof supervisorSchema>>;
type BulkEditValues = z.infer<typeof bulkEditSchema>;

interface Supervisor {
  id: string;
  name: string;
  cpf?: string | null;
  phone?: string | null;
  company_id: string;
  position: string;
  education?: string | null;
  created_at: string;
}

export default function SupervisorsPage() {
  const { t } = useTranslation();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
  const [isBulkEditOpen, setIsBulkEditOpen] = useState(false);
  const [selectedSupervisor, setSelectedSupervisor] =
    useState<Supervisor | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortColumn, setSortColumn] = useState("name");
  const [isSortAsc, setIsSortAsc] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState<SupervisorFilters>(initialFilters);

  // CRUD hook for supervisors
  const {
    items: supervisors,
    isLoading,
    create,
    update,
    remove,
    bulkRemove,
    bulkUpdate,
    isBulkDeleting,
  } = useSupabaseCrud<Supervisor>("supervisors", ["supervisors"], {
    orderBy: { column: sortColumn, ascending: isSortAsc },
  });

  // Fetch companies for selects
  const { items: companies } = useSupabaseCrud<any>("companies", ["companies"]);

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  const handleFilterChange = (key: keyof SupervisorFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters(initialFilters);
  };

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<SupervisorFormValues>({
    resolver: zodResolver(supervisorSchema(t)),
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
      if (selectedSupervisor) {
        await update({ id: selectedSupervisor.id, ...data });
        toast.success(t("supervisors.messages.updateSuccess"));
      } else {
        await create(data);
        toast.success(t("supervisors.messages.createSuccess"));
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
      toast.success(t("supervisors.messages.bulkUpdateSuccess"));
      setIsBulkEditOpen(false);
      selection.clearSelection();
      resetBulk();
    } catch (error) {
      toast.error(getFriendlyErrorMessage(error, t));
    }
  };

  const handleEdit = (supervisor: Supervisor) => {
    setSelectedSupervisor(supervisor);
    reset({
      name: supervisor.name,
      cpf: supervisor.cpf || "",
      phone: supervisor.phone || "",
      company_id: supervisor.company_id,
      position: supervisor.position || "",
      education: supervisor.education || "",
    });
    setIsFormOpen(true);
  };

  const handleDeleteClick = (supervisor: Supervisor) => {
    setSelectedSupervisor(supervisor);
    setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedSupervisor) return;
    try {
      await remove(selectedSupervisor.id);
      toast.success(t("supervisors.messages.deleteSuccess"));
      setIsDeleteOpen(false);
      setSelectedSupervisor(null);
    } catch (error) {
      toast.error(getFriendlyErrorMessage(error, t));
    }
  };

  const confirmBulkDelete = async () => {
    try {
      await bulkRemove(selection.selectedIds);
      toast.success(t("supervisors.messages.bulkDeleteSuccess"));
      setIsBulkDeleteOpen(false);
      selection.clearSelection();
    } catch (error) {
      toast.error(getFriendlyErrorMessage(error, t));
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedSupervisor(null);
    reset();
  };

  const filteredSupervisors = supervisors.filter((supervisor) => {
    const matchesSearch =
      (supervisor.name?.toLowerCase() || "").includes(
        searchTerm.toLowerCase(),
      ) ||
      (supervisor.position?.toLowerCase() || "").includes(
        searchTerm.toLowerCase(),
      );

    const matchesCompany =
      !filters.companyId || supervisor.company_id === filters.companyId;

    return matchesSearch && matchesCompany;
  });

  const selection = useSelection(filteredSupervisors);
  const pagination = usePagination(filteredSupervisors);

  const { listLayout } = useListLayout();

  if (isLoading) return <LoadingScreen />;

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-black text-blue-900 flex items-center gap-2">
            <UserCog className="text-blue-600" size={28} />{" "}
            {t("supervisors.title")}
          </h1>
          <p className="text-gray-500 font-medium">
            {t("supervisors.subtitle")}
          </p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl flex items-center justify-center gap-2 font-bold transition-all shadow-lg shadow-blue-200 active:scale-95"
        >
          <Plus size={20} /> {t("supervisors.new")}
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
            placeholder={t("supervisors.searchPlaceholder")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <ListSortControl
            options={supervisorSortOptions(t)}
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
            {t("supervisors.fields.company")}
          </label>
          <select
            value={filters.companyId}
            onChange={(e) => handleFilterChange("companyId", e.target.value)}
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">
              {t("companies.placeholders.selectCompany")}
            </option>
            {companies.map((e: any) => (
              <option key={e.id} value={e.id}>
                {e.business_name}
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
          pagination.currentItems.map((supervisor) => (
            <div
              key={supervisor.id}
              className={cn(
                "bg-white p-5 rounded-2xl shadow-sm border transition-all relative group space-y-4",
                selection.isSelected(supervisor.id)
                  ? "border-blue-500 ring-2 ring-blue-50"
                  : "border-gray-100",
              )}
            >
              <button
                onClick={() => selection.toggleSelect(supervisor.id)}
                className={cn(
                  "absolute top-4 right-4 p-2 rounded-lg transition-all z-10",
                  selection.isSelected(supervisor.id)
                    ? "text-blue-600 bg-blue-50"
                    : "text-gray-300 hover:text-gray-400 opacity-0 group-hover:opacity-100",
                )}
              >
                {selection.isSelected(supervisor.id) ? (
                  <CheckSquare size={20} />
                ) : (
                  <Square size={20} />
                )}
              </button>

              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                    <UserCog size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 leading-tight">
                      {supervisor.name}
                    </h3>
                    <p className="text-xs text-gray-500 font-medium">
                      {supervisor.position}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2 pt-2">
                <div className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 p-2 rounded-lg">
                  <Building2 size={14} className="text-blue-500" />
                  <span className="truncate">
                    {companies.find((e: any) => e.id === supervisor.company_id)
                      ?.business_name || "N/A"}
                  </span>
                </div>
                {supervisor.phone && (
                  <div className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 p-2 rounded-lg">
                    <Phone size={14} className="text-blue-500" />
                    <span>{supervisor.phone}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-2 border-t border-gray-50">
                <button
                  onClick={() => handleEdit(supervisor)}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-50 text-blue-700 font-bold text-sm hover:bg-blue-100 transition-colors"
                >
                  <Edit2 size={16} /> {t("common.edit")}
                </button>
                <button
                  onClick={() => handleDeleteClick(supervisor)}
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
                  {t("supervisors.fields.name")}
                </th>
                <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest">
                  {t("supervisors.fields.position")}
                </th>
                <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest">
                  {t("supervisors.fields.company")}
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
                    colSpan={5}
                    className="px-6 py-12 text-center text-gray-400 font-bold"
                  >
                    {t("common.noItemsFound")}
                  </td>
                </tr>
              ) : (
                pagination.currentItems.map((supervisor) => (
                  <tr
                    key={supervisor.id}
                    className={cn(
                      "hover:bg-blue-50/30 transition-colors group",
                      selection.isSelected(supervisor.id) && "bg-blue-50/50",
                    )}
                  >
                    <td className="px-6 py-4">
                      <button
                        onClick={() => selection.toggleSelect(supervisor.id)}
                        className={cn(
                          "p-1 rounded transition-colors",
                          selection.isSelected(supervisor.id)
                            ? "text-blue-600"
                            : "text-gray-300 hover:text-gray-400 opacity-0 group-hover:opacity-100",
                        )}
                      >
                        {selection.isSelected(supervisor.id) ? (
                          <CheckSquare size={20} />
                        ) : (
                          <Square size={20} />
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs uppercase">
                          {supervisor.name.substring(0, 2)}
                        </div>
                        <span className="text-gray-900 font-bold">
                          {supervisor.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 font-medium">
                      {supervisor.position}
                    </td>
                    <td className="px-6 py-4 text-gray-600 font-medium">
                      {companies.find(
                        (e: any) => e.id === supervisor.company_id,
                      )?.business_name || "N/A"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEdit(supervisor)}
                          className="p-2 text-blue-600 hover:bg-white rounded-lg shadow-sm border border-transparent hover:border-blue-100 transition-all"
                          title={t("common.edit")}
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(supervisor)}
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
          selectedSupervisor
            ? t("supervisors.editTitle")
            : t("supervisors.newTitle")
        }
        description={t("supervisors.formDescription")}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="text-sm font-bold text-gray-700 ml-1">
                {t("supervisors.fields.name")}
              </label>
              <div className="relative mt-1">
                <UserCog
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
                  placeholder={t(
                    "supervisors.placeholders.supervisorNameExample",
                  )}
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
                  label={t("supervisors.fields.cpf")}
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
                  label={t("supervisors.fields.phone")}
                  value={field.value || ""}
                  onChange={field.onChange}
                  error={errors.phone?.message}
                  placeholder="(00) 00000-0000"
                />
              )}
            />

            <div className="md:col-span-2">
              <label className="text-sm font-bold text-gray-700 ml-1">
                {t("supervisors.fields.company")}
              </label>
              <div className="relative mt-1">
                <Building2
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={16}
                />
                <select
                  {...register("company_id")}
                  className={cn(
                    "w-full pl-10 pr-3 py-2.5 rounded-lg border text-sm focus:ring-2 outline-none transition-all appearance-none bg-white font-medium",
                    errors.company_id
                      ? "border-red-500 focus:ring-red-200"
                      : "border-gray-200 focus:ring-blue-100 focus:border-blue-500",
                  )}
                >
                  <option value="">
                    {t("supervisors.placeholders.selectCompany")}
                  </option>
                  {companies.map((e: any) => (
                    <option key={e.id} value={e.id}>
                      {e.business_name}
                    </option>
                  ))}
                </select>
              </div>
              {errors.company_id && (
                <p className="text-[11px] font-bold text-red-500 mt-1 ml-1">
                  {errors.company_id.message}
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-bold text-gray-700 ml-1">
                {t("supervisors.fields.position")}
              </label>
              <div className="relative mt-1">
                <Briefcase
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={16}
                />
                <input
                  {...register("position")}
                  className={cn(
                    "w-full pl-10 pr-3 py-2.5 rounded-lg border text-sm focus:ring-2 outline-none transition-all",
                    errors.position
                      ? "border-red-500 focus:ring-red-200"
                      : "border-gray-200 focus:ring-blue-100 focus:border-blue-500",
                  )}
                  placeholder={t("supervisors.placeholders.positionExample")}
                />
              </div>
              {errors.position && (
                <p className="text-[11px] font-bold text-red-500 mt-1 ml-1">
                  {errors.position.message}
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-bold text-gray-700 ml-1">
                {t("supervisors.fields.education")}
              </label>
              <div className="relative mt-1">
                <GraduationCap
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={16}
                />
                <input
                  {...register("education")}
                  className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                  placeholder={t("supervisors.placeholders.educationExample")}
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
              {t("common.cancel")}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-[2] px-4 py-3 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-100 transition-all active:scale-95 disabled:opacity-50"
            >
              {isSubmitting
                ? t("common.saving")
                : selectedSupervisor
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
                {t("supervisors.bulkEdit.newCompany")}
              </label>
              <select
                {...registerBulk("company_id")}
                className="w-full px-3 py-2.5 mt-1 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all appearance-none bg-white font-medium"
              >
                <option value="">{t("common.keepCurrent")}</option>
                {companies.map((e: any) => (
                  <option key={e.id} value={e.id}>
                    {e.business_name}
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
        itemName={selectedSupervisor?.name}
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
