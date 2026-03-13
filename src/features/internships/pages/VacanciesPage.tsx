import { useState } from "react";
import {
  Briefcase,
  Plus,
  Edit2,
  Trash2,
  Search,
  Building2,
  BookOpen,
  Layers,
  CheckSquare,
  Square,
} from "lucide-react";
import {
  useSupabaseCrud,
  getFriendlyErrorMessage,
} from "@/hooks/useSupabaseCrud";
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
import { useTranslation } from "react-i18next";
import { Vacancy, Company, Course } from "@/types/database";

// Sort options for vacancies
const vacancySortOptions = (t: any): SortOption[] => [
  { label: t("vacancies.fields.title"), column: "title" },
  { label: t("common.status"), column: "status" },
  { label: t("vacancies.fields.quantity"), column: "quantity" },
  { label: t("common.createdAt"), column: "created_at" },
];

interface VacancyFilters {
  status: string;
  companyId: string;
  courseId: string;
}

const initialFilters: VacancyFilters = {
  status: "",
  companyId: "",
  courseId: "",
};

// Zod schema for vacancy form
const vacancySchema = (t: any) =>
  z.object({
    company_id: z.string().uuid(t("companies.validations.required")),
    course_id: z.string().uuid(t("courses.validations.required")),
    title: z.string().min(3, t("vacancies.validations.titleMin")),
    description: z.string().optional().or(z.literal("")),
    quantity: z.number().min(1, t("vacancies.validations.quantityMin")),
    status: z.enum(["open", "filled", "cancelled"], {
      errorMap: () => ({ message: t("common.validations.statusRequired") }),
    }),
  });

const bulkEditSchema = z.object({
  course_id: z.string().optional(),
  status: z.enum(["open", "filled", "cancelled"]).optional(),
});

type VacancyFormValues = z.infer<ReturnType<typeof vacancySchema>>;
type BulkEditValues = z.infer<typeof bulkEditSchema>;

