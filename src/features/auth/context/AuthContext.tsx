import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Profile, UserRole } from '@/types/auth';
import { Session } from '@supabase/supabase-js';

interface AuthContextType {
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = async (userId: string, user: any) => {
    try {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();

      if (error) {
        setProfile({
          id: userId,
          email: user.email || '',
          full_name: user.user_metadata?.['full_name'] || 'Usuário',
          role: (user.user_metadata?.['role'] as UserRole) || 'aluno',
          created_at: new Date().toISOString(),
        });
      } else {
        setProfile(data as Profile);
      }
    } catch (err) {
      console.error('AuthProvider: Profile fetch error:', err);
    }
  };

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        const {
          data: { session: initialSession },
        } = await supabase.auth.getSession();
        if (!mounted) return;

        setSession(initialSession);
        if (initialSession?.user) {
          await fetchProfile(initialSession.user.id, initialSession.user);
        }
      } catch (error) {
        console.error('AuthProvider: Init error:', error);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    initAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      if (!mounted) return;

      setSession(newSession);
      if (newSession?.user) {
        await fetchProfile(newSession.user.id, newSession.user);
      } else {
        setProfile(null);
        queryClient.clear();
      }
      setIsLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [queryClient]);

  const signOut = async () => {
    console.log('AuthContext: Iniciando processo de logout...');
    
    // Limpamos o estado local IMEDIATAMENTE para garantir que o usuário saia da tela atual
    const clearLocalData = () => {
      console.log('AuthContext: Limpando estado local e storages...');
      window.sessionStorage.clear();
      window.localStorage.clear();
      setSession(null);
      setProfile(null);
      queryClient.clear();
    };

    try {
      // Tentamos o logout no Supabase, mas com um timeout para não travar a UI
      const signOutPromise = supabase.auth.signOut();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout no logout do Supabase')), 3000)
      );

      await Promise.race([signOutPromise, timeoutPromise]);
      console.log('AuthContext: Supabase signOut concluído com sucesso.');
    } catch (error) {
      console.warn('AuthContext: Erro ou timeout ao deslogar do Supabase:', error);
    } finally {
      clearLocalData();
      console.log('AuthContext: Logout local concluído.');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        profile,
        isLoading,
        isAuthenticated: !!session?.user,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
