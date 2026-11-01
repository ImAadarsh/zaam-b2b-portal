'use client';

import React, { ButtonHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';

export type AsyncButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
  loadingText?: string;
};

/**
 * Primary async action button: disables + spinner while pending to prevent double-submit.
 */
export const AsyncButton: React.FC<AsyncButtonProps> = ({
  loading = false,
  loadingText,
  children,
  disabled,
  className = '',
  type = 'button',
  ...rest
}) => {
  const isDisabled = Boolean(disabled || loading);
  return (
    <button
      type={type}
      {...rest}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      className={`inline-flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed ${className}`}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin shrink-0" aria-hidden /> : null}
      <span>{loading && loadingText ? loadingText : children}</span>
    </button>
  );
};
