'use client';

import React, { useState } from 'react';
import { Plus, Minus, Eye, Tag, Sparkles } from 'lucide-react';
import { Product, ProductVariant } from '@/types';
import { useCart } from '@/context/CartContext';
import { useNotifications } from '@/context/NotificationContext';
import { ProductImage } from '@/components/ui/ProductImage';
import {
  EM_DASH,
  getPackSizeLabel,
  getPorPercent,
  getStockInfo,
  STOCK_TONE_CLASS
} from '@/lib/product';

interface ProductCardProps {
  product: Product;
  onOpenDetail?: (product: Product, variant: ProductVariant) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onOpenDetail }) => {
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const { addToCart, updateQuantity, getItemQuantity } = useCart();
  const { showToast } = useNotifications();

  const currentVariant = product.variants[selectedVariantIndex] || product.variants[0];
  const currentCartQty = getItemQuantity(currentVariant?.id || '');

  // A catalog item with no sellable variant cannot be priced or ordered.
  if (!currentVariant) return null;

  const handleAdd = () => {
    addToCart(product, currentVariant, 1);
    showToast(`Added 1 case of ${product.brand} (${currentVariant.name}) to basket`, 'success');
  };

  const handleIncrement = () => {
    updateQuantity(currentVariant.id, currentCartQty + 1);
  };

  const handleDecrement = () => {
    updateQuantity(currentVariant.id, currentCartQty - 1);
  };

  const lowestTierPrice = product.tierPricing && product.tierPricing.length > 0
    ? Math.min(...product.tierPricing.map(t => t.pricePerCase))
    : currentVariant.casePrice;

  const porPercent = getPorPercent(currentVariant);
  const packSize = getPackSizeLabel(currentVariant.packSize);
  const stock = getStockInfo(currentVariant.stockLevel);
  const unitsPerCase = Number(currentVariant.unitsPerCase) > 0 ? Number(currentVariant.unitsPerCase) : 1;

  return (
    <div className="bg-white rounded-xl border border-neutral-200/80 shadow-soft-sm hover:shadow-soft-md hover:border-zaam-green-600/30 transition-all duration-200 overflow-hidden flex flex-col group">

      {/* Product Image & Badges */}
      <div
        className="relative aspect-[4/3] w-full bg-neutral-50 overflow-hidden cursor-pointer"
        onClick={() => onOpenDetail?.(product, currentVariant)}
      >
        <ProductImage
          src={product.imageUrl}
          alt={product.name}
          size="md"
          fit="contain"
          className="h-full w-full"
          imgClassName="p-1.5 group-hover:scale-105 transition-transform duration-300"
        />

        {/* Promo / Fast Seller Badge */}
        <div className="absolute top-1.5 left-1.5 flex flex-col gap-1">
          {product.isPromo && (
            <span className="bg-rose-600 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-0.5">
              <Tag className="w-2.5 h-2.5" /> Promo
            </span>
          )}
          {product.featured && (
            <span className="bg-zaam-gold-500 text-zaam-dark-950 text-[9px] font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-0.5">
              <Sparkles className="w-2.5 h-2.5" /> Fast Seller
            </span>
          )}
        </div>

        {/* Quick View Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpenDetail?.(product, currentVariant);
          }}
          className="absolute bottom-1.5 right-1.5 p-1.5 bg-white/90 hover:bg-white text-neutral-700 hover:text-zaam-green-600 rounded-lg shadow-md backdrop-blur opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
          title="View product specifications"
        >
          <Eye className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Product Info */}
      <div className="p-2.5 flex-1 flex flex-col justify-between gap-2">
        <div className="min-w-0">
          {/* Brand & POR */}
          <div className="flex items-center justify-between gap-1 text-[10px] text-neutral-400 font-semibold uppercase tracking-wider">
            <span className="truncate">{product.brand}</span>
            {porPercent !== null && (
              <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 rounded flex-shrink-0">
                POR {porPercent}%
              </span>
            )}
          </div>

          {/* Product Name */}
          <h4
            onClick={() => onOpenDetail?.(product, currentVariant)}
            className="text-xs font-bold text-neutral-900 leading-snug line-clamp-2 mt-0.5 hover:text-zaam-green-600 cursor-pointer transition-colors"
            title={product.name}
          >
            {product.name}
          </h4>

          {/* Variant Selector Chips */}
          {product.variants.length > 1 && (
            <div className="mt-1.5 flex flex-wrap gap-1">
              {product.variants.map((v, idx) => (
                <button
                  key={v.id}
                  onClick={() => setSelectedVariantIndex(idx)}
                  className={`text-[9px] font-semibold px-1.5 py-0.5 rounded border transition-all max-w-full truncate ${
                    selectedVariantIndex === idx
                      ? 'bg-neutral-900 text-white border-neutral-900'
                      : 'bg-neutral-50 text-neutral-600 border-neutral-200 hover:bg-neutral-100'
                  }`}
                >
                  {v.flavor || v.name}
                </button>
              ))}
            </div>
          )}

          {/* Pack & Stock Info */}
          <div className="mt-1.5 flex items-center justify-between gap-1 text-[10px] text-neutral-500">
            <span className="truncate">Pack: <strong>{packSize ?? EM_DASH}</strong></span>
            <span className={`font-medium flex-shrink-0 ${STOCK_TONE_CLASS[stock.tone]}`}>{stock.label}</span>
          </div>
        </div>

        {/* Pricing & Add To Cart Bar */}
        <div className="pt-1.5 border-t border-neutral-100">
          <div className="flex items-baseline justify-between gap-1 mb-1.5">
            <div className="min-w-0">
              <span className="text-sm font-extrabold text-zaam-dark-900">
                £{currentVariant.casePrice.toFixed(2)}
              </span>
              <span className="text-[9px] text-neutral-400 ml-1">/case ex VAT</span>
            </div>

            {lowestTierPrice < currentVariant.casePrice && (
              <span className="text-[9px] text-zaam-green-700 font-bold bg-zaam-green-50 px-1 py-0.5 rounded flex-shrink-0">
                £{lowestTierPrice.toFixed(2)} min
              </span>
            )}
          </div>

          {/* Add / Quantity Control */}
          {currentCartQty === 0 ? (
            <button
              onClick={handleAdd}
              className="w-full bg-zaam-green-600 hover:bg-zaam-green-700 text-white font-semibold text-[11px] py-2 px-2 rounded-lg flex items-center justify-center space-x-1 shadow-sm btn-press transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add to Basket</span>
            </button>
          ) : (
            <div className="flex items-center justify-between bg-zaam-green-50 border border-zaam-green-200 rounded-lg p-0.5">
              <button
                onClick={handleDecrement}
                className="w-7 h-7 flex items-center justify-center rounded-md bg-white text-neutral-800 hover:bg-neutral-100 shadow-xs"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <div className="text-center px-1 min-w-0">
                <span className="text-[11px] font-extrabold text-zaam-green-800 block leading-tight">
                  {currentCartQty} {currentCartQty === 1 ? 'Case' : 'Cases'}
                </span>
                <span className="block text-[9px] text-neutral-500 font-medium leading-tight">
                  {currentCartQty * unitsPerCase} {currentCartQty * unitsPerCase === 1 ? 'unit' : 'units'}
                </span>
              </div>
              <button
                onClick={handleIncrement}
                className="w-7 h-7 flex items-center justify-center rounded-md bg-zaam-green-600 text-white hover:bg-zaam-green-700 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
