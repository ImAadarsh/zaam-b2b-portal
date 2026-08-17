import { ProductVariant } from '@/types';

export const EM_DASH = '—';

function toFiniteNumber(value: unknown): number | null {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

/**
 * Profit on return as a whole percentage, or null when the ERP feed lacks a usable
 * RRP / case price. Returning null keeps callers from rendering `-Infinity%`.
 */
export function getPorPercent(variant?: Partial<ProductVariant> | null): number | null {
  if (!variant) return null;

  const rrp = toFiniteNumber(variant.rrp);
  const unitsPerCase = toFiniteNumber(variant.unitsPerCase);
  const casePrice = toFiniteNumber(variant.casePrice);
  if (!rrp || rrp <= 0 || !casePrice || casePrice <= 0) return null;

  const retailValue = rrp * (unitsPerCase && unitsPerCase > 0 ? unitsPerCase : 1);
  if (retailValue <= 0) return null;

  const por = ((retailValue - casePrice) / retailValue) * 100;
  if (!Number.isFinite(por) || por <= 0 || por >= 100) return null;

  return Math.round(por);
}

/** Pack size string, or null when the ERP feed has no meaningful value. */
export function getPackSizeLabel(packSize?: string | number | null): string | null {
  const raw = packSize == null ? '' : String(packSize).trim();
  if (!raw || raw === '0') return null;
  return raw;
}

export type StockTone = 'in' | 'low' | 'out' | 'unknown';

export function getStockInfo(stockLevel?: number | null): { label: string; tone: StockTone } {
  const level = toFiniteNumber(stockLevel);
  if (level == null || level < 0) return { label: `Stock ${EM_DASH}`, tone: 'unknown' };
  if (level === 0) return { label: 'Out of stock', tone: 'out' };
  if (level <= 5) return { label: `${level} left`, tone: 'low' };
  return { label: `${level} in stock`, tone: 'in' };
}

export const STOCK_TONE_CLASS: Record<StockTone, string> = {
  in: 'text-emerald-600',
  low: 'text-amber-600',
  out: 'text-rose-600',
  unknown: 'text-neutral-400'
};

/** Weight with unit, or an em dash when the ERP feed reports 0/unknown. */
export function getWeightLabel(weightKg?: number | null): string {
  const weight = toFiniteNumber(weightKg);
  if (weight == null || weight <= 0) return EM_DASH;
  return `${weight} kg`;
}

export function getUnitsPerCaseLabel(unitsPerCase?: number | null): string {
  const units = toFiniteNumber(unitsPerCase);
  if (units == null || units <= 0) return EM_DASH;
  return `${units} ${units === 1 ? 'Unit' : 'Units'}`;
}

export function getBarcodeLabel(barcode?: string | null): string {
  const raw = (barcode || '').trim();
  return raw.length > 0 ? raw : EM_DASH;
}
