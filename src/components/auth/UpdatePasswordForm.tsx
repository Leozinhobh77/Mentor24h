'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { Alert } from '../Alert';

const updatePasswordSchema = z.object({
  password: z.string().min(8, 'Senha deve ter no mínimo 8 caracteres'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Senhas não correspondem",
  path: ["confirmPassword"],
});

type UpdatePasswordFormData = z.infer<typeof updatePasswordSchema>;

export function UpdatePasswordForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExpired, setIsExpired] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdatePasswordFormData>({
    resolver: zodResolver(updatePasswordSchema),
  });

  useEffect(() => {
    // Verify that we have a valid recovery session
    // Supabase sets the session when the user clicks the recovery link
    const checkSession = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (!response.ok) {
          setIsExpired(true);
        }
      } catch {
        setIsExpired(true);
      }
    };

    checkSession();
  }, []);

  const onSubmit = async (data: UpdatePasswordFormData) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/auth/update-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: data.password }),
      });

      const result = await response.json();

      if (!result.success) {
        setError(result.error || 'Erro ao atualizar senha');
        return;
      }

      // Redirect to login after successful password update
      router.push('/auth/login');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isExpired) {
    return (
      <div className="w-full max-w-md space-y-6">
        <Alert
          type="error"
          title="Link expirado"
          message="Este link de recuperação expirou. Solicite um novo email de recuperação."
        />
        <div className="text-center space-y-3">
          <Link
            href="/auth/reset"
            className="block text-purple-400 hover:text-purple-300 font-medium transition-colors"
          >
            Solicitar novo link
          </Link>
          <Link
            href="/auth/login"
            className="block text-gray-400 hover:text-gray-300 transition-colors"
          >
            Voltar para login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-md space-y-6">
      {/* Title */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-2">Criar nova senha</h1>
        <p className="text-gray-400">Digite uma nova senha segura para sua conta</p>
      </div>

      {/* Error Message */}
      {error && (
        <Alert type="error" title="Erro" message={error} />
      )}

      {/* Password Field */}
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-200 mb-2">
          Nova senha
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

      {/* Confirm Password Field */}
      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-200 mb-2">
          Confirmar nova senha
        </label>
        <input
          id="confirmPassword"
          type="password"
          placeholder="••••••••"
          {...register('confirmPassword')}
          className={`w-full px-4 py-3 rounded-lg bg-slate-800 border ${
            errors.confirmPassword ? 'border-red-500' : 'border-slate-700'
          } text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all`}
        />
        {errors.confirmPassword && (
          <p className="text-red-400 text-sm mt-1">{errors.confirmPassword.message}</p>
        )}
      </div>

      {/* Update Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            Atualizando...
          </>
        ) : (
          'Atualizar senha'
        )}
      </button>

      {/* Back to Login */}
      <div className="text-center">
        <p className="text-gray-400">
          <Link href="/auth/login" className="text-purple-400 hover:text-purple-300 font-medium transition-colors">
            Voltar para login
          </Link>
        </p>
      </div>

      {/* Info Message */}
      <div className="bg-blue-500/10 border border-blue-500/30 text-blue-200 px-4 py-3 rounded-lg text-xs">
        💡 Escolha uma senha forte com maiúsculas, números e caracteres especiais
      </div>
    </form>
  );
}
