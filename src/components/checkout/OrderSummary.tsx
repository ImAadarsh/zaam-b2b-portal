'use client';

import React, { useState } from 'react';
import { ShoppingBag, Scale, Layers, Tag, Loader2, AlertTriangle } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { zaamApi } from '@/lib/api';
import { useNotifications } from '@/context/NotificationContext';
import { ProductImage } from '@/components/ui/ProductImage';
import { EM_DASH, formatSaleQty, getMaxOrderQty, getPackLabel, getWeightLabel } from '@/lib/product';

type AppliedCoupon = {
  couponCode: string;
  couponName: string;
  discountAmount: number;
  freeShipping?: boolean;
};

type Props = {
  appliedCoupon?: AppliedCoupon | null;
  onCouponApplied?: (coupon: AppliedCoupon | null) => void;
  shippingPrice?: number;
  shippingLabel?: string;
};

export const OrderSummary: React.FC<Props> = ({
  appliedCoupon,
  onCouponApplied,
  shippingPrice = 0,
  shippingLabel = 'Delivery'
}) => {
  const { cart, totalCases, totalUnits, totalWeightKg, subtotal, vatAmount, totalAmount } = useCart();
  const { showToast } = useNotifications();
  const [code, setCode] = useState('');
  const [applying, setApplying] = useState(false);

  const discount = Number(appliedCoupon?.discountAmount || 0);
  const ship = appliedCoupon?.freeShipping ? 0 : Number(shippingPrice) || 0;
  const shippingVat = ship > 0 ? ship * 0.2 : 0;
  const payable = Math.max(0, totalAmount + ship + shippingVat - discount);

  const applyCoupon = async () => {
    if (!code.trim() || !onCouponApplied) return;
    setApplying(true);
    try {
      const result = await zaamApi.validateCoupon(code.trim(), subtotal);
      onCouponApplied({
        couponCode: result.couponCode,
        couponName: result.couponName,
        discountAmount: result.discountAmount,
        freeShipping: result.freeShipping
      });
      showToast(`Coupon ${result.couponCode} applied`, 'success');
    } catch (e: any) {
      onCouponApplied(null);
      showToast(e.message || 'Invalid coupon', 'error');
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-5 shadow-soft-sm border border-neutral-200/80 space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
        <div className="flex items-center space-x-2">
          <ShoppingBag className="w-4 h-4 text-zaam-green-600" />
          <h3 className="text-sm font-bold text-neutral-900">Order Manifest & Summary</h3>
        </div>
        <span className="text-xs font-semibold text-neutral-500">{totalCases} {totalCases === 1 ? 'item' : 'items'}</span>
      </div>

      <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
        {cart.map((item) => (
          <div key={item.variant.id} className="flex items-center justify-between text-xs py-1.5 border-b border-neutral-100 last:border-0">
            <div className="flex items-center space-x-2.5 min-w-0">
              <ProductImage
                src={item.product.imageUrl}
                alt={item.product.name}
                size="xs"
                className="w-9 h-9 rounded-lg flex-shrink-0 border border-neutral-100"
              />
              <div className="min-w-0">
                <p className="font-bold text-neutral-800 truncate">{item.product.brand} - {item.variant.name}</p>
                <p className="text-[10px] text-neutral-400">
                  {formatSaleQty(item.quantity, item.variant)} ({getPackLabel(item.variant) ?? EM_DASH})
                </p>
                {item.quantity > getMaxOrderQty(item.variant) && (
                  <p className="text-[10px] font-semibold text-rose-600 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    {getMaxOrderQty(item.variant) > 0
                      ? `Only ${formatSaleQty(getMaxOrderQty(item.variant), item.variant)} available`
                      : 'Out of stock'}
                  </p>
                )}
              </div>
            </div>
            <div className="text-right flex-shrink-0 ml-2">
              <span className="font-bold text-neutral-900">£{(item.variant.casePrice * item.quantity).toFixed(2)}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2 bg-neutral-50 p-3 rounded-xl border border-neutral-200 text-xs text-neutral-600">
        <div className="flex items-center space-x-2">
          <Scale className="w-4 h-4 text-zaam-green-600" />
          <div>
            <span className="text-[10px] text-neutral-400 block">Total Freight Weight</span>
            <span className="font-bold text-neutral-800">{getWeightLabel(totalWeightKg)}</span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Layers className="w-4 h-4 text-zaam-green-600" />
          <div>
            <span className="text-[10px] text-neutral-400 block">Total Retail Units</span>
            <span className="font-bold text-neutral-800">{totalUnits} Units</span>
          </div>
        </div>
      </div>

      {onCouponApplied && (
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1">
            <Tag className="w-3 h-3" /> Promo code
          </label>
          <div className="flex gap-2">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="B2BWELCOME10"
              className="flex-1 text-xs border border-neutral-200 rounded-xl px-3 py-2.5 font-mono"
            />
            <button
              type="button"
              onClick={applyCoupon}
              disabled={applying || !code.trim()}
              className="px-3 py-2.5 rounded-xl bg-neutral-900 text-white text-xs font-bold disabled:opacity-50"
            >
              {applying ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Apply'}
            </button>
          </div>
          {appliedCoupon && (
            <p className="text-[11px] text-zaam-green-700 font-semibold">
              {appliedCoupon.couponName}: −£{discount.toFixed(2)}
              {appliedCoupon.freeShipping ? ' + free shipping' : ''}
              <button type="button" className="ml-2 text-neutral-400 underline" onClick={() => onCouponApplied(null)}>
                Remove
              </button>
            </p>
          )}
        </div>
      )}

      <div className="space-y-1.5 text-xs pt-1 border-t border-neutral-100">
        <div className="flex justify-between text-neutral-600">
          <span>Net Goods Subtotal</span>
          <span className="font-medium text-neutral-900">£{subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-neutral-600">
          <span>Standard UK VAT (20%)</span>
          <span className="font-medium text-neutral-900">£{(vatAmount + shippingVat).toFixed(2)}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-zaam-green-700">
            <span>Coupon discount</span>
            <span className="font-bold">−£{discount.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between text-neutral-600">
          <span>{shippingLabel || 'Pallet Freight Delivery'}</span>
          <span className={`font-bold ${ship === 0 ? 'text-emerald-600' : 'text-neutral-900'}`}>
            {ship === 0 ? 'FREE' : `£${ship.toFixed(2)}`}
          </span>
        </div>
        <div className="flex justify-between text-base font-extrabold text-neutral-900 pt-2 border-t border-neutral-200">
          <span>Total Order Value</span>
          <span className="text-zaam-green-700 text-lg">£{payable.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};
