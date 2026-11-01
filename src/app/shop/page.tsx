'use client';

import React, { useState, Suspense, useEffect, useCallback, useRef, lazy } from 'react';
import { useSearchParams } from 'next/navigation';
import { CategoryAccordion } from '@/components/shop/CategoryAccordion';
import { ProductGrid, ProductGridSkeleton } from '@/components/shop/ProductGrid';
import { zaamApi } from '@/lib/api';
import { Product, ProductVariant, Category } from '@/types';
import { Search, ArrowUpDown, Loader2 } from 'lucide-react';

const ProductDetailModal = lazy(() =>
  import('@/components/shop/ProductDetailModal').then((m) => ({ default: m.ProductDetailModal }))
);

const PAGE_SIZE = 36;

function ShopContent() {
  const searchParams = useSearchParams();
  const initialCat = searchParams.get('cat') || 'all';
  const initialSearch = searchParams.get('search') || '';

  const [selectedCategory, setSelectedCategory] = useState<string>(initialCat);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState<string>(initialSearch);
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'name'>('featured');
  const [modalProduct, setModalProduct] = useState<Product | null>(null);
  const [modalVariant, setModalVariant] = useState<ProductVariant | undefined>(undefined);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [isLoadingCatalog, setIsLoadingCatalog] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const offsetRef = useRef(0);
  const requestIdRef = useRef(0);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const cats = await zaamApi.getCategories();
        if (!cancelled) setCategories(cats);
      } catch {
        /* categories optional if products load */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const activeCat = selectedSubCategory || selectedCategory;

  const loadPage = useCallback(
    async (opts: { reset: boolean }) => {
      const requestId = ++requestIdRef.current;
      const offset = opts.reset ? 0 : offsetRef.current;
      if (opts.reset) {
        setIsLoadingCatalog(true);
        setCatalogError(null);
      } else {
        setIsLoadingMore(true);
      }
      try {
        const result = await zaamApi.getProducts({
          category: activeCat !== 'all' ? activeCat : undefined,
          search: debouncedSearch.trim() || undefined,
          limit: PAGE_SIZE,
          offset,
          sort: sortBy
        });
        if (requestId !== requestIdRef.current) return;
        setProducts((prev) => (opts.reset ? result.data : [...prev, ...result.data]));
        setTotal(result.meta.total);
        setHasMore(result.meta.hasMore);
        offsetRef.current = offset + result.data.length;
      } catch (err: any) {
        if (requestId !== requestIdRef.current) return;
        if (opts.reset) {
          setProducts([]);
          setTotal(0);
          setHasMore(false);
          setCatalogError(err.message || 'Failed to load catalog');
        }
      } finally {
        if (requestId === requestIdRef.current) {
          setIsLoadingCatalog(false);
          setIsLoadingMore(false);
        }
      }
    },
    [activeCat, debouncedSearch, sortBy]
  );

  useEffect(() => {
    offsetRef.current = 0;
    loadPage({ reset: true });
  }, [loadPage]);

  const handleSelectCategory = (catId: string, subCatSlug: string = '') => {
    setSelectedCategory(catId);
    setSelectedSubCategory(subCatSlug);
  };

  const handleOpenDetail = (product: Product, variant: ProductVariant) => {
    setModalProduct(product);
    setModalVariant(variant);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setDebouncedSearch('');
    setSelectedCategory('all');
    setSelectedSubCategory('');
    setSortBy('featured');
  };

  const hasActiveFilter =
    Boolean(debouncedSearch.trim()) || selectedCategory !== 'all' || Boolean(selectedSubCategory);

  const shown = products.length;
  const progressLabel =
    total > 0
      ? `Showing ${shown} of ${total}`
      : isLoadingCatalog
        ? 'Loading…'
        : 'No products';

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-2">
      <div className="bg-white rounded-2xl p-5 shadow-soft-sm border border-neutral-200/80 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-zaam-dark-900 tracking-tight">
                Wholesale Product Catalog
              </h1>
              <span className="text-xs bg-zaam-gold-500/20 text-zaam-gold-700 font-bold px-2 py-0.5 rounded-full">
                Tier Pricing Active
              </span>
            </div>
            <p className="text-xs text-neutral-500 mt-1">
              Browse wholesale cases, pallet quantities, and manufacturer deals.
            </p>
            {catalogError && (
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <p className="text-xs text-rose-600">{catalogError}</p>
                <button
                  type="button"
                  onClick={() => loadPage({ reset: true })}
                  className="text-xs font-bold text-zaam-green-700 hover:underline"
                >
                  Retry
                </button>
              </div>
            )}
          </div>

          <div
            className="text-xs text-neutral-500 bg-neutral-50 px-3 py-1.5 rounded-xl border border-neutral-200 self-start sm:self-auto tabular-nums"
            aria-live="polite"
          >
            {progressLabel}
            {total > 0 && (
              <span className="text-neutral-400"> · page size {PAGE_SIZE}</span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2 relative">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by brand, product name, or EAN barcode (e.g. Monster, Red Bull)..."
              className="w-full pl-10 pr-4 py-2.5 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-zaam-green-600 focus:bg-white transition-all"
              aria-label="Search products"
            />
          </div>

          <div className="relative">
            <ArrowUpDown className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-zaam-green-600 focus:bg-white appearance-none cursor-pointer font-medium text-neutral-700"
              aria-label="Sort products"
            >
              <option value="featured">Sort by: Top Featured & Margin</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name">Alphabetical (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[236px_minmax(0,1fr)] xl:grid-cols-[264px_minmax(0,1fr)] gap-4 lg:gap-5">
        <aside className="w-full">
          <div className="lg:sticky lg:top-20">
            <CategoryAccordion
              categories={categories}
              selectedCategory={selectedCategory}
              selectedSubCategory={selectedSubCategory}
              onSelectCategory={handleSelectCategory}
            />
          </div>
        </aside>

        <div className="min-w-0 space-y-4">
          <ProductGrid
            products={products}
            isLoading={isLoadingCatalog}
            searchQuery={debouncedSearch}
            hasActiveFilter={hasActiveFilter}
            onClearFilters={clearFilters}
            onOpenDetail={handleOpenDetail}
          />

          {!isLoadingCatalog && hasMore && (
            <div className="flex flex-col items-center gap-2 pt-2 pb-4">
              {total > 0 && (
                <div className="w-full max-w-xs h-1 rounded-full bg-neutral-100 overflow-hidden" aria-hidden>
                  <div
                    className="h-full bg-zaam-green-500 rounded-full transition-all"
                    style={{ width: `${Math.min(100, Math.round((shown / total) * 100))}%` }}
                  />
                </div>
              )}
              <button
                type="button"
                disabled={isLoadingMore}
                onClick={() => loadPage({ reset: false })}
                className="inline-flex items-center gap-2 bg-white border border-neutral-200 hover:border-zaam-green-500 text-neutral-800 text-xs font-bold px-5 py-2.5 rounded-xl shadow-soft-sm disabled:opacity-60 transition-all min-h-[44px]"
              >
                {isLoadingMore ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Loading…
                  </>
                ) : (
                  <>Load more · {Math.min(PAGE_SIZE, Math.max(0, total - shown))} more</>
                )}
              </button>
            </div>
          )}

          {!isLoadingCatalog && !hasMore && shown > 0 && (
            <p className="text-center text-[11px] text-neutral-400 pb-4">
              End of results · {shown} product{shown === 1 ? '' : 's'}
            </p>
          )}
        </div>
      </div>

      {modalProduct && (
        <Suspense fallback={null}>
          <ProductDetailModal
            key={modalProduct.id}
            product={modalProduct}
            initialVariant={modalVariant}
            onClose={() => setModalProduct(null)}
          />
        </Suspense>
      )}
    </div>
  );
}

function ShopFallback() {
  return (
    <div className="space-y-6 pb-2">
      <div className="bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-soft-sm space-y-4 animate-pulse">
        <div className="h-7 bg-neutral-200 rounded-lg w-2/3 max-w-sm" />
        <div className="h-10 bg-neutral-100 rounded-xl w-full" />
      </div>
      <ProductGridSkeleton count={12} />
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<ShopFallback />}>
      <ShopContent />
    </Suspense>
  );
}
