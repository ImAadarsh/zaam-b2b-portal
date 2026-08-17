import React from 'react';
import Image from 'next/image';

type BrandLayout = 'horizontal' | 'stacked';
type BrandTone = 'black' | 'white' | 'golden';

const BRAND_ASSETS: Record<BrandLayout, { ratio: number; tones: Record<BrandTone, string> }> = {
  horizontal: {
    ratio: 1260 / 471,
    tones: {
      black: '/brand/h-black.png',
      white: '/brand/h-white.png',
      golden: '/brand/h-golden.png'
    }
  },
  stacked: {
    ratio: 1,
    tones: {
      black: '/brand/black.png',
      white: '/brand/white.png',
      golden: '/brand/golden.png'
    }
  }
};

interface BrandLogoProps {
  layout?: BrandLayout;
  /** Pick the tone that contrasts with the surface: `black` on light, `white`/`golden` on dark. */
  tone?: BrandTone;
  /** Rendered height in px — width is derived from the asset ratio so the mark never stretches. */
  height?: number;
  className?: string;
  priority?: boolean;
  alt?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  layout = 'horizontal',
  tone = 'black',
  height = 32,
  className = '',
  priority = false,
  alt = 'Zaam'
}) => {
  const asset = BRAND_ASSETS[layout];
  const width = Math.round(height * asset.ratio);

  return (
    <Image
      src={asset.tones[tone]}
      alt={alt}
      width={width}
      height={height}
      priority={priority}
      className={`w-auto object-contain ${className}`}
      style={{ height }}
    />
  );
};
