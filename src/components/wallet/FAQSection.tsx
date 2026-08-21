'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { HelpCircle, ChevronDown, ChevronUp, Headphones } from 'lucide-react';

const faqs = [
  {
    question: 'How do 30-Day Net Trade Credit terms work?',
    answer: 'Orders dispatched on trade credit are aggregated across the billing month. You receive a consolidated VAT invoice on the 1st of the following month, payable by the 30th/31st of that month via Open Banking, BACS, or Direct Debit.'
  },
  {
    question: 'How do I qualify for a higher credit limit (e.g. £25,000+)?',
    answer: 'Credit limit increases are reviewed automatically every 90 days based on on-time settlement history. You can also request an immediate manual review via Support or your Account Manager with your recent management accounts.'
  },
  {
    question: 'Can I split checkout payments between Wallet Credit and Bank Card?',
    answer: 'Yes. During checkout, if your order total exceeds available credit, you can apply your full remaining credit line and settle the remainder seamlessly via UK Open Banking or Card.'
  },
  {
    question: 'Are there early settlement discounts available for prompt payment?',
    answer: 'Yes, Gold and Platinum retail members receive an additional 1.5% prompt settlement rebate when settling monthly statement balances within 7 calendar days of statement generation.'
  }
];

export const FAQSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="bg-white rounded-2xl p-5 shadow-soft-sm border border-neutral-200/80 space-y-4">
      <div className="flex items-center space-x-2">
        <div className="p-2 bg-neutral-100 rounded-lg text-neutral-700">
          <HelpCircle className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-neutral-900">Trade Credit & Wallet FAQ</h3>
          <p className="text-[11px] text-neutral-500">Essential rules regarding terms, limits & settlements</p>
        </div>
      </div>

      <div className="space-y-2">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className="border border-neutral-200 rounded-xl overflow-hidden transition-colors"
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="w-full p-3.5 text-left flex items-center justify-between bg-neutral-50/50 hover:bg-neutral-100/50 transition-colors"
              >
                <span className="text-xs font-bold text-neutral-800">{faq.question}</span>
                {isOpen ? (
                  <ChevronUp className="w-4 h-4 text-neutral-400 flex-shrink-0 ml-2" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-neutral-400 flex-shrink-0 ml-2" />
                )}
              </button>

              {isOpen && (
                <div className="p-3.5 bg-white text-xs text-neutral-600 border-t border-neutral-100 leading-relaxed animate-in fade-in duration-150">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <Link
        href="/account/support"
        className="flex items-center justify-center gap-2 w-full text-xs font-bold text-zaam-green-700 bg-zaam-green-50 hover:bg-zaam-green-100 border border-zaam-green-200 py-2.5 rounded-xl transition-colors"
      >
        <Headphones className="w-4 h-4" />
        Contact support
      </Link>
    </div>
  );
};
