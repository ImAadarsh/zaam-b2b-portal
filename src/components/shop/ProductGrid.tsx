'use client';

import React from 'react';
import { Product, ProductVariant } from '@/types';
import { ProductCard } from './ProductCard';
import { PackageOpen } from 'lucide-react';

interface ProductGridProps {
  products: Product[];
  isLoading?: boolean;
  onOpenDetail?: (product: Product, variant: ProductVariant) => void;
}

const GRID_CLASS =
  'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2.5 sm:gap-3';

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  isLoading,
  onOpenDetail
}) => {
  if (isLoading) {
    return (
      <div className={GRID_CLASS}>
        {Array.from({ length: 12 }).map((_, n) => (
          <div key={n} className="bg-white rounded-xl p-2.5 border border-neutral-200 shadow-soft-sm animate-pulse space-y-2">
            <div className="aspect-[4/3] bg-neutral-200 rounded-lg w-full" />
            <div className="h-3 bg-neutral-200 rounded w-3/4" />
            <div className="h-2.5 bg-neutral-200 rounded w-1/2" />
            <div className="h-7 bg-neutral-200 rounded w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-12 border border-neutral-200 text-center space-y-3">
        <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto text-neutral-400">
          <PackageOpen className="w-8 h-8" />
        </div>
        <h3 className="text-base font-bold text-neutral-800">No products found in this category</h3>
        <p className="text-xs text-neutral-500 max-w-sm mx-auto">
          Try clearing your search query or selecting a different wholesale section.
        </p>
      </div>
    );
  }

  return (
    <div className={GRID_CLASS}>
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onOpenDetail={onOpenDetail}
        />
      ))}
    </div>
  );
};
