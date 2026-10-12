'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingBag, Bell, Building2, ChevronDown, Sparkles, LogOut, Check, Plus } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useNotifications } from '@/context/NotificationContext';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { Branch } from '@/types';

const branchLabel = (b: Branch) => [b.addressLine1, b.city].filter(Boolean).join(', ');

export const AppHeader: React.FC = () => {
  const { totalCases, setIsCartDrawerOpen } = useCart();
  const { retailer, branches, selectedBranch, selectedBranchId, setSelectedBranchId, logout } = useAuth();
  const { unreadCount, showToast } = useNotifications();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-200/80 shadow-soft-sm">
      <div className="app-container">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center gap-2.5 group" aria-label="Zaam B2B Wholesale Portal">
              <BrandLogo layout="horizontal" tone="black" height={28} priority className="transition-opacity group-hover:opacity-80" />
              <span className="w-px h-7 bg-neutral-200 hidden sm:block" />
              <div className="hidden sm:flex flex-col">
                <span className="text-[11px] bg-zaam-gold-500/15 text-zaam-gold-600 font-bold px-1.5 rounded uppercase tracking-wider self-start">
                  B2B
                </span>
                <span className="text-[10px] text-neutral-500 font-medium">Wholesale Portal</span>
              </div>
            </Link>
          </div>

          {/* Center Branch Selector (Desktop & Tablet) */}
          <div className="hidden md:flex items-center">
            <div className="relative group">
              <button
                type="button"
                className="flex items-center space-x-2 bg-neutral-100/90 hover:bg-neutral-200/70 transition-colors px-3 py-1.5 rounded-full text-xs font-medium text-neutral-700 cursor-pointer border border-neutral-200"
              >
                <Building2 className="w-3.5 h-3.5 text-zaam-green-600" />
                <span className="max-w-[200px] truncate">{selectedBranch ? branchLabel(selectedBranch) : 'No delivery branch'}</span>
                <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
              </button>

              <div className="absolute left-0 pt-1 w-72 hidden group-hover:block group-focus-within:block z-50">
                <div className="bg-white rounded-xl shadow-soft-lg border border-neutral-100 py-1 animate-in fade-in slide-in-from-top-1 duration-150">
                  <div className="px-3 py-1.5 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider border-b border-neutral-100">
                    Switch Active Branch ({branches.length})
                  </div>
                  <div className="max-h-72 overflow-auto">
                    {branches.map((branch) => {
                      const isCurrent = branch.id === selectedBranchId;
                      return (
                        <button
                          key={branch.id}
                          type="button"
                          onClick={() => {
                            if (isCurrent) return;
                            setSelectedBranchId(branch.id);
                            showToast(`Deliveries will go to ${branchLabel(branch)}`, 'success');
                          }}
                          className={`w-full text-left px-3 py-2 text-xs transition-colors hover:bg-zaam-green-50 flex items-start gap-2 ${
                            isCurrent ? 'font-semibold text-zaam-green-600 bg-zaam-green-50/50' : 'text-neutral-700'
                          }`}
                        >
                          <Check className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${isCurrent ? 'text-zaam-green-600' : 'invisible'}`} />
                          <span className="min-w-0">
                            <span className="block truncate">{branch.company || branchLabel(branch)}</span>
                            <span className="block text-[10px] text-neutral-400 font-normal truncate">
                              {branchLabel(branch)} {branch.postalCode}
                              {branch.isDefault ? ' • Default' : ''}
                              {isCurrent ? ' • Current' : ''}
                            </span>
                          </span>
                        </button>
                      );
                    })}
                    {branches.length === 0 && (
                      <p className="px-3 py-2 text-xs text-neutral-500">No delivery branches on your account yet.</p>
                    )}
                  </div>
                  <Link
                    href="/account?panel=branches"
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-zaam-green-700 hover:bg-zaam-green-50 border-t border-neutral-100"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add / manage branches
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center space-x-3">
            {/* VIP Tier Badge */}
            <div className="hidden sm:flex items-center space-x-1.5 bg-zaam-gold-500/10 border border-zaam-gold-500/30 text-zaam-gold-700 px-2.5 py-1 rounded-full text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-zaam-gold-500" />
              <span>{retailer?.tier || 'Wholesale'}</span>
            </div>

            <button
              onClick={logout}
              className="p-2 text-neutral-600 hover:text-rose-600 hover:bg-neutral-100 rounded-full transition-colors"
              title="Sign out"
            >
              <LogOut className="w-5 h-5" />
            </button>

            {/* Notifications Button */}
            <Link
              href="/#notifications"
              className="relative p-2 text-neutral-600 hover:text-zaam-green-600 hover:bg-neutral-100 rounded-full transition-colors"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </Link>

            {/* Cart Button */}
            <button
              onClick={() => setIsCartDrawerOpen(true)}
              className="relative flex items-center space-x-2 bg-zaam-green-600 hover:bg-zaam-green-700 text-white px-3.5 py-2 rounded-xl text-xs font-semibold shadow-glow-green btn-press"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden xs:inline">Basket</span>
              {totalCases > 0 && (
                <span className="bg-zaam-gold-500 text-zaam-dark-900 px-1.5 py-0.5 rounded-full text-[11px] font-bold">
                  {totalCases}
                </span>
              )}
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
