import CategoriesPage from '@/components/categories/CategoriesPage';

export default function Page() {
  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-2">Categorias</h1>
      <p className="text-gray-400 mb-8">
        Selecione as categorias que deseja receber para personalizar sua experiência
      </p>
      <CategoriesPage />
    </main>
  );
}
