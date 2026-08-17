'use client';

import React from 'react';
import { Bank } from '@/types';
import { Zap, Lock } from 'lucide-react';

interface BankTransferTabProps {
  banks: Bank[];
  selectedBankId: string;
  onSelectBank: (id: string) => void;
  instructions?: string | null;
}

export const BankTransferTab: React.FC<BankTransferTabProps> = ({
  banks,
  selectedBankId,
  onSelectBank,
  instructions
}) => {
  return (
    <div className="space-y-4">
      <div className="bg-zaam-green-50 border border-zaam-green-200/80 rounded-2xl p-4 flex items-start space-x-3">
        <div className="p-2 bg-zaam-green-600 text-white rounded-xl flex-shrink-0">
          <Zap className="w-4 h-4" />
        </div>
        <div className="text-xs space-y-1">
          <h4 className="font-bold text-zaam-green-900">Bank transfer / Open Banking</h4>
          <p className="text-zaam-green-800">
            {instructions ||
              'Selecting a bank records your preferred route. Settlement stays pending until funds are confirmed by staff — this is not an automatic success.'}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-bold text-neutral-800 uppercase tracking-wider block">Select Your UK Bank:</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {banks.map((bank) => {
            const isSelected = selectedBankId === bank.id;
            return (
              <button
                key={bank.id}
                type="button"
                onClick={() => onSelectBank(bank.id)}
                className={`p-3 rounded-2xl border text-left transition-all flex items-center space-x-3 ${
                  isSelected
                    ? 'border-zaam-green-600 bg-white ring-2 ring-zaam-green-600/20 shadow-soft-sm'
                    : 'border-neutral-200 hover:border-neutral-300 bg-white'
                }`}
              >
                <span className="text-2xl flex-shrink-0">{bank.logo}</span>
                <div className="min-w-0">
                  <p className={`text-xs font-bold truncate ${isSelected ? 'text-zaam-green-800' : 'text-neutral-900'}`}>
                    {bank.name}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-center space-x-2 text-[11px] text-neutral-500 pt-1">
        <Lock className="w-3.5 h-3.5 text-zaam-green-600" />
        <span>Payment remains pending until ERP staff confirm receipt</span>
      </div>
    </div>
  );
};
