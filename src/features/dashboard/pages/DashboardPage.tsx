import {
  Users,
  Briefcase,
  AlertTriangle,
  Clock,
  TrendingUp,
  FileSpreadsheet,
  LayoutDashboard,
  ArrowRight,
  GraduationCap,
  Building2,
  CheckCircle2,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { useTranslation } from "react-i18next";

export default function DashboardPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const { data: stats, isLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const today = new Date();
      const next15Days = new Date();
      next15Days.setDate(today.getDate() + 15);

      const [students, internships, frequencies, vacancies, evaluations] =
        await Promise.all([
          supabase.from("students").select("*", { count: "exact" }),
          supabase
            .from("internships")
            .select("id, status, created_at, student_id, end_date", {
              count: "exact",
            })
            .order("created_at", { ascending: false }),
          supabase.from("frequencies").select("performed_hours"),
          supabase
            .from("vacancies")
            .select("id", { count: "exact" })
            .eq("status", "open"),
          supabase.from("evaluations").select("internship_id"),
        ]);

      const totalHours =
        frequencies.data?.reduce((acc, f) => acc + f.performed_hours, 0) || 0;
      const activeInternshipsArr =
        internships.data?.filter((e) => e.status === "active") || [];
      const activeInternshipsCount = activeInternshipsArr.length;

      // Compliance: Contracts Expiring (Next 15 days)
      const expiringCount = activeInternshipsArr.filter((e) => {
        const endDate = new Date(e.end_date);
        return endDate >= today && endDate <= next15Days;
      }).length;

      // Compliance: Pending Evaluations (Active internships without any grade)
      const internshipsWithEvaluation = new Set(
        evaluations.data?.map((a) => a.internship_id),
      );
      const withoutEvaluationCount = activeInternshipsArr.filter(
        (e) => !internshipsWithEvaluation.has(e.id),
      ).length;

      // Distribution by status
      const statusDistribution = {
        pending:
          students.data?.filter((a) => a.status === "pending").length || 0,
        interning:
          students.data?.filter((a) => a.status === "interning").length || 0,
        completed:
          students.data?.filter((a) => a.status === "completed").length || 0,
      };

      // Last 5 internships with student details
      const recentInternshipsIds =
        internships.data?.slice(0, 5).map((e) => e.student_id) || [];
      const { data: recentStudents } = await supabase
        .from("students")
        .select("id, name")
        .in("id", recentInternshipsIds);

      const recentActivities =
        internships.data?.slice(0, 5).map((e) => ({
          ...e,
          studentName:
            recentStudents?.find((a) => a.id === e.student_id)?.name ||
            t("common.student", "Student"),
        })) || [];

      return {
        totalStudents: students.count || 0,
        activeInternships: activeInternshipsCount,
        totalHours,
        openVacancies: vacancies.count || 0,
        statusDistribution,
        recentActivities,
        compliance: {
          expiring: expiringCount,
          withoutEvaluation: withoutEvaluationCount,
          totalAlerts: expiringCount + withoutEvaluationCount,
        },
      };
    },
  });

  const handleExportSICE = async () => {
    try {
      const { data: internships, error } = await supabase.from("internships")
        .select(`
          id, status, start_date, end_date, total_workload, daily_workload,
          students (name, registration, cpf, courses (name)),
          vacancies (title, companies (business_name, cnpj)),
          advisors (name),
          supervisors (name)
        `);

      if (error) throw error;
      if (!internships || internships.length === 0) {
        toast.error(t("dashboard.messages.noDataToExport"));
        return;
      }

      const headers = [
        "Internship ID",
        "Student Name",
        "Registration",
        "Student CPF",
        "Course",
        "Company",
        "CNPJ",
        "Vacancy",
        "Advisor",
        "Supervisor",
        "Start",
        "End",
        "Total Workload",
        "Daily Workload",
        "Status",
      ];
      const csvData = internships.map((e) => {
        const student = e.students as any;
        const vacancy = e.vacancies as any;
        return [
          e.id,
          student?.name,
          student?.registration,
          student?.cpf,
          student?.courses?.name,
          vacancy?.companies?.business_name,
          vacancy?.companies?.cnpj,
          vacancy?.title,
          (e.advisors as any)?.name,
          (e.supervisors as any)?.name,
          e.start_date,
          e.end_date,
          e.total_workload,
          e.daily_workload,
          e.status,
        ];
      });

      const escapeCSV = (field: any) =>
        `"${String(field || "").replace(/"/g, '""')}"`;
      const csvContent = [
        headers.join(","),
        ...csvData.map((row) => row.map(escapeCSV).join(",")),
      ].join("\n");
      const blob = new Blob(["\ufeff" + csvContent], {
        type: "text/csv;charset=utf-8;",
      });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `detailed_sice_report_${new Date().toISOString().split("T")[0]}.csv`;
      link.click();
      toast.success(t("dashboard.messages.reportExported"));
    } catch (error) {
      toast.error(t("dashboard.messages.exportError"));
    }
  };

  const cards = [
    {
      label: t("dashboard.cards.totalStudents"),
      value: stats?.totalStudents,
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: t("dashboard.cards.activeInternships"),
      value: stats?.activeInternships,
      icon: Briefcase,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: t("dashboard.cards.totalHours"),
      value: `${stats?.totalHours}h`,
      icon: Clock,
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
    {
      label: t("dashboard.cards.openVacancies"),
      value: stats?.openVacancies,
      icon: TrendingUp,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
  ];

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 pb-12"
    >
      {/* Header Section */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-blue-900 rounded-2xl text-white shadow-xl shadow-blue-900/20">
            <LayoutDashboard size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-blue-900 tracking-tight leading-none">
              {t("dashboard.title")}
            </h1>
            <p className="text-gray-500 font-medium mt-1">
              {t("dashboard.subtitle")}
            </p>
          </div>
        </div>
        <button
          onClick={handleExportSICE}
          className="flex items-center gap-3 px-6 py-4 bg-blue-50 text-blue-700 rounded-2xl font-bold text-xs uppercase tracking-wider hover:bg-blue-100 transition-all active:scale-95"
        >
          <FileSpreadsheet size={18} /> {t("dashboard.actions.exportSICE")}
        </button>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4 transition-all hover:shadow-lg group"
          >
            <div
              className={cn(
                "p-4 rounded-2xl transition-all group-hover:rotate-6",
                card.bg,
              )}
            >
              <card.icon className={card.color} size={28} />
            </div>
            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1">
                {card.label}
              </p>
              <h2 className="text-3xl font-bold text-blue-900 tracking-tight">
                {card.value}
              </h2>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Distribution & Activities */}
        <div className="lg:col-span-2 space-y-8">
          {/* Student Distribution */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-blue-900 mb-8 flex items-center gap-2">
              <GraduationCap className="text-blue-600" size={20} />{" "}
              {t("dashboard.sections.distribution")}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  label: t("students.status.pending"),
                  value: stats?.statusDistribution.pending ?? 0,
                  color: "bg-amber-400",
                  total: stats?.totalStudents,
                },
                {
                  label: t("students.status.interning"),
                  value: stats?.statusDistribution.interning ?? 0,
                  color: "bg-green-500",
                  total: stats?.totalStudents,
                },
                {
                  label: t("students.status.completed"),
                  value: stats?.statusDistribution.completed ?? 0,
                  color: "bg-blue-600",
                  total: stats?.totalStudents,
                },
              ].map((item, idx) => {
                const percentage = item.total
                  ? Math.round((item.value / item.total) * 100)
                  : 0;
                return (
                  <div key={idx} className="space-y-3">
                    <div className="flex justify-between items-end">
                      <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                        {item.label}
                      </span>
                      <span className="text-sm font-bold text-blue-900">
                        {item.value} ({percentage}%)
                      </span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 1, delay: idx * 0.2 }}
                        className={cn("h-full rounded-full", item.color)}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Activities */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-lg font-bold text-blue-900 flex items-center gap-2">
                <Clock className="text-orange-500" size={20} />{" "}
                {t("dashboard.sections.recentAllocations")}
              </h3>
              <button
                onClick={() => navigate("/internships")}
                className="text-blue-600 text-[10px] font-bold uppercase tracking-widest hover:underline flex items-center gap-1"
              >
                {t("common.viewAll")} <ArrowRight size={14} />
              </button>
            </div>
            <div className="space-y-4">
              {stats?.recentActivities.map((activity, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-2xl transition-colors border border-transparent hover:border-gray-100"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-xs">
                      {activity.studentName.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {activity.studentName}
                      </p>
                      <p className="text-[10px] text-gray-400 uppercase font-semibold tracking-tight">
                        {t("dashboard.labels.startedOn")}{" "}
                        {new Date(activity.created_at).toLocaleDateString(
                          i18n.language === "pt" ? "pt-BR" : "en-US",
                        )}
                      </p>
                    </div>
                  </div>
                  <span
                    className={cn(
                      "px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider",
                      activity.status === "active"
                        ? "bg-green-100 text-green-700"
                        : "bg-blue-100 text-blue-700",
                    )}
                  >
                    {
                      t(
                        `common.statusLabels.${activity.status}`,
                        activity.status,
                      ) as string
                    }
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Intelligence */}
        <div className="space-y-8">
          {/* Quick Alerts */}
          <div
            className={cn(
              "p-8 rounded-3xl shadow-xl transition-all duration-500 relative overflow-hidden group",
              (stats?.compliance.totalAlerts ?? 0) > 0
                ? "bg-blue-900 text-white shadow-blue-900/30"
                : "bg-green-600 text-white shadow-green-600/20",
            )}
          >
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 transition-transform duration-500">
              {(stats?.compliance.totalAlerts ?? 0) > 0 ? (
                <AlertTriangle size={80} />
              ) : (
                <CheckCircle2 size={80} />
              )}
            </div>

            <h3 className="text-lg font-bold mb-6 relative z-10 flex items-center gap-2">
              {t("dashboard.compliance.title")}
              {(stats?.compliance.totalAlerts ?? 0) > 0 ? (
                <span className="bg-orange-500 text-[10px] px-2 py-0.5 rounded-full uppercase font-bold">
                  {stats?.compliance.totalAlerts}{" "}
                  {t("dashboard.compliance.alerts")}
                </span>
              ) : (
                <span className="bg-white/20 text-[10px] px-2 py-0.5 rounded-full uppercase font-bold">
                  {t("dashboard.compliance.ok")}
                </span>
              )}
            </h3>

            <div className="space-y-6 relative z-10">
              {(stats?.compliance.totalAlerts ?? 0) > 0 ? (
                <>
                  {stats?.compliance.expiring ? (
                    <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/10">
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-blue-300 mb-1">
                        {t("dashboard.compliance.deadlines")}
                      </p>
                      <p className="text-sm font-semibold">
                        {t("dashboard.compliance.expiringInternships", {
                          count: stats.compliance.expiring,
                        })}
                      </p>
                      <button
                        onClick={() => navigate("/internships")}
                        className="mt-3 text-[10px] font-bold uppercase tracking-widest text-orange-400 hover:text-orange-300 transition-colors"
                      >
                        {t("dashboard.compliance.solveNow")} →
                      </button>
                    </div>
                  ) : null}

                  {stats?.compliance.withoutEvaluation ? (
                    <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/10">
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-blue-300 mb-1">
                        {t("dashboard.compliance.evaluations")}
                      </p>
                      <p className="text-sm font-semibold">
                        {t("dashboard.compliance.pendingEvaluations", {
                          count: stats.compliance.withoutEvaluation,
                        })}
                      </p>
                      <button
                        onClick={() => navigate("/evaluations")}
                        className="mt-3 text-[10px] font-bold uppercase tracking-widest text-orange-400 hover:text-orange-300 transition-colors"
                      >
                        {t("dashboard.compliance.enterGrades")} →
                      </button>
                    </div>
                  ) : null}
                </>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm font-bold text-green-50">
                    {t("dashboard.compliance.allInOrder")}
                  </p>
                  <p className="text-[10px] font-medium text-green-100/70 mt-1 uppercase tracking-widest">
                    {t("dashboard.compliance.noCriticalIssues")}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Featured Partners */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-blue-900 mb-6 flex items-center gap-2">
              <Building2 className="text-purple-600" size={20} />{" "}
              {t("dashboard.sections.openVacancies")}
            </h3>
            <div className="bg-purple-50 p-6 rounded-2xl text-center border border-purple-100">
              <p className="text-3xl font-bold text-purple-700">
                {stats?.openVacancies}
              </p>
              <p className="text-[10px] font-semibold text-purple-400 uppercase tracking-widest mt-1">
                {t("dashboard.labels.availableOpportunities")}
              </p>
              <button
                onClick={() => navigate("/vacancies")}
                className="w-full mt-4 bg-white py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest text-purple-700 shadow-sm hover:shadow-md transition-all active:scale-95"
              >
                {t("dashboard.actions.manageVacancies")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
