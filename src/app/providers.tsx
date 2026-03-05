import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "sonner";
import { ReactNode } from "react";
import { AuthProvider } from "@/features/auth/context/AuthContext";
import { LayoutProvider } from "@/hooks/useListLayout";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutos
      retry: 1,
    },
  },
});

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <LayoutProvider>
          {children}
          <Toaster position="bottom-right" richColors closeButton />
          <ReactQueryDevtools initialIsOpen={false} />
        </LayoutProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
