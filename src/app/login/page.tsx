'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Lock } from 'lucide-react';
import { BrandLogo } from '@/components/ui/BrandLogo';

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, isReady } = useAuth();
  const [email, setEmail] = useState('retailer@zaam.co.uk');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  React.useEffect(() => {
    if (isReady && isAuthenticated) router.replace('/');
  }, [isReady, isAuthenticated, router]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await login(email, password);
      router.replace('/');
    } catch (err: any) {
      setError(err.message || 'Sign in failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-gradient-to-br from-slate-50 via-white to-emerald-50">
      <form onSubmit={submit} className="w-full max-w-md bg-white border border-neutral-200 rounded-3xl p-8 shadow-soft-lg space-y-5">
        <div className="flex flex-col items-center text-center gap-3">
          <BrandLogo layout="stacked" tone="black" height={84} priority alt="Zaam Wholesale" />
          <div>
            <h1 className="text-xl font-extrabold text-zaam-dark-900">Zaam Wholesale</h1>
            <p className="text-xs text-neutral-500 mt-0.5">B2B retailer portal sign in</p>
          </div>
        </div>
        {error && <p className="text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2">{error}</p>}
        <label className="block text-xs font-semibold text-neutral-600">Email
          <input className="mt-1 w-full border border-neutral-200 rounded-xl px-3 py-2.5 text-sm" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label className="block text-xs font-semibold text-neutral-600">Password
          <input className="mt-1 w-full border border-neutral-200 rounded-xl px-3 py-2.5 text-sm" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        <button disabled={busy} className="w-full bg-zaam-green-600 hover:bg-zaam-green-700 text-white font-bold py-2.5 rounded-xl flex items-center justify-center gap-2">
          <Lock className="w-4 h-4" />
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}
