import Link from 'next/link';
import { Navbar } from '@/components/Navbar';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Navbar />
      <div className="container mx-auto px-4 py-20">
        <div className="text-center space-y-8">
          <h1 className="text-5xl font-bold text-white mb-4">
            Mentor24h
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Seu ecossistema de bem-estar 24/7 via WhatsApp. Organização, Inspiração, Entretenimento e Bem-estar em um único lugar.
          </p>

          <div className="grid md:grid-cols-4 gap-4 mb-12 max-w-4xl mx-auto">
            <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-6">
              <div className="text-3xl mb-2">🎯</div>
              <h3 className="text-lg font-semibold text-white">Organização</h3>
              <p className="text-sm text-gray-300 mt-2">Planejamento e produtividade</p>
            </div>
            <div className="bg-pink-500/20 border border-pink-500/50 rounded-lg p-6">
              <div className="text-3xl mb-2">✨</div>
              <h3 className="text-lg font-semibold text-white">Inspiração</h3>
              <p className="text-sm text-gray-300 mt-2">Motivação diária</p>
            </div>
            <div className="bg-rose-500/20 border border-rose-500/50 rounded-lg p-6">
              <div className="text-3xl mb-2">🎭</div>
              <h3 className="text-lg font-semibold text-white">Entretenimento</h3>
              <p className="text-sm text-gray-300 mt-2">Diversão e leveza</p>
            </div>
            <div className="bg-sky-500/20 border border-sky-500/50 rounded-lg p-6">
              <div className="text-3xl mb-2">💆</div>
              <h3 className="text-lg font-semibold text-white">Bem-estar</h3>
              <p className="text-sm text-gray-300 mt-2">Saúde e equilíbrio</p>
            </div>
          </div>

          <div className="space-y-4 mt-12">
            <Link
              href="/dashboard"
              className="inline-block bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3 px-8 rounded-lg transition-all duration-200"
            >
              Acessar Dashboard
            </Link>
            <p className="text-gray-400 text-sm">
              ⚠️ Em desenvolvimento - configure as variáveis de ambiente antes de usar
            </p>
          </div>

          <div className="mt-16 text-gray-400 text-sm space-y-2">
            <p>📊 Status: Setup completo - Estrutura criada</p>
            <p>🔄 Próximos passos: Autenticação e API</p>
            <p>💡 Use <code className="bg-slate-800 px-2 py-1 rounded">npm run dev</code> para iniciar o servidor</p>
          </div>
        </div>
      </div>
    </div>
  );
}
