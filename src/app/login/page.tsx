'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { CheckCircle2, Lock, Loader2, ScanLine, Store } from 'lucide-react';
import { BrandLogo } from '@/components/ui/BrandLogo';

const NEXT_STEPS = [
  { icon: Store, text: 'Browse wholesale cases with your tier pricing' },
  { icon: ScanLine, text: 'Scan shelf barcodes to replenish by case' },
  { icon: CheckCircle2, text: 'Checkout to your active delivery branch' }
];

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, isReady } = useAuth();
  const [email, setEmail] = useState('');
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
      router.replace('/?welcome=1');
    } catch (err: any) {
      const msg = String(err?.message || 'Sign in failed');
      // Preserve clearer disabled/pending-account messaging from API when present
      setError(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-gradient-to-br from-slate-50 via-white to-emerald-50">
      <div className="w-full max-w-md space-y-4">
        <form
          onSubmit={submit}
          className="bg-white border border-neutral-200 rounded-3xl p-8 shadow-soft-lg space-y-5"
        >
          <div className="flex flex-col items-center text-center gap-3">
            <BrandLogo layout="stacked" tone="black" height={84} priority alt="Zaam Wholesale" />
            <div>
              <h1 className="text-xl font-extrabold text-zaam-dark-900">Zaam Wholesale</h1>
              <p className="text-xs text-neutral-500 mt-0.5">B2B retailer portal sign in</p>
            </div>
          </div>

          {error && (
            <div
              role="alert"
              className="text-sm text-rose-700 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2.5 space-y-1"
            >
              <p className="font-semibold">{error}</p>
              {(error.toLowerCase().includes('disabled') ||
                error.toLowerCase().includes('pending') ||
                error.toLowerCase().includes('inactive') ||
                error.toLowerCase().includes('approv')) && (
                <p className="text-xs text-rose-600/90">
                  If your trade account is awaiting activation, contact your Zaam rep or{' '}
                  <a href="mailto:support@zaam.co.uk" className="underline font-semibold">
                    support@zaam.co.uk
                  </a>
                  .
                </p>
              )}
            </div>
          )}

          <label className="block text-xs font-semibold text-neutral-600">
            Email
            <input
              className="mt-1 w-full border border-neutral-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-zaam-green-500/30 focus:border-zaam-green-600"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label className="block text-xs font-semibold text-neutral-600">
            Password
            <input
              className="mt-1 w-full border border-neutral-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-zaam-green-500/30 focus:border-zaam-green-600"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          <button
            type="submit"
            disabled={busy}
            aria-busy={busy || undefined}
            className="w-full bg-zaam-green-600 hover:bg-zaam-green-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 btn-press"
          >
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        {/* First-login path: set expectations before they enter */}
        <div className="bg-white/80 border border-neutral-200/80 rounded-2xl px-5 py-4 shadow-soft-sm">
          <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-2.5">
            After you sign in
          </p>
          <ul className="space-y-2">
            {NEXT_STEPS.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-start gap-2.5 text-xs text-neutral-600">
                <span className="mt-0.5 p-1 rounded-md bg-zaam-green-50 text-zaam-green-700 shrink-0">
                  <Icon className="w-3.5 h-3.5" aria-hidden />
                </span>
                <span>{text}</span>
              </li>
            ))}
          </ul>
          <p className="text-[11px] text-neutral-400 mt-3">
            Need access? Ask your account manager — new retailers are provisioned by Zaam staff.
          </p>
        </div>
      </div>
    </div>
  );
}
