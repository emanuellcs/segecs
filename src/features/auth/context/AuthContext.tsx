import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Profile, UserRole } from "@/types/auth";
import { Session } from "@supabase/supabase-js";

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
    console.log("AuthProvider: Fetching profile for:", userId);
    try {
      // Adicionamos um timeout de 5 segundos na busca de perfil para evitar travar o carregamento
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Profile fetch timeout")), 5000),
      );

      const profilePromise = supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      const { data, error } = (await Promise.race([
        profilePromise,
        timeoutPromise,
      ])) as any;

      if (!data || error) {
        console.warn(
          "AuthProvider: Profile not found or error, using default:",
          error,
        );
        setProfile({
          id: userId,
          email: user.email || "",
          full_name: user.user_metadata?.["full_name"] || "Usuário",
          role: (user.user_metadata?.["role"] as UserRole) || "aluno",
          created_at: new Date().toISOString(),
        });
      } else {
        setProfile(data as Profile);
      }
    } catch (err) {
      console.error("AuthProvider: Profile fetch error:", err);
      // Em caso de erro, definimos um perfil básico para não travar a navegação
      setProfile({
        id: userId,
        email: user.email || "",
        full_name: user.user_metadata?.["full_name"] || "Usuário",
        role: (user.user_metadata?.["role"] as UserRole) || "aluno",
        created_at: new Date().toISOString(),
      });
    }
  };

  useEffect(() => {
    let mounted = true;

    // O onAuthStateChange do Supabase v2 dispara um evento INITIAL_SESSION logo no início
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      console.log("AuthProvider: Auth state changed:", event, !!newSession);

      if (!mounted) return;

      if (
        event === "SIGNED_IN" ||
        event === "TOKEN_REFRESHED" ||
        event === "USER_UPDATED" ||
        event === "INITIAL_SESSION"
      ) {
        setSession(newSession);
        if (newSession?.user) {
          await fetchProfile(newSession.user.id, newSession.user);
        } else {
          setProfile(null);
        }
      } else if (event === "SIGNED_OUT") {
        setSession(null);
        setProfile(null);
        queryClient.clear();
      }

      // Garantimos que o loading pare
      setIsLoading(false);
    });

    // Como segurança adicional, se após 10 segundos ainda estiver carregando, forçamos o encerramento
    const backupTimeout = setTimeout(() => {
      if (mounted && isLoading) {
        console.warn("AuthProvider: Forcing isLoading false after timeout");
        setIsLoading(false);
      }
    }, 10000);

    return () => {
      mounted = false;
      subscription.unsubscribe();
      clearTimeout(backupTimeout);
    };
  }, [queryClient]);

  const signOut = async () => {
    console.log("AuthContext: Iniciando processo de logout...");

    // Limpamos o estado local para garantir que o usuário saia da tela atual
    const clearLocalData = () => {
      console.log("AuthContext: Limpando estado local e limpando cache...");
      setSession(null);
      setProfile(null);
      queryClient.clear();
    };

    try {
      // Tentamos o logout no Supabase, mas com um timeout para não travar a UI
      const signOutPromise = supabase.auth.signOut();
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error("Timeout no logout do Supabase")),
          3000,
        ),
      );

      await Promise.race([signOutPromise, timeoutPromise]);
      console.log("AuthContext: Supabase signOut concluído com sucesso.");
    } catch (error) {
      console.warn(
        "AuthContext: Erro ou timeout ao deslogar do Supabase:",
        error,
      );
    } finally {
      clearLocalData();
      console.log("AuthContext: Logout local concluído.");
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
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
