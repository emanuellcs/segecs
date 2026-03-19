import { useState } from "react";
import {
  BookOpen,
  Plus,
  Edit2,
  Trash2,
  Search,
  School as SchoolIcon,
  GraduationCap,
  Clock,
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
import { Course, School, Level } from "@/types/database";

// Sort options for courses
const courseSortOptions = (t: any): SortOption[] => [
  { label: t("courses.fields.name"), column: "name" },
  { label: t("common.createdAt"), column: "created_at" },
];

interface CourseFilters {
  schoolId: string;
  levelId: string;
}

const initialFilters: CourseFilters = {
  schoolId: "",
  levelId: "",
};

// Zod schema for course form
const courseSchema = (t: any) =>
  z.object({
    name: z.string().min(3, t("courses.validations.nameMin")),
    school_id: z.string().uuid(t("courses.validations.schoolRequired")),
    level_id: z.string().uuid(t("courses.validations.levelRequired")),
    mandatory_workload: z.number().min(1, t("courses.validations.workloadMin")),
  });

const bulkEditSchema = z.object({
  school_id: z.string().uuid().optional(),
  level_id: z.string().uuid().optional(),
  mandatory_workload: z.number().min(1).optional(),
});

type CourseFormValues = z.infer<ReturnType<typeof courseSchema>>;
type BulkEditValues = z.infer<typeof bulkEditSchema>;

export default function CoursesPage() {
  const { t } = useTranslation();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
  const [isBulkEditOpen, setIsBulkEditOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortColumn, setSortColumn] = useState("name");
  const [isSortAsc, setIsSortAsc] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState<CourseFilters>(initialFilters);

  // CRUD hook for courses
  const {
    items: courses,
    isLoading,
    create,
    update,
    remove,
    bulkRemove,
    bulkUpdate,
    isBulkDeleting,
  } = useSupabaseCrud<Course>("courses", ["courses"], {
    orderBy: { column: sortColumn, ascending: isSortAsc },
  });

  // Fetch schools and levels for selects
  const { items: schools } = useSupabaseCrud<School>("schools", ["schools"]);
  const { items: levels } = useSupabaseCrud<Level>("levels", ["levels"]);

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  const handleFilterChange = (key: keyof CourseFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters(initialFilters);
  };

  // Filter courses based on search and filters
  const filteredCourses = courses.filter((course) => {
    const matchesSearch = (course.name?.toLowerCase() || "").includes(
      searchTerm.toLowerCase(),
    );

    const matchesSchool =
      !filters.schoolId || course.school_id === filters.schoolId;
    const matchesLevel =
      !filters.levelId || course.level_id === filters.levelId;

    return matchesSearch && matchesSchool && matchesLevel;
  });

  const selection = useSelection(filteredCourses);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CourseFormValues>({
    resolver: zodResolver(courseSchema(t)),
    defaultValues: {
      mandatory_workload: 400,
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

  const onSubmit = async (data: CourseFormValues) => {
    try {
      if (selectedCourse) {
        await update({ id: selectedCourse.id, ...data });
        toast.success(t("courses.messages.updateSuccess"));
      } else {
        await create(data);
        toast.success(t("courses.messages.createSuccess"));
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
      toast.success(t("courses.messages.bulkUpdateSuccess"));
      setIsBulkEditOpen(false);
      selection.clearSelection();
      resetBulk();
    } catch (error) {
      toast.error(getFriendlyErrorMessage(error, t));
    }
  };

  const handleEdit = (course: Course) => {
    setSelectedCourse(course);
    reset({
      name: course.name,
      school_id: course.school_id,
      level_id: course.level_id,
      mandatory_workload: course.mandatory_workload,
    });
    setIsFormOpen(true);
  };

  const handleDeleteClick = (course: Course) => {
    setSelectedCourse(course);
    setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedCourse) return;
    try {
      await remove(selectedCourse.id);
      toast.success(t("courses.messages.deleteSuccess"));
      setIsDeleteOpen(false);
      setSelectedCourse(null);
    } catch (error) {
      toast.error(getFriendlyErrorMessage(error, t));
    }
  };

  const confirmBulkDelete = async () => {
    try {
      await bulkRemove(selection.selectedIds);
      toast.success(t("courses.messages.bulkDeleteSuccess"));
      setIsBulkDeleteOpen(false);
      selection.clearSelection();
    } catch (error) {
      toast.error(getFriendlyErrorMessage(error, t));
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedCourse(null);
    reset();
  };

  const pagination = usePagination(filteredCourses);
  const { listLayout } = useListLayout();

  if (isLoading) return <LoadingScreen />;

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-black text-blue-900 flex items-center gap-2">
            <BookOpen className="text-blue-600" size={28} />{" "}
            {t("courses.title")}
          </h1>
          <p className="text-gray-500 font-medium">{t("courses.subtitle")}</p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl flex items-center justify-center gap-2 font-bold transition-all shadow-lg shadow-blue-200 active:scale-95"
        >
          <Plus size={20} /> {t("courses.new")}
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
            placeholder={t("courses.searchPlaceholder")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <ListSortControl
            options={courseSortOptions(t)}
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
            {t("courses.fields.school")}
          </label>
          <select
            value={filters.schoolId}
            onChange={(e) => handleFilterChange("schoolId", e.target.value)}
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">{t("common.allSchools")}</option>
            {schools.map((e: School) => (
              <option key={e.id} value={e.id}>
                {e.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
            {t("courses.fields.level")}
          </label>
          <select
            value={filters.levelId}
            onChange={(e) => handleFilterChange("levelId", e.target.value)}
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">{t("common.allLevels")}</option>
            {levels.map((n: Level) => (
              <option key={n.id} value={n.id}>
                {n.description}
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
        {filteredCourses.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl text-center text-gray-400 font-bold border-2 border-dashed border-gray-100 col-span-full">
            {t("common.noItemsFound")}
          </div>
        ) : (
          pagination.currentItems.map((course) => (
            <div
              key={course.id}
              className={cn(
                "bg-white p-5 rounded-2xl shadow-sm border transition-all relative group space-y-4",
                selection.isSelected(course.id)
                  ? "border-blue-500 ring-2 ring-blue-50"
                  : "border-gray-100",
              )}
            >
              <button
                onClick={() => selection.toggleSelect(course.id)}
                className={cn(
                  "absolute top-4 right-4 p-2 rounded-lg transition-all z-10",
                  selection.isSelected(course.id)
                    ? "text-blue-600 bg-blue-50"
                    : "text-gray-300 hover:text-gray-400 opacity-0 group-hover:opacity-100",
                )}
              >
                {selection.isSelected(course.id) ? (
                  <CheckSquare size={20} />
                ) : (
                  <Square size={20} />
                )}
              </button>

              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                    <BookOpen size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 leading-tight">
                      {course.name}
                    </h3>
                    <p className="text-xs text-gray-500 font-medium">
                      {levels.find((n: Level) => n.id === course.level_id)
                        ?.description || "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 p-2 rounded-lg">
                  <SchoolIcon size={14} className="text-blue-500" />
                  <span className="truncate">
                    {schools.find((e: School) => e.id === course.school_id)
                      ?.name || "N/A"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-blue-700 bg-blue-50 p-2 rounded-lg font-bold">
                  <Clock size={14} />
                  <span>
                    {t("courses.labels.totalWorkload", {
                      count: course.mandatory_workload,
                    })}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t border-gray-50">
                <button
                  onClick={() => handleEdit(course)}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-50 text-blue-700 font-bold text-sm hover:bg-blue-100 transition-colors"
                >
                  <Edit2 size={16} /> {t("common.edit")}
                </button>
                <button
                  onClick={() => handleDeleteClick(course)}
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
                  {t("courses.fields.name")}
                </th>
                <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest">
                  {t("courses.fields.school")}
                </th>
                <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest">
                  {t("courses.fields.level")}
                </th>
                <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest">
                  {t("courses.fields.workloadAbbreviation")}
                </th>
                <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest text-right">
                  {t("common.actions")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredCourses.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-gray-400 font-bold"
                  >
                    {t("common.noItemsFound")}
                  </td>
                </tr>
              ) : (
                pagination.currentItems.map((course) => (
                  <tr
                    key={course.id}
                    className={cn(
                      "hover:bg-blue-50/30 transition-colors group",
                      selection.isSelected(course.id) && "bg-blue-50/50",
                    )}
                  >
                    <td className="px-6 py-4">
                      <button
                        onClick={() => selection.toggleSelect(course.id)}
                        className={cn(
                          "p-1 rounded transition-colors",
                          selection.isSelected(course.id)
                            ? "text-blue-600"
                            : "text-gray-300 hover:text-gray-400 opacity-0 group-hover:opacity-100",
                        )}
                      >
                        {selection.isSelected(course.id) ? (
                          <CheckSquare size={20} />
                        ) : (
                          <Square size={20} />
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs uppercase">
                          {course.name.substring(0, 2)}
                        </div>
                        <span className="text-gray-900 font-bold">
                          {course.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 font-medium">
                      {schools.find((e: School) => e.id === course.school_id)
                        ?.name || "N/A"}
                    </td>
                    <td className="px-6 py-4 text-gray-600 font-medium">
                      {levels.find((n: Level) => n.id === course.level_id)
                        ?.description || "N/A"}
                    </td>
                    <td className="px-6 py-4 text-blue-600 font-black text-sm">
                      {course.mandatory_workload}h
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEdit(course)}
                          className="p-2 text-blue-600 hover:bg-white rounded-lg shadow-sm border border-transparent hover:border-blue-100 transition-all"
                          title={t("common.edit")}
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(course)}
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
        title={selectedCourse ? t("courses.editTitle") : t("courses.newTitle")}
        description={t("courses.formDescription")}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-bold text-gray-700 ml-1">
                {t("courses.fields.name")}
              </label>
              <div className="relative mt-1">
                <BookOpen
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
                  placeholder={t("courses.placeholders.courseNameExample")}
                />
              </div>
              {errors.name && (
                <p className="text-[11px] font-bold text-red-500 mt-1 ml-1">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-bold text-gray-700 ml-1">
                {t("courses.fields.school")}
              </label>
              <div className="relative mt-1">
                <SchoolIcon
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
                    {t("courses.placeholders.selectSchool")}
                  </option>
                  {schools.map((e: School) => (
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

            <div>
              <label className="text-sm font-bold text-gray-700 ml-1">
                {t("courses.fields.level")}
              </label>
              <div className="relative mt-1">
                <GraduationCap
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={16}
                />
                <select
                  {...register("level_id")}
                  className={cn(
                    "w-full pl-10 pr-3 py-2.5 rounded-lg border text-sm focus:ring-2 outline-none transition-all appearance-none bg-white font-medium",
                    errors.level_id
                      ? "border-red-500 focus:ring-red-200"
                      : "border-gray-200 focus:ring-blue-100 focus:border-blue-500",
                  )}
                >
                  <option value="">
                    {t("courses.placeholders.selectLevel")}
                  </option>
                  {levels.map((n: Level) => (
                    <option key={n.id} value={n.id}>
                      {n.description}
                    </option>
                  ))}
                </select>
              </div>
              {errors.level_id && (
                <p className="text-[11px] font-bold text-red-500 mt-1 ml-1">
                  {errors.level_id.message}
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-bold text-gray-700 ml-1">
                {t("courses.fields.mandatoryWorkload")}
              </label>
              <div className="relative mt-1">
                <Clock
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={16}
                />
                <input
                  type="number"
                  {...register("mandatory_workload", {
                    valueAsNumber: true,
                  })}
                  className={cn(
                    "w-full pl-10 pr-3 py-2.5 rounded-lg border text-sm focus:ring-2 outline-none transition-all",
                    errors.mandatory_workload
                      ? "border-red-500 focus:ring-red-200"
                      : "border-gray-200 focus:ring-blue-100 focus:border-blue-500",
                  )}
                />
              </div>
              {errors.mandatory_workload && (
                <p className="text-[11px] font-bold text-red-500 mt-1 ml-1">
                  {errors.mandatory_workload.message}
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
                : selectedCourse
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
                {t("courses.bulkEdit.newSchool")}
              </label>
              <select
                {...registerBulk("school_id")}
                className="w-full px-3 py-2.5 mt-1 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all appearance-none bg-white font-medium"
              >
                <option value="">{t("common.keepCurrent")}</option>
                {schools.map((e: School) => (
                  <option key={e.id} value={e.id}>
                    {e.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-bold text-gray-700 ml-1">
                {t("courses.bulkEdit.newLevel")}
              </label>
              <select
                {...registerBulk("level_id")}
                className="w-full px-3 py-2.5 mt-1 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all appearance-none bg-white font-medium"
              >
                <option value="">{t("common.keepCurrent")}</option>
                {levels.map((n: Level) => (
                  <option key={n.id} value={n.id}>
                    {n.description}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-bold text-gray-700 ml-1">
                {t("courses.bulkEdit.newWorkload")}
              </label>
              <input
                type="number"
                {...registerBulk("mandatory_workload", {
                  valueAsNumber: true,
                })}
                className="w-full px-3 py-2.5 mt-1 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                placeholder="Ex: 400"
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
        itemName={selectedCourse?.name}
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
