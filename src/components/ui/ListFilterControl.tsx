import { Filter, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ListFilterControlProps {
  isOpen: boolean;
  onToggle: () => void;
  onClear: () => void;
  count: number;
  children: React.ReactNode;
}

export function ListFilterControl({
  isOpen,
  onToggle,
  onClear,
  count,
  children,
}: ListFilterControlProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <button
          onClick={onToggle}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 rounded-xl border font-bold text-sm transition-all shadow-sm",
            isOpen
              ? "bg-blue-50 border-blue-200 text-blue-700"
              : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50",
          )}
        >
          <Filter size={18} />
          Filtros
          {count > 0 && (
            <span className="ml-1 px-2 py-0.5 bg-blue-600 text-white text-[10px] rounded-full">
              {count}
            </span>
          )}
        </button>

        {count > 0 && (
          <button
            onClick={onClear}
            className="flex items-center gap-1 px-3 py-2 text-sm font-bold text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          >
            <X size={16} />
            Limpar
          </button>
        )}
      </div>

      {isOpen && (
        <div className="p-4 bg-gray-50 border border-gray-100 rounded-2xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 animate-in fade-in slide-in-from-top-2 duration-200">
          {children}
        </div>
      )}
    </div>
  );
}
