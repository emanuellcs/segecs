import { useState } from "react";
import {
  GraduationCap,
  Plus,
  Edit2,
  Trash2,
  Search,
  User,
  BookOpen,
  Fingerprint,
  Calendar,
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
import { Student } from "@/types/database";

// Sort options for students
const studentSortOptions = (t: any): SortOption[] => [
  { label: t("students.fields.name"), column: "name" },
  { label: t("students.fields.registration"), column: "registration" },
  { label: t("students.fields.birthDate"), column: "birth_date" },
  { label: t("common.createdAt", "Created At"), column: "created_at" },
];

interface StudentFilters {
  status: string;
  courseId: string;
  guardianId: string;
}

const initialFilters: StudentFilters = {
  status: "",
  courseId: "",
  guardianId: "",
};

// Zod schema for student form
const studentSchema = (t: any) =>
  z.object({
    name: z.string().min(3, t("students.validations.nameMin")),
    registration: z
      .string()
      .min(1, t("students.validations.registrationRequired")),
    cpf: z.string().min(14, t("students.validations.cpfInvalid")),
    birth_date: z.string().min(1, t("students.validations.birthDateRequired")),
    course_id: z.string().uuid(t("students.validations.courseRequired")),
    guardian_id: z.string().uuid(t("students.validations.guardianRequired")),
    status: z.enum(["pending", "interning", "completed", "dropped_out"], {
      errorMap: () => ({ message: t("students.validations.statusRequired") }),
    }),
  });

const bulkEditSchema = z.object({
  course_id: z.string().optional(),
  guardian_id: z.string().optional(),
  status: z
    .enum(["pending", "interning", "completed", "dropped_out"])
    .optional(),
});

type StudentFormValues = z.infer<ReturnType<typeof studentSchema>>;
type BulkEditValues = z.infer<typeof bulkEditSchema>;

export default function StudentsPage() {
  const { t } = useTranslation();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
  const [isBulkEditOpen, setIsBulkEditOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortColumn, setSortColumn] = useState("name");
  const [isSortAsc, setIsSortAsc] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState<StudentFilters>(initialFilters);

  // CRUD hook for students
  const {
    items: students,
    isLoading,
    create,
    update,
    remove,
    bulkRemove,
    bulkUpdate,
    isBulkDeleting,
  } = useSupabaseCrud<Student>("students", ["students"], {
    orderBy: { column: sortColumn, ascending: isSortAsc },
  });

  // Fetch courses and guardians for selects
  const { items: courses } = useSupabaseCrud<any>("courses", ["courses"]);
  const { items: guardians } = useSupabaseCrud<any>("guardians", ["guardians"]);

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  const handleFilterChange = (key: keyof StudentFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters(initialFilters);
  };

  // Filter students based on search and filters
  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      (student.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (student.registration || "").includes(searchTerm) ||
      (student.cpf || "").includes(searchTerm);

    const matchesStatus = !filters.status || student.status === filters.status;
    const matchesCourse =
      !filters.courseId || student.course_id === filters.courseId;
    const matchesGuardian =
      !filters.guardianId || student.guardian_id === filters.guardianId;

    return matchesSearch && matchesStatus && matchesCourse && matchesGuardian;
  });

  const selection = useSelection(filteredStudents);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<StudentFormValues>({
    resolver: zodResolver(studentSchema(t)),
    defaultValues: {
      status: "pending",
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

  const onSubmit = async (data: StudentFormValues) => {
    try {
      if (selectedStudent) {
        await update({ id: selectedStudent.id, ...data });
        toast.success(t("students.messages.updateSuccess"));
      } else {
        await create(data);
        toast.success(t("students.messages.createSuccess"));
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
      toast.error(t("students.messages.selectFieldToUpdate"));
      return;
    }

    try {
      await bulkUpdate({
        ids: selection.selectedIds,
        updateData,
      });
      toast.success(t("students.messages.bulkUpdateSuccess"));
      setIsBulkEditOpen(false);
      selection.clearSelection();
      resetBulk();
    } catch (error) {
      toast.error(getFriendlyErrorMessage(error, t));
    }
  };

  const handleEdit = (student: Student) => {
    setSelectedStudent(student);
    reset({
      name: student.name,
      registration: student.registration || "",
      cpf: student.cpf || "",
      birth_date: student.birth_date || "",
      course_id: student.course_id,
      guardian_id: student.guardian_id,
      status: student.status,
    });
    setIsFormOpen(true);
  };

  const handleDeleteClick = (student: Student) => {
    setSelectedStudent(student);
    setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedStudent) return;
    try {
      await remove(selectedStudent.id);
      toast.success(t("students.messages.deleteSuccess"));
      setIsDeleteOpen(false);
      setSelectedStudent(null);
    } catch (error) {
      toast.error(getFriendlyErrorMessage(error, t));
    }
  };

  const confirmBulkDelete = async () => {
    try {
      await bulkRemove(selection.selectedIds);
      toast.success(t("students.messages.bulkDeleteSuccess"));
      setIsBulkDeleteOpen(false);
      selection.clearSelection();
    } catch (error) {
      toast.error(getFriendlyErrorMessage(error, t));
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedStudent(null);
    reset();
  };

  const pagination = usePagination(filteredStudents);
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
            <GraduationCap className="text-blue-600" size={28} />{" "}
            {t("students.title")}
          </h1>
          <p className="text-gray-500 font-medium">{t("students.subtitle")}</p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl flex items-center justify-center gap-2 font-bold transition-all shadow-lg shadow-blue-200 active:scale-95"
        >
          <Plus size={20} /> {t("students.new")}
        </button>
      </div>

      {/* Search, Sort and Layout Toggle */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative group flex-1">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors"
            size={20}
          />
          <input
            type="text"
            placeholder={t("students.searchPlaceholder")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
          />
        </div>

        <div className="flex items-center gap-2">
          <ListSortControl
            options={studentSortOptions(t)}
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
            <option value="">{t("common.allStatus", "All Status")}</option>
            <option value="pending">{t("students.status.pending")}</option>
            <option value="interning">{t("students.status.interning")}</option>
            <option value="completed">{t("students.status.completed")}</option>
            <option value="dropped_out">
              {t("students.status.dropped_out")}
            </option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
            {t("students.fields.course")}
          </label>
          <select
            value={filters.courseId}
            onChange={(e) => handleFilterChange("courseId", e.target.value)}
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">{t("students.allCourses", "All Courses")}</option>
            {courses.map((c: any) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
            {t("students.fields.guardian")}
          </label>
          <select
            value={filters.guardianId}
            onChange={(e) => handleFilterChange("guardianId", e.target.value)}
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">
              {t("students.allGuardians", "All Guardians")}
            </option>
            {guardians.map((r: any) => (
              <option key={r.id} value={r.id}>
                {r.name}
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
        {filteredStudents.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl text-center text-gray-400 font-bold border-2 border-dashed border-gray-100 col-span-full">
            {t("common.noItemsFound")}
          </div>
        ) : (
          pagination.currentItems.map((student) => (
            <div
              key={student.id}
              className={cn(
                "bg-white p-5 rounded-2xl shadow-sm border transition-all relative group",
                selection.isSelected(student.id)
                  ? "border-blue-500 ring-2 ring-blue-50"
                  : "border-gray-100",
              )}
            >
              <button
                onClick={() => selection.toggleSelect(student.id)}
                className={cn(
                  "absolute top-4 right-4 p-2 rounded-lg transition-all z-10",
                  selection.isSelected(student.id)
                    ? "text-blue-600 bg-blue-50"
                    : "text-gray-300 hover:text-gray-400 opacity-0 group-hover:opacity-100",
                )}
              >
                {selection.isSelected(student.id) ? (
                  <CheckSquare size={20} />
                ) : (
                  <Square size={20} />
                )}
              </button>

              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                    <User size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 leading-tight">
                      {student.name}
                    </h3>
                    <p className="text-xs text-gray-500 font-medium">
                      {t("students.fields.registration")}:{" "}
                      {student.registration}
                    </p>
                  </div>
                </div>
                <span
                  className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                    student.status === "interning"
                      ? "bg-green-100 text-green-700"
                      : student.status === "pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-gray-100 text-gray-700",
                  )}
                >
                  {t(`students.status.${student.status}`)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 p-2 rounded-lg">
                  <BookOpen size={14} className="text-blue-500" />
                  <span className="truncate">
                    {courses.find((c: any) => c.id === student.course_id)
                      ?.name || "N/A"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 p-2 rounded-lg">
                  <Fingerprint size={14} className="text-blue-500" />
                  <span>{student.cpf}</span>
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t border-gray-50">
                <button
                  onClick={() => handleEdit(student)}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-50 text-blue-700 font-bold text-sm hover:bg-blue-100 transition-colors"
                >
                  <Edit2 size={16} /> {t("common.edit")}
                </button>
                <button
                  onClick={() => handleDeleteClick(student)}
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
                  {t("students.fields.name")}
                </th>
                <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest">
                  {t("students.fields.registration")}
                </th>
                <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest">
                  {t("students.fields.course")}
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
              {filteredStudents.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-gray-400 font-bold"
                  >
                    {t("common.noItemsFound")}
                  </td>
                </tr>
              ) : (
                pagination.currentItems.map((student) => (
                  <tr
                    key={student.id}
                    className={cn(
                      "hover:bg-blue-50/30 transition-colors group",
                      selection.isSelected(student.id) && "bg-blue-50/50",
                    )}
                  >
                    <td className="px-6 py-4">
                      <button
                        onClick={() => selection.toggleSelect(student.id)}
                        className={cn(
                          "p-1 rounded transition-colors",
                          selection.isSelected(student.id)
                            ? "text-blue-600"
                            : "text-gray-300 hover:text-gray-400 opacity-0 group-hover:opacity-100",
                        )}
                      >
                        {selection.isSelected(student.id) ? (
                          <CheckSquare size={20} />
                        ) : (
                          <Square size={20} />
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs uppercase">
                          {student.name.substring(0, 2)}
                        </div>
                        <span className="text-gray-900 font-bold">
                          {student.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 font-medium">
                      {student.registration}
                    </td>
                    <td className="px-6 py-4 text-gray-600 font-medium">
                      {courses.find((c: any) => c.id === student.course_id)
                        ?.name || "N/A"}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={cn(
                          "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                          student.status === "interning"
                            ? "bg-green-100 text-green-700"
                            : student.status === "pending"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-gray-100 text-gray-700",
                        )}
                      >
                        {t(`students.status.${student.status}`)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEdit(student)}
                          className="p-2 text-blue-600 hover:bg-white rounded-lg shadow-sm border border-transparent hover:border-blue-100 transition-all"
                          title={t("common.edit")}
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(student)}
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
          selectedStudent ? t("students.editTitle") : t("students.newTitle")
        }
        description={t("students.formDescription")}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="text-sm font-bold text-gray-700 ml-1">
                {t("students.fields.name")}
              </label>
              <div className="relative mt-1">
                <User
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
                  placeholder="Ex: John Doe"
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
                {t("students.fields.registration")}
              </label>
              <input
                {...register("registration")}
                className={cn(
                  "w-full px-3 py-2.5 mt-1 rounded-lg border text-sm focus:ring-2 outline-none transition-all",
                  errors.registration
                    ? "border-red-500 focus:ring-red-200"
                    : "border-gray-200 focus:ring-blue-100 focus:border-blue-500",
                )}
                placeholder="000000"
              />
              {errors.registration && (
                <p className="text-[11px] font-bold text-red-500 mt-1 ml-1">
                  {errors.registration.message}
                </p>
              )}
            </div>

            <Controller
              name="cpf"
              control={control}
              render={({ field }) => (
                <InputMask
                  mask="cpf"
                  label={t("students.fields.cpf")}
                  value={field.value || ""}
                  onChange={field.onChange}
                  error={errors.cpf?.message}
                  placeholder="000.000.000-00"
                />
              )}
            />

            <div className="md:col-span-2">
              <label className="text-sm font-bold text-gray-700 ml-1">
                {t("students.fields.course")}
              </label>
              <select
                {...register("course_id")}
                className={cn(
                  "w-full px-3 py-2.5 mt-1 rounded-lg border text-sm focus:ring-2 outline-none transition-all appearance-none bg-white",
                  errors.course_id
                    ? "border-red-500 focus:ring-red-200"
                    : "border-gray-200 focus:ring-blue-100 focus:border-blue-500",
                )}
              >
                <option value="">
                  {t("students.placeholders.selectCourse")}
                </option>
                {courses.map((c: any) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {errors.course_id && (
                <p className="text-[11px] font-bold text-red-500 mt-1 ml-1">
                  {errors.course_id.message}
                </p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-bold text-gray-700 ml-1">
                {t("students.fields.guardian")}
              </label>
              <select
                {...register("guardian_id")}
                className={cn(
                  "w-full px-3 py-2.5 mt-1 rounded-lg border text-sm focus:ring-2 outline-none transition-all appearance-none bg-white",
                  errors.guardian_id
                    ? "border-red-500 focus:ring-red-200"
                    : "border-gray-200 focus:ring-blue-100 focus:border-blue-500",
                )}
              >
                <option value="">
                  {t("students.placeholders.selectGuardian")}
                </option>
                {guardians.map((r: any) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
              {errors.guardian_id && (
                <p className="text-[11px] font-bold text-red-500 mt-1 ml-1">
                  {errors.guardian_id.message}
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-bold text-gray-700 ml-1">
                {t("students.fields.birthDate")}
              </label>
              <div className="relative mt-1">
                <Calendar
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={16}
                />
                <input
                  type="date"
                  {...register("birth_date")}
                  className={cn(
                    "w-full pl-10 pr-3 py-2.5 rounded-lg border text-sm focus:ring-2 outline-none transition-all",
                    errors.birth_date
                      ? "border-red-500 focus:ring-red-200"
                      : "border-gray-200 focus:ring-blue-100 focus:border-blue-500",
                  )}
                />
              </div>
              {errors.birth_date && (
                <p className="text-[11px] font-bold text-red-500 mt-1 ml-1">
                  {errors.birth_date.message}
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-bold text-gray-700 ml-1">
                {t("students.fields.status")}
              </label>
              <select
                {...register("status")}
                className="w-full px-3 py-2.5 mt-1 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all appearance-none bg-white font-bold"
              >
                <option value="pending">
                  🟡 {t("students.status.pending")}
                </option>
                <option value="interning">
                  🟢 {t("students.status.interning")}
                </option>
                <option value="completed">
                  🔵 {t("students.status.completed")}
                </option>
                <option value="dropped_out">
                  🔴 {t("students.status.dropped_out")}
                </option>
              </select>
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
                ? t("common.saving", "Saving...")
                : selectedStudent
                  ? t("common.saveChanges", "Save Changes")
                  : t("common.confirmRegistration", "Confirm Registration")}
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
                {t("students.bulkEdit.newCourse")}
              </label>
              <select
                {...registerBulk("course_id")}
                className="w-full px-3 py-2.5 mt-1 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all appearance-none bg-white"
              >
                <option value="">
                  {t("common.keepCurrent", "Keep current...")}
                </option>
                {courses.map((c: any) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-bold text-gray-700 ml-1">
                {t("students.bulkEdit.newGuardian")}
              </label>
              <select
                {...registerBulk("guardian_id")}
                className="w-full px-3 py-2.5 mt-1 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all appearance-none bg-white"
              >
                <option value="">
                  {t("common.keepCurrent", "Keep current...")}
                </option>
                {guardians.map((r: any) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-bold text-gray-700 ml-1">
                {t("students.bulkEdit.newStatus")}
              </label>
              <select
                {...registerBulk("status")}
                className="w-full px-3 py-2.5 mt-1 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all appearance-none bg-white font-bold"
              >
                <option value="">
                  {t("common.keepCurrent", "Keep current...")}
                </option>
                <option value="pending">
                  🟡 {t("students.status.pending")}
                </option>
                <option value="interning">
                  🟢 {t("students.status.interning")}
                </option>
                <option value="completed">
                  🔵 {t("students.status.completed")}
                </option>
                <option value="dropped_out">
                  🔴 {t("students.status.dropped_out")}
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
                ? t("common.updating", "Updating...")
                : t("common.applyChanges", "Apply Changes")}
            </button>
          </div>
        </form>
      </BulkEditModal>

      {/* Delete Confirmation */}
      <ConfirmDeleteModal
        isOpen={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onConfirm={confirmDelete}
        itemName={selectedStudent?.name}
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
