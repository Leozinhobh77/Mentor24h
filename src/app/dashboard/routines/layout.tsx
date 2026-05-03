import { Metadata } from 'next';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { DashboardNavbar } from '@/components/DashboardNavbar';

export const metadata: Metadata = {
  title: 'Rotinas | Mentor24h',
  description: 'Gerencie suas rotinas automáticas',
};

export default function RoutinesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <DashboardNavbar />
      {children}
    </ProtectedRoute>
  );
}
