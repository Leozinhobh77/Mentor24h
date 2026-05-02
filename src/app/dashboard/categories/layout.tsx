import { ProtectedRoute } from '@/components';
import DashboardNavbar from '@/components/DashboardNavbar';

export const metadata = {
  title: 'Categorias | Mentor24h',
  description: 'Gerenciar suas categorias de interesse',
};

export default function CategoriesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <DashboardNavbar />
        {children}
      </div>
    </ProtectedRoute>
  );
}
