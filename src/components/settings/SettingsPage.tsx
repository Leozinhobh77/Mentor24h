'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';
import { Alert } from '../Alert';

export function SettingsPage() {
  const { user, logout } = useAuth();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteEmail, setDeleteEmail] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDeleteAccount = async () => {
    if (deleteEmail !== user?.email) {
      setError('Email não corresponde. Digite seu email exato.');
      return;
    }

    try {
      setIsDeleting(true);
      setError(null);

      const token = localStorage.getItem('auth_token');
      if (!token) throw new Error('Token não encontrado');

      const response = await fetch('/api/auth/account', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!result.success) {
        setError(result.error || 'Erro ao deletar conta');
        return;
      }

      // Logout and redirect
      localStorage.removeItem('auth_token');
      window.location.href = '/';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Notificações */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
        <h2 className="text-xl font-bold text-white mb-6">🔔 Notificações</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-slate-700">
            <div>
              <p className="text-white font-medium">Resumos semanais via WhatsApp</p>
              <p className="text-gray-400 text-sm mt-1">Receba um resumo semanal de sua jornada</p>
            </div>
            <input type="checkbox" defaultChecked className="w-5 h-5 rounded cursor-pointer" />
          </div>

          <div className="flex items-center justify-between py-3 border-b border-slate-700">
            <div>
              <p className="text-white font-medium">Alertas de bem-estar</p>
              <p className="text-gray-400 text-sm mt-1">Notificações para seus horários de bem-estar</p>
            </div>
            <input type="checkbox" defaultChecked className="w-5 h-5 rounded cursor-pointer" />
          </div>

          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-white font-medium">Novidades do produto</p>
              <p className="text-gray-400 text-sm mt-1">Atualizações e novas funcionalidades</p>
            </div>
            <input type="checkbox" defaultChecked className="w-5 h-5 rounded cursor-pointer" />
          </div>
        </div>
      </div>

      {/* Conta */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
        <h2 className="text-xl font-bold text-white mb-6">🔐 Conta</h2>
        <div className="space-y-3">
          <Link href="/auth/reset" className="block w-full text-left px-4 py-3 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-colors">
            <p className="text-white font-medium">Alterar senha</p>
            <p className="text-gray-400 text-sm mt-1">Atualize sua senha periodicamente</p>
          </Link>

          <button className="w-full text-left px-4 py-3 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-colors">
            <p className="text-white font-medium">Exportar meus dados</p>
            <p className="text-gray-400 text-sm mt-1">Em breve</p>
          </button>
        </div>
      </div>

      {/* LGPD */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-6">
        <h2 className="text-xl font-bold text-blue-300 mb-6">⚖️ LGPD</h2>
        <div className="space-y-3">
          {user?.consentDate && (
            <p className="text-blue-200">
              <span className="font-medium">Consentimento dado em:</span>{' '}
              {new Date(user.consentDate).toLocaleDateString('pt-BR')}
            </p>
          )}
          <div className="space-y-2">
            <a href="#" className="block text-blue-300 hover:text-blue-200 underline text-sm">
              Política de Privacidade
            </a>
            <a href="#" className="block text-blue-300 hover:text-blue-200 underline text-sm">
              Termos de Uso
            </a>
          </div>
        </div>
      </div>

      {/* Zona de Perigo */}
      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6">
        <h2 className="text-xl font-bold text-red-400 mb-6">⚠️ Zona de Perigo</h2>
        <div className="space-y-3">
          <button
            onClick={() => logout()}
            className="w-full text-left px-4 py-3 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-colors border border-red-500/30"
          >
            <p className="text-red-300 font-medium">Fazer logout</p>
            <p className="text-red-400 text-sm mt-1">Sair de sua conta neste dispositivo</p>
          </button>

          <button
            onClick={() => setShowDeleteModal(true)}
            className="w-full text-left px-4 py-3 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-colors border border-red-500/30"
          >
            <p className="text-red-300 font-medium">Deletar conta permanentemente</p>
            <p className="text-red-400 text-sm mt-1">Esta ação é irreversível e removerá todos os seus dados</p>
          </button>
        </div>
      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-lg p-6 max-w-sm w-full border border-red-500">
            <h3 className="text-xl font-bold text-red-400 mb-2">⚠️ Deletar conta</h3>
            <p className="text-gray-300 mb-4">
              Esta ação é <span className="font-bold">permanente e irreversível</span>. Todos os seus dados serão removidos.
            </p>

            {error && (
              <Alert type="error" title="Erro" message={error} />
            )}

            <p className="text-gray-400 text-sm mb-4">
              Para confirmar, digite seu email:
            </p>

            <input
              type="email"
              value={deleteEmail}
              onChange={(e) => setDeleteEmail(e.target.value)}
              placeholder={user?.email}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 mb-4"
            />

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteEmail('');
                  setError(null);
                }}
                className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg transition-colors font-medium"
              >
                {isDeleting ? 'Deletando...' : 'Deletar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
