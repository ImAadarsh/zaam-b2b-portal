'use client';

import React from 'react';
import Link from 'next/link';
import { Phone, Mail, MessageSquare, Headphones, UserCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export const RepContactCard: React.FC = () => {
  const { retailer } = useAuth();
  if (!retailer) return null;
  const rep = retailer.assignedRep;

  const phoneHref = rep.phone ? `tel:${rep.phone.replace(/\s+/g, '')}` : undefined;
  const emailHref = rep.email ? `mailto:${rep.email}` : undefined;
  const waHref = rep.phone
    ? `https://wa.me/${rep.phone.replace(/[^\d+]/g, '').replace(/^\+/, '')}`
    : undefined;

  return (
    <div className="bg-gradient-to-tr from-zaam-dark-900 to-zaam-green-950 text-white rounded-3xl p-6 shadow-soft-lg border border-neutral-800 space-y-5 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-48 h-48 bg-zaam-gold-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-xs bg-zaam-gold-500/20 text-zaam-gold-400 font-bold px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
            <UserCheck className="w-3.5 h-3.5" /> Assigned Account Rep
          </span>
        </div>
        <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Online
        </span>
      </div>

      <div className="flex items-center space-x-4">
        <img
          src={rep.avatarUrl || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(rep.name || 'Rep')}
          alt={rep.name}
          className="w-16 h-16 rounded-2xl object-cover ring-2 ring-zaam-gold-500/50 shadow-md"
        />
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-bold text-white">{rep.name}</h3>
          <p className="text-xs text-neutral-300">Senior Key Account Manager</p>
          {rep.phone && (
            <p className="text-[11px] text-zaam-gold-400 font-medium mt-0.5">
              Direct Line: {rep.phone}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 pt-2">
        {phoneHref ? (
          <a
            href={phoneHref}
            className="bg-white/10 hover:bg-white/20 text-white text-xs font-semibold py-2.5 px-3 rounded-xl flex flex-col items-center justify-center space-y-1 backdrop-blur border border-white/15 transition-all btn-press"
          >
            <Phone className="w-4 h-4 text-emerald-400" />
            <span>Call Rep</span>
          </a>
        ) : (
          <Link
            href="/account/support"
            className="bg-white/10 hover:bg-white/20 text-white text-xs font-semibold py-2.5 px-3 rounded-xl flex flex-col items-center justify-center space-y-1 backdrop-blur border border-white/15 transition-all btn-press"
          >
            <Phone className="w-4 h-4 text-emerald-400" />
            <span>Support</span>
          </Link>
        )}

        {waHref ? (
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-zaam-green-600/40 hover:bg-zaam-green-600/60 text-white text-xs font-semibold py-2.5 px-3 rounded-xl flex flex-col items-center justify-center space-y-1 backdrop-blur border border-zaam-green-500/30 transition-all btn-press"
          >
            <MessageSquare className="w-4 h-4 text-zaam-green-400" />
            <span>WhatsApp</span>
          </a>
        ) : (
          <Link
            href="/account/support"
            className="bg-zaam-green-600/40 hover:bg-zaam-green-600/60 text-white text-xs font-semibold py-2.5 px-3 rounded-xl flex flex-col items-center justify-center space-y-1 backdrop-blur border border-zaam-green-500/30 transition-all btn-press"
          >
            <MessageSquare className="w-4 h-4 text-zaam-green-400" />
            <span>Message</span>
          </Link>
        )}

        {emailHref ? (
          <a
            href={emailHref}
            className="bg-white/10 hover:bg-white/20 text-white text-xs font-semibold py-2.5 px-3 rounded-xl flex flex-col items-center justify-center space-y-1 backdrop-blur border border-white/15 transition-all btn-press"
          >
            <Mail className="w-4 h-4 text-zaam-gold-400" />
            <span>Email</span>
          </a>
        ) : (
          <Link
            href="/account/support"
            className="bg-white/10 hover:bg-white/20 text-white text-xs font-semibold py-2.5 px-3 rounded-xl flex flex-col items-center justify-center space-y-1 backdrop-blur border border-white/15 transition-all btn-press"
          >
            <Mail className="w-4 h-4 text-zaam-gold-400" />
            <span>Email</span>
          </Link>
        )}
      </div>

      <Link
        href="/account/support"
        className="flex items-center justify-center gap-2 w-full bg-zaam-gold-500/15 hover:bg-zaam-gold-500/25 text-zaam-gold-300 text-xs font-bold py-2.5 rounded-xl border border-zaam-gold-500/25 transition-colors"
      >
        <Headphones className="w-4 h-4" />
        Open Support Hub
      </Link>
    </div>
  );
};
