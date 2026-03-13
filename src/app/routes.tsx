import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "@/features/auth/pages/LoginPage";
import PrivateRoute from "@/features/auth/components/PrivateRoute";
import AppLayout from "@/layouts/AppLayout";

import CitiesPage from "@/features/cities/pages/CitiesPage";
import LevelsPage from "@/features/levels/pages/LevelsPage";
import SchoolsPage from "@/features/schools/pages/SchoolsPage";
import CoursesPage from "@/features/courses/pages/CoursesPage";
import GuardiansPage from "@/features/guardians/pages/GuardiansPage";
import StudentsPage from "@/features/students/pages/StudentsPage";
import CompaniesPage from "@/features/companies/pages/CompaniesPage";
import AdvisorsPage from "@/features/advisors/pages/AdvisorsPage";
import SupervisorsPage from "@/features/supervisors/pages/SupervisorsPage";
import VacanciesPage from "@/features/internships/pages/VacanciesPage";
import InternshipsPage from "@/features/internships/pages/InternshipsPage";
import FrequencyPage from "@/features/frequency/pages/FrequencyPage";
import EvaluationsPage from "@/features/evaluations/pages/EvaluationsPage";
import SocialProjectsPage from "@/features/social_projects/pages/SocialProjectsPage";
import VisitsPage from "@/features/visits/pages/VisitsPage";
import DashboardPage from "@/features/dashboard/pages/DashboardPage";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Route */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected Private Routes */}
      <Route
        element={
          <PrivateRoute>
            <AppLayout />
          </PrivateRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/cities" element={<CitiesPage />} />
        <Route path="/levels" element={<LevelsPage />} />
        <Route path="/schools" element={<SchoolsPage />} />
        <Route path="/courses" element={<CoursesPage />} />
        <Route path="/guardians" element={<GuardiansPage />} />
        <Route path="/students" element={<StudentsPage />} />
        <Route path="/companies" element={<CompaniesPage />} />
        <Route path="/advisors" element={<AdvisorsPage />} />
        <Route path="/supervisors" element={<SupervisorsPage />} />
        <Route path="/vacancies" element={<VacanciesPage />} />
        <Route path="/internships" element={<InternshipsPage />} />
        <Route path="/frequency" element={<FrequencyPage />} />
        <Route path="/evaluations" element={<EvaluationsPage />} />
        <Route path="/social-projects" element={<SocialProjectsPage />} />
        <Route path="/visits" element={<VisitsPage />} />
      </Route>

      {/* Default Redirects */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
