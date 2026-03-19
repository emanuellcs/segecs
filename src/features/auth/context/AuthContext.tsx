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
      // Add a 5-second timeout to profile fetching to avoid blocking load
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
          full_name: user.user_metadata?.["full_name"] || "User",
          role: (user.user_metadata?.["role"] as UserRole) || "student",
          created_at: new Date().toISOString(),
        });
      } else {
        setProfile(data as Profile);
      }
    } catch (err) {
      console.error("AuthProvider: Profile fetch error:", err);
      // In case of error, set a basic profile to avoid blocking navigation
      setProfile({
        id: userId,
        email: user.email || "",
        full_name: user.user_metadata?.["full_name"] || "User",
        role: (user.user_metadata?.["role"] as UserRole) || "student",
        created_at: new Date().toISOString(),
      });
    }
  };

  useEffect(() => {
    let mounted = true;

    // Supabase v2 onAuthStateChange triggers an INITIAL_SESSION event at the start
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

      // Ensure loading stops
      setIsLoading(false);
    });

    // As extra security, if it's still loading after 10 seconds, force termination
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
    console.log("AuthContext: Starting logout process...");

    // Clear local state to ensure the user leaves the current screen
    const clearLocalData = () => {
      console.log("AuthContext: Clearing local state and cache...");
      setSession(null);
      setProfile(null);
      queryClient.clear();
    };

    try {
      // Attempt Supabase logout, but with a timeout to not block UI
      const signOutPromise = supabase.auth.signOut();
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Supabase logout timeout")), 3000),
      );

      await Promise.race([signOutPromise, timeoutPromise]);
      console.log("AuthContext: Supabase signOut completed successfully.");
    } catch (error) {
      console.warn(
        "AuthContext: Error or timeout logging out from Supabase:",
        error,
      );
    } finally {
      clearLocalData();
      console.log("AuthContext: Local logout completed.");
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
