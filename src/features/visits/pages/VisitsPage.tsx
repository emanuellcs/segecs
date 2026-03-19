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
import { Visit, Internship, Student, Company, Vacancy } from "@/types/database";

// Sort options for visits
const visitSortOptions = (t: any): SortOption[] => [
  { label: t("visits.fields.visitDate"), column: "visit_date" },
  { label: t("visits.fields.type"), column: "type" },
  { label: t("common.createdAt"), column: "created_at" },
];

interface VisitFilters {
  type: string;
  companyId: string;
}

const initialFilters: VisitFilters = {
  type: "",
  companyId: "",
};

// Zod schema for visit form
const visitSchema = (t: any) =>
  z.object({
    internship_id: z.string().uuid(t("visits.validations.internshipRequired")),
    visit_date: z.string().min(1, t("visits.validations.dateRequired")),
    type: z.enum(["in_person", "remote"], {
      errorMap: () => ({ message: t("visits.validations.typeRequired") }),
    }),
    summary: z.string().min(10, t("visits.validations.summaryMin")),
    observations: z.string().optional().or(z.literal("")),
  });

const bulkEditSchema = z.object({
  type: z.enum(["in_person", "remote"]).optional(),
});

type VisitFormValues = z.infer<ReturnType<typeof visitSchema>>;
type BulkEditValues = z.infer<typeof bulkEditSchema>;

