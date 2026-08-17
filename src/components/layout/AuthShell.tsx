'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { AppHeader } from '@/components/layout/AppHeader';
import { BottomNavigation } from '@/components/layout/BottomNavigation';
import { CartDrawer } from '@/components/layout/CartDrawer';
import { BrandLogo } from '@/components/ui/BrandLogo';

export function AuthShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isReady, isAuthenticated } = useAuth();
  const isLogin = pathname === '/login';

  React.useEffect(() => {
    if (!isReady || isLogin) return;
    if (!isAuthenticated) router.replace('/login');
  }, [isReady, isAuthenticated, isLogin, router]);

  if (!isReady) {
    return <BrandSplash message="Loading wholesale portal…" />;
  }

  if (isLogin) {
    return <>{children}</>;
  }

  if (!isAuthenticated) {
    return <BrandSplash message="Redirecting to sign in…" />;
  }

  return (
    <>
      <AppHeader />
      <main className="flex-1 pb-24 app-container pt-4">
        {children}
      </main>
      <BottomNavigation />
      <CartDrawer />
    </>
  );
}

function BrandSplash({ message }: { message: string }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <BrandLogo layout="horizontal" tone="black" height={40} priority />
      <div className="flex items-center gap-2 text-sm text-neutral-500">
        <Loader2 className="w-4 h-4 animate-spin text-zaam-green-600" />
        <span>{message}</span>
      </div>
    </div>
  );
}
