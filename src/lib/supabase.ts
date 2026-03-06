import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "Supabase URL or Publishable Key missing. Check your .env file.",
  );
}

const customStorage = {
  getItem: (key: string) => {
    if (typeof window === "undefined") return null;
    // Tenta obter de ambos para ser resiliente. Se houver no localStorage, ele persiste entre sessões.
    return localStorage.getItem(key) || sessionStorage.getItem(key);
  },
  setItem: (key: string, value: string) => {
    if (typeof window === "undefined") return;
    
    // Consideramos 'true' por padrão a menos que explicitamente marcado como 'false'
    // Isso garante que não se perca o login em caso de inconsistência no storage
    const rememberMeRaw = localStorage.getItem("sb-remember-me");
    const isRememberMe = rememberMeRaw !== "false";
    
    if (isRememberMe) {
      localStorage.setItem(key, value);
      sessionStorage.removeItem(key); // Limpa do volátil se está no persistente
    } else {
      sessionStorage.setItem(key, value);
      localStorage.removeItem(key); // Limpa do persistente se optou por não ser lembrado
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
