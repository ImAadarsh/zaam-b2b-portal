'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronRight, ChevronUp, Layers } from 'lucide-react';
import { Category } from '@/types';

interface CategoryAccordionProps {
  categories: Category[];
  selectedCategory: string;
  selectedSubCategory: string;
  onSelectCategory: (categoryId: string, subCategoryId?: string) => void;
}

export const CategoryAccordion: React.FC<CategoryAccordionProps> = ({
  categories,
  selectedCategory,
  selectedSubCategory,
  onSelectCategory,
}) => {
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    drinks: true,
    confectionery: true
  });
  // Collapsed by default under `lg` so the grid stays above the fold on phones/tablets.
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  return (
    <div className="bg-white rounded-2xl shadow-soft-sm border border-neutral-200/80 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 p-3 border-b border-neutral-100">
        <button
          type="button"
          onClick={() => setMobileOpen(open => !open)}
          className="flex items-center space-x-2 min-w-0 lg:cursor-default"
          aria-expanded={mobileOpen}
        >
          <Layers className="w-4 h-4 text-zaam-green-600 flex-shrink-0" />
          <h3 className="text-[11px] font-bold uppercase tracking-wide text-neutral-800 text-left leading-tight">
            Wholesale Categories
          </h3>
          <span className="lg:hidden text-neutral-400">
            {mobileOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </span>
        </button>

        <button
          onClick={() => onSelectCategory('all', '')}
          className={`text-[11px] font-semibold px-2 py-1 rounded-md transition-colors flex-shrink-0 ${
            selectedCategory === 'all'
              ? 'bg-zaam-green-600 text-white'
              : 'text-neutral-500 hover:text-neutral-900 bg-neutral-100'
          }`}
        >
          View All
        </button>
      </div>

      {/* Categories Accordion List — scrolls independently of the product grid on desktop */}
      <div
        className={`${
          mobileOpen ? 'block' : 'hidden'
        } lg:block p-3 space-y-1.5 overflow-y-auto lg:max-h-[calc(100vh-12rem)]`}
      >
        {categories.length === 0 && (
          <p className="text-[11px] text-neutral-400 py-2">Loading categories…</p>
        )}
        {categories.map((cat) => {
          const subcategories = cat.subcategories || [];
          const hasSubcategories = subcategories.length > 0;
          const isExpanded = hasSubcategories && !!expandedCategories[cat.id];
          const isSelected = selectedCategory === cat.id && !selectedSubCategory;

          return (
            <div key={cat.id} className="rounded-xl overflow-hidden border border-neutral-100/80">
              {/* Parent Category Header */}
              <div
                className={`flex items-center justify-between p-2.5 cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-zaam-green-50 text-zaam-green-700 font-bold'
                    : 'bg-neutral-50/70 hover:bg-neutral-100 text-neutral-800 font-medium'
                }`}
                onClick={() => {
                  toggleCategory(cat.id);
                  onSelectCategory(cat.id, '');
                }}
              >
                <div className="flex items-center space-x-2 text-xs min-w-0">
                  <span className="truncate">{cat.name}</span>
                </div>

                <div className="flex items-center space-x-1 flex-shrink-0">
                  {hasSubcategories && (
                    <>
                      <span className="text-[10px] text-neutral-400 font-normal">
                        ({subcategories.length})
                      </span>
                      {isExpanded ? (
                        <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Nested Subcategories */}
              {isExpanded && (
                <div className="bg-white px-2 py-1.5 space-y-1 border-t border-neutral-100">
                  {subcategories.map((sub) => {
                    const isSubSelected = selectedSubCategory === sub.slug || selectedSubCategory === sub.id;

                    return (
                      <button
                        key={sub.id}
                        onClick={() => onSelectCategory(cat.id, sub.slug)}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-all ${
                          isSubSelected
                            ? 'bg-zaam-green-600 text-white font-semibold shadow-xs'
                            : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
                        }`}
                      >
                        <div className="flex items-center space-x-1.5 min-w-0">
                          <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60 flex-shrink-0" />
                          <span className="truncate text-left">{sub.name}</span>
                        </div>
                        {sub.itemCount && (
                          <span className={`text-[10px] flex-shrink-0 ml-1 ${isSubSelected ? 'text-white/80' : 'text-neutral-400'}`}>
                            {sub.itemCount}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
