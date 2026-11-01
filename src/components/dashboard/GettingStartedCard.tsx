'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, Circle, MapPin, ScanLine, Store, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { zaamApi } from '@/lib/api';

const DISMISS_KEY = 'zaam_b2b_getting_started_dismissed';

type Step = {
  id: string;
  label: string;
  hint: string;
  href: string;
  done: boolean;
  cta: string;
};

/**
 * First-run activation checklist for new retailers.
 * Aha moment: place first wholesale order (or scan-to-basket).
 * Endowed progress: account verified counts as already complete.
 */
export const GettingStartedCard: React.FC = () => {
  const { retailer, selectedBranch, branches } = useAuth();
  const [dismissed, setDismissed] = useState(true);
  const [hasOrders, setHasOrders] = useState<boolean | null>(null);

  useEffect(() => {
    setDismissed(localStorage.getItem(DISMISS_KEY) === '1');
  }, []);

  useEffect(() => {
    let cancelled = false;
    zaamApi
      .listOrders({ page: 1, pageSize: 1, sort: 'date', dir: 'desc' })
      .then((res) => {
        if (!cancelled) setHasOrders(res.meta.total > 0);
      })
      .catch(() => {
        if (!cancelled) setHasOrders(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const steps: Step[] = useMemo(
    () => [
      {
        id: 'account',
        label: 'Account verified',
        hint: 'Your trade account is active on Zaam Wholesale.',
        href: '/account',
        done: true,
        cta: 'View account'
      },
      {
        id: 'branch',
        label: 'Confirm delivery branch',
        hint: selectedBranch
          ? `Delivering to ${[selectedBranch.addressLine1, selectedBranch.city].filter(Boolean).join(', ')}`
          : branches.length === 0
            ? 'Add a delivery address so orders know where to go.'
            : 'Pick which store receives this order.',
        href: branches.length === 0 ? '/account?panel=branches' : '/#',
        done: Boolean(selectedBranch),
        cta: selectedBranch ? 'Switch branch' : 'Set branch'
      },
      {
        id: 'order',
        label: 'Place your first wholesale order',
        hint: 'Browse cases, add to basket, and checkout with trade pricing.',
        href: '/shop',
        done: hasOrders === true,
        cta: 'Order wholesale'
      },
      {
        id: 'scan',
        label: 'Try shelf scan (optional)',
        hint: 'Scan an EAN on the shelf to replenish by case in seconds.',
        href: '/scan',
        done: false,
        cta: 'Open scanner'
      }
    ],
    [selectedBranch, branches.length, hasOrders]
  );

  const requiredDone = steps.filter((s) => s.id !== 'scan' && s.done).length;
  const requiredTotal = steps.filter((s) => s.id !== 'scan').length;
  const allRequiredDone = requiredDone >= requiredTotal;
  const progressPct = Math.round((requiredDone / requiredTotal) * 100);

  if (!retailer || dismissed || allRequiredDone) return null;

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, '1');
    setDismissed(true);
  };

  const iconFor = (id: string) => {
    if (id === 'branch') return MapPin;
    if (id === 'scan') return ScanLine;
    if (id === 'order') return Store;
    return CheckCircle2;
  };

  return (
    <section
      aria-label="Getting started"
      className="bg-gradient-to-br from-zaam-green-50 via-white to-white rounded-2xl border border-zaam-green-200/70 shadow-soft-sm p-5 space-y-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-zaam-green-700">
            Getting started · {progressPct}% complete
          </p>
          <h2 className="text-base sm:text-lg font-extrabold text-zaam-dark-900 mt-0.5">
            Activate your wholesale portal
          </h2>
          <p className="text-xs text-neutral-600 mt-1 max-w-xl">
            Reach your first order in a few steps — trade pricing unlocks as soon as you add cases to basket.
          </p>
        </div>
        <button
          type="button"
          onClick={dismiss}
          className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-white/80 transition-colors"
          aria-label="Dismiss getting started"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div
        className="h-1.5 rounded-full bg-zaam-green-100 overflow-hidden"
        role="progressbar"
        aria-valuenow={progressPct}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full bg-zaam-green-600 rounded-full transition-all duration-500"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {steps.map((step) => {
          const Icon = iconFor(step.id);
          const isBranchStep = step.id === 'branch' && branches.length > 0;
          return (
            <li
              key={step.id}
              className={`flex items-start gap-3 rounded-xl border px-3 py-3 ${
                step.done
                  ? 'bg-white/70 border-zaam-green-100'
                  : 'bg-white border-neutral-200'
              }`}
            >
              <span className="mt-0.5 shrink-0" aria-hidden>
                {step.done ? (
                  <CheckCircle2 className="w-4 h-4 text-zaam-green-600" />
                ) : (
                  <Circle className="w-4 h-4 text-neutral-300" />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <Icon className="w-3.5 h-3.5 text-zaam-green-700 shrink-0" />
                  <p className={`text-xs font-bold ${step.done ? 'text-neutral-500 line-through' : 'text-neutral-900'}`}>
                    {step.label}
                  </p>
                </div>
                <p className="text-[11px] text-neutral-500 mt-0.5 leading-snug">{step.hint}</p>
                {!step.done && !isBranchStep && (
                  <Link
                    href={step.href}
                    className="inline-flex mt-2 text-[11px] font-bold text-zaam-green-700 hover:text-zaam-green-800"
                  >
                    {step.cta} →
                  </Link>
                )}
                {!step.done && isBranchStep && (
                  <p className="mt-2 text-[11px] font-semibold text-zaam-green-700">
                    Use the branch switcher in the header
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
};
