import { ResetForm } from '@/components/auth/ResetForm';

export const metadata = {
  title: 'Recuperar senha | Mentor24h',
};

export default function ResetPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 flex items-center justify-center px-4 py-12">
      <ResetForm />
    </div>
  );
}
