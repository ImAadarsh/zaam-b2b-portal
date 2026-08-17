'use client';

import React, { useEffect, useState } from 'react';
import { Package } from 'lucide-react';

export type ProductImageSize = 'xs' | 'sm' | 'md' | 'lg';

const ICON_CLASS: Record<ProductImageSize, string> = {
  xs: 'w-3.5 h-3.5',
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8'
};

const ICON_WRAP_CLASS: Record<ProductImageSize, string> = {
  xs: 'p-1',
  sm: 'p-1.5',
  md: 'p-2',
  lg: 'p-2.5'
};

const LABEL_CLASS: Record<ProductImageSize, string> = {
  xs: 'hidden',
  sm: 'text-[8px]',
  md: 'text-[10px]',
  lg: 'text-[11px]'
};

interface NoImagePlaceholderProps {
  size?: ProductImageSize;
  label?: string;
  className?: string;
}

/** Branded fallback shown wherever a catalog item has no ERP media attached. */
export const NoImagePlaceholder: React.FC<NoImagePlaceholderProps> = ({
  size = 'md',
  label = 'No Image',
  className = ''
}) => (
  <div
    role="img"
    aria-label={label}
    className={`flex h-full w-full flex-col items-center justify-center gap-1 bg-gradient-to-br from-neutral-50 via-neutral-100 to-neutral-200/70 ${className}`}
  >
    <span
      className={`flex items-center justify-center rounded-full bg-white/80 ring-1 ring-inset ring-neutral-200/90 ${ICON_WRAP_CLASS[size]}`}
    >
      <Package className={`${ICON_CLASS[size]} text-zaam-green-700/45`} strokeWidth={1.6} />
    </span>
    <span className={`${LABEL_CLASS[size]} font-bold uppercase tracking-wider text-neutral-400`}>
      {label}
    </span>
  </div>
);

interface ProductImageProps {
  src?: string | null;
  alt: string;
  /** Controls placeholder icon/label scale — match it to the rendered box. */
  size?: ProductImageSize;
  fit?: 'cover' | 'contain';
  /** Classes for the wrapper box (sizing, radius, aspect ratio). */
  className?: string;
  imgClassName?: string;
  label?: string;
}

export const ProductImage: React.FC<ProductImageProps> = ({
  src,
  alt,
  size = 'md',
  fit = 'contain',
  className = '',
  imgClassName = '',
  label
}) => {
  const source = typeof src === 'string' ? src.trim() : '';
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [source]);

  const showImage = source.length > 0 && !failed;

  return (
    <div className={`relative overflow-hidden bg-white ${className}`}>
      {showImage ? (
        <img
          src={source}
          alt={alt}
          loading="lazy"
          onError={() => setFailed(true)}
          className={`h-full w-full ${fit === 'cover' ? 'object-cover' : 'object-contain'} ${imgClassName}`}
        />
      ) : (
        <NoImagePlaceholder size={size} label={label} />
      )}
    </div>
  );
};
