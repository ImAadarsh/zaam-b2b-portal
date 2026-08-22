'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { PackageCheck, Clock, ArrowRight, RotateCw } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useNotifications } from '@/context/NotificationContext';
import { zaamApi } from '@/lib/api';
import { Order } from '@/types';

export const RecentOrdersList: React.FC = () => {
  const { addToCart, setIsCartDrawerOpen } = useCart();
  const { showToast } = useNotifications();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    zaamApi.getOrders().then(setOrders).catch(() => setOrders([]));
  }, []);

  const handleReorder = async (order: Order) => {
    const products = await zaamApi.getProducts();
    let itemsAdded = 0;
    order.items.forEach((item) => {
      for (const prod of products) {
        const matchedVar = prod.variants.find((v) => v.sku === item.sku);
        if (matchedVar) {
          addToCart(prod, matchedVar, item.quantity);
          itemsAdded += item.quantity;
          break;
        }
      }
    });
    showToast(`Added ${itemsAdded} cases from order ${order.orderNumber} to basket!`, 'success');
    setIsCartDrawerOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Delivered':
        return <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full">Delivered</span>;
      case 'Dispatched':
        return <span className="bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold px-2 py-0.5 rounded-full">In Transit</span>;
      case 'Processing':
        return <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold px-2 py-0.5 rounded-full">Processing</span>;
      default:
        return <span className="bg-neutral-100 text-neutral-700 text-[10px] font-bold px-2 py-0.5 rounded-full">{status}</span>;
    }
  };

  return (
    <div className="bg-white rounded-2xl p-5 shadow-soft-sm border border-neutral-200/80 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-neutral-100 rounded-lg text-neutral-700">
            <PackageCheck className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-neutral-900">Recent Wholesale Orders</h3>
            <p className="text-[11px] text-neutral-500">Orders placed through this portal</p>
          </div>
        </div>
        <Link href="/shop" className="text-xs text-zaam-green-600 hover:text-zaam-green-700 font-semibold flex items-center space-x-1">
          <span>Catalog</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
      <div className="space-y-3">
        {orders.length === 0 && (
          <p className="text-xs text-neutral-500">No B2B orders yet. Place your first wholesale order from the catalog.</p>
        )}
        {orders.slice(0, 5).map((order) => (
          <div key={order.id} className="p-4 rounded-xl border border-neutral-200 bg-white space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-neutral-900">{order.orderNumber}</span>
                {getStatusBadge(order.status)}
              </div>
              <span className="text-xs text-neutral-400 font-medium flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {order.date}
              </span>
            </div>
            <div className="bg-neutral-50 p-2.5 rounded-lg text-xs space-y-1">
              <div className="flex justify-between font-semibold text-neutral-700">
                <span>{order.itemCount} Cases</span>
                <span className="text-zaam-green-700 font-bold">£{Number(order.total).toFixed(2)} Inc VAT</span>
              </div>
              <p className="text-[11px] text-neutral-500 truncate">
                {(order.items || []).map((i) => `${i.quantity}x ${i.name}`).join(' • ')}
              </p>
            </div>
            <div className="flex items-center justify-between pt-1">
              <div className="text-[11px] text-neutral-500 space-y-0.5">
                <div>
                  Paid via: <strong className="text-neutral-700">{order.paymentMethod}</strong>
                </div>
                {order.trackingNumber && (
                  <div>
                    Tracking:{' '}
                    {/^[\dA-Z]{8,}$/i.test(order.trackingNumber) ? (
                      <a
                        href={`https://www.dhl.com/gb-en/home/tracking.html?tracking-id=${encodeURIComponent(order.trackingNumber)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="font-semibold text-zaam-green-700 underline"
                      >
                        {order.trackingNumber}
                      </a>
                    ) : (
                      <strong className="text-neutral-700">{order.trackingNumber}</strong>
                    )}
                  </div>
                )}
              </div>
              <button
                onClick={() => handleReorder(order)}
                className="flex items-center space-x-1.5 bg-neutral-100 hover:bg-zaam-green-50 text-neutral-800 text-xs font-semibold px-3 py-1.5 rounded-lg border border-neutral-200"
              >
                <RotateCw className="w-3 h-3" />
                <span>Re-Order</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
