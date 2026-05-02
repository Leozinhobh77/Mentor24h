'use client';

import { useState, useEffect } from 'react';
import { SeverityBadge } from '@/components/SeverityBadge';
import { CrisisModal } from '@/components/CrisisModal';

/**
 * TASK-038: Crises Page
 *
 * Página: /dashboard/crises
 * Filtro: severity >= 8 (apenas crises)
 * Layout: lista crises com paginação
 * Responsivo: mobile, tablet, desktop
 * Features: severity badge, timestamps, actions
 */

interface Crisis {
  id: string;
  userId: number;
  body: string;
  direction: 'inbound' | 'outbound';
  severity: number;
  is_crisis: boolean;
  created_at: string;
}

export default function CrisesPage() {
  const [crises, setCrises] = useState<Crisis[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [duration, setDuration] = useState(0);
  const [selectedCrisis, setSelectedCrisis] = useState<Crisis | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const itemsPerPage = 20;

  // Fetch crises (severity >= 8)
  useEffect(() => {
    async function fetchCrises() {
      try {
        setLoading(true);
        const offset = (page - 1) * itemsPerPage;

        const response = await fetch(
          `/api/messages?severity=8&limit=${itemsPerPage}&offset=${offset}`
        );

        if (!response.ok) throw new Error('Failed to fetch crises');

        const data = await response.json();
        setCrises(data.messages || []);
        setTotal(data.total || 0);
        setTotalPages(Math.ceil((data.total || 0) / itemsPerPage));
        setDuration(data.duration || 0);
      } catch (error) {
        console.error('Error fetching crises:', error);
        setCrises([]);
      } finally {
        setLoading(false);
      }
    }

    fetchCrises();
  }, [page]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando crises...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-red-900 mb-2">
            🚨 Crises Detectadas
          </h1>
          <p className="text-red-700">
            Histórico de mensagens com severidade crítica (8+)
          </p>
          {duration > 0 && (
            <p className="text-xs text-red-600 mt-2">
              {total} crise{total !== 1 ? 's' : ''} ({duration}ms) • Página {page} de{' '}
              {totalPages}
            </p>
          )}
        </div>

        {/* Crises List */}
        {crises.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center border-2 border-green-200">
            <p className="text-2xl mb-2">✅</p>
            <p className="text-gray-600 text-lg font-medium">
              Nenhuma crise detectada
            </p>
            <p className="text-gray-500 text-sm mt-2">
              Ótimo sinal! O sistema está operacional.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {crises.map((crisis) => (
              <div
                key={crisis.id}
                className="bg-white rounded-lg shadow hover:shadow-xl transition-shadow p-4 md:p-6 border-l-4 border-l-red-600 bg-red-50"
              >
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                  {/* Severity Badge */}
                  <div className="md:col-span-2">
                    <SeverityBadge severity={crisis.severity} size="md" />
                  </div>

                  {/* Crisis Content */}
                  <div className="md:col-span-7">
                    <p className="text-sm text-red-600 font-semibold mb-2">
                      🚨 Severidade: {crisis.severity}/10
                    </p>
                    <p className="text-gray-900 font-medium line-clamp-3">
                      {crisis.body.substring(0, 250)}
                      {crisis.body.length > 250 ? '...' : ''}
                    </p>
                    <p className="text-xs text-gray-500 mt-3">
                      Usuário ID: {crisis.userId} • {new Date(crisis.created_at).toLocaleString('pt-BR')}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="md:col-span-3 flex flex-col gap-2 items-end">
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-600 text-white">
                      🚨 Crítica
                    </span>

                    <button
                      onClick={() => {
                        setSelectedCrisis(crisis);
                        setIsModalOpen(true);
                      }}
                      className="text-red-600 hover:text-red-800 font-medium text-sm px-3 py-1 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      📋 Ver Detalhes
                    </button>

                    <button className="text-blue-600 hover:text-blue-800 font-medium text-sm px-3 py-1 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors">
                      💬 Contatar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2 flex-wrap">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-4 py-2 rounded-lg bg-red-200 hover:bg-red-300 disabled:opacity-50 disabled:cursor-not-allowed text-red-900 font-medium"
            >
              ← Anterior
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = Math.max(1, page - 2) + i;
                if (pageNum > totalPages) return null;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`px-3 py-2 rounded-lg font-medium ${
                      pageNum === page
                        ? 'bg-red-600 text-white'
                        : 'bg-red-200 hover:bg-red-300 text-red-900'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 rounded-lg bg-red-200 hover:bg-red-300 disabled:opacity-50 disabled:cursor-not-allowed text-red-900 font-medium"
            >
              Próxima →
            </button>

            <span className="text-red-700 text-sm font-medium">
              Página {page} de {totalPages}
            </span>
          </div>
        )}

        {/* Modal (TASK-039) */}
        {selectedCrisis && (
          <CrisisModal
            crisis={selectedCrisis}
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
          />
        )}
      </div>
    </div>
  );
}
