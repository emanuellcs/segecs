import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "Supabase URL or Publishable Key missing. Check your .env file.",
  );
}

/**
 * Custom storage implementation for Supabase Auth that respects the 'Remember Me' preference.
 * Persists session in localStorage if 'Remember Me' is enabled, otherwise uses sessionStorage.
 */
const customStorage = {
  getItem: (key: string) => {
    if (typeof window === "undefined") return null;
    // Tries both to be resilient. If it exists in localStorage, it persists across sessions.
    return localStorage.getItem(key) || sessionStorage.getItem(key);
  },
  setItem: (key: string, value: string) => {
    if (typeof window === "undefined") return;

    // We consider 'true' by default unless explicitly marked as 'false'
    // This ensures login is not lost in case of storage inconsistency
    const rememberMeRaw = localStorage.getItem("sb-remember-me");
    const isRememberMe = rememberMeRaw !== "false";

    if (isRememberMe) {
      localStorage.setItem(key, value);
      sessionStorage.removeItem(key); // Clear from volatile if in persistent
    } else {
      sessionStorage.setItem(key, value);
      localStorage.removeItem(key); // Clear from persistent if opted not to be remembered
    }
  },
  removeItem: (key: string) => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  },
};

export const supabase = createClient(supabaseUrl || "", supabaseAnonKey || "", {
  auth: {
    persistSession: true,
    storage: customStorage,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
