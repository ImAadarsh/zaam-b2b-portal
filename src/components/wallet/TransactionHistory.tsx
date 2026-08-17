'use client';

import React, { useEffect, useState } from 'react';
import { ArrowDownLeft, ArrowUpRight, FileText } from 'lucide-react';
import { zaamApi } from '@/lib/api';
import { useNotifications } from '@/context/NotificationContext';

export const TransactionHistory: React.FC = () => {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useNotifications();

  useEffect(() => {
    (async () => {
      try {
        const data = await zaamApi.getLedger();
        setRows(data);
      } catch (e: any) {
        showToast(e.message || 'Failed to load ledger', 'error');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="bg-white rounded-2xl p-5 shadow-soft-sm border border-neutral-200/80 space-y-4">
      <div>
        <h3 className="text-sm font-bold text-neutral-900">Trade Ledger & Invoices</h3>
        <p className="text-[11px] text-neutral-500">Live statement from ERP ledger / B2B orders & payments</p>
      </div>
      {loading ? (
        <p className="text-xs text-neutral-500">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="text-xs text-neutral-500">No ledger entries yet.</p>
      ) : (
        <div className="space-y-2.5">
          {rows.map((tx) => (
            <div key={tx.id} className="p-3.5 rounded-xl border border-neutral-200 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div
                  className={`p-2.5 rounded-xl flex-shrink-0 ${
                    tx.type === 'payment'
                      ? 'bg-emerald-50 text-emerald-700'
                      : tx.type === 'credit_note' || tx.type === 'reward'
                        ? 'bg-zaam-gold-50 text-zaam-gold-700'
                        : 'bg-neutral-100 text-neutral-700'
                  }`}
                >
                  {tx.type === 'payment' ? <ArrowDownLeft className="w-4 h-4" /> : tx.type === 'credit_note' || tx.type === 'reward' ? <FileText className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-neutral-900">{tx.reference}</span>
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded uppercase bg-neutral-100 text-neutral-700">{tx.status}</span>
                  </div>
                  <p className="text-xs text-neutral-600 truncate max-w-xs sm:max-w-md">{tx.description}</p>
                  <span className="text-[10px] text-neutral-400 font-medium">
                    {tx.date ? new Date(tx.date).toLocaleDateString('en-GB') : ''}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className={`text-sm font-extrabold ${tx.type === 'payment' || tx.type === 'credit_note' || tx.type === 'reward' ? 'text-emerald-700' : 'text-neutral-900'}`}>
                  {tx.type === 'payment' || tx.type === 'credit_note' || tx.type === 'reward' ? '-' : '+'}£{Number(tx.amount).toFixed(2)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
