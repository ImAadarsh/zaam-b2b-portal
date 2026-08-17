'use client';

import React, { useState, Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { CategoryAccordion } from '@/components/shop/CategoryAccordion';
import { ProductGrid } from '@/components/shop/ProductGrid';
import { ProductDetailModal } from '@/components/shop/ProductDetailModal';
import { zaamApi } from '@/lib/api';
import { Product, ProductVariant, Category } from '@/types';
import { Search, ArrowUpDown } from 'lucide-react';

function ShopContent() {
  const searchParams = useSearchParams();
  const initialCat = searchParams.get('cat') || 'all';
  const initialSearch = searchParams.get('search') || '';

  const [selectedCategory, setSelectedCategory] = useState<string>(initialCat);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>(initialSearch);
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'name'>('featured');
  const [modalProduct, setModalProduct] = useState<Product | null>(null);
  const [modalVariant, setModalVariant] = useState<ProductVariant | undefined>(undefined);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [isLoadingCatalog, setIsLoadingCatalog] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [items, cats] = await Promise.all([zaamApi.getProducts(), zaamApi.getCategories()]);
        if (cancelled) return;
        setProducts(items);
        setCategories(cats);
      } catch (err: any) {
        if (!cancelled) setCatalogError(err.message || 'Failed to load catalog');
      } finally {
        if (!cancelled) setIsLoadingCatalog(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const handleSelectCategory = (catId: string, subCatSlug: string = '') => {
    setSelectedCategory(catId);
    setSelectedSubCategory(subCatSlug);
  };

  const handleOpenDetail = (product: Product, variant: ProductVariant) => {
    setModalProduct(product);
    setModalVariant(variant);
  };

  // Filter products
  const filteredProducts = products.filter((prod) => {
    // Category match
    if (selectedCategory !== 'all') {
      if (selectedSubCategory) {
        if (prod.subCategory !== selectedSubCategory) return false;
      } else {
        if (prod.category !== selectedCategory && prod.subCategory !== selectedCategory) return false;
      }
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const nameMatch = prod.name.toLowerCase().includes(q);
      const brandMatch = prod.brand.toLowerCase().includes(q);
      const variantMatch = prod.variants.some(v => 
        v.name.toLowerCase().includes(q) || 
        v.barcode.includes(q) || 
        v.sku.toLowerCase().includes(q)
      );
      if (!nameMatch && !brandMatch && !variantMatch) return false;
    }

    return true;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-asc') {
      return (a.variants[0]?.casePrice || 0) - (b.variants[0]?.casePrice || 0);
    }
    if (sortBy === 'price-desc') {
      return (b.variants[0]?.casePrice || 0) - (a.variants[0]?.casePrice || 0);
    }
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name);
    }
    return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Banner & Search Header */}
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
            {catalogError && <p className="text-xs text-rose-600 mt-1">{catalogError}</p>}
          </div>

          {/* Quick Stats */}
          <div className="text-xs text-neutral-500 bg-neutral-50 px-3 py-1.5 rounded-xl border border-neutral-200 self-start sm:self-auto">
            Showing <strong className="text-neutral-900">{sortedProducts.length}</strong> products
          </div>
        </div>

        {/* Search Bar & Sort Dropdown */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2 relative">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by brand, product name, or EAN barcode (e.g. Monster, Red Bull)..."
              className="w-full pl-10 pr-4 py-2.5 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-zaam-green-600 focus:bg-white transition-all"
            />
          </div>

          <div className="relative">
            <ArrowUpDown className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-zaam-green-600 focus:bg-white appearance-none cursor-pointer font-medium text-neutral-700"
            >
              <option value="featured">Sort by: Top Featured & Margin</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name">Alphabetical (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content Layout: Left Category Accordion + Right Product Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[236px_minmax(0,1fr)] xl:grid-cols-[264px_minmax(0,1fr)] gap-4 lg:gap-5">
        {/* Left Sidebar Category Accordion — stays pinned below the sticky AppHeader */}
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

        {/* Right Product Grid */}
        <div className="min-w-0">
          <ProductGrid
            products={sortedProducts}
            isLoading={isLoadingCatalog}
            onOpenDetail={handleOpenDetail}
          />
        </div>
      </div>

      {/* Product Spec Detail Modal */}
      {modalProduct && (
        <ProductDetailModal
          key={modalProduct.id}
          product={modalProduct}
          initialVariant={modalVariant}
          onClose={() => setModalProduct(null)}
        />
      )}

    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-neutral-500">Loading catalog...</div>}>
      <ShopContent />
    </Suspense>
  );
}
