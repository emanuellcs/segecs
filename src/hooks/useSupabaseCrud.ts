import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

/**
 * Translates technical Supabase/Postgres errors into user-friendly messages.
 * Note: Since this is used in components, we can pass the translation function.
 */
export function getFriendlyErrorMessage(
  error: any,
  t: (key: string) => string,
): string {
  if (error.code === "23503") {
    return t("errors.foreignKeyViolation");
  }
  if (error.code === "23505") {
    return t("errors.uniqueViolation");
  }
  return error.message || t("errors.unexpected");
}

/**
 * Legacy support for translateError, but ideally components should use getFriendlyErrorMessage with 't'
 */
export function translateError(error: any): string {
  if (error.code === "23503") {
    return "Cannot delete this record because it is linked to other data in the system (e.g., internships, vacancies, or evaluations).";
  }
  if (error.code === "23505") {
    return "A record with these unique data (CPF, CNPJ, or Registration) already exists.";
  }
  return error.message || "An unexpected error occurred during the operation.";
}

export function useSupabaseCrud<T extends { id: string }>(
  table: string,
  queryKey: string[],
  options?: {
    orderBy?: { column: string; ascending?: boolean };
  },
) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [...queryKey, options?.orderBy],
    queryFn: async () => {
      let q = supabase.from(table).select("*");

      if (options?.orderBy) {
        q = q.order(options.orderBy.column, {
          ascending: options.orderBy.ascending ?? false,
        });
      } else {
        q = q.order("created_at", { ascending: false });
      }

      const { data, error } = await q;
      if (error) throw error;
      return (data || []) as T[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (newData: Omit<T, "id" | "created_at">) => {
      const { data, error } = await supabase
        .from(table)
        .insert(newData)
        .select()
        .single();
      if (error) throw error;
      return data as T;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...updateData }: Partial<T> & { id: string }) => {
      const { data, error } = await supabase
        .from(table)
        .update(updateData)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data as T;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from(table).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await supabase.from(table).delete().in("id", ids);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const bulkUpdateMutation = useMutation({
    mutationFn: async ({
      ids,
      updateData,
    }: {
      ids: string[];
      updateData: Partial<T>;
    }) => {
      const { error } = await supabase
        .from(table)
        .update(updateData)
        .in("id", ids);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  return {
    items: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    create: createMutation.mutateAsync,
    update: updateMutation.mutateAsync,
    remove: deleteMutation.mutateAsync,
    bulkRemove: bulkDeleteMutation.mutateAsync,
    bulkUpdate: bulkUpdateMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isBulkDeleting: bulkDeleteMutation.isPending,
    isBulkUpdating: bulkUpdateMutation.isPending,
  };
}
