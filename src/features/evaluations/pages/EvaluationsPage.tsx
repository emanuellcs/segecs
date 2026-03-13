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
  Filter,
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
import { toast } from "sonner";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { ListFilterControl } from "@/components/ui/ListFilterControl";
import { useTranslation } from "react-i18next";
import { Evaluation, Internship, Student } from "@/types/database";

// Sort options for evaluations
const evaluationSortOptions = (t: any): SortOption[] => [
  { label: t("evaluations.fields.evaluationDate"), column: "evaluation_date" },
  { label: t("evaluations.fields.grade"), column: "grade" },
  { label: t("evaluations.fields.type"), column: "type" },
  { label: t("common.createdAt"), column: "created_at" },
];

interface EvaluationFilters {
  internshipId: string;
  type: string;
}

const initialFilters: EvaluationFilters = {
  internshipId: "",
  type: "",
};

// Zod schema for evaluation form
const evaluationSchema = (t: any) =>
  z.object({
    internship_id: z
      .string()
      .uuid(t("evaluations.validations.internshipRequired")),
    type: z.number().min(1).max(3),
    grade: z
      .number()
      .min(0, t("evaluations.validations.gradeMin"))
      .max(10, t("evaluations.validations.gradeMax")),
    comments: z.string().optional().or(z.literal("")),
    evaluation_date: z
      .string()
      .min(1, t("evaluations.validations.dateRequired")),
  });

const bulkEditSchema = z.object({
  type: z.number().min(1).max(3).optional(),
  grade: z.number().min(0).max(10).optional(),
  evaluation_date: z.string().optional(),
});

type EvaluationFormValues = z.infer<ReturnType<typeof evaluationSchema>>;
type BulkEditValues = z.infer<typeof bulkEditSchema>;

