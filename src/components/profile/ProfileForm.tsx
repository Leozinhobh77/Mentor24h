'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/lib/hooks/useAuth';
import { Alert } from '../Alert';

const profileSchema = z.object({
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  preferredAssistant: z.enum(['Mateus', 'Ana', 'Carlos', 'Juliana', 'Roberto', 'Fernanda']),
  timezone: z.enum(['America/Sao_Paulo', 'America/Manaus', 'America/Fortaleza', 'America/Belem', 'America/Recife']),
  whatsappNumber: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const ASSISTANTS = ['Mateus', 'Ana', 'Carlos', 'Juliana', 'Roberto', 'Fernanda'];
const TIMEZONES = [
  { value: 'America/Sao_Paulo', label: 'São Paulo (UTC-3)' },
  { value: 'America/Manaus', label: 'Manaus (UTC-4)' },
  { value: 'America/Fortaleza', label: 'Fortaleza (UTC-3)' },
  { value: 'America/Belem', label: 'Belém (UTC-3)' },
  { value: 'America/Recife', label: 'Recife (UTC-3)' },
];

export function ProfileForm() {
  const { user, isLoading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    if (user && !authLoading) {
      reset({
        name: user.name,
        preferredAssistant: (user.preferredAssistant as any) || 'Mateus',
        timezone: (user.timezone as any) || 'America/Sao_Paulo',
        whatsappNumber: user.whatsappNumber || '',
      });
    }
  }, [user, authLoading, reset]);

  const onSubmit = async (data: ProfileFormData) => {
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(false);

      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Token não encontrado');
      }

      const response = await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!result.success) {
        setError(result.error || 'Erro ao atualizar perfil');
        return;
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-slate-700 border-t-purple-500 rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-400">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Success Alert */}
      {success && (
        <Alert
          type="success"
          title="Sucesso"
          message="Perfil atualizado com sucesso!"
        />
      )}

      {/* Error Alert */}
      {error && (
        <Alert
          type="error"
          title="Erro"
          message={error}
        />
      )}

      {/* Name Field */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-200 mb-2">
          Nome completo
        </label>
        <input
          id="name"
          type="text"
          placeholder="Seu nome"
          {...register('name')}
          className={`w-full px-4 py-3 rounded-lg bg-slate-800 border ${
            errors.name ? 'border-red-500' : 'border-slate-700'
          } text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all`}
        />
        {errors.name && (
          <p className="text-red-400 text-sm mt-1">{errors.name.message}</p>
        )}
      </div>

      {/* Preferred Assistant */}
      <div>
        <label htmlFor="preferredAssistant" className="block text-sm font-medium text-gray-200 mb-2">
          Assistente preferido
        </label>
        <select
          id="preferredAssistant"
          {...register('preferredAssistant')}
          className={`w-full px-4 py-3 rounded-lg bg-slate-800 border ${
            errors.preferredAssistant ? 'border-red-500' : 'border-slate-700'
          } text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all`}
        >
          {ASSISTANTS.map(assistant => (
            <option key={assistant} value={assistant}>
              {assistant}
            </option>
          ))}
        </select>
        {errors.preferredAssistant && (
          <p className="text-red-400 text-sm mt-1">{errors.preferredAssistant.message}</p>
        )}
      </div>

      {/* Timezone */}
      <div>
        <label htmlFor="timezone" className="block text-sm font-medium text-gray-200 mb-2">
          Fuso horário
        </label>
        <select
          id="timezone"
          {...register('timezone')}
          className={`w-full px-4 py-3 rounded-lg bg-slate-800 border ${
            errors.timezone ? 'border-red-500' : 'border-slate-700'
          } text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all`}
        >
          {TIMEZONES.map(tz => (
            <option key={tz.value} value={tz.value}>
              {tz.label}
            </option>
          ))}
        </select>
        {errors.timezone && (
          <p className="text-red-400 text-sm mt-1">{errors.timezone.message}</p>
        )}
      </div>

      {/* WhatsApp (optional) */}
      <div>
        <label htmlFor="whatsappNumber" className="block text-sm font-medium text-gray-200 mb-2">
          WhatsApp (opcional)
        </label>
        <input
          id="whatsappNumber"
          type="tel"
          placeholder="+55 11 99999-9999"
          {...register('whatsappNumber')}
          className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
        />
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
            Salvando...
          </>
        ) : (
          'Salvar alterações'
        )}
      </button>

      {/* Info */}
      <div className="bg-blue-500/10 border border-blue-500/30 text-blue-200 px-4 py-3 rounded-lg text-xs">
        💡 Email não pode ser alterado. Para mudar, entre em contato com o suporte.
      </div>
    </form>
  );
}
