import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Páginas
import CadastroUsuarios from './pages/CadastroUsuarios';
import EditarUsuario from './pages/EditarUsuario';
import Login from './pages/Login';
import CadastroAlunos from './pages/CadastroAlunos';
import CadastroNiveis from './pages/CadastroNiveis';
import Dashboard from './pages/Dashboard';
import CadastroCidades from './pages/CadastroCidades';
import CadastroCursos from './pages/CadastroCursos';
import CadastroEscolas from './pages/CadastroEscolas';
import CadastroResponsaveis from './pages/CadastroResponsaveis';

// Componentes de Estrutura
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout'; 

function App() {
  return (
    <Router>
      <Routes>
        {/* === ROTA PÚBLICA === */}
        <Route path="/" element={<Login />} />

        {/* === ROTAS PROTEGIDAS === */}
        <Route element={<PrivateRoute />}>
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/alunos" element={<CadastroAlunos />} />
            <Route path="/cursos" element={<CadastroCursos />} />
            <Route path="/niveis" element={<CadastroNiveis />} />
            <Route path="/usuarios" element={<CadastroUsuarios />} />
            <Route path="/cidades" element={<CadastroCidades />} />
            <Route path="/usuarios/editar/:id" element={<EditarUsuario />} />
            <Route path="/escolas" element={<CadastroEscolas />} />
            <Route path="/responsaveis" element={<CadastroResponsaveis />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
