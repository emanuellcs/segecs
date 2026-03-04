import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '@/layouts/Sidebar';
import { FaBars } from 'react-icons/fa';

const AppLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      {/* Overlay para fechar o sidebar no mobile ao clicar fora */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black bg-opacity-50 transition-opacity lg:hidden"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* Sidebar - Agora com controle de visibilidade responsivo */}
      <div className={`
        fixed inset-y-0 left-0 z-30 w-64 transform bg-blue-900 transition duration-300 ease-in-out lg:static lg:inset-0 lg:translate-x-0
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <Sidebar onClose={() => setIsSidebarOpen(false)} />
      </div>

      {/* Conteúdo Principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header Mobile - Visível apenas em telas menores que LG */}
        <header className="flex items-center justify-between px-6 py-4 bg-white border-b lg:hidden">
          <div className="flex items-center">
            <button onClick={toggleSidebar} className="text-gray-500 focus:outline-none">
              <FaBars className="h-6 w-6" />
            </button>
            <span className="ml-4 text-2xl font-black text-blue-900">SEGECS</span>
          </div>
        </header>

        {/* Área de Scroll do Conteúdo */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl animate-fadeIn">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
