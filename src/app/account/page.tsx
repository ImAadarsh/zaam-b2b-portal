'use client';

import React from 'react';
import { SettingsMenu } from '@/components/account/SettingsMenu';
import { RepContactCard } from '@/components/account/RepContactCard';
import { UserCircle, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function AccountPage() {
  const { retailer } = useAuth();
  if (!retailer) return null;

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="bg-white rounded-2xl p-5 shadow-soft-sm border border-neutral-200/80 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-gradient-to-tr from-zaam-dark-900 to-neutral-800 text-white rounded-2xl shadow-soft-sm">
            <UserCircle className="w-6 h-6 text-zaam-gold-400" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-zaam-dark-900">
              Account & Trade Settings
            </h1>
            <p className="text-xs text-neutral-500">
              {retailer.tradingName} ({retailer.accountNumber})
            </p>
          </div>
        </div>

        <span className="text-xs bg-zaam-gold-500/20 text-zaam-gold-700 font-bold px-3 py-1 rounded-full uppercase tracking-wider">
          {retailer.tier} Member
        </span>
      </div>

      {/* Grid: Left Rep Card + Right Settings Menu */}
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-6">
        <div className="md:col-span-1">
          <RepContactCard />
        </div>

        <div className="md:col-span-2 xl:col-span-3">
          <SettingsMenu />
        </div>
      </div>

    </div>
  );
}