export default function EvaluationsPage() {
  const { t, i18n } = useTranslation();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
  const [isBulkEditOpen, setIsBulkEditOpen] = useState(false);
  const [selectedEval, setSelectedEval] = useState<Evaluation | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortColumn, setSortColumn] = useState("evaluation_date");
  const [isSortAsc, setIsSortAsc] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState<EvaluationFilters>(initialFilters);

  // CRUD hook for evaluations
  const {
    items: evaluations,
    isLoading,
    create,
    update,
    remove,
    bulkRemove,
    bulkUpdate,
    isBulkDeleting,
  } = useSupabaseCrud<Evaluation>("evaluations", ["evaluations"], {
    orderBy: { column: sortColumn, ascending: isSortAsc },
  });

  const { items: internships } = useSupabaseCrud<Internship>("internships", [
    "internships",
  ]);
  const { items: students } = useSupabaseCrud<Student>("students", [
    "students",
  ]);

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  const handleFilterChange = (key: keyof EvaluationFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters(initialFilters);
  };

  const filteredEvaluations = evaluations.filter((evalItem) => {
    const internship = internships.find((e) => e.id === evalItem.internship_id);
    const studentName =
      students.find((a) => a.id === internship?.student_id)?.name || "";

    const matchesSearch = (studentName?.toLowerCase() || "").includes(
      searchTerm.toLowerCase(),
    );

    const matchesInternship =
      !filters.internshipId || evalItem.internship_id === filters.internshipId;

    const matchesType =
      !filters.type || evalItem.type.toString() === filters.type;

    return matchesSearch && matchesInternship && matchesType;
  });

  const selection = useSelection(filteredEvaluations);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EvaluationFormValues>({
    resolver: zodResolver(evaluationSchema(t)),
  });

  const {
    register: registerBulk,
    handleSubmit: handleSubmitBulk,
    reset: resetBulk,
    formState: { isSubmitting: isSubmittingBulk },
  } = useForm<BulkEditValues>({
    resolver: zodResolver(bulkEditSchema),
  });

  const onSubmit = async (data: EvaluationFormValues) => {
    try {
      if (selectedEval) {
        await update({ id: selectedEval.id, ...data });
        toast.success(t("evaluations.messages.updateSuccess"));
      } else {
        await create(data);
        toast.success(t("evaluations.messages.createSuccess"));
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
      toast.success(t("evaluations.messages.bulkUpdateSuccess"));
      setIsBulkEditOpen(false);
      selection.clearSelection();
      resetBulk();
    } catch (error) {
      toast.error(getFriendlyErrorMessage(error, t));
    }
  };

  const handleEdit = (evalItem: Evaluation) => {
    setSelectedEval(evalItem);
    reset({
      internship_id: evalItem.internship_id,
      type: evalItem.type,
      grade: evalItem.grade,
      comments: evalItem.comments || "",
      evaluation_date: evalItem.evaluation_date,
    });
    setIsFormOpen(true);
  };

  const handleDeleteClick = (evalItem: Evaluation) => {
    setSelectedEval(evalItem);
    setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedEval) return;
    try {
      await remove(selectedEval.id);
      toast.success(t("evaluations.messages.deleteSuccess"));
      setIsDeleteOpen(false);
      setSelectedEval(null);
    } catch (error) {
      toast.error(getFriendlyErrorMessage(error, t));
    }
  };

  const confirmBulkDelete = async () => {
    try {
      await bulkRemove(selection.selectedIds);
      toast.success(t("evaluations.messages.bulkDeleteSuccess"));
      setIsBulkDeleteOpen(false);
      selection.clearSelection();
    } catch (error) {
      toast.error(getFriendlyErrorMessage(error, t));
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedEval(null);
    reset();
  };

  const pagination = usePagination(filteredEvaluations);

  const mediaGeral =
    filteredEvaluations.length > 0
      ? (
          filteredEvaluations.reduce((acc, a) => acc + a.grade, 0) /
          filteredEvaluations.length
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
            <Award className="text-blue-600" size={28} />{" "}
            {t("evaluations.title")}
          </h1>
          <p className="text-gray-500 font-medium">
            {t("evaluations.subtitle")}
          </p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl flex items-center justify-center gap-2 font-bold transition-all shadow-lg shadow-blue-200 active:scale-95"
        >
          <Plus size={20} /> {t("evaluations.new")}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
          <div>
            <p className="text-gray-400 text-xs font-black uppercase tracking-widest mb-1">
              {t("evaluations.stats.activeFilter")}
            </p>
            <h2 className="text-xl font-black text-blue-900">
              {activeFilterCount > 0
                ? `${activeFilterCount} ${t("common.filters", "filters")}`
                : t("common.all")}
            </h2>
          </div>
          <div className="bg-blue-50 p-3 rounded-xl text-blue-500">
            <Filter size={32} />
          </div>
        </div>

        <div className="bg-orange-500 p-6 rounded-2xl shadow-lg shadow-orange-100 flex justify-between items-center text-white">
          <div>
            <p className="text-orange-100 text-xs font-black uppercase tracking-widest mb-1">
              {t("evaluations.stats.gradeAverage")}
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
              {t("evaluations.stats.totalEntries")}
            </p>
            <h2 className="text-4xl font-black text-gray-800">
              {filteredEvaluations.length}
            </h2>
          </div>
          <div className="bg-blue-50 p-3 rounded-xl text-blue-500">
            <Award size={32} />
          </div>
        </div>
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
            placeholder={t("evaluations.searchPlaceholder")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <ListSortControl
            options={evaluationSortOptions(t)}
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
            {t("evaluations.fields.internship")}
          </label>
          <select
            value={filters.internshipId}
            onChange={(e) => handleFilterChange("internshipId", e.target.value)}
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">{t("common.allInternships")}</option>
            {internships.map((est: Internship) => (
              <option key={est.id} value={est.id}>
                {students.find((a: Student) => a.id === est.student_id)?.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
            {t("evaluations.fields.type")}
          </label>
          <select
            value={filters.type}
            onChange={(e) => handleFilterChange("type", e.target.value)}
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">{t("common.allTypes")}</option>
            <option value="1">{t("evaluations.types.first")}</option>
            <option value="2">{t("evaluations.types.second")}</option>
            <option value="3">{t("evaluations.types.third")}</option>
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
          pagination.currentItems.map((evaluation) => {
            const internship = internships.find(
              (e) => e.id === evaluation.internship_id,
            );
            const student = students.find(
              (a) => a.id === internship?.student_id,
            );

            return (
              <div
                key={evaluation.id}
                className={cn(
                  "bg-white p-5 rounded-2xl shadow-sm border transition-all relative group space-y-4",
                  selection.isSelected(evaluation.id)
                    ? "border-blue-500 ring-2 ring-blue-50"
                    : "border-gray-100",
                )}
              >
                <button
                  onClick={() => selection.toggleSelect(evaluation.id)}
                  className={cn(
                    "absolute top-4 right-4 p-2 rounded-lg transition-all z-10",
                    selection.isSelected(evaluation.id)
                      ? "text-blue-600 bg-blue-50"
                      : "text-gray-300 hover:text-gray-400 opacity-0 group-hover:opacity-100",
                  )}
                >
                  {selection.isSelected(evaluation.id) ? (
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
                        {new Date(
                          evaluation.evaluation_date,
                        ).toLocaleDateString(
                          i18n.language === "pt" ? "pt-BR" : "en-US",
                        )}
                      </p>
                    </div>
                  </div>
                  <span className="px-2 py-1 bg-gray-100 rounded text-[10px] font-black uppercase tracking-wider text-gray-600">
                    {t("evaluations.types.label", { count: evaluation.type })}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2 text-blue-900 font-black text-2xl">
                    <TrendingUp size={20} className="text-orange-500" />
                    <span>{evaluation.grade.toFixed(1)}</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(evaluation)}
                      className="p-2.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(evaluation)}
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
                  {t("common.student")}
                </th>
                <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest">
                  {t("evaluations.fields.type")}
                </th>
                <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest">
                  {t("common.date")}
                </th>
                <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest text-center">
                  {t("evaluations.fields.grade")}
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
                pagination.currentItems.map((evaluation) => {
                  const internship = internships.find(
                    (e) => e.id === evaluation.internship_id,
                  );
                  const student = students.find(
                    (a) => a.id === internship?.student_id,
                  );

                  return (
                    <tr
                      key={evaluation.id}
                      className={cn(
                        "hover:bg-blue-50/30 transition-colors group",
                        selection.isSelected(evaluation.id) && "bg-blue-50/50",
                      )}
                    >
                      <td className="px-6 py-4">
                        <button
                          onClick={() => selection.toggleSelect(evaluation.id)}
                          className={cn(
                            "p-1 rounded transition-colors",
                            selection.isSelected(evaluation.id)
                              ? "text-blue-600"
                              : "text-gray-300 hover:text-gray-400 opacity-0 group-hover:opacity-100",
                          )}
                        >
                          {selection.isSelected(evaluation.id) ? (
                            <CheckSquare size={20} />
                          ) : (
                            <Square size={20} />
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs uppercase">
                            {student?.name.substring(0, 2)}
                          </div>
                          <span className="text-gray-900 font-bold">
                            {student?.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-gray-100 rounded text-[10px] font-black uppercase tracking-wider text-gray-600">
                          {t("evaluations.types.label", {
                            count: evaluation.type,
                          })}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600 font-medium text-sm">
                        {new Date(
                          evaluation.evaluation_date,
                        ).toLocaleDateString(
                          i18n.language === "pt" ? "pt-BR" : "en-US",
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-blue-900 font-black text-xl">
                          {evaluation.grade.toFixed(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleEdit(evaluation)}
                            className="p-2 text-blue-600 hover:bg-white rounded-lg shadow-sm border border-transparent hover:border-blue-100 transition-all"
                            title={t("common.edit")}
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(evaluation)}
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
        title={
          selectedEval ? t("evaluations.editTitle") : t("evaluations.newTitle")
        }
        description={t("evaluations.formDescription")}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="text-sm font-bold text-gray-700 ml-1">
                {t("evaluations.fields.internship")}
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
                    {t("evaluations.placeholders.selectInternship")}
                  </option>
                  {internships.map((est: Internship) => (
                    <option key={est.id} value={est.id}>
                      {
                        students.find((a: Student) => a.id === est.student_id)
                          ?.name
                      }
                    </option>
                  ))}
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
                {t("evaluations.fields.type")}
              </label>
              <select
                {...register("type", { valueAsNumber: true })}
                className="w-full px-3 py-2.5 mt-1 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all appearance-none bg-white font-bold"
              >
                <option value={1}>{t("evaluations.types.first")}</option>
                <option value={2}>{t("evaluations.types.second")}</option>
                <option value={3}>{t("evaluations.types.third")}</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-bold text-gray-700 ml-1">
                {t("evaluations.fields.grade")}
              </label>
              <div className="relative mt-1">
                <TrendingUp
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={16}
                />
                <input
                  type="number"
                  step="0.1"
                  {...register("grade", { valueAsNumber: true })}
                  className={cn(
                    "w-full pl-10 pr-3 py-2.5 rounded-lg border text-sm focus:ring-2 outline-none transition-all",
                    errors.grade
                      ? "border-red-500 focus:ring-red-200"
                      : "border-gray-200 focus:ring-blue-100 focus:border-blue-500",
                  )}
                />
              </div>
              {errors.grade && (
                <p className="text-[11px] font-bold text-red-500 mt-1 ml-1">
                  {errors.grade.message}
                </p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-bold text-gray-700 ml-1">
                {t("evaluations.fields.evaluationDate")}
              </label>
              <div className="relative mt-1">
                <Calendar
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={16}
                />
                <input
                  type="date"
                  {...register("evaluation_date")}
                  className={cn(
                    "w-full pl-10 pr-3 py-2.5 rounded-lg border text-sm focus:ring-2 outline-none transition-all",
                    errors.evaluation_date
                      ? "border-red-500 focus:ring-red-200"
                      : "border-gray-200 focus:ring-blue-100 focus:border-blue-500",
                  )}
                />
              </div>
              {errors.evaluation_date && (
                <p className="text-[11px] font-bold text-red-500 mt-1 ml-1">
                  {errors.evaluation_date.message}
                </p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-bold text-gray-700 ml-1">
                {t("evaluations.fields.comments")}
              </label>
              <div className="relative mt-1">
                <MessageSquare
                  className="absolute left-3 top-3 text-gray-400"
                  size={16}
                />
                <textarea
                  {...register("comments")}
                  rows={3}
                  className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                  placeholder={t("evaluations.placeholders.commentsExample")}
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
                : selectedEval
                  ? t("common.saveChanges")
                  : t("common.confirm")}
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
                {t("evaluations.bulkEdit.newType")}
              </label>
              <select
                {...registerBulk("type", { valueAsNumber: true })}
                className="w-full px-3 py-2.5 mt-1 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all appearance-none bg-white font-bold"
              >
                <option value="">{t("common.keepCurrent")}</option>
                <option value={1}>{t("evaluations.types.first")}</option>
                <option value={2}>{t("evaluations.types.second")}</option>
                <option value={3}>{t("evaluations.types.third")}</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-bold text-gray-700 ml-1">
                {t("evaluations.bulkEdit.newGrade")}
              </label>
              <input
                type="number"
                step="0.1"
                {...registerBulk("grade", { valueAsNumber: true })}
                className="w-full px-3 py-2.5 mt-1 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                placeholder={t("evaluations.placeholders.gradeRange")}
              />
            </div>

            <div>
              <label className="text-sm font-bold text-gray-700 ml-1">
                {t("evaluations.bulkEdit.newDate")}
              </label>
              <input
                type="date"
                {...registerBulk("evaluation_date")}
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
