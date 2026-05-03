'use client';

import { useState } from 'react';

export default function VisualizarDashboard() {
  const [currentView, setCurrentView] = useState('home');

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Navbar */}
      <nav className="border-b border-slate-700 bg-slate-900/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg"></div>
            <span className="font-bold text-white">Mentor24h</span>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-slate-400 hover:text-white text-sm">
              Dev User
            </button>
            <button className="bg-slate-800 hover:bg-slate-700 text-white px-3 py-2 rounded text-sm">
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 border-r border-slate-700 bg-slate-900/30 p-6 sticky top-16 h-[calc(100vh-64px)]">
          <div className="space-y-2">
            <button
              onClick={() => setCurrentView('home')}
              className={`w-full text-left px-4 py-2 rounded-lg transition ${
                currentView === 'home'
                  ? 'bg-purple-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              📊 Dashboard
            </button>
            <button
              onClick={() => setCurrentView('categories')}
              className={`w-full text-left px-4 py-2 rounded-lg transition ${
                currentView === 'categories'
                  ? 'bg-purple-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              📋 Categorias
            </button>
            <button
              onClick={() => setCurrentView('routines')}
              className={`w-full text-left px-4 py-2 rounded-lg transition ${
                currentView === 'routines'
                  ? 'bg-purple-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              ⏰ Rotinas
            </button>
            <button
              onClick={() => setCurrentView('perfil')}
              className={`w-full text-left px-4 py-2 rounded-lg transition ${
                currentView === 'perfil'
                  ? 'bg-purple-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              👤 Perfil
            </button>
            <button
              onClick={() => setCurrentView('config')}
              className={`w-full text-left px-4 py-2 rounded-lg transition ${
                currentView === 'config'
                  ? 'bg-purple-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              ⚙️ Configurações
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {currentView === 'home' && (
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
              <p className="text-slate-400 mb-8">
                Bem-vindo ao Mentor24h! Sua plataforma de bem-estar 24/7
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
                  <div className="text-3xl mb-2">📊</div>
                  <p className="text-slate-400 text-sm">Total de Mensagens</p>
                  <p className="text-2xl font-bold text-white mt-2">48</p>
                </div>
                <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
                  <div className="text-3xl mb-2">📋</div>
                  <p className="text-slate-400 text-sm">Categorias Selecionadas</p>
                  <p className="text-2xl font-bold text-white mt-2">18/42</p>
                </div>
                <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
                  <div className="text-3xl mb-2">⏰</div>
                  <p className="text-slate-400 text-sm">Rotinas Ativas</p>
                  <p className="text-2xl font-bold text-white mt-2">3/3</p>
                </div>
              </div>

              <div className="mt-8 bg-purple-900/20 border border-purple-700/50 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-white mb-2">
                  💡 Bem-vindo!
                </h2>
                <p className="text-slate-300">
                  Este é um preview do dashboard. Para acessar com dados reais,
                  faça login na página de autenticação.
                </p>
              </div>
            </div>
          )}

          {currentView === 'categories' && (
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Categorias</h1>
              <p className="text-slate-400 mb-8">
                Selecione suas categorias favoritas em 4 pilares
              </p>

              <div className="space-y-6">
                {['Organização', 'Inspiração', 'Entretenimento', 'Bem-estar'].map(
                  (pilar) => (
                    <div key={pilar}>
                      <h3 className="text-lg font-semibold text-white mb-3">
                        {pilar}
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map((i) => (
                          <button
                            key={i}
                            className="bg-slate-800/50 border border-slate-700 hover:border-purple-500 rounded-lg p-4 text-center transition cursor-pointer"
                          >
                            <div className="text-2xl mb-2">📌</div>
                            <p className="text-sm text-slate-300">
                              Categoria {i}
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          )}

          {currentView === 'routines' && (
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Rotinas</h1>
              <p className="text-slate-400 mb-8">
                3 rotinas automáticas para seu bem-estar
              </p>

              <div className="space-y-4">
                {[
                  {
                    icon: '📊',
                    name: 'Resumo Semanal',
                    time: 'Toda segunda às 08:00',
                    status: 'Ativa',
                  },
                  {
                    icon: '📈',
                    name: 'Análise de Padrões',
                    time: 'Toda segunda às 14:00',
                    status: 'Ativa',
                  },
                  {
                    icon: '🌟',
                    name: 'Dica Diária',
                    time: 'Diariamente às 19:00',
                    status: 'Ativa',
                  },
                ].map((routine) => (
                  <div
                    key={routine.name}
                    className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 hover:border-purple-500/50 transition"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="text-3xl">{routine.icon}</div>
                        <div>
                          <h3 className="text-lg font-semibold text-white">
                            {routine.name}
                          </h3>
                          <p className="text-slate-400 text-sm">
                            {routine.time}
                          </p>
                        </div>
                      </div>
                      <span className="bg-green-900/30 border border-green-700 text-green-400 px-3 py-1 rounded text-sm font-medium">
                        {routine.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentView === 'perfil' && (
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Meu Perfil</h1>
              <p className="text-slate-400 mb-8">
                Customize suas informações pessoais
              </p>

              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-8 max-w-2xl">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Nome
                    </label>
                    <input
                      type="text"
                      defaultValue="Dev User"
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Timezone
                    </label>
                    <select className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500">
                      <option>America/Sao_Paulo</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      WhatsApp
                    </label>
                    <input
                      type="text"
                      defaultValue="+5511999999999"
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 rounded-lg transition">
                    Salvar Perfil
                  </button>
                </div>
              </div>
            </div>
          )}

          {currentView === 'config' && (
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                Configurações
              </h1>
              <p className="text-slate-400 mb-8">
                Personalize suas preferências
              </p>

              <div className="space-y-6 max-w-2xl">
                <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Notificações
                  </h3>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="w-4 h-4"
                      />
                      <span className="text-slate-300">
                        Resumos semanais
                      </span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="w-4 h-4"
                      />
                      <span className="text-slate-300">
                        Alertas de crise
                      </span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        className="w-4 h-4"
                      />
                      <span className="text-slate-300">
                        Novidades e atualizações
                      </span>
                    </label>
                  </div>
                </div>

                <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Conta
                  </h3>
                  <button className="bg-red-900/30 hover:bg-red-900/50 border border-red-700 text-red-400 px-4 py-2 rounded-lg transition">
                    🗑️ Deletar Conta
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
