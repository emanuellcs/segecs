import { createContext, useContext, useState, ReactNode } from 'react';

type ListLayout = 'table' | 'cards';

interface LayoutContextType {
  listLayout: ListLayout;
  setListLayout: (layout: ListLayout) => void;
  toggleListLayout: () => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export function LayoutProvider({ children }: { children: ReactNode }) {
  const [listLayout, setListLayoutState] = useState<ListLayout>(() => {
    const saved = localStorage.getItem('segecs-list-layout');
    return (saved as ListLayout) || 'table';
  });

  const setListLayout = (layout: ListLayout) => {
    setListLayoutState(layout);
    localStorage.setItem('segecs-list-layout', layout);
  };

  const toggleListLayout = () => {
    const newLayout = listLayout === 'table' ? 'cards' : 'table';
    setListLayout(newLayout);
  };

  return (
    <LayoutContext.Provider value={{ listLayout, setListLayout, toggleListLayout }}>
      {children}
    </LayoutContext.Provider>
  );
}

export function useListLayout() {
  const context = useContext(LayoutContext);
  if (context === undefined) {
    throw new Error('useListLayout must be used within a LayoutProvider');
  }
  return context;
}
