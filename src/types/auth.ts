import { Session } from '@supabase/supabase-js';

export type UserRole = 'admin' | 'coordenador' | 'orientador' | 'aluno' | 'supervisor';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url?: string;
  created_at: string;
}

export interface AuthState {
  profile: Profile | null;
  session: Session | null;
  isLoading: boolean;
}
