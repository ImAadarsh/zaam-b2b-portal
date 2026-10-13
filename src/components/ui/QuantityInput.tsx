'use client';

import React, { useEffect, useState } from 'react';
import { Plus, Minus } from 'lucide-react';

interface QuantityInputProps {
  value: number;
  /** Highest allowed quantity; 0 disables the control. */
  max: number;
  onChange: (value: number) => void;
  /** Called when the user tries to go above max (typing or +). */
  onLimit?: () => void;
  size?: 'sm' | 'md';
}

export const QuantityInput: React.FC<QuantityInputProps> = ({ value, max, onChange, onLimit, size = 'md' }) => {
  const [draft, setDraft] = useState(String(value));
  useEffect(() => setDraft(String(value)), [value]);

  const disabled = max <= 0;
  const clamp = (n: number) => {
    if (!Number.isFinite(n) || n < 1) return 1;
    if (n > max) {
      onLimit?.();
      return Math.max(1, max);
    }
    return Math.floor(n);
  };

  const commit = (raw: string) => {
    const next = clamp(parseInt(raw, 10));
    setDraft(String(next));
    onChange(next);
  };

  const btn = size === 'sm' ? 'w-7 h-7' : 'w-8 h-8';

  return (
    <div className="flex items-center space-x-1.5 bg-white border border-neutral-300 rounded-xl p-1 shadow-xs">
      <button
        type="button"
        onClick={() => onChange(clamp(value - 1))}
        disabled={disabled || value <= 1}
        className={`${btn} flex items-center justify-center rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold disabled:opacity-40 disabled:cursor-not-allowed`}
        aria-label="Decrease quantity"
      >
        <Minus className="w-4 h-4" />
      </button>
      <input
        type="number"
        inputMode="numeric"
        min={1}
        max={Math.max(1, max)}
        value={draft}
        disabled={disabled}
        onChange={(e) => {
          setDraft(e.target.value);
          const n = parseInt(e.target.value, 10);
          if (Number.isFinite(n) && n > max) commit(e.target.value);
        }}
        onBlur={(e) => commit(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') commit((e.target as HTMLInputElement).value);
        }}
        className="w-12 text-center text-sm font-bold text-neutral-900 bg-transparent outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none disabled:text-neutral-400"
        aria-label="Quantity"
      />
      <button
        type="button"
        onClick={() => (value >= max ? onLimit?.() : onChange(value + 1))}
        disabled={disabled || value >= max}
        className={`${btn} flex items-center justify-center rounded-lg bg-zaam-green-600 hover:bg-zaam-green-700 text-white font-bold disabled:bg-neutral-300 disabled:cursor-not-allowed`}
        aria-label="Increase quantity"
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );
};
