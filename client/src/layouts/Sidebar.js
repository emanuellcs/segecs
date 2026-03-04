import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  FaHome, FaUserGraduate, FaUsers, FaUserTie, 
  FaLayerGroup, FaCity, FaBook, FaSchool, FaTimes 
} from 'react-icons/fa';

function Sidebar({ onClose }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const location = useLocation();
  const currentPath = location.pathname;

  useEffect(() => {
    const userStorage = localStorage.getItem('user');
    if (userStorage) {
      setUser(JSON.parse(userStorage));
    }
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const isActive = (path) => {
    return currentPath === path 
      ? "bg-blue-800 border-l-4 border-yellow-400 text-white" 
      : "text-blue-100 hover:bg-blue-800 hover:text-white";
  };

  const showAdminMenu = user && user.id_nivel === 1;

  const NavLink = ({ to, icon: Icon, children }) => (
    <Link 
      to={to} 
      onClick={onClose}
      className={`flex items-center gap-4 px-6 py-3 transition-all duration-200 ${isActive(to)}`}
    >
      <Icon className="text-lg" />
      <span className="font-medium">{children}</span>
    </Link>
  );

  return (
    <div className="flex flex-col h-full">
      {/* Logo e Botão Fechar (Mobile) */}
      <div className="flex items-center justify-between p-6 border-b border-blue-800">
        <h2 className="text-2xl font-black tracking-tighter text-white">SEGECS</h2>
        <button onClick={onClose} className="text-blue-200 lg:hidden">
          <FaTimes size={20} />
        </button>
      </div>

      {/* Info Usuário */}
      <div className="px-6 py-4 bg-blue-800/50">
        <p className="text-xs text-blue-300 uppercase font-bold tracking-widest mb-1">Usuário</p>
        <p className="text-sm text-white font-medium truncate">
          {user ? user.nome : 'Carregando...'}
        </p>
      </div>

      {/* Navegação */}
      <nav className="flex-1 mt-4 overflow-y-auto scrollbar-thin scrollbar-thumb-blue-700">
        <NavLink to="/dashboard" icon={FaHome}>Dashboard</NavLink>
        <NavLink to="/cidades" icon={FaCity}>Cidades</NavLink>
        <NavLink to="/escolas" icon={FaSchool}>Escolas</NavLink>
        <NavLink to="/cursos" icon={FaBook}>Cursos</NavLink>
        <NavLink to="/alunos" icon={FaUserGraduate}>Alunos</NavLink>
        <NavLink to="/responsaveis" icon={FaUserTie}>Responsáveis</NavLink>

        {showAdminMenu && (
          <div className="mt-6">
            <p className="px-6 py-2 text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">Administração</p>
            <NavLink to="/niveis" icon={FaLayerGroup}>Níveis de Acesso</NavLink>
            <NavLink to="/usuarios" icon={FaUsers}>Usuários</NavLink>
          </div>
        )}
      </nav>

      {/* Footer / Logout */}
      <div className="p-4 bg-blue-950/30">
        <button 
          onClick={handleLogout} 
          className="w-full flex items-center justify-center gap-2 p-3 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white rounded-xl text-sm font-bold transition-all duration-300"
        >
          Sair do Sistema
        </button>
      </div>
    </div>
  );
}

export default Sidebar;
