'use client';

import React, { useCallback } from 'react';
import { clsx } from 'clsx';

interface CategoryCardProps {
  id: number;
  title: string;
  description?: string;
  pilar: 'organization' | 'inspiration' | 'entertainment' | 'wellbeing';
  isSelected: boolean;
  onToggle: (categoryId: number) => Promise<void>;
  isLoading?: boolean;
}

const pillarClasses = {
  organization: 'border-organization-500 bg-organization-50 hover:bg-organization-100',
  inspiration: 'border-inspiration-500 bg-inspiration-50 hover:bg-inspiration-100',
  entertainment: 'border-entertainment-500 bg-entertainment-50 hover:bg-entertainment-100',
  wellbeing: 'border-wellbeing-500 bg-wellbeing-50 hover:bg-wellbeing-100',
};

const pillarCheckClasses = {
  organization: 'text-organization-500',
  inspiration: 'text-inspiration-500',
  entertainment: 'text-entertainment-500',
  wellbeing: 'text-wellbeing-500',
};

export const CategoryCard = React.memo(function CategoryCard({
  id,
  title,
  description,
  pilar,
  isSelected,
  onToggle,
  isLoading = false,
}: CategoryCardProps) {
  const handleToggle = useCallback(async () => {
    await onToggle(id);
  }, [id, onToggle]);

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className={clsx(
        'p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer',
        'text-left hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed',
        pillarClasses[pilar],
        isSelected && 'ring-2 ring-offset-2'
      )}
      aria-pressed={isSelected}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{title}</h3>
          {description && (
            <p className="text-sm text-gray-600 mt-1">{description}</p>
          )}
        </div>
        <div
          className={clsx(
            'ml-3 flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center',
            isSelected ? pillarCheckClasses[pilar] : 'border-gray-300'
          )}
        >
          {isSelected && (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </div>
      </div>
    </button>
  );
});

CategoryCard.displayName = 'CategoryCard';
