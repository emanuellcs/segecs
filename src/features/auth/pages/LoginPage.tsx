import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Mail, Lock, LogIn, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

const loginSchema = z.object({
  email: z.string().email('Insira um e-mail válido'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        toast.error('Credenciais inválidas ou erro no servidor.');
        return;
      }

      toast.success('Bem-vindo ao SEGECS!');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Ocorreu um erro inesperado.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-900 px-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-white rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-400 rounded-full blur-[120px]"></div>
      </div>

      <div className="bg-white p-8 sm:p-12 rounded-[2.5rem] shadow-2xl w-full max-w-md relative z-10 border border-white/20 backdrop-blur-sm">
        <div className="flex justify-center mb-6">
          <div className="bg-blue-900 p-4 rounded-3xl shadow-xl shadow-blue-900/20">
            <ShieldCheck className="text-white" size={40} />
          </div>
        </div>

        <h1 className="text-4xl font-black text-center text-blue-900 tracking-tighter mb-2">SEGECS</h1>
        <p className="text-center text-gray-400 mb-10 font-black uppercase tracking-[0.2em] text-[10px]">
          Gestão de Estágios • EEEP
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-1">
            <label className="block text-blue-950 text-xs font-black mb-2 uppercase tracking-widest ml-1">E-mail Institucional</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={18} />
              <input
                {...register('email')}
                type="email"
                placeholder="seu@email.com"
                className={cn(
                  "w-full pl-12 pr-4 py-4 bg-gray-50 border rounded-2xl focus:outline-none focus:ring-2 transition-all text-sm font-medium",
                  errors.email ? "border-red-200 focus:ring-red-100" : "border-transparent focus:ring-blue-100 focus:bg-white focus:border-blue-200"
                )}
              />
            </div>
            {errors.email && (
              <p className="text-red-500 text-[10px] font-black uppercase mt-1 ml-1 tracking-wider">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="block text-blue-950 text-xs font-black mb-2 uppercase tracking-widest ml-1">Senha de Acesso</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={18} />
              <input
                {...register('password')}
                type="password"
                placeholder="••••••••"
                className={cn(
                  "w-full pl-12 pr-4 py-4 bg-gray-50 border rounded-2xl focus:outline-none focus:ring-2 transition-all text-sm font-medium",
                  errors.password ? "border-red-200 focus:ring-red-100" : "border-transparent focus:ring-blue-100 focus:bg-white focus:border-blue-200"
                )}
              />
            </div>
            {errors.password && (
              <p className="text-red-500 text-[10px] font-black uppercase mt-1 ml-1 tracking-wider">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-900 hover:bg-blue-800 text-white py-4 rounded-2xl font-black transition-all shadow-xl shadow-blue-900/20 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 text-sm tracking-widest uppercase"
          >
            {loading ? (
              <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                Entrar no Sistema <LogIn size={18} />
              </>
            )}
          </button>
        </form>

        <div className="mt-12 pt-8 border-t border-gray-100 text-center">
          <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">
            &copy; {new Date().getFullYear()} SEGECS • Governo do Estado do Ceará
          </p>
        </div>
      </div>
    </div>
  );
}
