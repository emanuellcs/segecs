import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaHome, FaUserGraduate, FaUsers, FaUserTie, FaLayerGroup, FaCity, FaBook, FaSchool } from 'react-icons/fa';

function Sidebar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const location = useLocation();
  const currentPath = location.pathname;

  // Carregar usuário ao montar E quando a rota muda
  useEffect(() => {
    const userStorage = localStorage.getItem('user');
    if (userStorage) {
      setUser(JSON.parse(userStorage));
    } else {
      setUser(null);
    }
  }, [location.pathname]);  // Recarrega quando muda de rota

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user'); // Limpa os dados
    navigate('/');
  };

  const isActive = (path) => {
    return currentPath === path
      ? "bg-blue-800 border-r-4 border-yellow-400"
      : "hover:bg-blue-800";
  };

  // Verificar se deve mostrar menu admin
  const showAdminMenu = user && user.id_nivel === 1;

  return (
    <div className="w-64 bg-blue-900 min-h-screen text-white flex flex-col shadow-xl">
      <div className="p-6 text-center border-b border-blue-800">
        <h2 className="text-2xl font-bold">SEGECS</h2>
        <p className="text-xs text-gray-400 mt-1">
          {user ? `Olá, ${user.nome.split(' ')[0]}` : 'Carregando...'}
        </p>
      </div>

      <nav className="flex-1 mt-6">

        {/* TODOS veem Dashboard e Alunos */}
        <Link to="/dashboard" className={`flex items-center gap-4 px-6 py-3 hover:bg-blue-800 transition ${isActive('/dashboard')}`}>
          <FaHome size={24} /> Dashboard
        </Link>

        <Link to="/cidades" className={`flex items-center gap-4 px-6 py-3 hover:bg-blue-800 transition ${isActive('/cidades')}`}>
          <FaCity size={24} /> Cidades
        </Link>

        <Link to="/escolas" className={`flex items-center gap-4 px-6 py-3 hover:bg-blue-800 transition ${isActive('/escolas')}`}>
          <FaSchool size={24} /> Escolas
        </Link>

        <Link to="/cursos" className={`flex items-center gap-4 px-6 py-3 hover:bg-blue-800 transition ${isActive('/cursos')}`}>
          <FaBook size={24} /> Cursos
        </Link>

        <Link to="/alunos" className={`flex items-center gap-4 px-6 py-3 hover:bg-blue-800 transition ${isActive('/alunos')}`}>
          <FaUserGraduate size={24} /> Alunos
        </Link>

        <Link to="/responsaveis" className={`flex items-center gap-4 px-6 py-3 hover:bg-blue-800 transition ${isActive('/responsaveis')}`}>
          <FaUserTie size={24} /> Responsáveis
        </Link>


        {/* --- ÁREA RESTRITA (Só Nível 1 - Admin) --- */}
        {showAdminMenu && (
          <>
            <div className="pt-4 pb-2 px-4 text-xs text-gray-400 uppercase font-bold">
              Administração
            </div>

            <Link to="/niveis" className={`flex items-center gap-4 px-6 py-3 hover:bg-blue-800 transition ${isActive('/niveis')}`}>
              <FaLayerGroup size={24} /> Níveis de Acesso
            </Link>

            <Link to="/usuarios" className={`flex items-center gap-4 px-6 py-3 hover:bg-blue-800 transition ${isActive('/usuarios')}`}>
              <FaUsers size={24} /> Usuários
            </Link>

          </>
        )}

      </nav>

      <div className="p-4 border-t border-blue-800">
        <button onClick={handleLogout} className="w-full flex items-center justify-center p-2 bg-red-600 hover:bg-red-700 rounded text-sm font-bold transition">
          Sair
        </button>
      </div>
    </div>
  );
}

export default Sidebar;
