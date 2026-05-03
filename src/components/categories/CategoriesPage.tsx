'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { CategoryCard } from './CategoryCard';

interface Category {
  id: number;
  name: string;
  icon?: string;
  pillar: string;
  order: number;
  isSelected: boolean;
}

interface GroupedCategories {
  organization: Category[];
  inspiration: Category[];
  entertainment: Category[];
  wellbeing: Category[];
}

const PILLAR_CONFIG = {
  organization: {
    label: 'Organização',
    color: 'blue',
    bgColor: 'from-blue-500/20 to-blue-600/10',
    borderColor: 'border-blue-500/30',
    textColor: 'text-blue-300',
  },
  inspiration: {
    label: 'Inspiração',
    color: 'amber',
    bgColor: 'from-amber-500/20 to-amber-600/10',
    borderColor: 'border-amber-500/30',
    textColor: 'text-amber-300',
  },
  entertainment: {
    label: 'Entretenimento',
    color: 'pink',
    bgColor: 'from-pink-500/20 to-pink-600/10',
    borderColor: 'border-pink-500/30',
    textColor: 'text-pink-300',
  },
  wellbeing: {
    label: 'Bem-estar',
    color: 'green',
    bgColor: 'from-green-500/20 to-green-600/10',
    borderColor: 'border-green-500/30',
    textColor: 'text-green-300',
  },
};

export default function CategoriesPage() {
  const { isLoading: authLoading } = useAuth();
  const [categories, setCategories] = useState<GroupedCategories | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toggling, setToggling] = useState<number | null>(null);

  // Load categories on mount
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Token não encontrado');
      }

      const response = await fetch('/api/categories', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Erro ao buscar categorias');
      }

      setCategories(result.data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = useCallback(async (categoryId: number) => {
    if (!categories) return;

    // Encontrar pillar dinamicamente (mais eficiente)
    let pillar: keyof GroupedCategories | null = null;
    for (const p of Object.keys(categories) as Array<keyof GroupedCategories>) {
      if (categories[p].some((c) => c.id === categoryId)) {
        pillar = p;
        break;
      }
    }

    if (!pillar) return;

    // Otimistic update
    const newCategories = { ...categories };
    const catIndex = newCategories[pillar].findIndex((c) => c.id === categoryId);
    if (catIndex >= 0) {
      newCategories[pillar][catIndex].isSelected = !newCategories[pillar][catIndex].isSelected;
      setCategories(newCategories);
    }

    setToggling(categoryId);
    setError(null);

    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Token não encontrado');
      }

      const response = await fetch(`/api/user/categories/${categoryId}/toggle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!result.success) {
        const revertCategories = { ...newCategories };
        if (catIndex >= 0) {
          revertCategories[pillar][catIndex].isSelected = !revertCategories[pillar][catIndex].isSelected;
          setCategories(revertCategories);
        }
        setError(result.error || 'Erro ao atualizar categoria');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(message);
      const revertCategories = { ...newCategories };
      if (catIndex >= 0) {
        revertCategories[pillar][catIndex].isSelected = !revertCategories[pillar][catIndex].isSelected;
        setCategories(revertCategories);
      }
    } finally {
      setToggling(null);
    }
  }, [categories]);

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-slate-700 border-t-purple-500 rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-400">Carregando categorias...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-300">
        ❌ {error}
      </div>
    );
  }

  if (!categories) {
    return (
      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 text-yellow-300">
        ⚠️ Nenhuma categoria encontrada
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {Object.entries(PILLAR_CONFIG).map(([pillar, config]) => {
        const cats = categories[pillar as keyof typeof categories];
        const selectedCount = cats.filter((c) => c.isSelected).length;

        return (
          <div key={pillar}>
            {/* Section header */}
            <div className={`bg-gradient-to-r ${config.bgColor} border ${config.borderColor} rounded-lg p-4 mb-4`}>
              <div className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded-full bg-${config.color}-500`}></div>
                <h2 className={`text-lg font-semibold ${config.textColor}`}>{config.label}</h2>
                <span className="text-gray-400 text-sm ml-auto">
                  {selectedCount} de {cats.length} selecionadas
                </span>
              </div>
            </div>

            {/* Categories grid — memoized cards para performance */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {cats.map((cat) => (
                <CategoryCard
                  key={cat.id}
                  id={cat.id}
                  title={cat.name}
                  pilar={pillar as 'organization' | 'inspiration' | 'entertainment' | 'wellbeing'}
                  isSelected={cat.isSelected}
                  isLoading={toggling === cat.id}
                  onToggle={handleToggle}
                />
              ))}
            </div>
          </div>
        );
      })}

      {/* Summary card */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 mt-8">
        <p className="text-gray-400 text-sm">
          💡 Categorias selecionadas ajudam a personalizar as mensagens que você recebe no WhatsApp.
          Você pode alterar suas preferências a qualquer momento.
        </p>
      </div>
    </div>
  );
}
