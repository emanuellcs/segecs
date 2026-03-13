import { ArrowUpDown, SortAsc, SortDesc } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

export interface SortOption {
  label: string;
  column: string;
}

interface ListSortControlProps {
  options: SortOption[];
  currentColumn: string;
  ascending: boolean;
  onSortChange: (column: string, ascending: boolean) => void;
}

export function ListSortControl({
  options,
  currentColumn,
  ascending,
  onSortChange,
}: ListSortControlProps) {
  const { t } = useTranslation();

  return (
    <div className="flex items-center gap-2">
      <div className="relative group flex-1 md:flex-none min-w-[180px]">
        <ArrowUpDown
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          size={16}
        />
        <select
          value={currentColumn}
          onChange={(e) => onSortChange(e.target.value, ascending)}
          className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm appearance-none cursor-pointer"
        >
          {options.map((opt) => (
            <option key={opt.column} value={opt.column}>
              {t("common.sortBy", "Sort by")}: {opt.label}
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={() => onSortChange(currentColumn, !ascending)}
        className={cn(
          "p-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-all shadow-sm group",
          "text-blue-600 font-bold flex items-center gap-1",
        )}
        title={
          ascending
            ? t("common.ascending", "Ascending")
            : t("common.descending", "Descending")
        }
      >
        {ascending ? <SortAsc size={20} /> : <SortDesc size={20} />}
      </button>
    </div>
  );
}
