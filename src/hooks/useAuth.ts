import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Profile } from '@/types/auth';
import { useEffect } from 'react';

export function useAuth() {
  const queryClient = useQueryClient();

  const { data: session, isLoading: isSessionLoading } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    },
  });

  const { data: profile, isLoading: isProfileLoading } = useQuery({
    queryKey: ['profile', session?.user?.id],
    queryFn: async () => {
      if (!session?.user) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      if (error) {
        // Fallback para quando o perfil ainda não existe (durante migração ou primeiro login)
        return {
          id: session.user.id,
          email: session.user.email,
          full_name: session.user.user_metadata?.full_name || 'Usuário',
          role: (session.user.user_metadata?.role as any) || 'aluno',
        } as Profile;
      }
      
      return data as Profile;
    },
    enabled: !!session?.user,
  });

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      queryClient.setQueryData(['session'], session);
      if (!session) {
        queryClient.setQueryData(['profile'], null);
      }
    });

    return () => subscription.unsubscribe();
  }, [queryClient]);

  const signOut = async () => {
    await supabase.auth.signOut();
    queryClient.setQueryData(['session'], null);
    queryClient.setQueryData(['profile'], null);
  };

  return {
    session,
    profile,
    isLoading: isSessionLoading || isProfileLoading,
    isAuthenticated: !!session?.user,
    signOut,
  };
}
