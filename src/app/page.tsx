'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { WalletSummaryCard } from '@/components/dashboard/WalletSummaryCard';
import { NotificationList } from '@/components/dashboard/NotificationList';
import { RecentOrdersList } from '@/components/dashboard/RecentOrdersList';
import { GettingStartedCard } from '@/components/dashboard/GettingStartedCard';
import { Building2, ScanLine, Store } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useNotifications } from '@/context/NotificationContext';
import { zaamApi } from '@/lib/api';

type PopularTile = {
  id: string;
  label: string;
  icon: string;
  catSlug: string;
  brandsSubtitle: string;
};

function DashboardInner() {
  const { retailer, selectedBranch, branches } = useAuth();
  const { showToast } = useNotifications();
  const searchParams = useSearchParams();
  const [popularTiles, setPopularTiles] = useState<PopularTile[]>([]);
  const [tilesLoading, setTilesLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    zaamApi
      .getPopularCategories()
      .then((tiles) => {
        if (!cancelled) setPopularTiles(tiles);
      })
      .catch(() => {
        if (!cancelled) setPopularTiles([]);
      })
      .finally(() => {
        if (!cancelled) setTilesLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (searchParams.get('welcome') !== '1') return;
    showToast('Welcome — start with Order Wholesale or confirm your delivery branch.', 'info');
    // Clean the query without a full navigation bounce
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.delete('welcome');
      window.history.replaceState({}, '', url.pathname + url.search);
    }
  }, [searchParams, showToast]);

  if (!retailer) return null;

  const firstName = retailer.contactName.split(' ')[0] || 'there';
  const branchHint = selectedBranch
    ? [selectedBranch.addressLine1, selectedBranch.city].filter(Boolean).join(', ')
    : branches.length === 0
      ? 'Add a delivery branch'
      : 'Select a delivery branch';

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <GettingStartedCard />

      {/* Welcome & Quick Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-soft-sm">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-zaam-dark-900 tracking-tight">
              Welcome back, {firstName}
            </h1>
            <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">
              Verified Account
            </span>
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            Trading as: <strong className="text-neutral-800">{retailer.tradingName}</strong>
            {' · '}
            <span className="inline-flex items-center gap-1 text-neutral-600">
              <Building2 className="w-3 h-3 text-zaam-green-600" aria-hidden />
              {branchHint}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
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

          {!selectedBranch && (
            <Link
              href="/account?panel=branches"
              className="flex items-center space-x-1.5 bg-white hover:bg-neutral-50 text-neutral-800 text-xs font-bold px-4 py-2.5 rounded-xl border border-neutral-200 btn-press transition-all"
            >
              <Building2 className="w-4 h-4 text-zaam-green-600" />
              <span>Set branch</span>
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <WalletSummaryCard />
          <RecentOrdersList />
        </div>

        <div className="space-y-6">
          <NotificationList />

          <div className="bg-white rounded-2xl p-5 shadow-soft-sm border border-neutral-200/80 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                Popular FMCG Categories
              </h3>
              <Link href="/shop" className="text-[11px] font-semibold text-zaam-green-600 hover:text-zaam-green-700">
                Browse all
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {tilesLoading &&
                Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-[72px] rounded-xl border border-neutral-100 bg-neutral-100 animate-pulse"
                    aria-hidden
                  />
                ))}
              {!tilesLoading && popularTiles.length === 0 && (
                <div className="col-span-2 text-center space-y-2 bg-neutral-50 border border-dashed border-neutral-200 rounded-xl px-3 py-5">
                  <p className="text-xs text-neutral-600 font-medium">No featured categories yet</p>
                  <p className="text-[11px] text-neutral-500">
                    Jump into the full catalog to start your first case order.
                  </p>
                  <Link
                    href="/shop"
                    className="inline-flex text-[11px] font-bold text-zaam-green-700 hover:text-zaam-green-800"
                  >
                    Open wholesale catalog →
                  </Link>
                </div>
              )}
              {!tilesLoading &&
                popularTiles.map((tile) => (
                  <Link
                    key={tile.id}
                    href={`/shop?cat=${encodeURIComponent(tile.catSlug)}`}
                    className="p-3 bg-neutral-50 hover:bg-zaam-green-50 rounded-xl border border-neutral-200/80 transition-all text-left group min-h-[72px]"
                  >
                    <span className="text-lg" aria-hidden>
                      {tile.icon}
                    </span>
                    <p className="text-xs font-bold text-neutral-900 group-hover:text-zaam-green-700 mt-1">
                      {tile.label}
                    </p>
                    {tile.brandsSubtitle && (
                      <span className="text-[10px] text-neutral-400">{tile.brandsSubtitle}</span>
                    )}
                  </Link>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <React.Suspense fallback={null}>
      <DashboardInner />
    </React.Suspense>
  );
}
