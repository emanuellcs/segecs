import { Trash2, Edit2, X } from "lucide-react";

interface BulkActionsToolbarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onBulkDelete: () => void;
  onBulkEdit?: () => void;
  label?: string;
}

export function BulkActionsToolbar({
  selectedCount,
  onClearSelection,
  onBulkDelete,
  onBulkEdit,
  label = "registros selecionados",
}: BulkActionsToolbarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="bg-blue-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-6 border border-blue-800/50 backdrop-blur-md bg-opacity-95">
        <div className="flex items-center gap-3 pr-6 border-r border-blue-800">
          <button
            onClick={onClearSelection}
            className="p-1 hover:bg-blue-800 rounded-md transition-colors"
            title="Limpar seleção"
          >
            <X size={18} />
          </button>
          <span className="font-bold text-sm whitespace-nowrap">
            {selectedCount} {label}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {onBulkEdit && (
            <button
              onClick={onBulkEdit}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-600 font-bold text-sm transition-all active:scale-95"
            >
              <Edit2 size={16} /> Editar em Lote
            </button>
          )}
          <button
            onClick={onBulkDelete}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 font-bold text-sm transition-all active:scale-95 shadow-lg shadow-red-900/20"
          >
            <Trash2 size={16} /> Excluir em Lote
          </button>
        </div>
      </div>
    </div>
  );
}
