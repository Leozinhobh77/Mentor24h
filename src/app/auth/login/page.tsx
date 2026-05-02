import { LoginForm } from '@/components/auth/LoginForm';
import Link from 'next/link';

export const metadata = {
  title: 'Login — Mentor24h',
  description: 'Acesse sua conta Mentor24h',
};

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <LoginForm />

        {/* Footer Link */}
        <div className="mt-8 text-center text-xs text-gray-500">
          <p>
            Mentor24h © 2026 • Todos os direitos reservados
            <br />
            <Link href="/" className="hover:text-gray-400 transition-colors">
              Voltar ao início
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
