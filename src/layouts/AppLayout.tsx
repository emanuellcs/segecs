import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Menu, RefreshCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import Sidebar from './Sidebar';

export default function AppLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const location = useLocation();
  const queryClient = useQueryClient();

  // Fecha o menu mobile ao mudar de rota
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Impede o scroll do body quando o menu mobile está aberto
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMobileMenuOpen]);

  const handleSync = async () => {
    setIsRefreshing(true);
    try {
      await queryClient.refetchQueries();
      toast.success('Dados sincronizados com o banco de dados!');
    } catch (error) {
      toast.error('Erro ao sincronizar dados.');
      console.error(error);
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50/50 text-slate-900">
      {/* Sidebar Desktop (fina/fixa em lg+) */}
      <div className="hidden lg:block w-64 shrink-0">
        <div className="fixed inset-y-0 left-0 w-64">
          <Sidebar />
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 z-50 w-[280px] lg:hidden"
            >
              <Sidebar onClose={() => setIsMobileMenuOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header - visible on both mobile and desktop */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Abrir menu"
            >
              <Menu size={24} />
            </button>
            <div className="ml-4 lg:ml-0">
              <h1 className="text-xl font-black tracking-tighter text-blue-900 lg:hidden">SEGECS</h1>
              <div className="hidden lg:block">
                {/* Você pode adicionar um título dinâmico aqui se desejar */}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSync}
              disabled={isRefreshing}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-300 border shadow-sm ${
                isRefreshing
                  ? 'bg-blue-50 text-blue-400 border-blue-100'
                  : 'bg-white text-blue-700 border-blue-200 hover:bg-blue-50 hover:border-blue-400 active:scale-95'
              }`}
              title="Sincronizar com Banco de Dados"
            >
              <RefreshCcw size={14} className={isRefreshing ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">Sincronizar Dados</span>
              <span className="sm:hidden text-[10px]">Sincronizar</span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          <div className="container mx-auto p-4 md:p-8 animate-in fade-in duration-500">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
