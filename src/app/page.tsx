'use client';

import React from 'react';
import Link from 'next/link';
import { ReferralBanner } from '@/components/dashboard/ReferralBanner';
import { WalletSummaryCard } from '@/components/dashboard/WalletSummaryCard';
import { NotificationList } from '@/components/dashboard/NotificationList';
import { RecentOrdersList } from '@/components/dashboard/RecentOrdersList';
import { Store, ScanLine, Wallet, ArrowRight, ShieldCheck, Sparkles, TrendingUp, Zap } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function DashboardPage() {
  const { retailer } = useAuth();
  if (!retailer) return null;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Welcome & Quick Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-soft-sm">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-zaam-dark-900 tracking-tight">
              Welcome back, {retailer.contactName.split(' ')[0]} 👋
            </h1>
            <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">
              Verified Account
            </span>
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            Trading as: <strong className="text-neutral-800">{retailer.tradingName}</strong> • {retailer.deliveryAddress.city}
          </p>
        </div>

        {/* Quick Launch Buttons */}
        <div className="flex items-center space-x-2">
          <Link
            href="/shop"
            className="flex items-center space-x-1.5 bg-zaam-green-600 hover:bg-zaam-green-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-glow-green btn-press transition-all"
          >
            <Store className="w-4 h-4" />
            <span>Order Wholesale</span>
          </Link>

          <Link
            href="/scan"
            className="flex items-center space-x-1.5 bg-zaam-dark-900 hover:bg-zaam-dark-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl btn-press transition-all"
          >
            <ScanLine className="w-4 h-4 text-zaam-gold-400" />
            <span>Scan EAN</span>
          </Link>
        </div>
      </div>

      {/* Hero Referral Banner */}
      <ReferralBanner />

      {/* Main Grid: Wallet Card & Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Wallet Balance */}
        <div className="lg:col-span-2 space-y-6">
          <WalletSummaryCard />
          <RecentOrdersList />
        </div>

        {/* Right Col: Alerts & Shortcuts */}
        <div className="space-y-6">
          <NotificationList />

          {/* Quick Wholesale Categories Widget */}
          <div className="bg-white rounded-2xl p-5 shadow-soft-sm border border-neutral-200/80 space-y-3">
            <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
              Popular FMCG Categories
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/shop?cat=drinks"
                className="p-3 bg-neutral-50 hover:bg-zaam-green-50 rounded-xl border border-neutral-200/80 transition-all text-left group"
              >
                <span className="text-lg">⚡</span>
                <p className="text-xs font-bold text-neutral-900 group-hover:text-zaam-green-700 mt-1">
                  Energy Drinks
                </p>
                <span className="text-[10px] text-neutral-400">Monster, Red Bull</span>
              </Link>

              <Link
                href="/shop?cat=confectionery"
                className="p-3 bg-neutral-50 hover:bg-zaam-green-50 rounded-xl border border-neutral-200/80 transition-all text-left group"
              >
                <span className="text-lg">🍫</span>
                <p className="text-xs font-bold text-neutral-900 group-hover:text-zaam-green-700 mt-1">
                  Confectionery
                </p>
                <span className="text-[10px] text-neutral-400">Cadbury, Sweets</span>
              </Link>

              <Link
                href="/shop?cat=crisps-snacks"
                className="p-3 bg-neutral-50 hover:bg-zaam-green-50 rounded-xl border border-neutral-200/80 transition-all text-left group"
              >
                <span className="text-lg">🥔</span>
                <p className="text-xs font-bold text-neutral-900 group-hover:text-zaam-green-700 mt-1">
                  Crisps & Snacks
                </p>
                <span className="text-[10px] text-neutral-400">Walkers, Nuts</span>
              </Link>

              <Link
                href="/shop?cat=vapes-tobacco"
                className="p-3 bg-neutral-50 hover:bg-zaam-green-50 rounded-xl border border-neutral-200/80 transition-all text-left group"
              >
                <span className="text-lg">💨</span>
                <p className="text-xs font-bold text-neutral-900 group-hover:text-zaam-green-700 mt-1">
                  Vapes & Tins
                </p>
                <span className="text-[10px] text-neutral-400">Lost Mary, Pouches</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