export default function VacanciesPage() {
  const { t } = useTranslation();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
  const [isBulkEditOpen, setIsBulkEditOpen] = useState(false);
  const [selectedVacancy, setSelectedVacancy] = useState<Vacancy | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortColumn, setSortColumn] = useState("title");
  const [isSortAsc, setIsSortAsc] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState<VacancyFilters>(initialFilters);

  // CRUD hook for vacancies
  const {
    items: vacancies,
    isLoading,
    create,
    update,
    remove,
    bulkRemove,
    bulkUpdate,
    isBulkDeleting,
  } = useSupabaseCrud<Vacancy>("vacancies", ["vacancies"], {
    orderBy: { column: sortColumn, ascending: isSortAsc },
  });

  // Fetch companies and courses for selects
  const { items: companies } = useSupabaseCrud<Company>("companies", [
    "companies",
  ]);
  const { items: courses } = useSupabaseCrud<Course>("courses", ["courses"]);

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  const handleFilterChange = (key: keyof VacancyFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters(initialFilters);
  };

  // Filter vacancies based on search and filters
  const filteredVacancies = vacancies.filter((vacancy) => {
    const companyName =
      companies.find((e) => e.id === vacancy.company_id)?.business_name || "";
    const courseName =
      courses.find((c) => c.id === vacancy.course_id)?.name || "";

    const matchesSearch =
      (vacancy.title?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (companyName?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (courseName?.toLowerCase() || "").includes(searchTerm.toLowerCase());

    const matchesStatus = !filters.status || vacancy.status === filters.status;
    const matchesCompany =
      !filters.companyId || vacancy.company_id === filters.companyId;
    const matchesCourse =
      !filters.courseId || vacancy.course_id === filters.courseId;

    return matchesSearch && matchesStatus && matchesCompany && matchesCourse;
  });

  const selection = useSelection(filteredVacancies);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<VacancyFormValues>({
    resolver: zodResolver(vacancySchema(t)),
    defaultValues: {
      quantity: 1,
      status: "open",
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

  const onSubmit = async (data: VacancyFormValues) => {
    try {
      if (selectedVacancy) {
        await update({ id: selectedVacancy.id, ...data });
        toast.success(t("vacancies.messages.updateSuccess"));
      } else {
        await create(data);
        toast.success(t("vacancies.messages.createSuccess"));
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
      toast.success(t("vacancies.messages.bulkUpdateSuccess"));
      setIsBulkEditOpen(false);
      selection.clearSelection();
      resetBulk();
    } catch (error) {
      toast.error(getFriendlyErrorMessage(error, t));
    }
  };

  const handleEdit = (vacancy: Vacancy) => {
    setSelectedVacancy(vacancy);
    reset({
      company_id: vacancy.company_id,
      course_id: vacancy.course_id,
      title: vacancy.title,
      description: vacancy.description || "",
      quantity: vacancy.quantity,
      status: vacancy.status,
    });
    setIsFormOpen(true);
  };

  const handleDeleteClick = (vacancy: Vacancy) => {
    setSelectedVacancy(vacancy);
    setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedVacancy) return;
    try {
      await remove(selectedVacancy.id);
      toast.success(t("vacancies.messages.deleteSuccess"));
      setIsDeleteOpen(false);
      setSelectedVacancy(null);
    } catch (error) {
      toast.error(getFriendlyErrorMessage(error, t));
    }
  };

  const confirmBulkDelete = async () => {
    try {
      await bulkRemove(selection.selectedIds);
      toast.success(t("vacancies.messages.bulkDeleteSuccess"));
      setIsBulkDeleteOpen(false);
      selection.clearSelection();
    } catch (error) {
      toast.error(getFriendlyErrorMessage(error, t));
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedVacancy(null);
    reset();
  };

  const pagination = usePagination(filteredVacancies);

  const { listLayout } = useListLayout();

  if (isLoading) return <LoadingScreen />;

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-black text-blue-900 flex items-center gap-2">
            <Briefcase className="text-blue-600" size={28} />{" "}
            {t("vacancies.title")}
          </h1>
          <p className="text-gray-500 font-medium">{t("vacancies.subtitle")}</p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl flex items-center justify-center gap-2 font-bold transition-all shadow-lg shadow-blue-200 active:scale-95"
        >
          <Plus size={20} /> {t("vacancies.new")}
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
            placeholder={t("vacancies.searchPlaceholder")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <ListSortControl
            options={vacancySortOptions(t)}
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
            {t("common.status")}
          </label>
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange("status", e.target.value)}
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">{t("common.allStatus")}</option>
            <option value="open">{t("vacancies.status.open")}</option>
            <option value="filled">{t("vacancies.status.filled")}</option>
            <option value="cancelled">{t("vacancies.status.cancelled")}</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
            {t("vacancies.fields.company")}
          </label>
          <select
            value={filters.companyId}
            onChange={(e) => handleFilterChange("companyId", e.target.value)}
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">
              {t("common.allCompanies", "All Companies")}
            </option>
            {companies.map((e: Company) => (
              <option key={e.id} value={e.id}>
                {e.business_name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
            {t("vacancies.fields.course")}
          </label>
          <select
            value={filters.courseId}
            onChange={(e) => handleFilterChange("courseId", e.target.value)}
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">{t("common.allCourses")}</option>
            {courses.map((c: Course) => (
              <option key={c.id} value={c.id}>
                {c.name}
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
        {filteredVacancies.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl text-center text-gray-400 font-bold border-2 border-dashed border-gray-100 col-span-full">
            {t("common.noItemsFound")}
          </div>
        ) : (
          pagination.currentItems.map((vacancy) => (
            <div
              key={vacancy.id}
              className={cn(
                "bg-white p-5 rounded-2xl shadow-sm border transition-all relative group space-y-4",
                selection.isSelected(vacancy.id)
                  ? "border-blue-500 ring-2 ring-blue-50"
                  : "border-gray-100",
              )}
            >
              <button
                onClick={() => selection.toggleSelect(vacancy.id)}
                className={cn(
                  "absolute top-4 right-4 p-2 rounded-lg transition-all z-10",
                  selection.isSelected(vacancy.id)
                    ? "text-blue-600 bg-blue-50"
                    : "text-gray-300 hover:text-gray-400 opacity-0 group-hover:opacity-100",
                )}
              >
                {selection.isSelected(vacancy.id) ? (
                  <CheckSquare size={20} />
                ) : (
                  <Square size={20} />
                )}
              </button>

              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                    <Briefcase size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 leading-tight">
                      {vacancy.title}
                    </h3>
                    <p className="text-xs text-gray-500 font-medium">
                      {
                        companies.find((e) => e.id === vacancy.company_id)
                          ?.business_name
                      }
                    </p>
                  </div>
                </div>
                <span
                  className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                    vacancy.status === "open"
                      ? "bg-green-100 text-green-700"
                      : vacancy.status === "filled"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-700",
                  )}
                >
                  {t(`vacancies.status.${vacancy.status}`)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 p-2 rounded-lg">
                  <BookOpen size={14} className="text-blue-500" />
                  <span className="truncate">
                    {courses.find((c) => c.id === vacancy.course_id)?.name ||
                      "N/A"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 p-2 rounded-lg">
                  <Layers size={14} className="text-blue-500" />
                  <span>
                    {t("vacancies.labels.vacanciesCount", {
                      count: vacancy.quantity,
                    })}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t border-gray-50">
                <button
                  onClick={() => handleEdit(vacancy)}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-50 text-blue-700 font-bold text-sm hover:bg-blue-100 transition-colors"
                >
                  <Edit2 size={16} /> {t("common.edit")}
                </button>
                <button
                  onClick={() => handleDeleteClick(vacancy)}
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
                  {t("vacancies.fields.title")} /{" "}
                  {t("vacancies.fields.company")}
                </th>
                <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest">
                  {t("vacancies.fields.course")}
                </th>
                <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest text-center">
                  {t("vacancies.fields.quantity")}
                </th>
                <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest">
                  {t("common.status")}
                </th>
                <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest text-right">
                  {t("common.actions")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredVacancies.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-gray-400 font-bold"
                  >
                    {t("common.noItemsFound")}
                  </td>
                </tr>
              ) : (
                pagination.currentItems.map((vacancy) => (
                  <tr
                    key={vacancy.id}
                    className={cn(
                      "hover:bg-blue-50/30 transition-colors group",
                      selection.isSelected(vacancy.id) && "bg-blue-50/50",
                    )}
                  >
                    <td className="px-6 py-4">
                      <button
                        onClick={() => selection.toggleSelect(vacancy.id)}
                        className={cn(
                          "p-1 rounded transition-colors",
                          selection.isSelected(vacancy.id)
                            ? "text-blue-600"
                            : "text-gray-300 hover:text-gray-400 opacity-0 group-hover:opacity-100",
                        )}
                      >
                        {selection.isSelected(vacancy.id) ? (
                          <CheckSquare size={20} />
                        ) : (
                          <Square size={20} />
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-gray-900 font-bold">
                          {vacancy.title}
                        </span>
                        <span className="text-xs text-gray-500 font-medium">
                          {
                            companies.find((e) => e.id === vacancy.company_id)
                              ?.business_name
                          }
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 font-medium">
                      {courses.find((c) => c.id === vacancy.course_id)?.name ||
                        "N/A"}
                    </td>
                    <td className="px-6 py-4 text-gray-600 font-bold text-center">
                      {vacancy.quantity}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={cn(
                          "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                          vacancy.status === "open"
                            ? "bg-green-100 text-green-700"
                            : vacancy.status === "filled"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-gray-100 text-gray-700",
                        )}
                      >
                        {t(`vacancies.status.${vacancy.status}`)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEdit(vacancy)}
                          className="p-2 text-blue-600 hover:bg-white rounded-lg shadow-sm border border-transparent hover:border-blue-100 transition-all"
                          title={t("common.edit")}
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(vacancy)}
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
          selectedVacancy ? t("vacancies.editTitle") : t("vacancies.newTitle")
        }
        description={t("vacancies.formDescription")}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="text-sm font-bold text-gray-700 ml-1">
                {t("vacancies.fields.title")}
              </label>
              <div className="relative mt-1">
                <Briefcase
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={16}
                />
                <input
                  {...register("title")}
                  className={cn(
                    "w-full pl-10 pr-3 py-2.5 rounded-lg border text-sm focus:ring-2 outline-none transition-all",
                    errors.title
                      ? "border-red-500 focus:ring-red-200"
                      : "border-gray-200 focus:ring-blue-100 focus:border-blue-500",
                  )}
                  placeholder={t("vacancies.placeholders.vacancyTitleExample")}
                />
              </div>
              {errors.title && (
                <p className="text-[11px] font-bold text-red-500 mt-1 ml-1">
                  {errors.title.message}
                </p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-bold text-gray-700 ml-1">
                {t("vacancies.fields.company")}
              </label>
              <div className="relative mt-1">
                <Building2
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={16}
                />
                <select
                  {...register("company_id")}
                  className={cn(
                    "w-full pl-10 pr-3 py-2.5 rounded-lg border text-sm focus:ring-2 outline-none transition-all appearance-none bg-white",
                    errors.company_id
                      ? "border-red-500 focus:ring-red-200"
                      : "border-gray-200 focus:ring-blue-100 focus:border-blue-500",
                  )}
                >
                  <option value="">{t("companies.placeholders.select")}</option>
                  {companies.map((e: Company) => (
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

            <div className="md:col-span-2">
              <label className="text-sm font-bold text-gray-700 ml-1">
                {t("vacancies.fields.course")}
              </label>
              <div className="relative mt-1">
                <BookOpen
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={16}
                />
                <select
                  {...register("course_id")}
                  className={cn(
                    "w-full pl-10 pr-3 py-2.5 rounded-lg border text-sm focus:ring-2 outline-none transition-all appearance-none bg-white",
                    errors.course_id
                      ? "border-red-500 focus:ring-red-200"
                      : "border-gray-200 focus:ring-blue-100 focus:border-blue-500",
                  )}
                >
                  <option value="">{t("courses.placeholders.select")}</option>
                  {courses.map((c: Course) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              {errors.course_id && (
                <p className="text-[11px] font-bold text-red-500 mt-1 ml-1">
                  {errors.course_id.message}
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-bold text-gray-700 ml-1">
                {t("vacancies.fields.quantity")}
              </label>
              <input
                type="number"
                {...register("quantity", { valueAsNumber: true })}
                className={cn(
                  "w-full px-3 py-2.5 mt-1 rounded-lg border text-sm focus:ring-2 outline-none transition-all",
                  errors.quantity
                    ? "border-red-500 focus:ring-red-200"
                    : "border-gray-200 focus:ring-blue-100 focus:border-blue-500",
                )}
              />
              {errors.quantity && (
                <p className="text-[11px] font-bold text-red-500 mt-1 ml-1">
                  {errors.quantity.message}
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-bold text-gray-700 ml-1">
                {t("common.status")}
              </label>
              <select
                {...register("status")}
                className="w-full px-3 py-2.5 mt-1 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all appearance-none bg-white font-bold"
              >
                <option value="open">🟢 {t("vacancies.status.open")}</option>
                <option value="filled">
                  🔵 {t("vacancies.status.filled")}
                </option>
                <option value="cancelled">
                  🔴 {t("vacancies.status.cancelled")}
                </option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-bold text-gray-700 ml-1">
                {t("vacancies.fields.description")}
              </label>
              <textarea
                {...register("description")}
                rows={3}
                className="w-full px-3 py-2.5 mt-1 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                placeholder={t("vacancies.placeholders.descriptionExample")}
              />
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
                : selectedVacancy
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
                {t("vacancies.bulkEdit.newCourse")}
              </label>
              <select
                {...registerBulk("course_id")}
                className="w-full px-3 py-2.5 mt-1 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all appearance-none bg-white"
              >
                <option value="">{t("common.keepCurrent")}</option>
                {courses.map((c: Course) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-bold text-gray-700 ml-1">
                {t("vacancies.bulkEdit.newStatus")}
              </label>
              <select
                {...registerBulk("status")}
                className="w-full px-3 py-2.5 mt-1 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all appearance-none bg-white font-bold"
              >
                <option value="">{t("common.keepCurrent")}</option>
                <option value="open">🟢 {t("vacancies.status.open")}</option>
                <option value="filled">
                  🔵 {t("vacancies.status.filled")}
                </option>
                <option value="cancelled">
                  🔴 {t("vacancies.status.cancelled")}
                </option>
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
        itemName={selectedVacancy?.title}
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
