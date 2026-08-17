'use client';

import React from 'react';
import { CreditCard, Lock, ShieldCheck } from 'lucide-react';

interface CreditCardTabProps {
  cardDetails: {
    cardNumber: string;
    expiry: string;
    cvv: string;
    holderName: string;
  };
  onChange: (next: CreditCardTabProps['cardDetails']) => void;
}

export const CreditCardTab: React.FC<CreditCardTabProps> = ({ cardDetails, onChange }) => {
  return (
    <div className="space-y-4">
      <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-4 flex items-start space-x-3">
        <div className="p-2 bg-zaam-dark-900 text-zaam-gold-400 rounded-xl">
          <ShieldCheck className="w-4 h-4" />
        </div>
        <div className="text-xs space-y-1">
          <h4 className="font-bold text-neutral-900">Card payment via configured gateway (Worldpay preferred)</h4>
          <p className="text-neutral-600">
            Card details are submitted to the ERP payment intent. Success only after the provider confirms — test mode is labeled TEST.
          </p>
        </div>
      </div>

      <div className="grid gap-3">
        <label className="text-xs font-bold text-neutral-700">
          Cardholder
          <input
            className="mt-1 w-full border border-neutral-200 rounded-xl px-3 py-2 text-sm"
            value={cardDetails.holderName}
            onChange={(e) => onChange({ ...cardDetails, holderName: e.target.value })}
          />
        </label>
        <label className="text-xs font-bold text-neutral-700">
          Card number
          <div className="relative mt-1">
            <CreditCard className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              className="w-full border border-neutral-200 rounded-xl pl-9 pr-3 py-2 text-sm font-mono"
              placeholder="•••• •••• •••• ••••"
              value={cardDetails.cardNumber}
              onChange={(e) => onChange({ ...cardDetails, cardNumber: e.target.value })}
              autoComplete="cc-number"
            />
          </div>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="text-xs font-bold text-neutral-700">
            Expiry (MM/YY)
            <input
              className="mt-1 w-full border border-neutral-200 rounded-xl px-3 py-2 text-sm font-mono"
              placeholder="12/28"
              value={cardDetails.expiry}
              onChange={(e) => onChange({ ...cardDetails, expiry: e.target.value })}
              autoComplete="cc-exp"
            />
          </label>
          <label className="text-xs font-bold text-neutral-700">
            CVV
            <div className="relative mt-1">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                className="w-full border border-neutral-200 rounded-xl pl-9 pr-3 py-2 text-sm font-mono"
                placeholder="•••"
                value={cardDetails.cvv}
                onChange={(e) => onChange({ ...cardDetails, cvv: e.target.value })}
                autoComplete="cc-csc"
              />
            </div>
          </label>
        </div>
      </div>
    </div>
  );
};
