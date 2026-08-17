'use client';

import React from 'react';
import Link from 'next/link';
import { Wallet, ArrowUpRight, ShieldCheck, Clock, TrendingUp } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export const WalletSummaryCard: React.FC = () => {
  const { retailer, availableCredit } = useAuth();
  if (!retailer) return null;
  const utilizationPercent = Math.min(100, Math.round((retailer.creditUsed / Math.max(retailer.creditLimit, 1)) * 100));

  return (
    <div className="bg-gradient-to-br from-zaam-green-800 via-zaam-green-700 to-zaam-green-900 text-white rounded-2xl p-5 shadow-soft-lg border border-zaam-green-600/30 relative overflow-hidden">
      {/* Background Accent Gradients */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 w-32 h-32 bg-zaam-gold-500/10 rounded-full blur-xl pointer-events-none" />

      <div className="relative z-10 space-y-4">
        
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-white/10 rounded-xl backdrop-blur">
              <Wallet className="w-5 h-5 text-zaam-gold-400" />
            </div>
            <div>
              <p className="text-xs text-zaam-green-100 font-medium">B2B Trade Credit Account</p>
              <h4 className="text-sm font-bold text-white tracking-wide">{retailer.companyName}</h4>
            </div>
          </div>

          <Link
            href="/wallet"
            className="flex items-center space-x-1 text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-full transition-all border border-white/15"
          >
            <span>Statement</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Big Balance Row */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between pt-1 gap-2">
          <div>
            <span className="text-xs text-zaam-green-200 uppercase tracking-wider font-semibold">Available Credit Line</span>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                £{availableCredit.toLocaleString('en-GB', { minimumFractionDigits: 2 })}
              </span>
              <span className="text-xs bg-zaam-gold-500/20 text-zaam-gold-300 font-bold px-2 py-0.5 rounded-md">
                {retailer.paymentTerms}
              </span>
            </div>
          </div>

          <div className="text-left sm:text-right text-xs text-zaam-green-200">
            <p>Total Limit: <strong className="text-white">£{retailer.creditLimit.toLocaleString()}</strong></p>
            <p>Current Invoiced: <strong className="text-white">£{retailer.creditUsed.toLocaleString()}</strong></p>
          </div>
        </div>

        {/* Progress Bar Gauge */}
        <div className="space-y-1.5 pt-1">
          <div className="flex justify-between text-[11px] text-zaam-green-200">
            <span>Credit Utilization ({utilizationPercent}%)</span>
            <span>Due on 31st of month</span>
          </div>
          <div className="w-full bg-black/30 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                utilizationPercent > 85 ? 'bg-rose-400' : 'bg-gradient-to-r from-zaam-gold-400 to-zaam-gold-300'
              }`}
              style={{ width: `${utilizationPercent}%` }}
            />
          </div>
        </div>

        {/* Quick Micro Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-white/10 text-[11px] text-zaam-green-100">
          <div className="flex items-center space-x-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-zaam-gold-400" />
            <span>Guaranteed Limits</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <Clock className="w-3.5 h-3.5 text-zaam-gold-400" />
            <span>0% Interest (30 Days)</span>
          </div>
          <div className="hidden sm:flex items-center space-x-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-zaam-gold-400" />
            <span>Tier: {retailer.tier}</span>
          </div>
        </div>

      </div>
    </div>
  );
};
