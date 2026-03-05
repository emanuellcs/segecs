import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemsPerPage: number;
  onItemsPerPageChange: (items: number) => void;
  totalItems: number;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage,
  onItemsPerPageChange,
  totalItems,
}: PaginationProps) {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-6 border-t border-gray-100 px-2 mt-4">
      <div className="flex items-center gap-3">
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
          Mostrar:
        </label>
        <select
          value={itemsPerPage}
          onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
          className="bg-gray-50 border-none rounded-lg text-[11px] font-black text-blue-900 focus:ring-2 focus:ring-blue-500 py-1 pl-3 pr-8 appearance-none cursor-pointer transition-all hover:bg-gray-100"
        >
          {[10, 25, 50, 100].map((num) => (
            <option key={num} value={num}>
              {num} registros
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 rounded-xl bg-gray-50 text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-all disabled:opacity-30 disabled:hover:bg-gray-50 disabled:hover:text-gray-400 active:scale-90 border border-transparent hover:border-blue-100"
          >
            <ChevronLeft size={18} />
          </button>

          <div className="flex items-center gap-1.5 px-2">
            <span className="text-sm font-black text-blue-900">
              {currentPage}
            </span>
            <span className="text-[10px] font-black text-gray-300 uppercase">
              de
            </span>
            <span className="text-sm font-black text-gray-500">
              {totalPages}
            </span>
          </div>

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 rounded-xl bg-gray-50 text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-all disabled:opacity-30 disabled:hover:bg-gray-50 disabled:hover:text-gray-400 active:scale-90 border border-transparent hover:border-blue-100"
          >
            <ChevronRight size={18} />
          </button>
        </div>
        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
          Exibindo {totalItems === 0 ? 0 : startItem}–{endItem} de {totalItems}{" "}
          registros
        </p>
      </div>
    </div>
  );
}
