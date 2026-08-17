'use client';

import React, { useState } from 'react';
import { Plus, Minus, ShoppingBag, X, CheckCircle2 } from 'lucide-react';
import { Product, ProductVariant } from '@/types';
import { useCart } from '@/context/CartContext';
import { useNotifications } from '@/context/NotificationContext';
import { ProductImage } from '@/components/ui/ProductImage';
import { EM_DASH, getBarcodeLabel, getPackSizeLabel } from '@/lib/product';

interface ScannedItemResultProps {
  product: Product;
  variant: ProductVariant;
  onClose: () => void;
}

export const ScannedItemResult: React.FC<ScannedItemResultProps> = ({
  product,
  variant,
  onClose
}) => {
  const [quantity, setQuantity] = useState(1);
  const { addToCart, setIsCartDrawerOpen } = useCart();
  const { showToast } = useNotifications();

  const handleAdd = () => {
    addToCart(product, variant, quantity);
    showToast(`Added ${quantity} cases of ${product.brand} (${variant.name}) to basket!`, 'success');
    onClose();
    setIsCartDrawerOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-zaam-dark-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-neutral-100 animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-4 bg-zaam-green-600 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-zaam-gold-400" />
            <h3 className="text-sm font-bold">Product Identified!</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          <div className="flex space-x-4">
            <ProductImage
              src={product.imageUrl}
              alt={product.name}
              size="sm"
              className="w-20 h-20 rounded-2xl flex-shrink-0 border border-neutral-100"
            />
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-bold text-zaam-green-700 bg-zaam-green-50 px-2 py-0.5 rounded-full uppercase">
                {product.brand}
              </span>
              <h4 className="text-sm font-bold text-neutral-900 truncate mt-1">
                {product.name}
              </h4>
              <p className="text-xs text-neutral-500 mt-0.5 truncate">
                Variant: <strong>{variant.name}</strong>
              </p>
              <p className="text-xs font-mono text-neutral-400 mt-0.5">
                EAN: {getBarcodeLabel(variant.barcode)}
              </p>
            </div>
          </div>

          {/* Quick Specs */}
          <div className="grid grid-cols-2 gap-2 text-xs bg-neutral-50 p-3 rounded-xl border border-neutral-200">
            <div>
              <span className="text-neutral-400 text-[10px] block">Pack Size</span>
              <span className="font-bold text-neutral-800">{getPackSizeLabel(variant.packSize) ?? EM_DASH}</span>
            </div>
            <div>
              <span className="text-neutral-400 text-[10px] block">Wholesale Price</span>
              <span className="font-bold text-zaam-green-700 text-sm">£{variant.casePrice.toFixed(2)} /case</span>
            </div>
          </div>

          {/* Case Stepper */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs font-bold text-neutral-700">Order Quantity:</span>
            <div className="flex items-center space-x-2 bg-neutral-100 border border-neutral-200 rounded-xl p-1">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-white text-neutral-800 font-bold shadow-xs"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-8 text-center text-sm font-extrabold text-neutral-900">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-zaam-green-600 text-white font-bold shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Price & Action */}
          <div className="pt-3 border-t border-neutral-100 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-neutral-400">Total (ex. VAT):</span>
              <p className="text-base font-extrabold text-zaam-dark-900">
                £{(variant.casePrice * quantity).toFixed(2)}
              </p>
            </div>

            <button
              onClick={handleAdd}
              className="bg-zaam-green-600 hover:bg-zaam-green-700 text-white text-xs font-bold py-3 px-5 rounded-xl shadow-glow-green flex items-center space-x-1.5 btn-press"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Add {quantity} Case(s)</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
