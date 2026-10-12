'use client';

import React from 'react';
import Link from 'next/link';
import { PackageCheck, ArrowRight } from 'lucide-react';
import { OrdersTable } from '@/components/orders/OrdersTable';

export const RecentOrdersList: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-soft-sm border border-neutral-200/80 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-neutral-100 rounded-lg text-neutral-700">
            <PackageCheck className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-neutral-900">Recent Wholesale Orders</h3>
            <p className="text-[11px] text-neutral-500">Latest orders placed through this portal</p>
          </div>
        </div>
        <Link href="/orders" className="text-xs text-zaam-green-600 hover:text-zaam-green-700 font-semibold flex items-center space-x-1">
          <span>View all orders</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
      <OrdersTable compact compactRows={5} />
    </div>
  );
};
