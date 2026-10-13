'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, CheckCircle2, FileText, Loader2, MapPin, PackageCheck, RotateCw, Truck } from 'lucide-react';
import { zaamApi } from '@/lib/api';
import { OrderDetail } from '@/types';
import { OrderStatusBadge, TrackingLink, formatOrderDate, useReorder } from '@/components/orders/orderHelpers';

const money = (n: number) => `£${Number(n || 0).toFixed(2)}`;

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const id = String(params?.id || '');
  const reorder = useReorder();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    zaamApi
      .getOrder(id)
      .then((o) => {
        setOrder(o);
        setError(null);
      })
      .catch((e: any) => setError(e.message || 'Order not found'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="py-16 text-center text-sm text-neutral-500">
        <Loader2 className="w-5 h-5 animate-spin inline mr-2 text-zaam-green-600" />
        Loading order…
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <h2 className="text-lg font-bold text-neutral-900">Order not found</h2>
        <p className="text-xs text-neutral-500">{error || 'This order does not exist or does not belong to your account.'}</p>
        <Link href="/orders" className="inline-flex items-center gap-1.5 text-xs font-semibold text-zaam-green-700 hover:underline">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to orders
        </Link>
      </div>
    );
  }

  const addr = order.deliveryAddress;

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-300">
      <Link href="/orders" className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-600 hover:text-zaam-green-700">
        <ArrowLeft className="w-3.5 h-3.5" /> All orders
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-soft-sm">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-gradient-to-tr from-zaam-dark-900 to-neutral-800 text-white rounded-2xl shadow-soft-sm">
            <PackageCheck className="w-6 h-6 text-zaam-gold-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-zaam-dark-900">{order.orderNumber}</h1>
              <OrderStatusBadge status={order.status} />
            </div>
            <p className="text-xs text-neutral-500">
              Placed {formatOrderDate(order)}
              {order.branch ? ` • ${order.branch}` : ''} • {order.paymentMethod}
            </p>
          </div>
        </div>
        {order.items.length > 0 && (
          <button
            onClick={() => reorder(order)}
            className="flex items-center space-x-1.5 bg-zaam-green-600 hover:bg-zaam-green-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-glow-green btn-press self-start sm:self-auto"
          >
            <RotateCw className="w-4 h-4" />
            <span>Re-Order to basket</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl p-5 shadow-soft-sm border border-neutral-200/80 space-y-3">
            <h3 className="text-sm font-bold text-neutral-900">Order lines</h3>
            <div className="overflow-x-auto rounded-xl border border-neutral-200">
              <table className="w-full text-xs">
                <thead className="bg-neutral-50 text-[11px] text-neutral-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-3 py-2.5 text-left font-semibold">SKU</th>
                    <th className="px-3 py-2.5 text-left font-semibold">Product</th>
                    <th className="px-3 py-2.5 text-right font-semibold">Qty</th>
                    <th className="px-3 py-2.5 text-right font-semibold">Price each</th>
                    <th className="px-3 py-2.5 text-right font-semibold">Line total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {order.items.map((item, idx) => (
                    <tr key={`${item.sku}-${idx}`}>
                      <td className="px-3 py-2.5 font-mono text-neutral-600 whitespace-nowrap">{item.sku}</td>
                      <td className="px-3 py-2.5 text-neutral-900">{item.name}</td>
                      <td className="px-3 py-2.5 text-right">{item.quantity}</td>
                      <td className="px-3 py-2.5 text-right whitespace-nowrap">{money(item.pricePerCase)}</td>
                      <td className="px-3 py-2.5 text-right font-semibold whitespace-nowrap">{money(item.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <dl className="ml-auto max-w-xs text-xs space-y-1.5 pt-2">
              <div className="flex justify-between"><dt className="text-neutral-500">Subtotal (ex VAT)</dt><dd className="font-semibold">{money(order.subtotal)}</dd></div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between"><dt className="text-neutral-500">Discount</dt><dd className="font-semibold text-emerald-700">-{money(order.discountAmount)}</dd></div>
              )}
              <div className="flex justify-between"><dt className="text-neutral-500">Delivery ({order.deliveryMethod})</dt><dd className="font-semibold">{money(order.shippingAmount)}</dd></div>
              <div className="flex justify-between"><dt className="text-neutral-500">VAT</dt><dd className="font-semibold">{money(order.vatAmount)}</dd></div>
              <div className="flex justify-between border-t border-neutral-200 pt-1.5 text-sm"><dt className="font-bold">Total</dt><dd className="font-extrabold text-zaam-green-700">{money(order.total)}</dd></div>
            </dl>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-soft-sm border border-neutral-200/80 space-y-3">
            <h3 className="text-sm font-bold text-neutral-900">Status timeline</h3>
            <ol className="relative border-l border-neutral-200 ml-2 space-y-4">
              {order.timeline.map((step, idx) => (
                <li key={`${step.status}-${idx}`} className="ml-4">
                  <span className="absolute -left-[7px] mt-0.5 w-3.5 h-3.5 rounded-full bg-white border-2 border-zaam-green-600 flex items-center justify-center">
                    {idx === order.timeline.length - 1 && <span className="w-1.5 h-1.5 rounded-full bg-zaam-green-600" />}
                  </span>
                  <p className="text-xs font-semibold text-neutral-900">{step.label}</p>
                  <p className="text-[11px] text-neutral-500">
                    {new Date(step.at).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    {' • '}
                    <span className="capitalize">{step.status.replace(/_/g, ' ')}</span>
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-5 shadow-soft-sm border border-neutral-200/80 space-y-2">
            <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2"><MapPin className="w-4 h-4 text-zaam-green-600" /> Delivery address</h3>
            {addr ? (
              <address className="not-italic text-xs text-neutral-700 leading-relaxed">
                {addr.company && <div className="font-semibold">{addr.company}</div>}
                {addr.name && <div>{addr.name}</div>}
                <div>{addr.addressLine1}</div>
                {addr.addressLine2 && <div>{addr.addressLine2}</div>}
                <div>{addr.city} {addr.postalCode}</div>
                <div>{addr.countryCode}</div>
                {addr.phone && <div className="text-neutral-500 mt-1">{addr.phone}</div>}
              </address>
            ) : (
              <p className="text-xs text-neutral-500">No delivery address recorded.</p>
            )}
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-soft-sm border border-neutral-200/80 space-y-2">
            <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2"><Truck className="w-4 h-4 text-zaam-green-600" /> Shipment</h3>
            <div className="text-xs text-neutral-700 space-y-1">
              <div>Status: <strong className="capitalize">{(order.fulfillmentStatus || 'pending').replace(/_/g, ' ')}</strong></div>
              {order.shipment?.carrier && <div>Carrier: <strong>{order.shipment.carrier}</strong></div>}
              <div>Tracking: <TrackingLink trackingNumber={order.trackingNumber} /></div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-soft-sm border border-neutral-200/80 space-y-2">
            <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2"><FileText className="w-4 h-4 text-zaam-green-600" /> Invoice</h3>
            {order.invoice ? (
              <div className="text-xs text-neutral-700 space-y-1">
                <div className="flex items-center gap-2">
                  <strong>{order.invoice.invoiceNumber}</strong>
                  <span className="text-[10px] font-bold uppercase bg-neutral-100 px-1.5 rounded">{order.invoice.status}</span>
                </div>
                {order.invoice.documentUrl ? (
                  <a href={order.invoice.documentUrl} target="_blank" rel="noreferrer" className="font-semibold text-zaam-green-700 underline">
                    Download invoice
                  </a>
                ) : (
                  <p className="text-neutral-500">The invoice document is not available online yet — contact your account manager for a copy.</p>
                )}
              </div>
            ) : (
              <p className="text-xs text-neutral-500">No invoice has been issued for this order yet.</p>
            )}
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-soft-sm border border-neutral-200/80 text-xs text-neutral-700 space-y-1">
            <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-zaam-green-600" /> Payment</h3>
            <div>Method: <strong>{order.paymentMethod}</strong></div>
            {order.paymentStatus && <div>Status: <strong className="capitalize">{order.paymentStatus.replace(/_/g, ' ')}</strong></div>}
          </div>
        </div>
      </div>
    </div>
  );
}
