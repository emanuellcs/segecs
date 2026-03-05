import React from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import LoginPage from '@/features/auth/pages/LoginPage';
import PrivateRoute from '@/features/auth/components/PrivateRoute';
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

// Placeholder para o Layout que será migrado
const LayoutPlaceholder = ({ children }: { children: React.ReactNode }) => (
  <div className="flex min-h-screen bg-gray-50">
    <aside className="w-64 bg-blue-900 text-white p-6 sticky top-0 h-screen overflow-y-auto">
      <h2 className="text-2xl font-bold mb-8">SEGECS</h2>
      <nav className="space-y-1">
        <Link to="/dashboard" className="block p-2 hover:bg-blue-800 rounded transition-colors">Dashboard</Link>
        
        <div className="pt-4 pb-2 text-xs font-semibold text-blue-300 uppercase tracking-wider">Operacional</div>
        <Link to="/vagas" className="block p-2 hover:bg-blue-800 rounded transition-colors">Vagas</Link>
        <Link to="/estagios" className="block p-2 hover:bg-blue-800 rounded transition-colors">Alocação (TCE)</Link>
        <Link to="/frequencia" className="block p-2 hover:bg-blue-800 rounded transition-colors">Frequência</Link>

        <div className="pt-4 pb-2 text-xs font-semibold text-blue-300 uppercase tracking-wider">Cadastros Base</div>
        <Link to="/cidades" className="block p-2 hover:bg-blue-800 rounded transition-colors">Cidades</Link>
        <Link to="/niveis" className="block p-2 hover:bg-blue-800 rounded transition-colors">Níveis</Link>
        <Link to="/escolas" className="block p-2 hover:bg-blue-800 rounded transition-colors">Escolas</Link>
        <Link to="/cursos" className="block p-2 hover:bg-blue-800 rounded transition-colors">Cursos</Link>
        
        <div className="pt-4 pb-2 text-xs font-semibold text-blue-300 uppercase tracking-wider">Pessoas & Parceiros</div>
        <Link to="/responsaveis" className="block p-2 hover:bg-blue-800 rounded transition-colors">Responsáveis</Link>
        <Link to="/alunos" className="block p-2 hover:bg-blue-800 rounded transition-colors">Alunos</Link>
        <Link to="/orientadores" className="block p-2 hover:bg-blue-800 rounded transition-colors">Orientadores</Link>
        <Link to="/empresas" className="block p-2 hover:bg-blue-800 rounded transition-colors">Empresas</Link>
        <Link to="/supervisores" className="block p-2 hover:bg-blue-800 rounded transition-colors">Supervisores</Link>
      </nav>
    </aside>
    <main className="flex-1 overflow-auto">
      {children}
    </main>
  </div>
);

const DashboardPlaceholder = () => (
  <div className="p-8">
    <h1 className="text-2xl font-bold">Dashboard</h1>
    <p>Bem-vindo ao SEGECS.</p>
  </div>
);

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <LayoutPlaceholder>
              <DashboardPlaceholder />
            </LayoutPlaceholder>
          </PrivateRoute>
        }
      />

      <Route path="/cidades" element={<PrivateRoute><LayoutPlaceholder><CidadesPage /></LayoutPlaceholder></PrivateRoute>} />
      <Route path="/niveis" element={<PrivateRoute><LayoutPlaceholder><NiveisPage /></LayoutPlaceholder></PrivateRoute>} />
      <Route path="/escolas" element={<PrivateRoute><LayoutPlaceholder><EscolasPage /></LayoutPlaceholder></PrivateRoute>} />
      <Route path="/cursos" element={<PrivateRoute><LayoutPlaceholder><CursosPage /></LayoutPlaceholder></PrivateRoute>} />
      <Route path="/responsaveis" element={<PrivateRoute><LayoutPlaceholder><ResponsaveisPage /></LayoutPlaceholder></PrivateRoute>} />
      <Route path="/alunos" element={<PrivateRoute><LayoutPlaceholder><AlunosPage /></LayoutPlaceholder></PrivateRoute>} />
      <Route path="/empresas" element={<PrivateRoute><LayoutPlaceholder><EmpresasPage /></LayoutPlaceholder></PrivateRoute>} />
      <Route path="/orientadores" element={<PrivateRoute><LayoutPlaceholder><OrientadoresPage /></LayoutPlaceholder></PrivateRoute>} />
      <Route path="/supervisores" element={<PrivateRoute><LayoutPlaceholder><SupervisoresPage /></LayoutPlaceholder></PrivateRoute>} />
      <Route path="/vagas" element={<PrivateRoute><LayoutPlaceholder><VagasPage /></LayoutPlaceholder></PrivateRoute>} />
      <Route path="/estagios" element={<PrivateRoute><LayoutPlaceholder><EstagiosPage /></LayoutPlaceholder></PrivateRoute>} />
      <Route path="/frequencia" element={<PrivateRoute><LayoutPlaceholder><FrequenciaPage /></LayoutPlaceholder></PrivateRoute>} />

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
