import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '@/features/auth/pages/LoginPage';
import PrivateRoute from '@/features/auth/components/PrivateRoute';
import AppLayout from '@/layouts/AppLayout';

import CidadesPage from '@/features/cidades/pages/CidadesPage';
import NiveisPage from '@/features/niveis/pages/NiveisPage';
import EscolasPage from '@/features/escolas/pages/EscolasPage';
import CursosPage from '@/features/cursos/pages/CursosPage';
import ResponsaveisPage from '@/features/responsaveis/pages/ResponsaveisPage';
import AlunosPage from '@/features/alunos/pages/AlunosPage';
import EmpresasPage from '@/features/empresas/pages/EmpresasPage';
import OrientadoresPage from '@/features/orientadores/pages/OrientadoresPage';
import SupervisoresPage from '@/features/supervisores/pages/SupervisoresPage';
import VagasPage from '@/features/estagios/pages/VagasPage';
import EstagiosPage from '@/features/estagios/pages/EstagiosPage';
import FrequenciaPage from '@/features/frequencia/pages/FrequenciaPage';
import AvaliacoesPage from '@/features/avaliacoes/pages/AvaliacoesPage';
import ProjetosSociaisPage from '@/features/projetos/pages/ProjetosSociaisPage';
import DashboardPage from '@/features/dashboard/pages/DashboardPage';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Rota pública */}
      <Route path="/login" element={<LoginPage />} />

      {/* Rotas privadas protegidas */}
      <Route
        element={
          <PrivateRoute>
            <AppLayout />
          </PrivateRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/cidades" element={<CidadesPage />} />
        <Route path="/niveis" element={<NiveisPage />} />
        <Route path="/escolas" element={<EscolasPage />} />
        <Route path="/cursos" element={<CursosPage />} />
        <Route path="/responsaveis" element={<ResponsaveisPage />} />
        <Route path="/alunos" element={<AlunosPage />} />
        <Route path="/empresas" element={<EmpresasPage />} />
        <Route path="/orientadores" element={<OrientadoresPage />} />
        <Route path="/supervisores" element={<SupervisoresPage />} />
        <Route path="/vagas" element={<VagasPage />} />
        <Route path="/estagios" element={<EstagiosPage />} />
        <Route path="/frequencia" element={<FrequenciaPage />} />
        <Route path="/avaliacoes" element={<AvaliacoesPage />} />
        <Route path="/projetos" element={<ProjetosSociaisPage />} />
      </Route>

      {/* Redirecionamentos padrão */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
