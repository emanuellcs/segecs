import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./Dialog";
import { Edit2 } from "lucide-react";

interface BulkEditModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  count: number;
  children: React.ReactNode;
}

export function BulkEditModal({
  isOpen,
  onOpenChange,
  title = "Editar em Lote",
  description = "Os campos preenchidos serão aplicados a todos os registros selecionados.",
  count,
  children,
}: BulkEditModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-[95vw]">
        <DialogHeader className="items-center sm:items-start">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
            <Edit2 className="text-blue-600 h-6 w-6" />
          </div>
          <DialogTitle className="text-xl font-bold text-gray-900">
            {title}
          </DialogTitle>
          <DialogDescription className="text-center sm:text-left">
            {description}
            <span className="block mt-2 font-bold text-blue-600">
              {count} {count === 1 ? "registro selecionado" : "registros selecionados"}
            </span>
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
}
