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

/** What one ordered quantity is; stock levels are counted in the same unit. */
export function getSaleUnit(variant?: Partial<ProductVariant> | null): string {
  return (variant?.saleUnit || 'case').toLowerCase();
}

function pluralize(unit: string, qty: number): string {
  if (qty === 1) return unit;
  return /(s|x|ch|sh)$/.test(unit) ? `${unit}es` : `${unit}s`;
}

/** e.g. "5 displays", or "5 Displays" with capitalize. */
export function formatSaleQty(qty: number, variant?: Partial<ProductVariant> | null, capitalize = false): string {
  const word = pluralize(getSaleUnit(variant), qty);
  return `${qty} ${capitalize ? word.charAt(0).toUpperCase() + word.slice(1) : word}`;
}

/** Retail units contained in `qty` sale units, or null when the sale unit is already a single unit. */
export function getContainedUnits(qty: number, variant?: Partial<ProductVariant> | null): number | null {
  const upc = toFiniteNumber(variant?.unitsPerCase);
  if (!upc || upc <= 1) return null;
  return qty * upc;
}

/** Most of this variant a retailer may order (the portal does not allow backorders). */
export function getMaxOrderQty(variant?: Partial<ProductVariant> | null): number {
  const level = toFiniteNumber(variant?.stockLevel);
  return level == null || level < 0 ? 0 : Math.floor(level);
}

export function getAvailabilityMessage(variant?: Partial<ProductVariant> | null): string {
  const max = getMaxOrderQty(variant);
  return max <= 0 ? 'Out of stock' : `Only ${formatSaleQty(max, variant)} available`;
}

export type StockTone = 'in' | 'low' | 'out' | 'unknown';

export function getStockInfo(stockLevel?: number | null, variant?: Partial<ProductVariant> | null): { label: string; tone: StockTone } {
  const level = toFiniteNumber(stockLevel);
  if (level == null || level < 0) return { label: `Stock ${EM_DASH}`, tone: 'unknown' };
  if (level === 0) return { label: 'Out of stock', tone: 'out' };
  if (level <= 5) return { label: `${formatSaleQty(level, variant)} left`, tone: 'low' };
  return { label: `${formatSaleQty(level, variant)} in stock`, tone: 'in' };
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

/** Pack label that says what is being sold, e.g. "Display of 12"; falls back to the raw pack size. */
export function getPackLabel(variant?: Partial<ProductVariant> | null): string | null {
  const upc = toFiniteNumber(variant?.unitsPerCase);
  const unit = getSaleUnit(variant);
  if (variant?.saleUnit && unit !== 'unit' && upc && upc > 1) {
    return `${unit.charAt(0).toUpperCase() + unit.slice(1)} of ${upc}`;
  }
  return getPackSizeLabel(variant?.packSize);
}

export function getBarcodeLabel(barcode?: string | null): string {
  const raw = (barcode || '').trim();
  return raw.length > 0 ? raw : EM_DASH;
}
