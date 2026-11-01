'use client';

import React, { useEffect, useState } from 'react';
import { Wallet, Plus, Download, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useNotifications } from '@/context/NotificationContext';
import { zaamApi } from '@/lib/api';

export const WalletBalance: React.FC = () => {
  const { retailer, availableCredit, refreshProfile } = useAuth();
  const { showToast } = useNotifications();
  const [requestedLimit, setRequestedLimit] = useState('');
  const [busy, setBusy] = useState<'credit' | 'statement' | null>(null);
  if (!retailer) return null;

  const handleRequestIncrease = async () => {
    if (busy) return;
    const limit = Number(requestedLimit || retailer.creditLimit * 1.25);
    if (!Number.isFinite(limit) || limit <= retailer.creditLimit) {
      showToast('Enter a requested limit greater than your current credit limit', 'error');
      return;
    }
    setBusy('credit');
    try {
      await zaamApi.requestCreditIncrease(limit, 'Retailer portal credit increase request');
      showToast('Credit increase request submitted for staff review', 'success');
      setRequestedLimit('');
    } catch (e: any) {
      showToast(e.message || 'Failed to submit credit request', 'error');
    } finally {
      setBusy(null);
    }
  };

  const handleDownloadStatement = async () => {
    if (busy) return;
    setBusy('statement');
    try {
      const csv = await zaamApi.downloadStatement();
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'zaam-trade-statement.csv';
      a.click();
      URL.revokeObjectURL(url);
      showToast('Statement downloaded', 'success');
    } catch (e: any) {
      showToast(e.message || 'Failed to download statement', 'error');
    } finally {
      setBusy(null);
    }
  };

  useEffect(() => {
    refreshProfile?.();
  }, []);

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-tr from-zaam-dark-950 via-neutral-900 to-zaam-green-950 text-white rounded-3xl p-6 shadow-soft-lg border border-neutral-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-zaam-gold-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-white/10 rounded-2xl backdrop-blur border border-white/10">
                <Wallet className="w-6 h-6 text-zaam-gold-400" />
              </div>
              <div>
                <span className="text-xs text-neutral-400 uppercase tracking-wider font-semibold">Trade Credit Facility</span>
                <h3 className="text-base font-bold text-white">{retailer.companyName}</h3>
              </div>
            </div>
            <span className="bg-zaam-gold-500/20 text-zaam-gold-400 border border-zaam-gold-500/40 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              {retailer.tier}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur">
              <span className="text-xs text-neutral-400 font-medium">Available Credit</span>
              <p className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                £{availableCredit.toLocaleString('en-GB', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur">
              <span className="text-xs text-neutral-400 font-medium">Used / Invoiced Balance</span>
              <p className="text-2xl sm:text-3xl font-extrabold text-zaam-gold-400 mt-1">
                £{retailer.creditUsed.toLocaleString('en-GB', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur">
              <span className="text-xs text-neutral-400 font-medium">Total Credit Limit</span>
              <p className="text-2xl sm:text-3xl font-extrabold text-neutral-200 mt-1">
                £{retailer.creditLimit.toLocaleString('en-GB', { minimumFractionDigits: 2 })}
              </p>
              <span className="text-[10px] text-neutral-400 font-medium mt-1 block">Account ID: {retailer.accountNumber}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2.5 pt-2 items-center">
            <input
              type="number"
              className="bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-xs w-40"
              placeholder="Requested limit"
              value={requestedLimit}
              onChange={(e) => setRequestedLimit(e.target.value)}
            />
            <button
              disabled={!!busy}
              onClick={handleRequestIncrease}
              className="flex items-center space-x-2 bg-zaam-gold-500 hover:bg-zaam-gold-600 text-zaam-dark-950 font-bold text-xs px-4 py-2.5 rounded-xl shadow-glow-gold btn-press transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {busy === 'credit' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              <span>{busy === 'credit' ? 'Submitting…' : 'Request Limit Increase'}</span>
            </button>
            <button
              disabled={!!busy}
              onClick={handleDownloadStatement}
              className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs px-4 py-2.5 rounded-xl border border-white/15 backdrop-blur btn-press transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {busy === 'statement' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              <span>{busy === 'statement' ? 'Downloading…' : 'Download Statement (CSV)'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
