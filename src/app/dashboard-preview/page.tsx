import { DashboardNavbar } from '@/components/DashboardNavbar';

export const metadata = {
  title: 'Dashboard Preview | Mentor24h',
};

export default function DashboardPreview() {
  return (
    <div className="min-h-screen bg-slate-950">
      <DashboardNavbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-2">
            🎯 Dashboard Mentor24h
          </h1>
          <p className="text-slate-400 text-lg">
            Bem-vindo! Visualize seu dashboard e explore os recursos.
          </p>
        </div>

        {/* Grid de Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card: Categorias */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 hover:border-blue-500/50 transition-all hover:shadow-lg hover:shadow-blue-500/20">
            <div className="text-4xl mb-4">📋</div>
            <h2 className="text-xl font-semibold text-white mb-2">Categorias</h2>
            <p className="text-slate-400 text-sm mb-4">
              42 categorias em 4 pilares: Organização, Inspiração, Entretenimento e Bem-estar
            </p>
            <a
              href="/dashboard/categories"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
            >
              Explorar Categorias →
            </a>
          </div>

          {/* Card: Rotinas */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 hover:border-purple-500/50 transition-all hover:shadow-lg hover:shadow-purple-500/20">
            <div className="text-4xl mb-4">⏰</div>
            <h2 className="text-xl font-semibold text-white mb-2">Rotinas</h2>
            <p className="text-slate-400 text-sm mb-4">
              3 rotinas automáticas: Resumo Semanal, Análise de Padrões e Dica Diária
            </p>
            <a
              href="/dashboard/routines"
              className="inline-block bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
            >
              Ver Rotinas →
            </a>
          </div>

          {/* Card: Perfil */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 hover:border-pink-500/50 transition-all hover:shadow-lg hover:shadow-pink-500/20">
            <div className="text-4xl mb-4">👤</div>
            <h2 className="text-xl font-semibold text-white mb-2">Perfil</h2>
            <p className="text-slate-400 text-sm mb-4">
              Customize seu nome, timezone, assistente preferido e WhatsApp
            </p>
            <a
              href="/perfil"
              className="inline-block bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
            >
              Editar Perfil →
            </a>
          </div>

          {/* Card: Configurações */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 hover:border-green-500/50 transition-all hover:shadow-lg hover:shadow-green-500/20">
            <div className="text-4xl mb-4">⚙️</div>
            <h2 className="text-xl font-semibold text-white mb-2">Configurações</h2>
            <p className="text-slate-400 text-sm mb-4">
              Notificações, preferências LGPD e gerenciamento de conta
            </p>
            <a
              href="/configuracoes"
              className="inline-block bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
            >
              Configurar →
            </a>
          </div>

          {/* Card: Auth */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 hover:border-yellow-500/50 transition-all hover:shadow-lg hover:shadow-yellow-500/20">
            <div className="text-4xl mb-4">🔐</div>
            <h2 className="text-xl font-semibold text-white mb-2">Autenticação</h2>
            <p className="text-slate-400 text-sm mb-4">
              Registre-se ou faça login para acessar seu dashboard pessoal
            </p>
            <a
              href="/auth/register"
              className="inline-block bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
            >
              Começar →
            </a>
          </div>

          {/* Card: WhatsApp */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 hover:border-emerald-500/50 transition-all hover:shadow-lg hover:shadow-emerald-500/20">
            <div className="text-4xl mb-4">💬</div>
            <h2 className="text-xl font-semibold text-white mb-2">WhatsApp</h2>
            <p className="text-slate-400 text-sm mb-4">
              Interface principal via WhatsApp com detecção de crise em tempo real
            </p>
            <div className="text-xs text-emerald-400 font-medium">
              ✓ Conectado ao Twilio
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-12 bg-gradient-to-r from-purple-900/20 to-pink-900/20 border border-purple-700/50 rounded-lg p-8">
          <h3 className="text-2xl font-bold text-white mb-4">
            🚀 Bem-vindo ao Mentor24h
          </h3>
          <p className="text-slate-300 mb-4">
            Sistema integrado de bem-estar 24/7 via WhatsApp + Dashboard Web.
            Organize, inspire-se, divirta-se e cuide da sua saúde mental com
            assistentes inteligentes e detecção de crise.
          </p>
          <ul className="space-y-2 text-slate-300">
            <li>✅ 42 categorias em 4 pilares</li>
            <li>✅ 3 rotinas automáticas inteligentes</li>
            <li>✅ Detecção de crise 99.9% confiável</li>
            <li>✅ Criptografia end-to-end (LGPD compliant)</li>
            <li>✅ Resposta automática com números de emergência</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
