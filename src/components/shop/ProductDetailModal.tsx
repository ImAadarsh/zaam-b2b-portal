'use client';

import React, { useState } from 'react';
import { X, Plus, Minus, ShoppingBag, Scale, Barcode, Layers, Sparkles, TrendingUp } from 'lucide-react';
import { Product, ProductVariant } from '@/types';
import { useCart } from '@/context/CartContext';
import { useNotifications } from '@/context/NotificationContext';
import { ProductImage } from '@/components/ui/ProductImage';
import {
  EM_DASH,
  getBarcodeLabel,
  getPackSizeLabel,
  getPorPercent,
  getStockInfo,
  getUnitsPerCaseLabel,
  getWeightLabel,
  STOCK_TONE_CLASS
} from '@/lib/product';

interface ProductDetailModalProps {
  product: Product;
  initialVariant?: ProductVariant;
  onClose: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  initialVariant,
  onClose
}) => {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(
    initialVariant || product.variants[0]
  );
  const [orderQuantity, setOrderQuantity] = useState(1);
  const { addToCart, setIsCartDrawerOpen } = useCart();
  const { showToast } = useNotifications();

  const handleAddToCart = () => {
    addToCart(product, selectedVariant, orderQuantity);
    showToast(`Added ${orderQuantity} cases of ${product.brand} (${selectedVariant.name}) to basket!`, 'success');
    onClose();
    setIsCartDrawerOpen(true);
  };

  const porPercent = getPorPercent(selectedVariant);
  const stock = getStockInfo(selectedVariant.stockLevel);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-zaam-dark-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl border border-neutral-100 animate-in zoom-in-95 duration-200">

        {/* Compact media + title header */}
        <div className="relative flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gradient-to-r from-zaam-dark-950 via-zaam-dark-900 to-zaam-dark-800">
          <ProductImage
            src={product.imageUrl}
            alt={product.name}
            size="sm"
            fit="contain"
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl flex-shrink-0 ring-1 ring-white/10"
          />

          <div className="min-w-0 flex-1 pr-10">
            <span className="text-[10px] uppercase font-bold tracking-wider text-zaam-gold-400">
              {product.brand} Wholesale Spec
            </span>
            <h3 className="text-sm sm:text-base font-bold text-white leading-snug line-clamp-2">
              {product.name}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] font-semibold text-white/70">
                {getPackSizeLabel(selectedVariant.packSize)
                  ? `Pack ${getPackSizeLabel(selectedVariant.packSize)}`
                  : `Pack ${EM_DASH}`}
              </span>
              {porPercent !== null && (
                <span className="text-[10px] font-bold text-emerald-300 bg-emerald-500/15 px-1.5 py-0.5 rounded flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> POR {porPercent}%
                </span>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur transition-all"
            aria-label="Close product details"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 space-y-4 max-h-[55vh] overflow-y-auto">
          {product.description && (
            <p className="text-xs text-neutral-600 leading-relaxed">
              {product.description}
            </p>
          )}

          {/* Variant Selection */}
          {product.variants.length > 1 && (
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-800">
                Available Flavors & Formats
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {product.variants.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariant(v)}
                    className={`p-2 rounded-lg text-left border transition-all ${
                      selectedVariant.id === v.id
                        ? 'border-zaam-green-600 bg-zaam-green-50/60 ring-2 ring-zaam-green-600/20'
                        : 'border-neutral-200 hover:border-neutral-300 bg-neutral-50/50'
                    }`}
                  >
                    <p className="text-[11px] font-bold text-neutral-900 truncate">{v.name}</p>
                    <p className="text-[10px] text-neutral-500">{getPackSizeLabel(v.packSize) ?? EM_DASH}</p>
                    <p className="text-[11px] font-extrabold text-zaam-green-700 mt-0.5">
                      £{v.casePrice.toFixed(2)}/case
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Wholesale Tier Discount Grid */}
          {product.tierPricing && product.tierPricing.length > 0 && (
            <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-200/80 space-y-2">
              <div className="flex items-center space-x-1.5 text-[11px] font-bold text-neutral-800">
                <Sparkles className="w-3.5 h-3.5 text-zaam-gold-500" />
                <span>Tier Volume Pricing (Per Case)</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {product.tierPricing.map((tier) => (
                  <div
                    key={tier.minCases}
                    className={`p-1.5 rounded-lg text-center border ${
                      orderQuantity >= tier.minCases
                        ? 'bg-zaam-green-600 text-white border-zaam-green-600'
                        : 'bg-white text-neutral-700 border-neutral-200'
                    }`}
                  >
                    <span className="text-[9px] block opacity-80">{tier.minCases}+ Cases</span>
                    <span className="text-[11px] font-bold">£{tier.pricePerCase.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Technical Specs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="p-2.5 bg-neutral-50 rounded-lg border border-neutral-200">
              <div className="flex items-center space-x-1.5 text-neutral-400 mb-0.5">
                <Barcode className="w-3.5 h-3.5" />
                <span className="text-[9px] font-semibold uppercase">EAN Barcode</span>
              </div>
              <p className="font-mono font-bold text-neutral-800 text-[11px] truncate">
                {getBarcodeLabel(selectedVariant.barcode)}
              </p>
            </div>

            <div className="p-2.5 bg-neutral-50 rounded-lg border border-neutral-200">
              <div className="flex items-center space-x-1.5 text-neutral-400 mb-0.5">
                <Scale className="w-3.5 h-3.5" />
                <span className="text-[9px] font-semibold uppercase">Case Weight</span>
              </div>
              <p className="font-bold text-neutral-800 text-[11px]">{getWeightLabel(selectedVariant.weightKg)}</p>
            </div>

            <div className="p-2.5 bg-neutral-50 rounded-lg border border-neutral-200">
              <div className="flex items-center space-x-1.5 text-neutral-400 mb-0.5">
                <Layers className="w-3.5 h-3.5" />
                <span className="text-[9px] font-semibold uppercase">Units / Case</span>
              </div>
              <p className="font-bold text-neutral-800 text-[11px]">
                {getUnitsPerCaseLabel(selectedVariant.unitsPerCase)}
              </p>
            </div>

            <div className="p-2.5 bg-neutral-50 rounded-lg border border-neutral-200">
              <div className="flex items-center space-x-1.5 text-neutral-400 mb-0.5">
                <ShoppingBag className="w-3.5 h-3.5" />
                <span className="text-[9px] font-semibold uppercase">Availability</span>
              </div>
              <p className={`font-bold text-[11px] ${STOCK_TONE_CLASS[stock.tone]}`}>{stock.label}</p>
            </div>
          </div>
        </div>

        {/* Modal Footer / Add to Basket Bar */}
        <div className="p-3 sm:p-4 border-t border-neutral-200 bg-neutral-50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-3 w-full sm:w-auto justify-between sm:justify-start">
            <span className="text-xs font-semibold text-neutral-600">Case Qty:</span>
            <div className="flex items-center space-x-2 bg-white border border-neutral-300 rounded-xl p-1 shadow-xs">
              <button
                onClick={() => setOrderQuantity(Math.max(1, orderQuantity - 1))}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-8 text-center text-sm font-bold text-neutral-900">{orderQuantity}</span>
              <button
                onClick={() => setOrderQuantity(orderQuantity + 1)}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <div className="text-right sm:text-left">
              <span className="text-[11px] text-neutral-400">Total (ex VAT):</span>
              <p className="text-base font-extrabold text-zaam-green-700">
                £{(selectedVariant.casePrice * orderQuantity).toFixed(2)}
              </p>
            </div>

            <button
              onClick={handleAddToCart}
              className="flex-1 sm:flex-initial bg-zaam-green-600 hover:bg-zaam-green-700 text-white font-semibold text-xs sm:text-sm py-2.5 px-5 rounded-xl flex items-center justify-center space-x-2 shadow-glow-green btn-press transition-all"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Add to Basket</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
