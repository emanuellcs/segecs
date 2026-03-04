import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const Layout = () => {
  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar fixo na esquerda */}
      <Sidebar />

      {/* Conteúdo da página (Outlet) */}
      <div className="flex-1 overflow-auto p-6">
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;
