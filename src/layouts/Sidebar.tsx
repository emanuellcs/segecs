import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  MapPin,
  Layers,
  School,
  BookOpen,
  Users,
  GraduationCap,
  Building2,
  UserCheck,
  UserCog,
  Briefcase,
  ClipboardCheck,
  Clock,
  Award,
  Heart,
  LogOut,
  Info,
  X,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { AboutModal } from '@/components/ui/AboutModal';

const menuItems = [
  { group: 'Principal', items: [{ to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard }] },
  {
    group: 'Operacional',
    items: [
      { to: '/vagas', label: 'Vagas', icon: Briefcase },
      { to: '/estagios', label: 'Alocação (TCE)', icon: ClipboardCheck },
      { to: '/frequencia', label: 'Frequência', icon: Clock },
    ],
  },
  {
    group: 'Avaliação & Conclusão',
    items: [
      { to: '/avaliacoes', label: 'Avaliações', icon: Award },
      { to: '/projetos', label: 'Projetos Sociais', icon: Heart },
    ],
  },
  {
    group: 'Pessoas & Parceiros',
    items: [
      { to: '/alunos', label: 'Alunos', icon: GraduationCap },
      { to: '/responsaveis', label: 'Responsáveis', icon: Users },
      { to: '/orientadores', label: 'Orientadores', icon: UserCheck },
      { to: '/supervisores', label: 'Supervisores', icon: UserCog },
      { to: '/empresas', label: 'Empresas', icon: Building2 },
    ],
  },
  {
    group: 'Configurações Base',
    items: [
      { to: '/cidades', label: 'Cidades', icon: MapPin },
      { to: '/niveis', label: 'Níveis', icon: Layers },
      { to: '/escolas', label: 'Escolas', icon: School },
      { to: '/cursos', label: 'Cursos', icon: BookOpen },
    ],
  },
];

interface SidebarProps {
  onClose?: () => void;
  className?: string;
  isCollapsed?: boolean;
}

export default function Sidebar({ onClose, className, isCollapsed = false }: SidebarProps) {
  const { signOut, profile } = useAuth();
  const navigate = useNavigate();
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  const handleLogout = async () => {
    console.log('Iniciando logout...');
    try {
      await signOut();
      console.log('Logout realizado com sucesso, redirecionando...');
      navigate('/login');
      if (onClose) onClose();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <aside
      className={cn(
        'flex flex-col h-full bg-blue-900 text-white shadow-xl transition-all duration-300',
        isCollapsed ? 'w-20' : 'w-64',
        className
      )}
    >
      {/* Header - Apenas para Mobile */}
      {!isCollapsed && onClose && (
        <div className="p-4 flex items-center justify-end lg:hidden">
          <button
            onClick={onClose}
            className="p-2 hover:bg-blue-800 rounded-lg text-blue-200 transition-colors"
          >
            <X size={24} />
          </button>
        </div>
      )}

      {/* Espaçador para Desktop quando não tem header */}
      <div className={cn('hidden lg:block', isCollapsed ? 'h-6' : 'h-6')} />

      <nav className="flex-1 overflow-y-auto px-4 space-y-6 pb-8 custom-scrollbar">
        {menuItems.map((group, idx) => (
          <div key={idx} className="transition-all duration-300">
            <AnimatePresence mode="wait">
              {!isCollapsed && (
                <motion.h3
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="px-2 mb-2 text-[10px] font-semibold text-blue-400 uppercase tracking-widest whitespace-nowrap"
                >
                  {group.group}
                </motion.h3>
              )}
            </AnimatePresence>
            <div className="space-y-1">
              {group.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={onClose}
                  title={isCollapsed ? item.label : undefined}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200',
                      isActive
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50 font-semibold'
                        : 'text-blue-100 hover:bg-blue-800 hover:text-white',
                      isCollapsed && 'justify-center px-0'
                    )
                  }
                >
                  <item.icon size={20} className="shrink-0" />
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="whitespace-nowrap"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div
        className={cn(
          'p-4 bg-blue-950/50 border-t border-blue-800 transition-all',
          isCollapsed && 'items-center px-2'
        )}
      >
        {!isCollapsed ? (
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-semibold text-xs uppercase shrink-0">
              {profile?.full_name?.substring(0, 2) || 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold truncate">{profile?.full_name}</p>
              <p className="text-[10px] text-blue-400 uppercase font-semibold tracking-wider">
                {profile?.role}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center mb-4">
            <div
              className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-semibold text-xs uppercase"
              title={profile?.full_name}
            >
              {profile?.full_name?.substring(0, 2) || 'U'}
            </div>
          </div>
        )}

        <button
          onClick={() => setIsAboutOpen(true)}
          title={isCollapsed ? 'Sobre o Sistema' : undefined}
          className={cn(
            'w-full flex items-center justify-center gap-2 py-3 text-sm font-semibold text-blue-300 hover:bg-blue-400/10 rounded-xl transition-all mb-1',
            isCollapsed && 'px-0'
          )}
        >
          <Info size={18} />
          {!isCollapsed && (
            <span className="uppercase tracking-widest text-xs font-bold">Sobre</span>
          )}
        </button>

        <button
          onClick={handleLogout}
          title={isCollapsed ? 'Sair do Sistema' : undefined}
          className={cn(
            'w-full flex items-center justify-center gap-2 py-3 text-sm font-semibold text-red-400 hover:bg-red-500/10 rounded-xl transition-all',
            isCollapsed && 'px-0'
          )}
        >
          <LogOut size={18} />
          {!isCollapsed && (
            <span className="uppercase tracking-widest text-xs font-bold">Sair</span>
          )}
        </button>

        <AboutModal isOpen={isAboutOpen} onOpenChange={setIsAboutOpen} />
      </div>
    </aside>
  );
}
