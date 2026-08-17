'use client';

import React from 'react';
import { WalletBalance } from '@/components/wallet/WalletBalance';
import { TransactionHistory } from '@/components/wallet/TransactionHistory';
import { FAQSection } from '@/components/wallet/FAQSection';
import { Wallet, ShieldCheck, Sparkles } from 'lucide-react';

export default function WalletPage() {
  return (
    <div className="w-full space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-soft-sm">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-gradient-to-tr from-zaam-green-700 to-zaam-green-600 text-white rounded-2xl shadow-glow-green">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-zaam-dark-900">
              B2B Trade Credit & Wallet
            </h1>
            <p className="text-xs text-neutral-500">
              Manage your commercial credit line, view 30-day statements and ledger entries.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-1.5 rounded-full font-semibold self-start sm:self-auto">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>FCA & Credit Insured</span>
        </div>
      </div>

      {/* Hero Balance & Limit Metrics */}
      <WalletBalance />

      {/* Transactions & Invoices */}
      <TransactionHistory />

      {/* Terms & FAQ */}
      <FAQSection />
    </div>
  );
}
