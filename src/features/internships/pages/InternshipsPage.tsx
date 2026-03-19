import { useState, useEffect } from "react";
import {
  ClipboardCheck,
  Plus,
  Edit2,
  Trash2,
  Search,
  FileText,
  User,
  Building2,
  Calendar,
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
import { pdf } from "@react-pdf/renderer";
import { TCETemplate } from "../templates/TCETemplate";
import { ActivityPlanTemplate } from "../templates/ActivityPlanTemplate";
import { TRETemplate } from "../templates/TRETemplate";
import { useTranslation } from "react-i18next";
import {
  Internship,
  Student,
  Vacancy,
  Advisor,
  Supervisor,
  Company,
  Course,
  School,
} from "@/types/database";

// Sort options for internships
const internshipSortOptions = (t: any): SortOption[] => [
  { label: t("internships.fields.startDate"), column: "start_date" },
  { label: t("internships.fields.endDate"), column: "end_date" },
  { label: t("common.status"), column: "status" },
  { label: t("common.createdAt"), column: "created_at" },
];

interface InternshipFilters {
  status: string;
  companyId: string;
  courseId: string;
}

const initialFilters: InternshipFilters = {
  status: "",
  companyId: "",
  courseId: "",
};

// Zod schema for internship form
const internshipSchema = (t: any) =>
  z.object({
    student_id: z.string().uuid(t("students.placeholders.select")),
    vacancy_id: z.string().uuid(t("vacancies.placeholders.select")),
    advisor_id: z.string().uuid(t("advisors.placeholders.select")),
    supervisor_id: z.string().uuid(t("supervisors.placeholders.select")),
    start_date: z
      .string()
      .min(1, t("internships.validations.startDateRequired")),
    end_date: z.string().min(1, t("internships.validations.endDateRequired")),
    total_workload: z.number().min(1, t("courses.validations.workloadMin")),
    daily_workload: z
      .number()
      .min(1, t("courses.validations.workloadMin"))
      .max(6, t("internships.validations.maxDaily")),
    status: z.enum(["active", "completed", "interrupted"], {
      errorMap: () => ({ message: t("common.validations.statusRequired") }),
    }),
  });

const bulkEditSchema = z.object({
  advisor_id: z.string().optional(),
  supervisor_id: z.string().optional(),
  status: z.enum(["active", "completed", "interrupted"]).optional(),
});

type InternshipFormValues = z.infer<ReturnType<typeof internshipSchema>>;
type BulkEditValues = z.infer<typeof bulkEditSchema>;

export default function InternshipsPage() {
  const { t, i18n } = useTranslation();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
  const [isBulkEditOpen, setIsBulkEditOpen] = useState(false);
  const [selectedInternship, setSelectedInternship] =
    useState<Internship | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortColumn, setSortColumn] = useState("start_date");
  const [isSortAsc, setIsSortAsc] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState<InternshipFilters>(initialFilters);

  // CRUD hook for internships
  const {
    items: internships,
    isLoading,
    create,
    update,
    remove,
    bulkRemove,
    bulkUpdate,
    isBulkDeleting,
  } = useSupabaseCrud<Internship>("internships", ["internships"], {
    orderBy: { column: sortColumn, ascending: isSortAsc },
  });

  // Fetch related data
  const { items: students } = useSupabaseCrud<Student>("students", [
    "students",
  ]);
  const { items: vacancies } = useSupabaseCrud<Vacancy>("vacancies", [
    "vacancies",
  ]);
  const { items: advisors } = useSupabaseCrud<Advisor>("advisors", [
    "advisors",
  ]);
  const { items: supervisors } = useSupabaseCrud<Supervisor>("supervisors", [
    "supervisors",
  ]);
  const { items: companies } = useSupabaseCrud<Company>("companies", [
    "companies",
  ]);
  const { items: courses } = useSupabaseCrud<Course>("courses", ["courses"]);

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  const handleFilterChange = (key: keyof InternshipFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters(initialFilters);
  };

  // Filter internships based on search and filters
  const filteredInternships = internships.filter((internship) => {
    const student = students.find((a) => a.id === internship.student_id);
    const studentName = student?.name || "";
    const vacancy = vacancies.find((v) => v.id === internship.vacancy_id);
    const company = companies.find((e) => e.id === vacancy?.company_id);
    const companyName = company?.business_name || "";

    const matchesSearch =
      (studentName?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (companyName?.toLowerCase() || "").includes(searchTerm.toLowerCase());

    const matchesStatus =
      !filters.status || internship.status === filters.status;
    const matchesCompany =
      !filters.companyId || vacancy?.company_id === filters.companyId;
    const matchesCourse =
      !filters.courseId || student?.course_id === filters.courseId;

    return matchesSearch && matchesStatus && matchesCompany && matchesCourse;
  });

  const selection = useSelection(filteredInternships);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<InternshipFormValues>({
    resolver: zodResolver(internshipSchema(t)),
    defaultValues: {
      total_workload: 400,
      daily_workload: 6,
      status: "active",
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

  const selectedStudentId = watch("student_id");

  // Auto-fill workload based on student's course
  useEffect(() => {
    if (selectedStudentId && !selectedInternship) {
      const student = students.find((a) => a.id === selectedStudentId);
      if (student?.course_id) {
        const course = courses.find((c) => c.id === student.course_id);
        if (course?.mandatory_workload) {
          setValue("total_workload", course.mandatory_workload);
        }
      }
    }
  }, [selectedStudentId, students, courses, setValue, selectedInternship]);

  const onSubmit = async (data: InternshipFormValues) => {
    try {
      if (selectedInternship) {
        await update({ id: selectedInternship.id, ...data });
        toast.success(t("internships.messages.updateSuccess"));
      } else {
        await create(data);
        toast.success(t("internships.messages.createSuccess"));
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
      toast.success(t("internships.messages.bulkUpdateSuccess"));
      setIsBulkEditOpen(false);
      selection.clearSelection();
      resetBulk();
    } catch (error) {
      toast.error(getFriendlyErrorMessage(error, t));
    }
  };

  const handleEdit = (internship: Internship) => {
    setSelectedInternship(internship);
    reset({
      student_id: internship.student_id,
      vacancy_id: internship.vacancy_id,
      advisor_id: internship.advisor_id,
      supervisor_id: internship.supervisor_id,
      start_date: internship.start_date,
      end_date: internship.end_date,
      total_workload: internship.total_workload,
      daily_workload: internship.daily_workload,
      status: internship.status,
    });
    setIsFormOpen(true);
  };

  const handleDeleteClick = (internship: Internship) => {
    setSelectedInternship(internship);
    setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedInternship) return;
    try {
      await remove(selectedInternship.id);
      toast.success(t("internships.messages.deleteSuccess"));
      setIsDeleteOpen(false);
      setSelectedInternship(null);
    } catch (error) {
      toast.error(getFriendlyErrorMessage(error, t));
    }
  };

  const confirmBulkDelete = async () => {
    try {
      await bulkRemove(selection.selectedIds);
      toast.success(t("internships.messages.bulkDeleteSuccess"));
      setIsBulkDeleteOpen(false);
      selection.clearSelection();
    } catch (error) {
      toast.error(getFriendlyErrorMessage(error, t));
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedInternship(null);
    reset();
  };

  const generatePDF = async (
    internship: Internship,
    type: "TCE" | "PLAN" | "TRE",
  ) => {
    const student = students.find((a) => a.id === internship.student_id);
    const vacancy = vacancies.find((v) => v.id === internship.vacancy_id);
    const company = companies.find((e) => e.id === vacancy?.company_id);
    const advisor = advisors.find((o) => o.id === internship.advisor_id);
    const supervisor = supervisors.find(
      (s) => s.id === internship.supervisor_id,
    );

    // School mock for template
    const school = { name: "EEEP Professor Raimundo" } as any;

    const data = {
      student: student as Student,
      company: company as Company,
      school: school as School,
      internship,
      supervisor: supervisor as Supervisor,
      advisor: advisor as Advisor,
    };

    toast.info(t("internships.messages.generating", { type }));

    try {
      let template;
      switch (type) {
        case "TCE":
          template = <TCETemplate data={data} />;
          break;
        case "PLAN":
          template = <ActivityPlanTemplate data={data} />;
          break;
        case "TRE":
          template = <TRETemplate data={data} />;
          break;
      }

      const blob = await pdf(template as any).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${type}_${student?.name.replace(/\s+/g, "_")}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success(t("internships.messages.generateSuccess", { type }));
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error(t("internships.messages.generateError", { type }));
    }
  };

  const pagination = usePagination(filteredInternships);
  const { listLayout } = useListLayout();

  if (isLoading) return <LoadingScreen />;

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-black text-blue-900 flex items-center gap-2">
            <ClipboardCheck className="text-blue-600" size={28} />{" "}
            {t("internships.title")}
          </h1>
          <p className="text-gray-500 font-medium">
            {t("internships.subtitle")}
          </p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl flex items-center justify-center gap-2 font-bold transition-all shadow-lg shadow-blue-200 active:scale-95"
        >
          <Plus size={20} /> {t("internships.new")}
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
            placeholder={t("internships.searchPlaceholder")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <ListSortControl
            options={internshipSortOptions(t)}
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
            <option value="active">{t("internships.status.active")}</option>
            <option value="completed">
              {t("internships.status.completed")}
            </option>
            <option value="interrupted">
              {t("internships.status.interrupted")}
            </option>
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

        <div>
          <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
            {t("courses.title")}
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
        {filteredInternships.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl text-center text-gray-400 font-bold border-2 border-dashed border-gray-100 col-span-full">
            {t("common.noItemsFound")}
          </div>
        ) : (
          pagination.currentItems.map((internship) => {
            const student = students.find(
              (a) => a.id === internship.student_id,
            );
            const vacancy = vacancies.find(
              (v) => v.id === internship.vacancy_id,
            );
            const company = companies.find((e) => e.id === vacancy?.company_id);

            return (
              <div
                key={internship.id}
                className={cn(
                  "bg-white p-5 rounded-2xl shadow-sm border transition-all relative group space-y-4",
                  selection.isSelected(internship.id)
                    ? "border-blue-500 ring-2 ring-blue-50"
                    : "border-gray-100",
                )}
              >
                <button
                  onClick={() => selection.toggleSelect(internship.id)}
                  className={cn(
                    "absolute top-4 right-4 p-2 rounded-lg transition-all z-10",
                    selection.isSelected(internship.id)
                      ? "text-blue-600 bg-blue-50"
                      : "text-gray-300 hover:text-gray-400 opacity-0 group-hover:opacity-100",
                  )}
                >
                  {selection.isSelected(internship.id) ? (
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
                      internship.status === "active"
                        ? "bg-green-100 text-green-700"
                        : internship.status === "completed"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-700",
                    )}
                  >
                    {t(`internships.status.${internship.status}`)}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 p-2 rounded-lg">
                    <Calendar size={14} className="text-blue-500" />
                    <span className="truncate">
                      {new Date(internship.start_date).toLocaleDateString(
                        i18n.language === "pt" ? "pt-BR" : "en-US",
                      )}{" "}
                      -{" "}
                      {new Date(internship.end_date).toLocaleDateString(
                        i18n.language === "pt" ? "pt-BR" : "en-US",
                      )}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 p-2 rounded-lg">
                    <Clock size={14} className="text-blue-500" />
                    <span>
                      {t("internships.labels.totalHours", {
                        count: internship.total_workload,
                      })}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 pt-2 border-t border-gray-50 flex-wrap">
                  <button
                    onClick={() => generatePDF(internship, "TCE")}
                    className="p-2 rounded-lg bg-blue-50 text-blue-700 font-bold hover:bg-blue-100 transition-colors text-[10px] flex items-center gap-1"
                    title={t("internships.templates.tce")}
                  >
                    <FileText size={14} /> {t("internships.templates.tce")}
                  </button>
                  <button
                    onClick={() => generatePDF(internship, "PLAN")}
                    className="p-2 rounded-lg bg-orange-50 text-orange-700 font-bold hover:bg-orange-100 transition-colors text-[10px] flex items-center gap-1"
                    title={t("internships.templates.plan")}
                  >
                    <FileText size={14} /> {t("internships.templates.plan")}
                  </button>
                  <button
                    onClick={() => generatePDF(internship, "TRE")}
                    className="p-2 rounded-lg bg-green-50 text-green-700 font-bold hover:bg-green-100 transition-colors text-[10px] flex items-center gap-1"
                    title={t("internships.templates.tre")}
                  >
                    <FileText size={14} /> {t("internships.templates.tre")}
                  </button>
                  <div className="w-full flex gap-2">
                    <button
                      onClick={() => handleEdit(internship)}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-50 text-blue-700 font-bold text-sm hover:bg-blue-100 transition-colors"
                    >
                      <Edit2 size={16} /> {t("common.edit")}
                    </button>
                    <button
                      onClick={() => handleDeleteClick(internship)}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-50 text-red-700 font-bold text-sm hover:bg-red-100 transition-colors"
                    >
                      <Trash2 size={16} /> {t("common.delete")}
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
                  {t("internships.fields.student")}
                </th>
                <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest">
                  {t("internships.fields.vacancy")}
                </th>
                <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest text-center">
                  {t("common.period", "Period")}
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
              {filteredInternships.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-gray-400 font-bold"
                  >
                    {t("common.noItemsFound")}
                  </td>
                </tr>
              ) : (
                pagination.currentItems.map((internship) => {
                  const student = students.find(
                    (a) => a.id === internship.student_id,
                  );
                  const vacancy = vacancies.find(
                    (v) => v.id === internship.vacancy_id,
                  );
                  const company = companies.find(
                    (e) => e.id === vacancy?.company_id,
                  );

                  return (
                    <tr
                      key={internship.id}
                      className={cn(
                        "hover:bg-blue-50/30 transition-colors group",
                        selection.isSelected(internship.id) && "bg-blue-50/50",
                      )}
                    >
                      <td className="px-6 py-4">
                        <button
                          onClick={() => selection.toggleSelect(internship.id)}
                          className={cn(
                            "p-1 rounded transition-colors",
                            selection.isSelected(internship.id)
                              ? "text-blue-600"
                              : "text-gray-300 hover:text-gray-400 opacity-0 group-hover:opacity-100",
                          )}
                        >
                          {selection.isSelected(internship.id) ? (
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
                        <div className="flex flex-col">
                          <span className="text-gray-900 font-medium">
                            {vacancy?.title}
                          </span>
                          <span className="text-xs text-gray-500">
                            {company?.business_name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600 font-medium text-center text-sm">
                        {new Date(internship.start_date).toLocaleDateString(
                          i18n.language === "pt" ? "pt-BR" : "en-US",
                        )}{" "}
                        -{" "}
                        {new Date(internship.end_date).toLocaleDateString(
                          i18n.language === "pt" ? "pt-BR" : "en-US",
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={cn(
                            "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                            internship.status === "active"
                              ? "bg-green-100 text-green-700"
                              : internship.status === "completed"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-gray-100 text-gray-700",
                          )}
                        >
                          {t(`internships.status.${internship.status}`)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => generatePDF(internship, "TCE")}
                            className="p-2 text-blue-600 hover:bg-white rounded-lg shadow-sm border border-transparent hover:border-blue-100 transition-all"
                            title={t("internships.templates.tce")}
                          >
                            <FileText size={16} />
                          </button>
                          <button
                            onClick={() => generatePDF(internship, "PLAN")}
                            className="p-2 text-orange-600 hover:bg-white rounded-lg shadow-sm border border-transparent hover:border-orange-100 transition-all"
                            title={t("internships.templates.plan")}
                          >
                            <FileText size={16} />
                          </button>
                          <button
                            onClick={() => generatePDF(internship, "TRE")}
                            className="p-2 text-green-600 hover:bg-white rounded-lg shadow-sm border border-transparent hover:border-green-100 transition-all"
                            title={t("internships.templates.tre")}
                          >
                            <FileText size={16} />
                          </button>
                          <button
                            onClick={() => handleEdit(internship)}
                            className="p-2 text-blue-600 hover:bg-white rounded-lg shadow-sm border border-transparent hover:border-blue-100 transition-all"
                            title={t("common.edit")}
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(internship)}
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
          selectedInternship
            ? t("internships.editTitle")
            : t("internships.newTitle")
        }
        description={t("internships.formDescription")}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="text-sm font-bold text-gray-700 ml-1">
                {t("internships.fields.student")}
              </label>
              <div className="relative mt-1">
                <User
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={16}
                />
                <select
                  {...register("student_id")}
                  className={cn(
                    "w-full pl-10 pr-3 py-2.5 rounded-lg border text-sm focus:ring-2 outline-none transition-all appearance-none bg-white",
                    errors.student_id
                      ? "border-red-500 focus:ring-red-200"
                      : "border-gray-200 focus:ring-blue-100 focus:border-blue-500",
                  )}
                >
                  <option value="">{t("students.placeholders.select")}</option>
                  {students.map((a: Student) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </div>
              {errors.student_id && (
                <p className="text-[11px] font-bold text-red-500 mt-1 ml-1">
                  {errors.student_id.message}
                </p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-bold text-gray-700 ml-1">
                {t("internships.fields.vacancy")}
              </label>
              <div className="relative mt-1">
                <Building2
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={16}
                />
                <select
                  {...register("vacancy_id")}
                  className={cn(
                    "w-full pl-10 pr-3 py-2.5 rounded-lg border text-sm focus:ring-2 outline-none transition-all appearance-none bg-white",
                    errors.vacancy_id
                      ? "border-red-500 focus:ring-red-200"
                      : "border-gray-200 focus:ring-blue-100 focus:border-blue-500",
                  )}
                >
                  <option value="">{t("vacancies.placeholders.select")}</option>
                  {vacancies.map((v: Vacancy) => {
                    const emp = companies.find(
                      (e: Company) => e.id === v.company_id,
                    );
                    return (
                      <option key={v.id} value={v.id}>
                        {v.title} ({emp?.business_name})
                      </option>
                    );
                  })}
                </select>
              </div>
              {errors.vacancy_id && (
                <p className="text-[11px] font-bold text-red-500 mt-1 ml-1">
                  {errors.vacancy_id.message}
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-bold text-gray-700 ml-1">
                {t("internships.fields.advisor")}
              </label>
              <select
                {...register("advisor_id")}
                className={cn(
                  "w-full px-3 py-2.5 mt-1 rounded-lg border text-sm focus:ring-2 outline-none transition-all appearance-none bg-white",
                  errors.advisor_id
                    ? "border-red-500 focus:ring-red-200"
                    : "border-gray-200 focus:ring-blue-100 focus:border-blue-500",
                )}
              >
                <option value="">{t("advisors.placeholders.select")}</option>
                {advisors.map((o: Advisor) => (
                  <option key={o.id} value={o.id}>
                    {o.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-bold text-gray-700 ml-1">
                {t("internships.fields.supervisor")}
              </label>
              <select
                {...register("supervisor_id")}
                className={cn(
                  "w-full px-3 py-2.5 mt-1 rounded-lg border text-sm focus:ring-2 outline-none transition-all appearance-none bg-white",
                  errors.supervisor_id
                    ? "border-red-500 focus:ring-red-200"
                    : "border-gray-200 focus:ring-blue-100 focus:border-blue-500",
                )}
              >
                <option value="">{t("supervisors.placeholders.select")}</option>
                {supervisors.map((s: Supervisor) => {
                  const emp = companies.find(
                    (e: Company) => e.id === s.company_id,
                  );
                  return (
                    <option key={s.id} value={s.id}>
                      {s.name} ({emp?.business_name})
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <label className="text-sm font-bold text-gray-700 ml-1">
                {t("internships.fields.startDate")}
              </label>
              <input
                type="date"
                {...register("start_date")}
                className={cn(
                  "w-full px-3 py-2.5 mt-1 rounded-lg border text-sm focus:ring-2 outline-none transition-all",
                  errors.start_date
                    ? "border-red-500 focus:ring-red-200"
                    : "border-gray-200 focus:ring-blue-100 focus:border-blue-500",
                )}
              />
            </div>

            <div>
              <label className="text-sm font-bold text-gray-700 ml-1">
                {t("internships.fields.endDate")}
              </label>
              <input
                type="date"
                {...register("end_date")}
                className={cn(
                  "w-full px-3 py-2.5 mt-1 rounded-lg border text-sm focus:ring-2 outline-none transition-all",
                  errors.end_date
                    ? "border-red-500 focus:ring-red-200"
                    : "border-gray-200 focus:ring-blue-100 focus:border-blue-500",
                )}
              />
            </div>

            <div>
              <label className="text-sm font-bold text-gray-700 ml-1">
                {t("internships.fields.totalWorkload")}
              </label>
              <input
                type="number"
                {...register("total_workload", { valueAsNumber: true })}
                className="w-full px-3 py-2.5 mt-1 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="text-sm font-bold text-gray-700 ml-1">
                {t("internships.fields.dailyWorkload")}
              </label>
              <input
                type="number"
                {...register("daily_workload", { valueAsNumber: true })}
                className="w-full px-3 py-2.5 mt-1 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-bold text-gray-700 ml-1">
                {t("common.status")}
              </label>
              <select
                {...register("status")}
                className="w-full px-3 py-2.5 mt-1 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all appearance-none bg-white font-bold"
              >
                <option value="active">
                  🟢 {t("internships.status.active")}
                </option>
                <option value="completed">
                  🔵 {t("internships.status.completed")}
                </option>
                <option value="interrupted">
                  🔴 {t("internships.status.interrupted")}
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
                ? t("common.saving")
                : selectedInternship
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
                {t("internships.bulkEdit.newAdvisor")}
              </label>
              <select
                {...registerBulk("advisor_id")}
                className="w-full px-3 py-2.5 mt-1 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all appearance-none bg-white"
              >
                <option value="">{t("common.keepCurrent")}</option>
                {advisors.map((o: Advisor) => (
                  <option key={o.id} value={o.id}>
                    {o.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-bold text-gray-700 ml-1">
                {t("internships.bulkEdit.newSupervisor")}
              </label>
              <select
                {...registerBulk("supervisor_id")}
                className="w-full px-3 py-2.5 mt-1 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all appearance-none bg-white"
              >
                <option value="">{t("common.keepCurrent")}</option>
                {supervisors.map((s: Supervisor) => {
                  const emp = companies.find(
                    (e: Company) => e.id === s.company_id,
                  );
                  return (
                    <option key={s.id} value={s.id}>
                      {s.name} ({emp?.business_name})
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <label className="text-sm font-bold text-gray-700 ml-1">
                {t("internships.bulkEdit.newStatus")}
              </label>
              <select
                {...registerBulk("status")}
                className="w-full px-3 py-2.5 mt-1 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all appearance-none bg-white font-bold"
              >
                <option value="">{t("common.keepCurrent")}</option>
                <option value="active">
                  🟢 {t("internships.status.active")}
                </option>
                <option value="completed">
                  🔵 {t("internships.status.completed")}
                </option>
                <option value="interrupted">
                  🔴 {t("internships.status.interrupted")}
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
