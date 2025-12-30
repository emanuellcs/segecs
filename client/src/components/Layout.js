import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';

const Layout = () => {
  const location = useLocation();
  const [renderKey, setRenderKey] = useState(0);

  // Força remontagem completa ao mudar de rota
  useEffect(() => {
    setRenderKey(prev => prev + 1);
  }, [location.pathname]);
  
  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* 1. O Sidebar fica fixo na esquerda */}
      <Sidebar />

      {/* 2. O conteúdo da página (Outlet) com chave para forçar remontagem */}
      <div className="flex-1 overflow-auto">
        <div key={renderKey}>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout;
