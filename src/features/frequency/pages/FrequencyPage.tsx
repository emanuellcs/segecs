import { useState } from "react";
import {
  Clock,
  Plus,
  Edit2,
  Trash2,
  Search,
  CheckCircle2,
  User,
  Calendar,
  Activity,
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
import { useSelection } from "@/hooks/useSelection";
import { toast } from "sonner";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { usePagination } from "@/hooks/usePagination";
import { Pagination } from "@/components/ui/Pagination";
import { ListSortControl, SortOption } from "@/components/ui/ListSortControl";
import { ListFilterControl } from "@/components/ui/ListFilterControl";
import { useTranslation } from "react-i18next";
import { Frequency, Internship, Student } from "@/types/database";

// Sort options for frequency
const frequencySortOptions = (t: any): SortOption[] => [
  { label: t("frequencies.fields.date"), column: "date" },
  { label: t("frequencies.fields.hoursPerformed"), column: "performed_hours" },
  { label: t("common.createdAt"), column: "created_at" },
];

interface FrequencyFilters {
  internshipId: string;
  supervisorValidated: string;
  advisorValidated: string;
}

const initialFilters: FrequencyFilters = {
  internshipId: "",
  supervisorValidated: "",
  advisorValidated: "",
};

// Zod schema for frequency form
const frequencySchema = (t: any) =>
  z.object({
    internship_id: z
      .string()
      .uuid(t("frequencies.validations.internshipRequired")),
    date: z.string().min(1, t("frequencies.validations.dateRequired")),
    performed_hours: z
      .number()
      .min(1, t("frequencies.validations.hoursMin"))
      .max(10, t("frequencies.validations.hoursMax")),
    activities: z.string().min(10, t("frequencies.validations.activitiesMin")),
    validated_by_supervisor: z.boolean().default(false),
    validated_by_advisor: z.boolean().default(false),
  });

const bulkEditSchema = z.object({
  validated_by_supervisor: z.boolean().optional(),
  validated_by_advisor: z.boolean().optional(),
});

type FrequencyFormValues = z.infer<ReturnType<typeof frequencySchema>>;
type BulkEditValues = z.infer<typeof bulkEditSchema>;

export default function FrequencyPage() {
  const { t, i18n } = useTranslation();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
  const [isBulkEditOpen, setIsBulkEditOpen] = useState(false);
  const [selectedFreq, setSelectedFreq] = useState<Frequency | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortColumn, setSortColumn] = useState("date");
  const [isSortAsc, setIsSortAsc] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState<FrequencyFilters>(initialFilters);

  // CRUD hook for frequency
  const {
    items: frequencies,
    isLoading,
    create,
    update,
    remove,
    bulkRemove,
    bulkUpdate,
    isBulkDeleting,
  } = useSupabaseCrud<Frequency>("frequencies", ["frequencies"], {
    orderBy: { column: sortColumn, ascending: isSortAsc },
  });

  const { items: internships } = useSupabaseCrud<Internship>("internships", [
    "internships",
  ]);
  const { items: students } = useSupabaseCrud<Student>("students", [
    "students",
  ]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FrequencyFormValues>({
    resolver: zodResolver(frequencySchema(t)) as any,
    defaultValues: {
      performed_hours: 6,
      validated_by_supervisor: false,
      validated_by_advisor: false,
      date: new Date().toISOString().split("T")[0],
      activities: "",
      internship_id: "",
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
      if (selectedFreq) {
        await update({ id: selectedFreq.id, ...data });
        toast.success(t("frequencies.messages.updateSuccess"));
      } else {
        await create(data);
        toast.success(t("frequencies.messages.createSuccess"));
      }
      handleCloseForm();
    } catch (error) {
      toast.error(getFriendlyErrorMessage(error, t));
    }
  };

  const onBulkEditSubmit = async (data: BulkEditValues) => {
    const updateData = Object.fromEntries(
      Object.entries(data).filter(([_, v]) => v !== undefined),
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
      toast.success(t("frequencies.messages.bulkUpdateSuccess"));
      setIsBulkEditOpen(false);
      selection.clearSelection();
      resetBulk();
    } catch (error) {
      toast.error(getFriendlyErrorMessage(error, t));
    }
  };

  const handleEdit = (freq: Frequency) => {
    setSelectedFreq(freq);
    reset({
      internship_id: freq.internship_id,
      date: freq.date,
      performed_hours: freq.performed_hours,
      activities: freq.activities,
      validated_by_supervisor: freq.validated_by_supervisor,
      validated_by_advisor: freq.validated_by_advisor,
    });
    setIsFormOpen(true);
  };

  const handleDeleteClick = (freq: Frequency) => {
    setSelectedFreq(freq);
    setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedFreq) return;
    try {
      await remove(selectedFreq.id);
      toast.success(t("frequencies.messages.deleteSuccess"));
      setIsDeleteOpen(false);
      setSelectedFreq(null);
    } catch (error) {
      toast.error(getFriendlyErrorMessage(error, t));
    }
  };

  const confirmBulkDelete = async () => {
    try {
      await bulkRemove(selection.selectedIds);
      toast.success(t("frequencies.messages.bulkDeleteSuccess"));
      setIsBulkDeleteOpen(false);
      selection.clearSelection();
    } catch (error) {
      toast.error(getFriendlyErrorMessage(error, t));
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedFreq(null);
    reset();
  };

  const handleFilterChange = (key: keyof FrequencyFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters(initialFilters);
  };

  const filteredFrequencies = frequencies.filter((freq) => {
    const internship = internships.find((e) => e.id === freq.internship_id);
    const studentName =
      students.find((a) => a.id === internship?.student_id)?.name || "";
    const matchesSearch =
      (studentName?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (freq.activities?.toLowerCase() || "").includes(searchTerm.toLowerCase());

    const matchesInternship =
      !filters.internshipId || freq.internship_id === filters.internshipId;
    const matchesSupervisor =
      !filters.supervisorValidated ||
      freq.validated_by_supervisor === (filters.supervisorValidated === "true");
    const matchesAdvisor =
      !filters.advisorValidated ||
      freq.validated_by_advisor === (filters.advisorValidated === "true");

    return (
      matchesSearch && matchesInternship && matchesSupervisor && matchesAdvisor
    );
  });

  const totalHoras = filteredFrequencies.reduce(
    (acc, f) => acc + f.performed_hours,
    0,
  );

  const selection = useSelection(filteredFrequencies);
  const pagination = usePagination(filteredFrequencies);
  const activeFilterCount = Object.values(filters).filter(Boolean).length;
  const { listLayout } = useListLayout();

  if (isLoading) return <LoadingScreen />;

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-black text-blue-900 flex items-center gap-2">
            <Clock className="text-blue-600" size={28} />{" "}
            {t("frequencies.title")}
          </h1>
          <p className="text-gray-500 font-medium">
            {t("frequencies.subtitle")}
          </p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl flex items-center justify-center gap-2 font-bold transition-all shadow-lg shadow-blue-200 active:scale-95"
        >
          <Plus size={20} /> {t("frequencies.new")}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-blue-600 p-6 rounded-2xl shadow-lg shadow-blue-100 flex justify-between items-center text-white">
          <div>
            <p className="text-blue-100 text-xs font-black uppercase tracking-widest mb-1">
              {t("frequencies.stats.accumulatedTotal")}
            </p>
            <h2 className="text-4xl font-black">{totalHoras}h</h2>
          </div>
          <div className="bg-blue-500/30 p-3 rounded-xl">
            <Clock size={32} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
          <div>
            <p className="text-gray-400 text-xs font-black uppercase tracking-widest mb-1">
              {t("frequencies.stats.mandatoryGoal")}
            </p>
            <h2 className="text-4xl font-black text-gray-800">400h</h2>
          </div>
          <div className="bg-green-50 p-3 rounded-xl text-green-500">
            <CheckCircle2 size={32} />
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
            placeholder={t("frequencies.searchPlaceholder")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <ListSortControl
            options={frequencySortOptions(t)}
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
            {t("frequencies.fields.internship")}
          </label>
          <select
            value={filters.internshipId}
            onChange={(e) => handleFilterChange("internshipId", e.target.value)}
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">{t("common.allActiveStudents")}</option>
            {internships
              .filter((e: Internship) => e.status === "active")
              .map((est: Internship) => (
                <option key={est.id} value={est.id}>
                  {students.find((a: Student) => a.id === est.student_id)?.name}
                </option>
              ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
            {t("frequencies.fields.supervisorValidation")}
          </label>
          <select
            value={filters.supervisorValidated}
            onChange={(e) =>
              handleFilterChange("supervisorValidated", e.target.value)
            }
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">{t("common.all")}</option>
            <option value="true">{t("common.validated", "Validated")}</option>
            <option value="false">{t("common.pending", "Pending")}</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
            {t("frequencies.fields.advisorValidation")}
          </label>
          <select
            value={filters.advisorValidated}
            onChange={(e) =>
              handleFilterChange("advisorValidated", e.target.value)
            }
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">{t("common.all")}</option>
            <option value="true">{t("common.validated", "Validated")}</option>
            <option value="false">{t("common.pending", "Pending")}</option>
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
        {filteredFrequencies.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl text-center text-gray-400 font-bold border-2 border-dashed border-gray-100 col-span-full">
            {t("common.noItemsFound")}
          </div>
        ) : (
          pagination.currentItems.map((frequency) => {
            const internship = internships.find(
              (e) => e.id === frequency.internship_id,
            );
            const student = students.find(
              (a) => a.id === internship?.student_id,
            );

            return (
              <div
                key={frequency.id}
                className={cn(
                  "bg-white p-5 rounded-2xl shadow-sm border transition-all relative group space-y-4",
                  selection.isSelected(frequency.id)
                    ? "border-blue-500 ring-2 ring-blue-50"
                    : "border-gray-100",
                )}
              >
                <button
                  onClick={() => selection.toggleSelect(frequency.id)}
                  className={cn(
                    "absolute top-4 right-4 p-2 rounded-lg transition-all z-10",
                    selection.isSelected(frequency.id)
                      ? "text-blue-600 bg-blue-50"
                      : "text-gray-300 hover:text-gray-400 opacity-0 group-hover:opacity-100",
                  )}
                >
                  {selection.isSelected(frequency.id) ? (
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
                        {new Date(frequency.date).toLocaleDateString(
                          i18n.language === "pt" ? "pt-BR" : "en-US",
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <span
                      className={cn(
                        "px-1.5 py-0.5 rounded text-[8px] font-black border",
                        frequency.validated_by_supervisor
                          ? "bg-green-50 text-green-700 border-green-100"
                          : "bg-gray-50 text-gray-400 border-gray-100",
                      )}
                    >
                      {t("frequencies.labels.validatedSup")}
                    </span>
                    <span
                      className={cn(
                        "px-1.5 py-0.5 rounded text-[8px] font-black border",
                        frequency.validated_by_advisor
                          ? "bg-blue-50 text-blue-700 border-blue-100"
                          : "bg-gray-50 text-gray-400 border-gray-100",
                      )}
                    >
                      {t("frequencies.labels.validatedOri")}
                    </span>
                  </div>
                </div>

                <p className="text-sm text-gray-600 line-clamp-2 bg-gray-50 p-3 rounded-xl border border-gray-100 italic">
                  "{frequency.activities}"
                </p>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2 text-blue-700 font-black">
                    <Clock size={16} />
                    <span>
                      {t("frequencies.labels.hoursPerformed", {
                        count: frequency.performed_hours,
                      })}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(frequency)}
                      className="p-2.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(frequency)}
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
                  {t("common.date")} / {t("students.title")}
                </th>
                <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest">
                  {t("frequencies.fields.activities")}
                </th>
                <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest text-center">
                  {t("common.hours", "Hours")}
                </th>
                <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest text-center">
                  {t("common.validation", "Validation")}
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
                pagination.currentItems.map((frequency) => {
                  const internship = internships.find(
                    (e) => e.id === frequency.internship_id,
                  );
                  const student = students.find(
                    (a) => a.id === internship?.student_id,
                  );

                  return (
                    <tr
                      key={frequency.id}
                      className={cn(
                        "hover:bg-blue-50/30 transition-colors group",
                        selection.isSelected(frequency.id) && "bg-blue-50/50",
                      )}
                    >
                      <td className="px-6 py-4">
                        <button
                          onClick={() => selection.toggleSelect(frequency.id)}
                          className={cn(
                            "p-1 rounded transition-colors",
                            selection.isSelected(frequency.id)
                              ? "text-blue-600"
                              : "text-gray-300 hover:text-gray-400 opacity-0 group-hover:opacity-100",
                          )}
                        >
                          {selection.isSelected(frequency.id) ? (
                            <CheckSquare size={20} />
                          ) : (
                            <Square size={20} />
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-gray-900 font-bold">
                            {new Date(frequency.date).toLocaleDateString(
                              i18n.language === "pt" ? "pt-BR" : "en-US",
                            )}
                          </span>
                          <span className="text-xs text-gray-500 font-medium">
                            {student?.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p
                          className="text-gray-600 text-sm max-w-md truncate"
                          title={frequency.activities}
                        >
                          {frequency.activities}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg font-black text-sm">
                          {frequency.performed_hours}h
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-2">
                          <span
                            className={cn(
                              "px-2 py-1 rounded text-[9px] font-black border",
                              frequency.validated_by_supervisor
                                ? "bg-green-50 text-green-700 border-green-100"
                                : "bg-gray-50 text-gray-400 border-gray-100",
                            )}
                          >
                            {t("frequencies.labels.validatedSup")}
                          </span>
                          <span
                            className={cn(
                              "px-2 py-1 rounded text-[9px] font-black border",
                              frequency.validated_by_advisor
                                ? "bg-blue-50 text-blue-700 border-blue-100"
                                : "bg-gray-50 text-gray-400 border-gray-100",
                            )}
                          >
                            {t("frequencies.labels.validatedOri")}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleEdit(frequency)}
                            className="p-2 text-blue-600 hover:bg-white rounded-lg shadow-sm border border-transparent hover:border-blue-100 transition-all"
                            title={t("common.edit")}
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(frequency)}
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
          selectedFreq ? t("frequencies.editTitle") : t("frequencies.newTitle")
        }
        description={t("frequencies.formDescription")}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="text-sm font-bold text-gray-700 ml-1">
                {t("frequencies.fields.internship")}
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
                    {t("frequencies.placeholders.selectInternship")}
                  </option>
                  {internships
                    .filter((e: Internship) => e.status === "active")
                    .map((est: Internship) => (
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
                {t("frequencies.fields.date")}
              </label>
              <div className="relative mt-1">
                <Calendar
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={16}
                />
                <input
                  type="date"
                  {...register("date")}
                  className={cn(
                    "w-full pl-10 pr-3 py-2.5 rounded-lg border text-sm focus:ring-2 outline-none transition-all",
                    errors.date
                      ? "border-red-500 focus:ring-red-200"
                      : "border-gray-200 focus:ring-blue-100 focus:border-blue-500",
                  )}
                />
              </div>
              {errors.date && (
                <p className="text-[11px] font-bold text-red-500 mt-1 ml-1">
                  {errors.date.message}
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-bold text-gray-700 ml-1">
                {t("frequencies.fields.hoursPerformed")}
              </label>
              <div className="relative mt-1">
                <Clock
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={16}
                />
                <input
                  type="number"
                  {...register("performed_hours", { valueAsNumber: true })}
                  className={cn(
                    "w-full pl-10 pr-3 py-2.5 rounded-lg border text-sm focus:ring-2 outline-none transition-all",
                    errors.performed_hours
                      ? "border-red-500 focus:ring-red-200"
                      : "border-gray-200 focus:ring-blue-100 focus:border-blue-500",
                  )}
                />
              </div>
              {errors.performed_hours && (
                <p className="text-[11px] font-bold text-red-500 mt-1 ml-1">
                  {errors.performed_hours.message}
                </p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-bold text-gray-700 ml-1">
                {t("frequencies.fields.activities")}
              </label>
              <div className="relative mt-1">
                <Activity
                  className="absolute left-3 top-3 text-gray-400"
                  size={16}
                />
                <textarea
                  {...register("activities")}
                  rows={3}
                  className={cn(
                    "w-full pl-10 pr-3 py-2.5 rounded-lg border text-sm focus:ring-2 outline-none transition-all",
                    errors.activities
                      ? "border-red-500 focus:ring-red-200"
                      : "border-gray-200 focus:ring-blue-100 focus:border-blue-500",
                  )}
                  placeholder={t("frequencies.placeholders.activitiesExample")}
                />
              </div>
              {errors.activities && (
                <p className="text-[11px] font-bold text-red-500 mt-1 ml-1">
                  {errors.activities.message}
                </p>
              )}
            </div>

            <div className="md:col-span-2 flex gap-4 bg-gray-50 p-4 rounded-xl">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  {...register("validated_by_supervisor")}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-xs font-bold text-gray-600 group-hover:text-blue-600 transition-colors">
                  {t("frequencies.fields.supervisorValidation")}
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  {...register("validated_by_advisor")}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-xs font-bold text-gray-600 group-hover:text-blue-600 transition-colors">
                  {t("frequencies.fields.advisorValidation")}
                </span>
              </label>
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
                : selectedFreq
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
            <div className="flex flex-col gap-4 bg-gray-50 p-4 rounded-xl">
              <p className="text-sm font-bold text-gray-700 mb-2">
                {t("frequencies.bulkEdit.validateSelected")}
              </p>
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  {...registerBulk("validated_by_supervisor")}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-bold text-gray-600 group-hover:text-blue-600 transition-colors">
                  {t("frequencies.bulkEdit.validateSupervisor")}
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  {...registerBulk("validated_by_advisor")}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-bold text-gray-600 group-hover:text-blue-600 transition-colors">
                  {t("frequencies.bulkEdit.validateAdvisor")}
                </span>
              </label>
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
