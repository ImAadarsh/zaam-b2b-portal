'use client';

import React, { Suspense, lazy, useState } from 'react';
import { Product, ProductVariant } from '@/types';
import { Loader2, ScanLine, Sparkles } from 'lucide-react';

const CameraScanner = lazy(() =>
  import('@/components/scan/CameraScanner').then((m) => ({ default: m.CameraScanner }))
);
const ScannedItemResult = lazy(() =>
  import('@/components/scan/ScannedItemResult').then((m) => ({ default: m.ScannedItemResult }))
);

export default function ScanPage() {
  const [scannedProduct, setScannedProduct] = useState<Product | null>(null);
  const [scannedVariant, setScannedVariant] = useState<ProductVariant | null>(null);

  const handleScanResult = (product: Product, variant: ProductVariant) => {
    setScannedProduct(product);
    setScannedVariant(variant);
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl p-5 shadow-soft-sm border border-neutral-200/80 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-gradient-to-tr from-zaam-green-700 to-zaam-green-600 text-white rounded-2xl shadow-glow-green">
            <ScanLine className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-extrabold text-zaam-dark-900">
              Barcode & QR Shelf Scanner
            </h1>
            <p className="text-xs text-neutral-500">
              Scan retail cans or cartons for instant case replenishment.
            </p>
          </div>
        </div>

        <span className="hidden sm:flex items-center space-x-1 text-xs bg-zaam-gold-500/20 text-zaam-gold-700 font-bold px-2.5 py-1 rounded-full">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Real-Time EAN Lookup</span>
        </span>
      </div>

      <Suspense
        fallback={
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-soft-sm p-10 flex flex-col items-center gap-3 text-neutral-500">
            <Loader2 className="w-6 h-6 animate-spin text-zaam-green-600" />
            <p className="text-xs font-medium">Loading camera scanner…</p>
          </div>
        }
      >
        <CameraScanner onScanResult={handleScanResult} />
      </Suspense>

      {scannedProduct && scannedVariant && (
        <Suspense fallback={null}>
          <ScannedItemResult
            key={scannedVariant.id}
            product={scannedProduct}
            variant={scannedVariant}
            onClose={() => {
              setScannedProduct(null);
              setScannedVariant(null);
            }}
          />
        </Suspense>
      )}
    </div>
  );
}
