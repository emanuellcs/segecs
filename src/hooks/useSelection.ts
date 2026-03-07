import { useState, useCallback, useMemo } from "react";

export function useSelection<T extends { id: string }>(items: T[]) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  }, []);

  const selectAll = useCallback(() => {
    setSelectedIds(items.map((item) => item.id));
  }, [items]);

  const clearSelection = useCallback(() => {
    setSelectedIds([]);
  }, []);

  const handleSelectAllToggle = useCallback(() => {
    if (selectedIds.length === items.length && items.length > 0) {
      clearSelection();
    } else {
      selectAll();
    }
  }, [selectedIds.length, items.length, selectAll, clearSelection]);

  const isSelected = useCallback(
    (id: string) => selectedIds.includes(id),
    [selectedIds],
  );

  const isAllSelected = useMemo(
    () => items.length > 0 && selectedIds.length === items.length,
    [items.length, selectedIds.length],
  );

  const isSomeSelected = useMemo(
    () => selectedIds.length > 0 && selectedIds.length < items.length,
    [selectedIds.length, items.length],
  );

  return {
    selectedIds,
    setSelectedIds,
    toggleSelect,
    selectAll,
    clearSelection,
    handleSelectAllToggle,
    isSelected,
    isAllSelected,
    isSomeSelected,
  };
}
