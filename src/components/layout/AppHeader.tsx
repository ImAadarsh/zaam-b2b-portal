'use client';

import React, { useEffect, useRef, useState } from 'react';
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
  const [branchOpen, setBranchOpen] = useState(false);
  const branchWrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!branchOpen) return;
    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      if (!branchWrapRef.current?.contains(e.target as Node)) setBranchOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setBranchOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('touchstart', onPointerDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('touchstart', onPointerDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [branchOpen]);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-200/80 shadow-soft-sm">
      <div className="app-container">
        <div className="flex items-center justify-between h-16 gap-2">
          <div className="flex items-center space-x-3 min-w-0">
            <Link href="/" className="flex items-center gap-2.5 group shrink-0" aria-label="Zaam B2B Wholesale Portal">
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

          {/* Branch selector — visible on all breakpoints; click/tap toggle (not hover-only) */}
          <div className="flex items-center min-w-0 flex-1 justify-center px-1" ref={branchWrapRef}>
            <div className="relative max-w-full">
              <button
                type="button"
                aria-haspopup="listbox"
                aria-expanded={branchOpen}
                aria-label="Switch delivery branch"
                onClick={() => setBranchOpen((o) => !o)}
                className="flex items-center space-x-2 bg-neutral-100/90 hover:bg-neutral-200/70 transition-colors px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-medium text-neutral-700 cursor-pointer border border-neutral-200 max-w-[min(100%,280px)]"
              >
                <Building2 className="w-3.5 h-3.5 text-zaam-green-600 shrink-0" aria-hidden />
                <span className="truncate">
                  {selectedBranch ? branchLabel(selectedBranch) : 'No delivery branch'}
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-neutral-400 shrink-0 transition-transform ${branchOpen ? 'rotate-180' : ''}`}
                  aria-hidden
                />
              </button>

              {branchOpen && (
                <div
                  role="listbox"
                  aria-label="Delivery branches"
                  className="absolute left-1/2 -translate-x-1/2 sm:left-0 sm:translate-x-0 pt-1 w-[min(18rem,calc(100vw-2rem))] z-50"
                >
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
                            role="option"
                            aria-selected={isCurrent}
                            onClick={() => {
                              if (!isCurrent) {
                                setSelectedBranchId(branch.id);
                                showToast(`Deliveries will go to ${branchLabel(branch)}`, 'success');
                              }
                              setBranchOpen(false);
                            }}
                            className={`w-full text-left px-3 py-2 text-xs transition-colors hover:bg-zaam-green-50 flex items-start gap-2 ${
                              isCurrent ? 'font-semibold text-zaam-green-600 bg-zaam-green-50/50' : 'text-neutral-700'
                            }`}
                          >
                            <Check className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${isCurrent ? 'text-zaam-green-600' : 'invisible'}`} aria-hidden />
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
                      onClick={() => setBranchOpen(false)}
                      className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-zaam-green-700 hover:bg-zaam-green-50 border-t border-neutral-100"
                    >
                      <Plus className="w-3.5 h-3.5" aria-hidden />
                      Add / manage branches
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-1.5 sm:space-x-3 shrink-0">
            <div className="hidden sm:flex items-center space-x-1.5 bg-zaam-gold-500/10 border border-zaam-gold-500/30 text-zaam-gold-700 px-2.5 py-1 rounded-full text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-zaam-gold-500" aria-hidden />
              <span>{retailer?.tier || 'Wholesale'}</span>
            </div>

            <button
              onClick={logout}
              className="p-2 text-neutral-600 hover:text-rose-600 hover:bg-neutral-100 rounded-full transition-colors"
              title="Sign out"
              aria-label="Sign out"
            >
              <LogOut className="w-5 h-5" aria-hidden />
            </button>

            <Link
              href="/#notifications"
              className="relative p-2 text-neutral-600 hover:text-zaam-green-600 hover:bg-neutral-100 rounded-full transition-colors"
              title="Notifications"
              aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : 'Notifications'}
            >
              <Bell className="w-5 h-5" aria-hidden />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </Link>

            <button
              onClick={() => setIsCartDrawerOpen(true)}
              className="relative flex items-center space-x-2 bg-zaam-green-600 hover:bg-zaam-green-700 text-white px-3 sm:px-3.5 py-2 rounded-xl text-xs font-semibold shadow-glow-green btn-press"
              aria-label={totalCases > 0 ? `Open basket, ${totalCases} items` : 'Open basket'}
            >
              <ShoppingBag className="w-4 h-4" aria-hidden />
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
