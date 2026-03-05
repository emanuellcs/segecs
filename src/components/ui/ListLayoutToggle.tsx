import { LayoutGrid, Table } from 'lucide-react';
import { useListLayout } from '@/hooks/useListLayout';
import { cn } from '@/lib/utils';

export function ListLayoutToggle() {
  const { listLayout, setListLayout } = useListLayout();

  return (
    <div className="hidden lg:flex items-center bg-gray-100 p-1 rounded-xl border border-gray-200 shadow-inner">
      <button
        onClick={() => setListLayout('table')}
        className={cn(
          'flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all font-bold text-xs',
          listLayout === 'table'
            ? 'bg-white text-blue-600 shadow-sm'
            : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
        )}
        title="Layout de Tabela"
      >
        <Table size={16} />
        Tabela
      </button>
      <button
        onClick={() => setListLayout('cards')}
        className={cn(
          'flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all font-bold text-xs',
          listLayout === 'cards'
            ? 'bg-white text-blue-600 shadow-sm'
            : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
        )}
        title="Layout de Cards"
      >
        <LayoutGrid size={16} />
        Cards
      </button>
    </div>
  );
}
