'use client';

import React from 'react';
import { useCart } from '@/context/CartContext';
import { useNotifications } from '@/context/NotificationContext';
import { zaamApi } from '@/lib/api';
import { getAvailabilityMessage } from '@/lib/product';
import { Order } from '@/types';

export const OrderStatusBadge: React.FC<{ status: string }> = ({ status }) => {
  switch (status) {
    case 'Delivered':
      return <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full">Delivered</span>;
    case 'Dispatched':
      return <span className="bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold px-2 py-0.5 rounded-full">In Transit</span>;
    case 'Processing':
      return <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold px-2 py-0.5 rounded-full">Processing</span>;
    case 'Cancelled':
      return <span className="bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold px-2 py-0.5 rounded-full">Cancelled</span>;
    default:
      return <span className="bg-neutral-100 text-neutral-700 text-[10px] font-bold px-2 py-0.5 rounded-full">{status}</span>;
  }
};

export const TrackingLink: React.FC<{ trackingNumber?: string | null }> = ({ trackingNumber }) => {
  if (!trackingNumber) return <span className="text-neutral-400">—</span>;
  if (/^[\dA-Z]{8,}$/i.test(trackingNumber)) {
    return (
      <a
        href={`https://www.dhl.com/gb-en/home/tracking.html?tracking-id=${encodeURIComponent(trackingNumber)}`}
        target="_blank"
        rel="noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="font-semibold text-zaam-green-700 underline"
      >
        {trackingNumber}
      </a>
    );
  }
  return <strong className="text-neutral-700">{trackingNumber}</strong>;
};

export function formatOrderDate(order: Pick<Order, 'date' | 'orderDate'>) {
  return order.orderDate
    ? new Date(order.orderDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : order.date;
}

export function useReorder() {
  const { addToCart, getItemQuantity, setIsCartDrawerOpen } = useCart();
  const { showToast } = useNotifications();

  return async (order: Pick<Order, 'orderNumber' | 'items'>) => {
    try {
      const products = await zaamApi.getProducts();
      let itemsAdded = 0;
      const short: string[] = [];
      (order.items || []).forEach((item) => {
        for (const prod of products) {
          const matchedVar = prod.variants.find((v) => v.sku === item.sku);
          if (matchedVar) {
            const before = getItemQuantity(matchedVar.id);
            const result = addToCart(prod, matchedVar, item.quantity);
            itemsAdded += Math.max(0, result.quantity - before);
            if (result.capped) short.push(`${prod.name} (${getAvailabilityMessage(matchedVar).toLowerCase()})`);
            break;
          }
        }
      });
      if (itemsAdded === 0) {
        showToast(`None of the items from ${order.orderNumber} are currently available`, 'error');
        return;
      }
      if (short.length) {
        showToast(`Added what is in stock from ${order.orderNumber}. Limited: ${short.join('; ')}`, 'warning');
      } else {
        showToast(`Added the items from order ${order.orderNumber} to basket`, 'success');
      }
      setIsCartDrawerOpen(true);
    } catch (e: any) {
      showToast(e.message || 'Re-order failed', 'error');
    }
  };
}
