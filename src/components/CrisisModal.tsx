import { useState, useEffect } from 'react';
import { SeverityBadge } from './SeverityBadge';

/**
 * TASK-039: Modal Detalhes Crise
 *
 * Componente: CrisisModal
 * Features:
 * - Mostra detalhes completos da crise
 * - Histórico do usuário (últimas 5 msgs)
 * - Ações: contatar, escalar, fechar
 * - Acessibilidade: ESC para fechar, focus trap
 */

interface CrisisMessage {
  id: string;
  userId: number;
  body: string;
  direction: 'inbound' | 'outbound';
  severity: number;
  is_crisis: boolean;
  created_at: string;
}

interface CrisisModalProps {
  crisis: CrisisMessage;
  isOpen: boolean;
  onClose: () => void;
}

export function CrisisModal({ crisis, isOpen, onClose }: CrisisModalProps) {
  const [userHistory, setUserHistory] = useState<CrisisMessage[]>([]);
  const [loading, setLoading] = useState(false);

  // Buscar histórico do usuário quando modal abre
  useEffect(() => {
    if (!isOpen) return;

    async function fetchUserHistory() {
      try {
        setLoading(true);
        // TODO: substituir por GET /api/messages?userId=...&limit=5
        // Por agora, usar dados mock
        const mockHistory: CrisisMessage[] = [
          {
            id: 'h1',
            userId: crisis.userId,
            body: 'Oi, tudo bem?',
            direction: 'inbound',
            severity: 1,
            is_crisis: false,
            created_at: new Date(Date.now() - 86400000).toISOString(),
          },
          {
            id: 'h2',
            userId: crisis.userId,
            body: 'Estou triste com alguns problemas',
            direction: 'inbound',
            severity: 3,
            is_crisis: false,
            created_at: new Date(Date.now() - 43200000).toISOString(),
          },
          {
            id: 'h3',
            userId: crisis.userId,
            body: 'As coisas estão piorando...',
            direction: 'inbound',
            severity: 6,
            is_crisis: false,
            created_at: new Date(Date.now() - 21600000).toISOString(),
          },
          crisis,
          {
            id: 'h5',
            userId: crisis.userId,
            body: 'Obrigado pela resposta, vou tentar respirar',
            direction: 'inbound',
            severity: 4,
            is_crisis: false,
            created_at: new Date(Date.now() - 3600000).toISOString(),
          },
        ];
        setUserHistory(mockHistory);
      } catch (error) {
        console.error('Erro ao buscar histórico:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchUserHistory();
  }, [isOpen, crisis]);

  // Fechar ao pressionar ESC
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
        role="presentation"
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          {/* Header */}
          <div className="sticky top-0 bg-red-50 border-b-2 border-red-600 p-6 flex items-center justify-between">
            <div>
              <h2 id="modal-title" className="text-2xl font-bold text-red-900 flex items-center gap-2">
                🚨 Detalhes da Crise
              </h2>
              <p className="text-sm text-red-600 mt-1">
                Usuário ID: {crisis.userId}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl font-bold transition-colors"
              aria-label="Fechar modal"
            >
              ✕
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Crisis Details */}
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Severidade</p>
                  <SeverityBadge severity={crisis.severity} size="md" />
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600 mb-1">Data</p>
                  <p className="font-mono text-sm">
                    {new Date(crisis.created_at).toLocaleString('pt-BR')}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-2">Mensagem Crítica</p>
                <div className="bg-red-50 border-l-4 border-red-600 p-4 rounded">
                  <p className="text-gray-900 text-base leading-relaxed">
                    {crisis.body}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded">
                  <p className="text-xs text-gray-600 uppercase font-semibold mb-1">
                    Direção
                  </p>
                  <p className="text-sm font-medium">
                    {crisis.direction === 'inbound' ? '📥 Entrada' : '📤 Saída'}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded">
                  <p className="text-xs text-gray-600 uppercase font-semibold mb-1">
                    Status
                  </p>
                  <p className="text-sm font-medium">
                    {crisis.is_crisis ? '🚨 Crise' : '✅ Normal'}
                  </p>
                </div>
              </div>
            </div>

            {/* Divider */}
            <hr className="border-gray-200" />

            {/* User History */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">
                📜 Histórico do Usuário (últimas 5)
              </h3>

              {loading ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  Carregando histórico...
                </p>
              ) : userHistory.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  Nenhuma mensagem anterior
                </p>
              ) : (
                <div className="space-y-3">
                  {userHistory.map((msg) => (
                    <div
                      key={msg.id}
                      className={`p-3 rounded border-l-2 ${
                        msg.is_crisis
                          ? 'bg-red-50 border-l-red-500'
                          : 'bg-gray-50 border-l-blue-400'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <SeverityBadge severity={msg.severity} size="sm" />
                        <span className="text-xs text-gray-500 whitespace-nowrap">
                          {new Date(msg.created_at).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-800 leading-relaxed">
                        {msg.body.substring(0, 120)}
                        {msg.body.length > 120 ? '...' : ''}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Divider */}
            <hr className="border-gray-200" />

            {/* Actions */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-900 uppercase">
                Ações
              </h3>
              <div className="grid grid-cols-3 gap-3">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm">
                  💬 Contatar
                </button>
                <button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium text-sm">
                  ⬆️ Escalar
                </button>
                <button className="px-4 py-2 bg-gray-300 text-gray-900 rounded-lg hover:bg-gray-400 transition-colors font-medium text-sm">
                  📋 Log
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 border-t p-4 flex gap-3 justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 font-medium text-sm transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
