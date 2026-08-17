'use client';

import React, { useEffect, useState } from 'react';
import { Gift, Copy, Check, ArrowRight, Sparkles } from 'lucide-react';
import { useNotifications } from '@/context/NotificationContext';
import { zaamApi } from '@/lib/api';

export const ReferralBanner: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [referral, setReferral] = useState<any>(null);
  const { showToast } = useNotifications();

  useEffect(() => {
    zaamApi.getReferral().then(setReferral).catch((e) => showToast(e.message || 'Failed to load referral', 'error'));
  }, []);

  const copyToClipboard = async () => {
    if (!referral?.code) return;
    const link = `${window.location.origin}/login?ref=${encodeURIComponent(referral.code)}`;
    await navigator.clipboard.writeText(link);
    setCopied(true);
    showToast('Referral link copied', 'success');
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-zaam-dark-900 via-neutral-900 to-zaam-green-950 p-5 text-white shadow-soft-lg border border-neutral-800">
      <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-zaam-gold-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start space-x-3.5">
          <div className="p-3 bg-gradient-to-tr from-zaam-gold-600 to-zaam-gold-400 text-zaam-dark-950 rounded-xl shadow-glow-gold flex-shrink-0">
            <Gift className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <span className="text-xs bg-zaam-gold-500/20 border border-zaam-gold-500/40 text-zaam-gold-400 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider inline-flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Retailer Rewards
            </span>
            <h3 className="text-base sm:text-lg font-bold tracking-tight text-white">
              Refer a Retailer & Get £{Number(referral?.rewardAmount ?? 100).toFixed(0)} Trade Credit
            </h3>
            <p className="text-xs text-neutral-300 max-w-md">
              Code: <strong className="text-white font-mono">{referral?.code || 'Loading…'}</strong>
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2 pt-2 sm:pt-0">
          <button onClick={copyToClipboard} className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 border border-white/20 px-3.5 py-2.5 rounded-xl text-xs font-semibold backdrop-blur transition-all btn-press text-neutral-200">
            {copied ? <Check className="w-4 h-4 text-zaam-green-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Link Copied!' : 'Copy Code'}</span>
          </button>
          <button onClick={copyToClipboard} className="flex items-center space-x-1.5 bg-zaam-gold-500 hover:bg-zaam-gold-600 text-zaam-dark-950 font-bold text-xs px-4 py-2.5 rounded-xl shadow-glow-gold btn-press transition-all">
            <span>Invite Now</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
