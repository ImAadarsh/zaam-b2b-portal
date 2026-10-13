'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, Loader2, Search, X } from 'lucide-react';
import { zaamApi } from '@/lib/api';
import { Branch, Order, OrderListParams, OrderStatusFilter } from '@/types';
import { OrderStatusBadge, TrackingLink, formatOrderDate } from './orderHelpers';

const STATUS_OPTIONS: OrderStatusFilter[] = ['Pending', 'Processing', 'Delivered', 'Cancelled'];
const PAGE_SIZES = [10, 25, 50, 100];

const DEFAULT_PARAMS: OrderListParams = { page: 1, pageSize: 10, sort: 'date', dir: 'desc' };

type Props = {
  /** Dashboard widget: latest rows only, no filters or pagination. */
  compact?: boolean;
  compactRows?: number;
};

export const OrdersTable: React.FC<Props> = ({ compact = false, compactRows = 5 }) => {
  const router = useRouter();
  const [params, setParams] = useState<OrderListParams>(
    compact ? { ...DEFAULT_PARAMS, pageSize: compactRows } : DEFAULT_PARAMS
  );
  const [searchInput, setSearchInput] = useState('');
  const [rows, setRows] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);

  useEffect(() => {
    if (compact) return;
    zaamApi.getBranches().then(setBranches).catch(() => setBranches([]));
  }, [compact]);

  useEffect(() => {
    if (compact) return;
    const t = setTimeout(() => {
      setParams((p) => (p.search === (searchInput.trim() || undefined) ? p : { ...p, search: searchInput.trim() || undefined, page: 1 }));
    }, 300);
    return () => clearTimeout(t);
  }, [searchInput, compact]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    zaamApi
      .listOrders(params)
      .then((res) => {
        if (cancelled) return;
        setRows(res.data);
        setTotal(res.meta.total);
      })
      .catch((e: any) => {
        if (cancelled) return;
        setRows([]);
        setTotal(0);
        setError(e.message || 'Failed to load orders');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [params]);

  const update = (patch: Partial<OrderListParams>) => setParams((p) => ({ ...p, ...patch, page: patch.page ?? 1 }));

  const toggleSort = (sort: OrderListParams['sort']) => {
    if (compact) return;
    setParams((p) => ({
      ...p,
      sort,
      dir: p.sort === sort ? (p.dir === 'desc' ? 'asc' : 'desc') : 'desc',
      page: 1
    }));
  };

  const hasFilters = Boolean(params.search || params.status || params.dateFrom || params.dateTo || params.branchId);
  const clearFilters = () => {
    setSearchInput('');
    setParams((p) => ({ ...DEFAULT_PARAMS, pageSize: p.pageSize }));
  };

  const pageCount = Math.max(1, Math.ceil(total / params.pageSize));
  const firstRow = total === 0 ? 0 : (params.page - 1) * params.pageSize + 1;
  const lastRow = Math.min(total, params.page * params.pageSize);
  const deliveryBranches = branches.filter((b) => b.addressType !== 'billing');

  const sortHeader = (field: OrderListParams['sort'], label: string, align: 'left' | 'right' = 'left') => {
    const active = params.sort === field;
    const Icon = !active ? ArrowUpDown : params.dir === 'desc' ? ArrowDown : ArrowUp;
    return (
      <th key={field} className={`px-3 py-2.5 font-semibold ${align === 'right' ? 'text-right' : 'text-left'}`}>
        {compact ? (
          label
        ) : (
          <button
            type="button"
            onClick={() => toggleSort(field)}
            className={`inline-flex items-center gap-1 hover:text-neutral-900 ${active ? 'text-neutral-900' : ''}`}
          >
            {label}
            <Icon className={`w-3 h-3 ${active ? 'text-zaam-green-600' : 'text-neutral-300'}`} />
          </button>
        )}
      </th>
    );
  };

  const inputClass = 'border border-neutral-200 rounded-xl px-3 py-2 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-zaam-green-500/30';

  return (
    <div className="space-y-3">
      {!compact && (
        <div className="flex flex-wrap items-end gap-2">
          <label className="flex-1 min-w-[180px]">
            <span className="block text-[10px] font-semibold text-neutral-500 uppercase tracking-wider mb-1">Order number</span>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search e.g. ZM-2026-…"
                maxLength={100}
                className={`${inputClass} w-full pl-8`}
              />
            </div>
          </label>
          <label>
            <span className="block text-[10px] font-semibold text-neutral-500 uppercase tracking-wider mb-1">Status</span>
            <select
              value={params.status || ''}
              onChange={(e) => update({ status: (e.target.value as OrderStatusFilter) || undefined })}
              className={inputClass}
            >
              <option value="">All statuses</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </label>
          <label>
            <span className="block text-[10px] font-semibold text-neutral-500 uppercase tracking-wider mb-1">From</span>
            <input
              type="date"
              value={params.dateFrom || ''}
              max={params.dateTo || undefined}
              onChange={(e) => update({ dateFrom: e.target.value || undefined })}
              className={inputClass}
            />
          </label>
          <label>
            <span className="block text-[10px] font-semibold text-neutral-500 uppercase tracking-wider mb-1">To</span>
            <input
              type="date"
              value={params.dateTo || ''}
              min={params.dateFrom || undefined}
              onChange={(e) => update({ dateTo: e.target.value || undefined })}
              className={inputClass}
            />
          </label>
          <label>
            <span className="block text-[10px] font-semibold text-neutral-500 uppercase tracking-wider mb-1">Branch</span>
            <select
              value={params.branchId || ''}
              onChange={(e) => update({ branchId: e.target.value || undefined })}
              className={`${inputClass} max-w-[220px]`}
            >
              <option value="">All branches</option>
              {deliveryBranches.map((b) => (
                <option key={b.id} value={b.id}>
                  {[b.addressLine1, b.city].filter(Boolean).join(', ')}
                </option>
              ))}
            </select>
          </label>
          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="flex items-center gap-1 text-xs font-semibold text-neutral-600 hover:text-rose-600 px-3 py-2 rounded-xl border border-neutral-200 bg-white"
            >
              <X className="w-3.5 h-3.5" />
              Clear
            </button>
          )}
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-neutral-200">
        <table className="w-full text-xs">
          <thead className="bg-neutral-50 text-[11px] text-neutral-500 uppercase tracking-wider">
            <tr>
              <th className="px-3 py-2.5 text-left font-semibold">Order</th>
              {sortHeader('date', 'Date')}
              {!compact && <th className="px-3 py-2.5 text-left font-semibold">Branch</th>}
              {sortHeader('status', 'Status')}
              <th className="px-3 py-2.5 text-right font-semibold">Qty</th>
              {sortHeader('total', 'Total', 'right')}
              {!compact && <th className="px-3 py-2.5 text-left font-semibold">Tracking</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {loading && rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-3 py-6 text-center text-neutral-500">
                  <Loader2 className="w-4 h-4 animate-spin inline mr-2 text-zaam-green-600" />
                  Loading orders…
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={7} className="px-3 py-6 text-center text-rose-600">{error}</td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-3 py-6 text-center text-neutral-500">
                  {hasFilters ? 'No orders match these filters.' : 'No B2B orders yet. Place your first wholesale order from the catalog.'}
                </td>
              </tr>
            ) : (
              rows.map((order) => (
                <tr
                  key={order.id}
                  onClick={() => router.push(`/orders/${order.id}`)}
                  className={`cursor-pointer hover:bg-zaam-green-50/40 transition-colors ${loading ? 'opacity-60' : ''}`}
                >
                  <td className="px-3 py-2.5 font-bold text-neutral-900 whitespace-nowrap">
                    <Link href={`/orders/${order.id}`} onClick={(e) => e.stopPropagation()} className="hover:text-zaam-green-700 hover:underline">
                      {order.orderNumber}
                    </Link>
                  </td>
                  <td className="px-3 py-2.5 text-neutral-600 whitespace-nowrap">{formatOrderDate(order)}</td>
                  {!compact && <td className="px-3 py-2.5 text-neutral-600 max-w-[200px] truncate">{order.branch || '—'}</td>}
                  <td className="px-3 py-2.5"><OrderStatusBadge status={order.status} /></td>
                  <td className="px-3 py-2.5 text-right text-neutral-700">{order.itemCount}</td>
                  <td className="px-3 py-2.5 text-right font-bold text-zaam-green-700 whitespace-nowrap">£{Number(order.total).toFixed(2)}</td>
                  {!compact && (
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      <TrackingLink trackingNumber={order.trackingNumber} />
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {!compact && (
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-neutral-600">
          <div className="flex items-center gap-2">
            <span>Rows per page</span>
            <select
              value={params.pageSize}
              onChange={(e) => update({ pageSize: Number(e.target.value) })}
              className="border border-neutral-200 rounded-lg px-2 py-1 bg-white"
            >
              {PAGE_SIZES.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
            <span className="text-neutral-400">
              {firstRow}–{lastRow} of {total}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={params.page <= 1 || loading}
              onClick={() => update({ page: params.page - 1 })}
              className="p-1.5 rounded-lg border border-neutral-200 bg-white disabled:opacity-40"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2">
              Page {params.page} of {pageCount}
            </span>
            <button
              type="button"
              disabled={params.page >= pageCount || loading}
              onClick={() => update({ page: params.page + 1 })}
              className="p-1.5 rounded-lg border border-neutral-200 bg-white disabled:opacity-40"
              aria-label="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
