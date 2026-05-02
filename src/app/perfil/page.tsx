'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import { useState } from 'react';
import Link from 'next/link';

export default function PerfilPage() {
  const { user, logout, isLoading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    preferredAssistant: user?.preferredAssistant || '',
    timezone: user?.timezone || 'America/Sao_Paulo',
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-slate-700 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-800/50 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors">
            ← Voltar ao Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-white">Meu Perfil</h1>
          <div className="w-20" />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        {/* Profile Card */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-8 mb-8">
          {/* User Avatar */}
          <div className="flex items-center gap-6 mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <span className="text-4xl text-white font-bold">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{user?.name}</h2>
              <p className="text-gray-400">{user?.email}</p>
              <p className="text-gray-500 text-sm mt-1">
                Membro desde {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('pt-BR') : 'N/A'}
              </p>
            </div>
          </div>

          {/* Status */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-slate-700/50 rounded p-4">
              <p className="text-gray-400 text-sm">Status</p>
              <p className="text-white font-semibold mt-1">
                {user?.isActive ? '🟢 Ativo' : '🔴 Inativo'}
              </p>
            </div>
            <div className="bg-slate-700/50 rounded p-4">
              <p className="text-gray-400 text-sm">Consentimento LGPD</p>
              <p className="text-white font-semibold mt-1">
                {user?.consentGiven ? '✅ Concedido' : '❌ Não concedido'}
              </p>
            </div>
          </div>

          {/* Edit Button */}
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="w-full px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors font-medium"
          >
            {isEditing ? 'Cancelar edição' : 'Editar perfil'}
          </button>
        </div>

        {/* Edit Form */}
        {isEditing && (
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-8 mb-8">
            <h3 className="text-lg font-bold text-white mb-6">Editar informações</h3>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Nome completo
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-gray-400 cursor-not-allowed"
                />
                <p className="text-gray-500 text-xs mt-1">Email não pode ser alterado</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Assistente preferido
                </label>
                <select
                  value={formData.preferredAssistant}
                  onChange={(e) => setFormData({ ...formData, preferredAssistant: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Selecionar...</option>
                  <option value="Mateus">Mateus</option>
                  <option value="Sophia">Sophia</option>
                  <option value="Lucas">Lucas</option>
                  <option value="Marina">Marina</option>
                  <option value="Rafael">Rafael</option>
                  <option value="Isabella">Isabella</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Fuso horário
                </label>
                <select
                  value={formData.timezone}
                  onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="America/Sao_Paulo">São Paulo (UTC-3)</option>
                  <option value="America/Manaus">Manaus (UTC-4)</option>
                  <option value="America/Cayenne">Guiana Francesa (UTC-3)</option>
                  <option value="America/Paramaribo">Suriname (UTC-3)</option>
                </select>
              </div>

              <button
                type="button"
                className="w-full px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors font-medium"
              >
                Salvar alterações
              </button>
            </form>
          </div>
        )}

        {/* Security Section */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-8 mb-8">
          <h3 className="text-lg font-bold text-white mb-6">Segurança</h3>

          <div className="space-y-4">
            <button className="w-full text-left px-4 py-3 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-colors">
              <p className="text-white font-medium">Alterar senha</p>
              <p className="text-gray-400 text-sm mt-1">Atualize sua senha com frequência</p>
            </button>

            <button className="w-full text-left px-4 py-3 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-colors">
              <p className="text-white font-medium">Sessões ativas</p>
              <p className="text-gray-400 text-sm mt-1">Gerencie suas sessões de login</p>
            </button>

            <button className="w-full text-left px-4 py-3 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-colors">
              <p className="text-white font-medium">Autenticação de dois fatores</p>
              <p className="text-gray-400 text-sm mt-1">Adicione camada extra de segurança</p>
            </button>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-8">
          <h3 className="text-lg font-bold text-red-400 mb-6">⚠️ Zona de perigo</h3>

          <div className="space-y-4">
            <button className="w-full text-left px-4 py-3 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-colors border border-red-500/30">
              <p className="text-red-300 font-medium">Baixar meus dados</p>
              <p className="text-red-400 text-sm mt-1">Exportar uma cópia de todos os seus dados</p>
            </button>

            <button
              onClick={() => logout()}
              className="w-full text-left px-4 py-3 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-colors border border-red-500/30"
            >
              <p className="text-red-300 font-medium">Fazer logout</p>
              <p className="text-red-400 text-sm mt-1">Sair de sua conta neste dispositivo</p>
            </button>

            <button className="w-full text-left px-4 py-3 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-colors border border-red-500/30">
              <p className="text-red-300 font-medium">Deletar conta permanentemente</p>
              <p className="text-red-400 text-sm mt-1">Esta ação é irreversível e removerá todos os seus dados</p>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
