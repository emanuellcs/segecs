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
  X,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

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
}

export default function Sidebar({ onClose, className }: SidebarProps) {
  const { signOut, profile } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
    if (onClose) onClose();
  };

  return (
    <aside className={cn("flex flex-col h-full bg-blue-900 text-white shadow-xl", className)}>
      <div className="p-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tighter">SEGECS</h1>
          <p className="text-[10px] text-blue-300 font-bold uppercase tracking-widest mt-1">
            EEEP - Ceará
          </p>
        </div>
        {onClose && (
          <button onClick={onClose} className="lg:hidden p-2 hover:bg-blue-800 rounded-lg">
            <X size={24} />
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-4 space-y-6 pb-8 custom-scrollbar">
        {menuItems.map((group, idx) => (
          <div key={idx}>
            <h3 className="px-2 mb-2 text-[10px] font-bold text-blue-400 uppercase tracking-widest">
              {group.group}
            </h3>
            <div className="space-y-1">
              {group.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                      isActive
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-900/50'
                        : 'text-blue-100 hover:bg-blue-800 hover:text-white'
                    )
                  }
                >
                  <item.icon size={18} />
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-4 bg-blue-950/50 border-t border-blue-800">
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-bold text-xs uppercase">
            {profile?.full_name?.substring(0, 2) || 'U'}
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-bold truncate">{profile?.full_name}</p>
            <p className="text-[10px] text-blue-400 uppercase font-black tracking-tighter">
              {profile?.role}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-2 text-sm font-bold text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
        >
          <LogOut size={16} /> Sair do Sistema
        </button>
      </div>
    </aside>
  );
}
