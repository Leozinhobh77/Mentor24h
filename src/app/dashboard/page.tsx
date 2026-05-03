'use client';

import { useAuth } from '@/lib/hooks/useAuth';

export default function DashboardPage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-slate-700 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Carregando seu dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-2">Bem-vindo ao Mentor24h! 👋</h2>
            <p className="text-gray-400">
              Sua plataforma de bem-estar completa. Comece explorando os 4 pilares:
              Organização, Inspiração, Entretenimento e Bem-estar.
            </p>
          </div>
        </div>

        {/* Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Organization Pillar */}
          <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30 rounded-lg p-6 hover:border-blue-500/50 transition-colors cursor-pointer group">
            <div className="text-3xl mb-2">📋</div>
            <h3 className="text-white font-semibold mb-2 group-hover:text-blue-300 transition-colors">
              Organização
            </h3>
            <p className="text-gray-400 text-sm">
              Planeje seus dias, organize tarefas e mantenha o foco
            </p>
          </div>

          {/* Inspiration Pillar */}
          <div className="bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/30 rounded-lg p-6 hover:border-amber-500/50 transition-colors cursor-pointer group">
            <div className="text-3xl mb-2">✨</div>
            <h3 className="text-white font-semibold mb-2 group-hover:text-amber-300 transition-colors">
              Inspiração
            </h3>
            <p className="text-gray-400 text-sm">
              Histórias motivacionais e citações para seu dia
            </p>
          </div>

          {/* Entertainment Pillar */}
          <div className="bg-gradient-to-br from-pink-500/20 to-pink-600/10 border border-pink-500/30 rounded-lg p-6 hover:border-pink-500/50 transition-colors cursor-pointer group">
            <div className="text-3xl mb-2">🎮</div>
            <h3 className="text-white font-semibold mb-2 group-hover:text-pink-300 transition-colors">
              Entretenimento
            </h3>
            <p className="text-gray-400 text-sm">
              Momento de diversão e descontração
            </p>
          </div>

          {/* Wellbeing Pillar */}
          <div className="bg-gradient-to-br from-green-500/20 to-green-600/10 border border-green-500/30 rounded-lg p-6 hover:border-green-500/50 transition-colors cursor-pointer group">
            <div className="text-3xl mb-2">🧘</div>
            <h3 className="text-white font-semibold mb-2 group-hover:text-green-300 transition-colors">
              Bem-estar
            </h3>
            <p className="text-gray-400 text-sm">
              Meditação, exercícios e cuidados pessoais
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
            <p className="text-gray-400 text-sm mb-1">Jornada iniciada em</p>
            <p className="text-white text-lg font-semibold">
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('pt-BR') : 'N/A'}
            </p>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
            <p className="text-gray-400 text-sm mb-1">Assistente preferido</p>
            <p className="text-white text-lg font-semibold">{user?.preferredAssistant || 'Não definido'}</p>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
            <p className="text-gray-400 text-sm mb-1">Fuso horário</p>
            <p className="text-white text-lg font-semibold">{user?.timezone || 'America/Sao_Paulo'}</p>
          </div>
        </div>

        {/* Coming Soon */}
        <div className="mt-8 bg-slate-800/50 border border-slate-700 rounded-lg p-6">
          <h3 className="text-white font-semibold mb-4">Em breve 🚀</h3>
          <ul className="space-y-2 text-gray-400 text-sm">
            <li>✓ Chat com 6 assistentes inteligentes</li>
            <li>✓ 92 áudios profissionais curados</li>
            <li>✓ 7 rotinas automáticas de bem-estar</li>
            <li>✓ Integração nativa com WhatsApp</li>
            <li>✓ Análise de bem-estar e padrões pessoais</li>
          </ul>
        </div>
    </main>
  );
}