export default function VisitsPage() {
  const { t, i18n } = useTranslation();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
  const [isBulkEditOpen, setIsBulkEditOpen] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortColumn, setSortColumn] = useState("visit_date");
  const [isSortAsc, setIsSortAsc] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState<VisitFilters>(initialFilters);

  // CRUD hook for visits
  const {
    items: visits,
    isLoading,
    create,
    update,
    remove,
    bulkRemove,
    bulkUpdate,
    isBulkDeleting,
  } = useSupabaseCrud<Visit>("visits", ["visits"], {
    orderBy: { column: sortColumn, ascending: isSortAsc },
  });

  // Fetch related data
  const { items: internships } = useSupabaseCrud<Internship>("internships", [
    "internships",
  ]);
  const { items: students } = useSupabaseCrud<Student>("students", [
    "students",
  ]);
  const { items: companies } = useSupabaseCrud<Company>("companies", [
    "companies",
  ]);
  const { items: vacancies } = useSupabaseCrud<Vacancy>("vacancies", [
    "vacancies",
  ]);

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  const handleFilterChange = (key: keyof VisitFilters, value: string) => {
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
  } = useForm<VisitFormValues>({
    resolver: zodResolver(visitSchema(t)),
    defaultValues: {
      type: "in_person",
      visit_date: new Date().toISOString().split("T")[0],
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

  const onSubmit = async (data: VisitFormValues) => {
    try {
      if (selectedVisit) {
        await update({ id: selectedVisit.id, ...data });
        toast.success(t("visits.messages.updateSuccess"));
      } else {
        await create(data);
        toast.success(t("visits.messages.createSuccess"));
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
      toast.success(t("visits.messages.bulkUpdateSuccess"));
      setIsBulkEditOpen(false);
      selection.clearSelection();
      resetBulk();
    } catch (error) {
      toast.error(getFriendlyErrorMessage(error, t));
    }
  };

  const handleEdit = (visit: Visit) => {
    setSelectedVisit(visit);
    reset({
      internship_id: visit.internship_id,
      visit_date: visit.visit_date,
      type: visit.type as "in_person" | "remote",
      summary: visit.summary,
      observations: visit.observations || "",
    });
    setIsFormOpen(true);
  };

  const handleDeleteClick = (visit: Visit) => {
    setSelectedVisit(visit);
    setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedVisit) return;
    try {
      await remove(selectedVisit.id);
      toast.success(t("visits.messages.deleteSuccess"));
      setIsDeleteOpen(false);
      setSelectedVisit(null);
    } catch (error) {
      toast.error(getFriendlyErrorMessage(error, t));
    }
  };

  const confirmBulkDelete = async () => {
    try {
      await bulkRemove(selection.selectedIds);
      toast.success(t("visits.messages.bulkDeleteSuccess"));
      setIsBulkDeleteOpen(false);
      selection.clearSelection();
    } catch (error) {
      toast.error(getFriendlyErrorMessage(error, t));
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedVisit(null);
    reset();
  };

  const filteredVisits = visits.filter((visit) => {
    const internship = internships.find((e) => e.id === visit.internship_id);
    const vacancy = vacancies.find((v) => v.id === internship?.vacancy_id);
    const studentName =
      students.find((a) => a.id === internship?.student_id)?.name || "";

    const matchesSearch =
      studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      visit.summary.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = !filters.type || visit.type === filters.type;
    const matchesCompany =
      !filters.companyId || vacancy?.company_id === filters.companyId;

    return matchesSearch && matchesType && matchesCompany;
  });

  const selection = useSelection(filteredVisits);
  const pagination = usePagination(filteredVisits);
  const { listLayout } = useListLayout();

  if (isLoading) return <LoadingScreen />;

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-black text-blue-900 flex items-center gap-2">
            <MapPin className="text-blue-600" size={28} /> {t("visits.title")}
          </h1>
          <p className="text-gray-500 font-medium">{t("visits.subtitle")}</p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl flex items-center justify-center gap-2 font-bold transition-all shadow-lg shadow-blue-200 active:scale-95"
        >
          <Plus size={20} /> {t("visits.new")}
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
            placeholder={t("visits.searchPlaceholder")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <ListSortControl
            options={visitSortOptions(t)}
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
            {t("visits.fields.type")}
          </label>
          <select
            value={filters.type}
            onChange={(e) => handleFilterChange("type", e.target.value)}
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">{t("common.allTypes")}</option>
            <option value="in_person">{t("visits.types.in_person")}</option>
            <option value="remote">{t("visits.types.remote")}</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
            {t("companies.title")}
          </label>
          <select
            value={filters.companyId}
            onChange={(e) => handleFilterChange("companyId", e.target.value)}
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">{t("common.allCompanies")}</option>
            {companies.map((e: Company) => (
              <option key={e.id} value={e.id}>
                {e.business_name}
              </option>
            ))}
          </select>
        </div>
      </ListFilterControl>

      {/* Listing (Cards) */}
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
          pagination.currentItems.map((visit) => {
            const internship = internships.find(
              (e) => e.id === visit.internship_id,
            );
            const student = students.find(
              (a) => a.id === internship?.student_id,
            );
            const vacancy = vacancies.find(
              (v) => v.id === internship?.vacancy_id,
            );
            const company = companies.find((e) => e.id === vacancy?.company_id);

            return (
              <div
                key={visit.id}
                className={cn(
                  "bg-white p-5 rounded-2xl shadow-sm border transition-all relative group space-y-4",
                  selection.isSelected(visit.id)
                    ? "border-blue-500 ring-2 ring-blue-50"
                    : "border-gray-100",
                )}
              >
                <button
                  onClick={() => selection.toggleSelect(visit.id)}
                  className={cn(
                    "absolute top-4 right-4 p-2 rounded-lg transition-all z-10",
                    selection.isSelected(visit.id)
                      ? "text-blue-600 bg-blue-50"
                      : "text-gray-300 hover:text-gray-400 opacity-0 group-hover:opacity-100",
                  )}
                >
                  {selection.isSelected(visit.id) ? (
                    <CheckSquare size={20} />
                  ) : (
                    <Square size={20} />
                  )}
                </button>

                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-xs uppercase">
                      {student?.name.substring(0, 2)}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 leading-tight">
                        {student?.name}
                      </h3>
                      <p className="text-xs text-gray-500 font-medium">
                        {company?.business_name}
                      </p>
                    </div>
                  </div>
                  <span
                    className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                      visit.type === "in_person"
                        ? "bg-purple-100 text-purple-700"
                        : "bg-blue-100 text-blue-700",
                    )}
                  >
                    {t(`visits.types.${visit.type}`)}
                  </span>
                </div>

                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <p className="text-sm text-gray-700 line-clamp-3 font-medium">
                    {visit.summary}
                  </p>
                </div>

                <div className="flex items-center gap-4 pt-2 text-xs text-gray-500 font-bold uppercase tracking-wider">
                  <div className="flex items-center gap-1.5">
                    <Calendar size={14} className="text-blue-500" />
                    {new Date(visit.visit_date).toLocaleDateString(
                      i18n.language === "pt" ? "pt-BR" : "en-US",
                    )}
                  </div>
                </div>

                <div className="flex gap-2 pt-2 border-t border-gray-50">
                  <button
                    onClick={() => handleEdit(visit)}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-50 text-blue-700 font-bold text-sm hover:bg-blue-100 transition-colors"
                  >
                    <Edit2 size={16} /> {t("common.edit")}
                  </button>
                  <button
                    onClick={() => handleDeleteClick(visit)}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-50 text-red-700 font-bold text-sm hover:bg-red-100 transition-colors"
                  >
                    <Trash2 size={16} /> {t("common.delete")}
                  </button>
                </div>
              </div>
            );
          })
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
                  {t("students.title")} / {t("companies.title")}
                </th>
                <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest">
                  {t("visits.fields.type")}
                </th>
                <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest">
                  {t("common.date")}
                </th>
                <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest">
                  {t("visits.fields.summary")}
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
                pagination.currentItems.map((visit) => {
                  const internship = internships.find(
                    (e) => e.id === visit.internship_id,
                  );
                  const student = students.find(
                    (a) => a.id === internship?.student_id,
                  );
                  const vacancy = vacancies.find(
                    (v) => v.id === internship?.vacancy_id,
                  );
                  const company = companies.find(
                    (e) => e.id === vacancy?.company_id,
                  );

                  return (
                    <tr
                      key={visit.id}
                      className={cn(
                        "hover:bg-blue-50/30 transition-colors group",
                        selection.isSelected(visit.id) && "bg-blue-50/50",
                      )}
                    >
                      <td className="px-6 py-4">
                        <button
                          onClick={() => selection.toggleSelect(visit.id)}
                          className={cn(
                            "p-1 rounded transition-colors",
                            selection.isSelected(visit.id)
                              ? "text-blue-600"
                              : "text-gray-300 hover:text-gray-400 opacity-0 group-hover:opacity-100",
                          )}
                        >
                          {selection.isSelected(visit.id) ? (
                            <CheckSquare size={20} />
                          ) : (
                            <Square size={20} />
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-gray-900 font-bold">
                            {student?.name}
                          </span>
                          <span className="text-xs text-gray-500">
                            {company?.business_name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={cn(
                            "px-2 py-1 rounded text-[10px] font-black uppercase tracking-wider",
                            visit.type === "in_person"
                              ? "bg-purple-100 text-purple-700"
                              : "bg-blue-100 text-blue-700",
                          )}
                        >
                          {t(`visits.types.${visit.type}`)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600 font-medium text-sm">
                        {new Date(visit.visit_date).toLocaleDateString(
                          i18n.language === "pt" ? "pt-BR" : "en-US",
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <p
                          className="text-gray-600 text-sm max-w-xs truncate"
                          title={visit.summary}
                        >
                          {visit.summary}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleEdit(visit)}
                            className="p-2 text-blue-600 hover:bg-white rounded-lg shadow-sm border border-transparent hover:border-blue-100 transition-all"
                            title={t("common.edit")}
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(visit)}
                            className="p-2 text-red-600 hover:bg-white rounded-lg shadow-sm border border-transparent hover:border-red-100 transition-all"
                            title={t("common.delete")}
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
        title={selectedVisit ? t("visits.editTitle") : t("visits.newTitle")}
        description={t("visits.formDescription")}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="text-sm font-bold text-gray-700 ml-1">
                {t("internships.fields.internship")}
              </label>
              <div className="relative mt-1">
                <User
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={16}
                />
                <select
                  {...register("internship_id")}
                  className={cn(
                    "w-full pl-10 pr-3 py-2.5 rounded-lg border text-sm focus:ring-2 outline-none transition-all appearance-none bg-white",
                    errors.internship_id
                      ? "border-red-500 focus:ring-red-200"
                      : "border-gray-200 focus:ring-blue-100 focus:border-blue-500",
                  )}
                >
                  <option value="">
                    {t("internships.placeholders.select")}
                  </option>
                  {internships.map((est: Internship) => {
                    const student = students.find(
                      (a: Student) => a.id === est.student_id,
                    );
                    return (
                      <option key={est.id} value={est.id}>
                        {student?.name}
                      </option>
                    );
                  })}
                </select>
              </div>
              {errors.internship_id && (
                <p className="text-[11px] font-bold text-red-500 mt-1 ml-1">
                  {errors.internship_id.message}
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-bold text-gray-700 ml-1">
                {t("visits.fields.visitDate")}
              </label>
              <div className="relative mt-1">
                <Calendar
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={16}
                />
                <input
                  type="date"
                  {...register("visit_date")}
                  className={cn(
                    "w-full pl-10 pr-3 py-2.5 rounded-lg border text-sm focus:ring-2 outline-none transition-all",
                    errors.visit_date
                      ? "border-red-500 focus:ring-red-200"
                      : "border-gray-200 focus:ring-blue-100 focus:border-blue-500",
                  )}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-bold text-gray-700 ml-1">
                {t("visits.fields.type")}
              </label>
              <select
                {...register("type")}
                className="w-full px-3 py-2.5 mt-1 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all appearance-none bg-white font-bold"
              >
                <option value="in_person">
                  🟣 {t("visits.types.in_person")}
                </option>
                <option value="remote">🔵 {t("visits.types.remote")}</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-bold text-gray-700 ml-1">
                {t("visits.fields.summary")}
              </label>
              <div className="relative mt-1">
                <CheckCircle2
                  className="absolute left-3 top-3 text-gray-400"
                  size={16}
                />
                <textarea
                  {...register("summary")}
                  rows={3}
                  className={cn(
                    "w-full pl-10 pr-3 py-2.5 rounded-lg border text-sm focus:ring-2 outline-none transition-all",
                    errors.summary
                      ? "border-red-500 focus:ring-red-200"
                      : "border-gray-200 focus:ring-blue-100 focus:border-blue-500",
                  )}
                  placeholder={t("visits.placeholders.summaryExample")}
                />
              </div>
              {errors.summary && (
                <p className="text-[11px] font-bold text-red-500 mt-1 ml-1">
                  {errors.summary.message}
                </p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-bold text-gray-700 ml-1">
                {t("visits.fields.observations")}
              </label>
              <div className="relative mt-1">
                <MessageSquare
                  className="absolute left-3 top-3 text-gray-400"
                  size={16}
                />
                <textarea
                  {...register("observations")}
                  rows={2}
                  className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                  placeholder={t("visits.placeholders.observationsExample")}
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
                : selectedVisit
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
                {t("visits.bulkEdit.newType")}
              </label>
              <select
                {...registerBulk("type")}
                className="w-full px-3 py-2.5 mt-1 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all appearance-none bg-white font-bold"
              >
                <option value="">{t("common.keepCurrent")}</option>
                <option value="in_person">
                  🟣 {t("visits.types.in_person")}
                </option>
                <option value="remote">🔵 {t("visits.types.remote")}</option>
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
        itemName={t("common.thisRecord")}
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
