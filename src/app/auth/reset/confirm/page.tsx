import { UpdatePasswordForm } from '@/components/auth/UpdatePasswordForm';

export const metadata = {
  title: 'Atualizar senha | Mentor24h',
};

export default function ResetConfirmPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 flex items-center justify-center px-4 py-12">
      <UpdatePasswordForm />
    </div>
  );
}
