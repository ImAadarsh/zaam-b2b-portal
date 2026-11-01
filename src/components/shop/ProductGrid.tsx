'use client';

import React from 'react';
import Link from 'next/link';
import { Product, ProductVariant } from '@/types';
import { ProductCard } from './ProductCard';
import { PackageOpen, RotateCcw, Store } from 'lucide-react';

interface ProductGridProps {
  products: Product[];
  isLoading?: boolean;
  searchQuery?: string;
  hasActiveFilter?: boolean;
  onClearFilters?: () => void;
  onOpenDetail?: (product: Product, variant: ProductVariant) => void;
}

const GRID_CLASS =
  'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2.5 sm:gap-3';

export const ProductGridSkeleton: React.FC<{ count?: number }> = ({ count = 12 }) => (
  <div className={GRID_CLASS} aria-busy="true" aria-label="Loading products">
    {Array.from({ length: count }).map((_, n) => (
      <div
        key={n}
        className="bg-white rounded-xl p-2.5 border border-neutral-200 shadow-soft-sm animate-pulse space-y-2"
      >
        <div className="aspect-[4/3] bg-neutral-200 rounded-lg w-full" />
        <div className="h-3 bg-neutral-200 rounded w-3/4" />
        <div className="h-2.5 bg-neutral-200 rounded w-1/2" />
        <div className="h-7 bg-neutral-200 rounded w-full" />
      </div>
    ))}
  </div>
);

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  isLoading,
  searchQuery,
  hasActiveFilter,
  onClearFilters,
  onOpenDetail
}) => {
  if (isLoading) {
    return <ProductGridSkeleton />;
  }

  if (products.length === 0) {
    const isFiltered = Boolean(hasActiveFilter || (searchQuery && searchQuery.trim()));
    return (
      <div className="bg-white rounded-2xl p-10 sm:p-12 border border-neutral-200 text-center space-y-3">
        <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto text-neutral-400">
          {isFiltered ? <PackageOpen className="w-8 h-8" /> : <Store className="w-8 h-8" />}
        </div>
        {isFiltered ? (
          <>
            <h3 className="text-base font-bold text-neutral-800">
              No products match{searchQuery?.trim() ? ` “${searchQuery.trim()}”` : ' these filters'}
            </h3>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto">
              Try a different brand, EAN, or clear filters to see the full wholesale catalog.
            </p>
            {onClearFilters && (
              <button
                type="button"
                onClick={onClearFilters}
                className="inline-flex items-center gap-1.5 mt-1 text-xs font-bold text-zaam-green-700 hover:text-zaam-green-800"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Clear search & filters
              </button>
            )}
          </>
        ) : (
          <>
            <h3 className="text-base font-bold text-neutral-800">Catalog is empty for this account</h3>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto">
              Once products are linked to your trade list they will appear here. You can still open Scan to look up EANs.
            </p>
            <Link
              href="/scan"
              className="inline-flex items-center gap-1.5 mt-1 text-xs font-bold text-zaam-green-700 hover:text-zaam-green-800"
            >
              Try barcode scan →
            </Link>
          </>
        )}
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
