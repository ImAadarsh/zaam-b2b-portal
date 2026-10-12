'use client';

import React from 'react';
import Link from 'next/link';
import { PackageCheck, Store } from 'lucide-react';
import { OrdersTable } from '@/components/orders/OrdersTable';

export default function OrdersPage() {
  return (
    <div className="w-full space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-soft-sm">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-gradient-to-tr from-zaam-dark-900 to-neutral-800 text-white rounded-2xl shadow-soft-sm">
            <PackageCheck className="w-6 h-6 text-zaam-gold-400" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-zaam-dark-900">Wholesale Orders</h1>
            <p className="text-xs text-neutral-500">Search, filter and open any order placed through this portal.</p>
          </div>
        </div>
        <Link
          href="/shop"
          className="flex items-center space-x-1.5 bg-zaam-green-600 hover:bg-zaam-green-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-glow-green btn-press transition-all self-start sm:self-auto"
        >
          <Store className="w-4 h-4" />
          <span>Order Wholesale</span>
        </Link>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-soft-sm border border-neutral-200/80">
        <OrdersTable />
      </div>
    </div>
  );
}
