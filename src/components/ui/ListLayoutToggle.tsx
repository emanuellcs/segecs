import { LayoutGrid, Table } from "lucide-react";
import { useListLayout } from "@/hooks/useListLayout";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

export function ListLayoutToggle() {
  const { listLayout, setListLayout } = useListLayout();
  const { t } = useTranslation();

  return (
    <div className="hidden lg:flex items-center bg-gray-50/50 p-1 rounded-2xl border border-gray-100 shadow-sm backdrop-blur-sm">
      <button
        onClick={() => setListLayout("table")}
        className={cn(
          "p-2 rounded-xl transition-all duration-300",
          listLayout === "table"
            ? "bg-white text-blue-900 shadow-md ring-1 ring-black/5 scale-105"
            : "text-gray-400 hover:text-blue-600 hover:bg-white/80",
        )}
        title={t("common.tableLayout", "Table Layout")}
      >
        <Table size={18} strokeWidth={2.5} />
      </button>
      <div className="w-px h-4 bg-gray-200 mx-1" />
      <button
        onClick={() => setListLayout("cards")}
        className={cn(
          "p-2 rounded-xl transition-all duration-300",
          listLayout === "cards"
            ? "bg-white text-blue-900 shadow-md ring-1 ring-black/5 scale-105"
            : "text-gray-400 hover:text-blue-600 hover:bg-white/80",
        )}
        title={t("common.cardLayout", "Card Layout")}
      >
        <LayoutGrid size={18} strokeWidth={2.5} />
      </button>
    </div>
  );
}
