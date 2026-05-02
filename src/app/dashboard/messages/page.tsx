'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { SeverityBadge } from '@/components/SeverityBadge';
import { CrisisModal } from '@/components/CrisisModal';

/**
 * TASK-036: Messages List Page
 * TASK-037: Search + Filters
 *
 * Página: /dashboard/messages
 * Layout: lista mensagens com busca, filtros, paginação
 * Responsivo: mobile, tablet, desktop
 * Features: severity badge, timestamps, search, filters (severity, date)
 * Performance: < 200ms para queries
 */

interface Message {
  id: string;
  userId: number;
  body: string;
  direction: 'inbound' | 'outbound';
  severity: number;
  is_crisis: boolean;
  created_at: string;
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [duration, setDuration] = useState(0);
  const itemsPerPage = 20;

  // Filtros (TASK-037)
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState<number | ''>('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [crisisFilter, setCrisisFilter] = useState<'all' | 'true' | 'false'>('all');

  // Modal (TASK-039)
  const [selectedCrisis, setSelectedCrisis] = useState<Message | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch messages com filtros (TASK-037)
  useEffect(() => {
    async function fetchMessages() {
      try {
        setLoading(true);
        const offset = (page - 1) * itemsPerPage;

        // Construir URL com parâmetros
        const params = new URLSearchParams({
          limit: String(itemsPerPage),
          offset: String(offset),
        });

        if (search) params.append('search', search);
        if (severityFilter !== '') params.append('severity', String(severityFilter));
        if (crisisFilter !== 'all') params.append('crisis', crisisFilter);
        if (startDate) params.append('startDate', new Date(startDate).toISOString());
        if (endDate) params.append('endDate', new Date(endDate).toISOString());

        const response = await fetch(`/api/messages?${params.toString()}`);

        if (!response.ok) throw new Error('Failed to fetch messages');

        const data = await response.json();
        setMessages(data.messages || []);
        setTotal(data.total || 0);
        setTotalPages(Math.ceil((data.total || 0) / itemsPerPage));
        setDuration(data.duration || 0);
      } catch (error) {
        console.error('Error fetching messages:', error);
        setMessages([]);
      } finally {
        setLoading(false);
      }
    }

    fetchMessages();
  }, [page, search, severityFilter, crisisFilter, startDate, endDate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando mensagens...</p>
        </div>
      </div>
    );
  }

  const handleResetFilters = () => {
    setSearch('');
    setSeverityFilter('');
    setCrisisFilter('all');
    setStartDate('');
    setEndDate('');
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            📱 Mensagens
          </h1>
          <p className="text-gray-600">Histórico de mensagens WhatsApp com análise de crise</p>
          {duration > 0 && (
            <p className="text-xs text-gray-500 mt-2">
              {total} resultados ({duration}ms) • Página {page} de {totalPages}
            </p>
          )}
        </div>

        {/* TASK-037: Search & Filters */}
        <div className="bg-white rounded-lg shadow p-4 md:p-6 mb-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🔍 Buscar
              </label>
              <input
                type="text"
                placeholder="Digite uma palavra..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1); // Reset paginação
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Severity Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ⚠️ Severidade
              </label>
              <select
                value={severityFilter}
                onChange={(e) => {
                  setSeverityFilter(e.target.value ? Number(e.target.value) : '');
                  setPage(1);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todas</option>
                <option value="3">Baixa (3+)</option>
                <option value="6">Média (6+)</option>
                <option value="8">Alta (8+)</option>
                <option value="9">Crítica (9+)</option>
              </select>
            </div>

            {/* Crisis Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🚨 Crise
              </label>
              <select
                value={crisisFilter}
                onChange={(e) => {
                  setCrisisFilter(e.target.value as 'all' | 'true' | 'false');
                  setPage(1);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todas</option>
                <option value="true">Apenas crises</option>
                <option value="false">Sem crises</option>
              </select>
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📅 Período
              </label>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setPage(1);
                  }}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setPage(1);
                  }}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Reset Button */}
          {(search || severityFilter !== '' || crisisFilter !== 'all' || startDate || endDate) && (
            <div className="flex justify-end">
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 text-sm text-red-600 hover:text-red-800 font-medium border border-red-300 rounded-lg hover:bg-red-50"
              >
                ✕ Limpar filtros
              </button>
            </div>
          )}
        </div>

        {/* Messages List */}
        {messages.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500 text-lg">Nenhuma mensagem encontrada</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-4 md:p-6 border-l-4 ${
                  msg.is_crisis ? 'border-l-red-500 bg-red-50' : 'border-l-gray-300'
                }`}
              >
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                  {/* Severity Badge */}
                  <div className="md:col-span-2">
                    <SeverityBadge severity={msg.severity} size="md" />
                  </div>

                  {/* Message Content */}
                  <div className="md:col-span-7">
                    <p className="text-sm text-gray-500 mb-2">
                      Usuário ID: {msg.userId}
                    </p>
                    <p className="text-gray-900 font-medium line-clamp-2">
                      {msg.body.substring(0, 150)}
                      {msg.body.length > 150 ? '...' : ''}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(msg.created_at).toLocaleString('pt-BR')}
                    </p>
                  </div>

                  {/* Direction & Actions */}
                  <div className="md:col-span-3 flex flex-col items-end gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        msg.direction === 'inbound'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {msg.direction === 'inbound' ? '📥 Entrada' : '📤 Saída'}
                    </span>

                    {msg.is_crisis && (
                      <button
                        onClick={() => {
                          setSelectedCrisis(msg);
                          setIsModalOpen(true);
                        }}
                        className="text-red-600 hover:text-red-800 font-medium text-sm"
                      >
                        🚨 Ver Detalhes
                      </button>
                    )}
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
              className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
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
                    className={`px-3 py-2 rounded-lg ${
                      pageNum === page
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 hover:bg-gray-300'
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
              className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Próxima →
            </button>

            <span className="text-gray-600 text-sm">
              Página {page} de {totalPages}
            </span>
          </div>
        )}

        {/* Modal (TASK-039) */}
        {selectedCrisis && selectedCrisis.is_crisis && (
          <CrisisModal
            crisis={selectedCrisis as any}
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
          />
        )}
      </div>
    </div>
  );
}
