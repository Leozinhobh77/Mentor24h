import { SettingsPage } from '@/components/settings/SettingsPage';

export const metadata = {
  title: 'Configurações | Mentor24h',
};

export default function ConfiguracoesPageRoute() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-2">Configurações</h1>
      <p className="text-gray-400 mb-8">Gerencie suas preferências e segurança da conta</p>
      <SettingsPage />
    </main>
  );
}
