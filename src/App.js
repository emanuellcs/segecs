import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Features - Auth
import PrivateRoute from '@/features/auth/components/PrivateRoute';
import LoginPage from '@/features/auth/pages/LoginPage';

// Features - Outros
import DashboardPage from '@/features/dashboard/pages/DashboardPage';
import AlunosPage from '@/features/alunos/pages/AlunosPage';
import CursosPage from '@/features/cursos/pages/CursosPage';
import NiveisPage from '@/features/niveis/pages/NiveisPage';
import UsuariosPage from '@/features/usuarios/pages/UsuariosPage';
import CidadesPage from '@/features/cidades/pages/CidadesPage';
import EditarUsuarioPage from '@/features/usuarios/pages/EditarUsuarioPage';
import EscolasPage from '@/features/escolas/pages/EscolasPage';
import ResponsaveisPage from '@/features/responsaveis/pages/ResponsaveisPage';

// Layout
import AppLayout from '@/layouts/AppLayout';

function App() {
  return (
    <Router>
      <Routes>
        {/* === ROTA PÚBLICA === */}
        <Route path="/" element={<LoginPage />} />

        {/* === ROTAS PROTEGIDAS === */}
        <Route element={<PrivateRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/alunos" element={<AlunosPage />} />
            <Route path="/cursos" element={<CursosPage />} />
            <Route path="/niveis" element={<NiveisPage />} />
            <Route path="/usuarios" element={<UsuariosPage />} />
            <Route path="/cidades" element={<CidadesPage />} />
            <Route path="/usuarios/editar/:id" element={<EditarUsuarioPage />} />
            <Route path="/escolas" element={<EscolasPage />} />
            <Route path="/responsaveis" element={<ResponsaveisPage />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
