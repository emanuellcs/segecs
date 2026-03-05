import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL or Publishable Key missing. Check your .env file.');
}

const customStorage = {
  getItem: (key: string) => {
    if (typeof window === 'undefined') return null;
    const rememberMe = localStorage.getItem('sb-remember-me') === 'true';
    // Se o usuário quer ser lembrado, prioriza localStorage. Caso contrário, apenas sessionStorage.
    if (rememberMe) {
      return localStorage.getItem(key) || sessionStorage.getItem(key);
    }
    return sessionStorage.getItem(key);
  },
  setItem: (key: string, value: string) => {
    if (typeof window === 'undefined') return;
    const rememberMe = localStorage.getItem('sb-remember-me') === 'true';
    if (rememberMe) {
      localStorage.setItem(key, value);
      sessionStorage.removeItem(key); // Garante que não haja duplicata volátil
    } else {
      sessionStorage.setItem(key, value);
      localStorage.removeItem(key); // Garante que não persista no disco
    }
  },
  removeItem: (key: string) => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  },
};

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '', {
  auth: {
    persistSession: true,
    storage: customStorage,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
