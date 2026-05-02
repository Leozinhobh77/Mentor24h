'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { Alert } from '../Alert';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isRegistered = searchParams.get('registered') === 'true';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!result.success) {
        setError(result.error || 'Erro ao fazer login');
        return;
      }

      // Salvar token (Supabase cuida disso client-side)
      // Redirecionar para dashboard
      router.push('/dashboard');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-md space-y-6">
      {/* Success Message */}
      {isRegistered && (
        <Alert type="success" title="Conta criada com sucesso!" description="Você pode fazer login agora com seus dados" />
      )}

      {/* Title */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-2">Bem-vindo de volta</h1>
        <p className="text-gray-400">Acesse sua conta Mentor24h</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Email Field */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-200 mb-2">
          Email
        </label>
        <input
          id="email"
          type="email"
          placeholder="seu@email.com"
          {...register('email')}
          className={`w-full px-4 py-3 rounded-lg bg-slate-800 border ${
            errors.email ? 'border-red-500' : 'border-slate-700'
          } text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all`}
        />
        {errors.email && (
          <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>
        )}
      </div>

      {/* Password Field */}
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-200 mb-2">
          Senha
        </label>
        <input
          id="password"
          type="password"
          placeholder="••••••••"
          {...register('password')}
          className={`w-full px-4 py-3 rounded-lg bg-slate-800 border ${
            errors.password ? 'border-red-500' : 'border-slate-700'
          } text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all`}
        />
        {errors.password && (
          <p className="text-red-400 text-sm mt-1">{errors.password.message}</p>
        )}
      </div>

      {/* Login Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            Entrando...
          </>
        ) : (
          'Entrar'
        )}
      </button>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-700"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-slate-900 text-gray-400">Ou</span>
        </div>
      </div>

      {/* Register Link */}
      <p className="text-center text-gray-400">
        Não tem conta?{' '}
        <Link href="/auth/register" className="text-purple-400 hover:text-purple-300 font-medium transition-colors">
          Criar conta
        </Link>
      </p>

      {/* Info Message */}
      <div className="bg-blue-500/10 border border-blue-500/30 text-blue-200 px-4 py-3 rounded-lg text-xs">
        💡 Use credenciais de teste ou registre uma nova conta
      </div>
    </form>
  );
}
