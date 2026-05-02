import { ProfileForm } from '@/components/profile/ProfileForm';

export const metadata = {
  title: 'Meu Perfil | Mentor24h',
};

export default function PerfilPage() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-2">Meu Perfil</h1>
      <p className="text-gray-400 mb-8">Atualize suas informações pessoais</p>
      <ProfileForm />
    </main>
  );
}
