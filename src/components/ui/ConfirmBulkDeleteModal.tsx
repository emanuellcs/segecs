import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "./Dialog";
import { AlertTriangle, Trash2 } from "lucide-react";

interface ConfirmBulkDeleteModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  count: number;
  isLoading?: boolean;
}

export function ConfirmBulkDeleteModal({
  isOpen,
  onOpenChange,
  onConfirm,
  title = "Excluir Registros em Lote",
  description = "Tem certeza que deseja excluir estes registros? Esta ação não pode ser desfeita.",
  count,
  isLoading = false,
}: ConfirmBulkDeleteModalProps) {
  const [confirmationText, setConfirmationText] = useState("");
  const isValid = confirmationText === "apagar registros";

  useEffect(() => {
    if (!isOpen) {
      setConfirmationText("");
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-[95vw]">
        <DialogHeader className="items-center sm:items-start">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
            <AlertTriangle className="text-red-600 h-6 w-6" />
          </div>
          <DialogTitle className="text-xl font-bold text-gray-900">
            {title}
          </DialogTitle>
          <DialogDescription className="text-center sm:text-left">
            {description}
            <span className="block mt-2 font-bold text-red-600">
              {count} {count === 1 ? "registro selecionado" : "registros selecionados"}
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <p className="text-sm text-gray-500">
            Para confirmar, digite <strong>apagar registros</strong> no campo abaixo:
          </p>
          <input
            type="text"
            value={confirmationText}
            onChange={(e) => setConfirmationText(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none transition-all"
            placeholder="apagar registros"
            autoFocus
          />
        </div>

        <DialogFooter className="mt-6 gap-2 sm:gap-0">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="flex-1 sm:flex-none px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading || !isValid}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:bg-red-300"
          >
            {isLoading ? (
              <span className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full" />
            ) : (
              <Trash2 size={16} />
            )}
            Excluir permanentemente
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
