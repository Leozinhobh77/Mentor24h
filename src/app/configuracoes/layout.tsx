import { ProtectedRoute } from '@/components/ProtectedRoute';
import { DashboardNavbar } from '@/components/DashboardNavbar';
import { ReactNode } from 'react';

export const metadata = {
  title: 'Configurações — Mentor24h',
  description: 'Configurações da conta e preferências',
};

export default function ConfiguracoesLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <DashboardNavbar />
        {children}
      </div>
    </ProtectedRoute>
  );
}
