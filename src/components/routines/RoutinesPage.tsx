'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';

interface RoutineStatus {
  id: number;
  name: string;
  type: string;
  enabled: boolean;
  lastExecuted: string | null;
  nextExecution: string;
  lastResult?: Record<string, any> | null;
}

export function RoutinesPage() {
  const { isAuthenticated } = useAuth();
  const [routines, setRoutines] = useState<RoutineStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRoutines() {
      try {
        setIsLoading(true);
        const response = await fetch('/api/routines/status');

        if (!response.ok) {
          throw new Error('Falha ao carregar rotinas');
        }

        const data = await response.json();
        setRoutines(data.data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
      } finally {
        setIsLoading(false);
      }
    }

    if (isAuthenticated) {
      fetchRoutines();
    }
  }, [isAuthenticated]);

  const getRoutineIcon = (type: string): string => {
    switch (type) {
      case 'weekly-summary':
        return '📊';
      case 'pattern-analysis':
        return '📈';
      case 'daily-wellbeing':
        return '🌟';
      default:
        return '⚙️';
    }
  };

  const formatDate = (date: string | null | Date): string => {
    if (!date) return 'Nunca executada';
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      const now = new Date();
      const diffMs = now.getTime() - dateObj.getTime();
      const diffMins = Math.floor(diffMs / 60000);

      if (diffMins < 1) return 'Agora mesmo';
      if (diffMins < 60) return `${diffMins}min atrás`;

      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h atrás`;

      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays}d atrás`;
    } catch {
      return 'Data inválida';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 pt-20">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-center">
            <div className="inline-block animate-spin">⚙️</div>
            <p className="text-slate-400 mt-2">Carregando rotinas...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 pt-20">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="bg-red-900/20 border border-red-700 rounded-lg p-4">
            <p className="text-red-400">❌ {error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 pt-20">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Rotinas Automáticas</h1>
          <p className="text-slate-400">
            Acompanhe o status das suas rotinas inteligentes
          </p>
        </div>

        {/* Routines Grid */}
        <div className="space-y-4">
          {routines.map((routine) => (
            <div
              key={routine.type}
              className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 hover:border-purple-500/50 transition-colors"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{getRoutineIcon(routine.type)}</span>
                  <div>
                    <h2 className="text-xl font-semibold text-white">
                      {routine.name}
                    </h2>
                    <p className="text-sm text-slate-400">
                      {routine.type.replace('-', ' ').toUpperCase()}
                    </p>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="flex items-center gap-2">
                  <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
                  <span className="text-sm font-medium text-green-400">
                    {routine.enabled ? 'Ativa' : 'Inativa'}
                  </span>
                </div>
              </div>

              {/* Timeline Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Last Executed */}
                <div className="bg-slate-900/50 rounded-lg p-4">
                  <p className="text-xs font-semibold text-slate-400 mb-2">
                    ⏱️ ÚLTIMA EXECUÇÃO
                  </p>
                  <p className="text-sm text-white">
                    {formatDate(routine.lastExecuted)}
                  </p>
                </div>

                {/* Next Execution */}
                <div className="bg-slate-900/50 rounded-lg p-4">
                  <p className="text-xs font-semibold text-slate-400 mb-2">
                    ⏰ PRÓXIMA EXECUÇÃO
                  </p>
                  <p className="text-sm text-white">
                    {formatDate(routine.nextExecution)}
                  </p>
                </div>
              </div>

              {/* Last Result */}
              {routine.lastResult && (
                <div className="mt-4 bg-slate-900/50 rounded-lg p-4">
                  <p className="text-xs font-semibold text-slate-400 mb-2">
                    📊 RESULTADO ANTERIOR
                  </p>
                  <div className="text-sm text-slate-300 space-y-1">
                    {Object.entries(routine.lastResult).map(([key, value]) => (
                      <p key={key}>
                        <span className="text-slate-400">{key}:</span>{' '}
                        <span className="text-white font-medium">
                          {typeof value === 'object'
                            ? JSON.stringify(value)
                            : String(value)}
                        </span>
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-purple-900/20 border border-purple-700/50 rounded-lg p-4">
          <p className="text-sm text-purple-300">
            💡 Essas rotinas rodam automaticamente nos horários agendados.
            Você verá seus resultados no seu WhatsApp.
          </p>
        </div>
      </div>
    </div>
  );
}
