'use client';

import React from 'react';
import Link from 'next/link';
import { X, Trash2, Plus, Minus, ArrowRight, ShieldCheck, ShoppingBag, Scale, Layers } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { ProductImage } from '@/components/ui/ProductImage';
import { getPackSizeLabel, EM_DASH, getWeightLabel } from '@/lib/product';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    isCartDrawerOpen,
    setIsCartDrawerOpen,
    updateQuantity,
    removeFromCart,
    clearCart,
    totalCases,
    totalUnits,
    totalWeightKg,
    subtotal,
    vatAmount,
    totalAmount
  } = useCart();

  if (!isCartDrawerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setIsCartDrawerOpen(false)}
        className="absolute inset-0 bg-zaam-dark-900/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
          
          {/* Drawer Header */}
          <div className="p-4 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/80">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-zaam-green-50 text-zaam-green-600 rounded-lg">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-zaam-dark-900">Wholesale Basket</h2>
                <p className="text-xs text-neutral-500">{totalCases} Cases ({totalUnits} Units)</p>
              </div>
            </div>

            <div className="flex items-center space-x-1">
              {cart.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-xs text-neutral-400 hover:text-rose-600 p-2 transition-colors flex items-center space-x-1"
                  title="Empty basket"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => setIsCartDrawerOpen(false)}
                className="p-2 text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-neutral-200/50 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center text-neutral-400">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="text-base font-semibold text-neutral-800">Your basket is empty</h3>
                <p className="text-xs text-neutral-500 max-w-xs">
                  Browse the wholesale catalog or use the barcode scanner to add cases to your order.
                </p>
                <button
                  onClick={() => setIsCartDrawerOpen(false)}
                  className="mt-2 bg-zaam-green-600 hover:bg-zaam-green-700 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-sm transition-colors"
                >
                  Browse Catalog
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.variant.id}
                  className="bg-white border border-neutral-200/80 rounded-xl p-3 shadow-soft-sm hover:border-zaam-green-600/30 transition-all flex space-x-3"
                >
                  {/* Thumbnail */}
                  <ProductImage
                    src={item.product.imageUrl}
                    alt={item.product.name}
                    size="sm"
                    className="w-16 h-16 rounded-lg flex-shrink-0 border border-neutral-100"
                  />

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-neutral-900 truncate">
                      {item.product.brand} - {item.variant.name}
                    </h4>
                    <p className="text-[11px] text-neutral-500 truncate">
                      Pack: {getPackSizeLabel(item.variant.packSize) ?? EM_DASH} • SKU: {item.variant.sku}
                    </p>

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-zaam-green-700">
                          £{(item.variant.casePrice * item.quantity).toFixed(2)}
                        </span>
                        <span className="text-[10px] text-neutral-400">
                          (£{item.variant.casePrice.toFixed(2)}/cs)
                        </span>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center space-x-1.5 bg-neutral-100 rounded-lg p-0.5 border border-neutral-200">
                        <button
                          onClick={() => updateQuantity(item.variant.id, item.quantity - 1)}
                          className="w-6 h-6 flex items-center justify-center rounded bg-white text-neutral-700 hover:bg-neutral-200 text-xs font-bold"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold px-1.5 text-neutral-900 min-w-[20px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.variant.id, item.quantity + 1)}
                          className="w-6 h-6 flex items-center justify-center rounded bg-white text-neutral-700 hover:bg-neutral-200 text-xs font-bold"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Drawer Footer / Checkout CTA */}
          {cart.length > 0 && (
            <div className="p-4 border-t border-neutral-200 bg-neutral-50 space-y-3">
              {/* Stats badges */}
              <div className="grid grid-cols-2 gap-2 text-[11px] text-neutral-600 bg-white p-2.5 rounded-xl border border-neutral-200">
                <div className="flex items-center space-x-1.5">
                  <Scale className="w-3.5 h-3.5 text-neutral-400" />
                  <span>Weight: <strong>{getWeightLabel(totalWeightKg)}</strong></span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <Layers className="w-3.5 h-3.5 text-neutral-400" />
                  <span>Cases: <strong>{totalCases}</strong></span>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-1 text-xs">
                <div className="flex justify-between text-neutral-600">
                  <span>Subtotal (Excl. VAT)</span>
                  <span>£{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>VAT (20%)</span>
                  <span>£{vatAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-zaam-dark-900 pt-1 border-t border-neutral-200">
                  <span>Total Payable</span>
                  <span className="text-zaam-green-700 font-extrabold text-base">£{totalAmount.toFixed(2)}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <Link
                href="/checkout"
                onClick={() => setIsCartDrawerOpen(false)}
                className="w-full bg-zaam-green-600 hover:bg-zaam-green-700 text-white font-semibold text-sm py-3 px-4 rounded-xl flex items-center justify-center space-x-2 shadow-glow-green btn-press transition-all"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <div className="flex items-center justify-center space-x-1 text-[11px] text-neutral-500">
                <ShieldCheck className="w-3.5 h-3.5 text-zaam-green-600" />
                <span>Trade Credit & Open Banking Protected</span>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
