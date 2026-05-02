'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { Alert } from '../Alert';

const resetSchema = z.object({
  email: z.string().email('Email inválido'),
});

type ResetFormData = z.infer<typeof resetSchema>;

export function ResetForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetFormData>({
    resolver: zodResolver(resetSchema),
  });

  const onSubmit = async (data: ResetFormData) => {
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(false);

      const response = await fetch('/api/auth/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!result.success) {
        setError(result.error || 'Erro ao enviar email de recuperação');
        return;
      }

      setSuccess(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="w-full max-w-md space-y-6">
        <Alert
          type="success"
          title="Email enviado com sucesso!"
          description="Verifique sua caixa de entrada e spam para o link de recuperação. Ele expira em 1 hora."
        />
        <div className="text-center">
          <Link href="/auth/login" className="text-purple-400 hover:text-purple-300 font-medium transition-colors">
            ← Voltar para login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-md space-y-6">
      {/* Title */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-2">Recuperar senha</h1>
        <p className="text-gray-400">Enviaremos um link de recuperação para seu email</p>
      </div>

      {/* Error Message */}
      {error && (
        <Alert type="error" title="Erro" description={error} />
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

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            Enviando...
          </>
        ) : (
          'Enviar link de recuperação'
        )}
      </button>

      {/* Back to Login */}
      <div className="text-center">
        <p className="text-gray-400">
          Lembrou a senha?{' '}
          <Link href="/auth/login" className="text-purple-400 hover:text-purple-300 font-medium transition-colors">
            Faça login
          </Link>
        </p>
      </div>

      {/* Info Message */}
      <div className="bg-blue-500/10 border border-blue-500/30 text-blue-200 px-4 py-3 rounded-lg text-xs">
        💡 O link de recuperação expira em 1 hora por segurança
      </div>
    </form>
  );
}
