'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Store, ScanLine, Wallet, UserCircle } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export const BottomNavigation: React.FC = () => {
  const pathname = usePathname();
  const { totalCases } = useCart();

  const navItems = [
    {
      label: 'Dashboard',
      href: '/',
      icon: LayoutDashboard,
      active: pathname === '/'
    },
    {
      label: 'Shop',
      href: '/shop',
      icon: Store,
      badge: totalCases > 0 ? totalCases : undefined,
      active: pathname.startsWith('/shop')
    },
    {
      label: 'Scan',
      href: '/scan',
      icon: ScanLine,
      isSpecial: true,
      active: pathname.startsWith('/scan')
    },
    {
      label: 'Wallet',
      href: '/wallet',
      icon: Wallet,
      active: pathname.startsWith('/wallet')
    },
    {
      label: 'Account',
      href: '/account',
      icon: UserCircle,
      active: pathname.startsWith('/account')
    }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-t border-neutral-200/80 shadow-soft-lg pb-safe">
      <div className="max-w-lg mx-auto px-4 h-16 flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;

          if (item.isSpecial) {
            return (
              <Link
                key={item.label}
                href={item.href}
                className="relative -top-5 flex flex-col items-center group"
              >
                <div
                  className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-transform duration-200 group-hover:scale-105 ${
                    item.active
                      ? 'bg-gradient-to-tr from-zaam-green-700 via-zaam-green-600 to-zaam-gold-500 text-white shadow-glow-green ring-4 ring-white'
                      : 'bg-zaam-dark-900 text-zaam-gold-400 hover:bg-zaam-dark-800 ring-4 ring-white'
                  }`}
                >
                  <Icon className="w-6 h-6 animate-pulse-subtle" />
                </div>
                <span className={`text-[11px] font-semibold mt-1 ${item.active ? 'text-zaam-green-600' : 'text-neutral-600'}`}>
                  {item.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 py-1.5 transition-colors relative group ${
                item.active ? 'text-zaam-green-600 font-semibold' : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform duration-150 group-hover:scale-110 ${item.active ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
                {item.badge && (
                  <span className="absolute -top-1.5 -right-2.5 bg-zaam-gold-500 text-zaam-dark-900 text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[11px] mt-1 tracking-tight">{item.label}</span>
              {item.active && (
                <div className="w-1.5 h-1.5 bg-zaam-green-600 rounded-full mt-0.5" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
