'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Headphones,
  Loader2,
  MessageSquarePlus,
  Send,
  ChevronRight,
  Package
} from 'lucide-react';
import { zaamApi } from '@/lib/api';
import { useNotifications } from '@/context/NotificationContext';
import type {
  Order,
  SupportTicket,
  SupportTicketCategory,
  SupportTicketPriority,
  SupportTicketStatus
} from '@/types';

const CATEGORIES: { value: SupportTicketCategory; label: string }[] = [
  { value: 'order_inquiry', label: 'Order inquiry' },
  { value: 'return', label: 'Return / exchange' },
  { value: 'complaint', label: 'Complaint' },
  { value: 'technical', label: 'Technical' },
  { value: 'billing', label: 'Billing & credit' },
  { value: 'general', label: 'General' },
  { value: 'other', label: 'Other' }
];

const PRIORITIES: { value: SupportTicketPriority; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' }
];

function statusLabel(status: SupportTicketStatus) {
  return status.replace(/_/g, ' ');
}

function statusClass(status: SupportTicketStatus) {
  switch (status) {
    case 'new':
    case 'open':
      return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    case 'pending_customer':
      return 'bg-amber-50 text-amber-800 border-amber-200';
    case 'pending_internal':
      return 'bg-sky-50 text-sky-800 border-sky-200';
    case 'resolved':
      return 'bg-neutral-100 text-neutral-700 border-neutral-200';
    case 'closed':
    case 'cancelled':
      return 'bg-rose-50 text-rose-700 border-rose-200';
    default:
      return 'bg-neutral-100 text-neutral-600 border-neutral-200';
  }
}

type View = 'list' | 'create' | 'detail';

export default function SupportPage() {
  const { showToast } = useNotifications();
  const [view, setView] = useState<View>('list');
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selected, setSelected] = useState<SupportTicket | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [reply, setReply] = useState('');
  const [form, setForm] = useState({
    subject: '',
    description: '',
    category: 'general' as SupportTicketCategory,
    priority: 'medium' as SupportTicketPriority,
    orderId: ''
  });

  const loadTickets = useCallback(async () => {
    setLoading(true);
    try {
      setTickets(await zaamApi.getSupportTickets());
    } catch (e: any) {
      showToast(e.message || 'Failed to load tickets', 'error');
      setTickets([]);
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  const openCreate = async () => {
    setForm({ subject: '', description: '', category: 'general', priority: 'medium', orderId: '' });
    setView('create');
    try {
      setOrders(await zaamApi.getOrders());
    } catch {
      setOrders([]);
    }
  };

  const openDetail = async (id: string) => {
    setView('detail');
    setDetailLoading(true);
    setReply('');
    try {
      setSelected(await zaamApi.getSupportTicket(id));
    } catch (e: any) {
      showToast(e.message || 'Failed to load ticket', 'error');
      setView('list');
    } finally {
      setDetailLoading(false);
    }
  };

  const submitCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.subject.trim() || !form.description.trim()) {
      showToast('Subject and description are required', 'warning');
      return;
    }
    setSubmitting(true);
    try {
      const ticket = await zaamApi.createSupportTicket({
        subject: form.subject.trim(),
        description: form.description.trim(),
        category: form.category,
        priority: form.priority,
        ...(form.orderId ? { orderId: form.orderId } : {})
      });
      showToast(`Ticket ${ticket.ticketNumber} created`, 'success');
      await loadTickets();
      setSelected(ticket);
      setView('detail');
    } catch (err: any) {
      showToast(err.message || 'Could not create ticket', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const submitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected || !reply.trim()) return;
    setSubmitting(true);
    try {
      await zaamApi.replySupportTicket(selected.id, reply.trim());
      const refreshed = await zaamApi.getSupportTicket(selected.id);
      setSelected(refreshed);
      setReply('');
      showToast('Reply sent', 'success');
      await loadTickets();
    } catch (err: any) {
      showToast(err.message || 'Could not send reply', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const canReply =
    selected &&
    selected.status !== 'closed' &&
    selected.status !== 'cancelled';

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl p-5 shadow-soft-sm border border-neutral-200/80 flex items-center justify-between gap-3">
        <div className="flex items-center space-x-3 min-w-0">
          {(view === 'create' || view === 'detail') && (
            <button
              type="button"
              onClick={() => {
                setView('list');
                setSelected(null);
              }}
              className="p-2 rounded-xl border border-neutral-200 hover:bg-neutral-50 text-neutral-600"
              aria-label="Back to tickets"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          {view === 'list' && (
            <Link
              href="/account"
              className="p-2 rounded-xl border border-neutral-200 hover:bg-neutral-50 text-neutral-600"
              aria-label="Back to account"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
          )}
          <div className="p-3 bg-gradient-to-tr from-zaam-dark-900 to-neutral-800 text-white rounded-2xl shadow-soft-sm shrink-0">
            <Headphones className="w-6 h-6 text-zaam-gold-400" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl font-extrabold text-zaam-dark-900 truncate">
              {view === 'create' ? 'New support ticket' : view === 'detail' ? selected?.ticketNumber || 'Ticket' : 'Support'}
            </h1>
            <p className="text-xs text-neutral-500 truncate">
              {view === 'list'
                ? 'Track and raise tickets with the Zaam support team'
                : view === 'create'
                  ? 'Describe your issue — linked to your wholesale account'
                  : selected?.subject || 'Conversation thread'}
            </p>
          </div>
        </div>

        {view === 'list' && (
          <button
            type="button"
            onClick={openCreate}
            className="shrink-0 inline-flex items-center gap-1.5 bg-zaam-green-600 hover:bg-zaam-green-700 text-white text-xs font-bold px-3.5 py-2.5 rounded-xl transition-colors"
          >
            <MessageSquarePlus className="w-4 h-4" />
            New ticket
          </button>
        )}
      </div>

      {view === 'list' && (
        <div className="bg-white rounded-2xl p-5 shadow-soft-sm border border-neutral-200/80 space-y-3">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-12 text-sm text-neutral-500">
              <Loader2 className="w-4 h-4 animate-spin text-zaam-green-600" />
              Loading tickets…
            </div>
          ) : tickets.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <p className="text-sm font-semibold text-neutral-800">No support tickets yet</p>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                Raise a ticket for order issues, billing, or general account help. Your messages go straight to the CRM support queue.
              </p>
              <button
                type="button"
                onClick={openCreate}
                className="inline-flex items-center gap-1.5 bg-zaam-green-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl"
              >
                <MessageSquarePlus className="w-4 h-4" />
                Create first ticket
              </button>
            </div>
          ) : (
            <ul className="space-y-2">
              {tickets.map((t) => (
                <li key={t.id}>
                  <button
                    type="button"
                    onClick={() => openDetail(t.id)}
                    className="w-full text-left border border-neutral-200 rounded-xl p-3.5 hover:border-zaam-green-300 hover:bg-zaam-green-50/40 transition-all flex items-center justify-between gap-3 group"
                  >
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[11px] font-mono font-semibold text-neutral-500">{t.ticketNumber}</span>
                        <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border ${statusClass(t.status)}`}>
                          {statusLabel(t.status)}
                        </span>
                      </div>
                      <p className="text-sm font-bold text-neutral-900 truncate group-hover:text-zaam-green-800">{t.subject}</p>
                      <p className="text-[11px] text-neutral-500">
                        {CATEGORIES.find((c) => c.value === t.category)?.label || t.category}
                        {t.orderNumber ? ` · Order ${t.orderNumber}` : ''}
                        {' · '}
                        {new Date(t.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-neutral-400 shrink-0" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {view === 'create' && (
        <form onSubmit={submitCreate} className="bg-white rounded-2xl p-5 shadow-soft-sm border border-neutral-200/80 space-y-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">Subject</label>
            <input
              className="w-full border border-neutral-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-zaam-green-500/30 focus:border-zaam-green-500"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              placeholder="Short summary of your issue"
              maxLength={500}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">Category</label>
              <select
                className="w-full border border-neutral-200 rounded-xl px-3 py-2.5 text-sm bg-white"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value as SupportTicketCategory })}
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">Priority (optional)</label>
              <select
                className="w-full border border-neutral-200 rounded-xl px-3 py-2.5 text-sm bg-white"
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value as SupportTicketPriority })}
              >
                {PRIORITIES.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider flex items-center gap-1">
              <Package className="w-3.5 h-3.5" /> Related order (optional)
            </label>
            <select
              className="w-full border border-neutral-200 rounded-xl px-3 py-2.5 text-sm bg-white"
              value={form.orderId}
              onChange={(e) => setForm({ ...form, orderId: e.target.value })}
            >
              <option value="">No linked order</option>
              {orders.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.orderNumber} · {o.status} · £{Number(o.total).toFixed(2)} · {new Date(o.date).toLocaleDateString()}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">Description</label>
            <textarea
              className="w-full border border-neutral-200 rounded-xl px-3 py-2.5 text-sm min-h-[140px] focus:outline-none focus:ring-2 focus:ring-zaam-green-500/30 focus:border-zaam-green-500"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Include order details, dates, and what you need help with"
              required
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-zaam-green-600 hover:bg-zaam-green-700 disabled:opacity-60 text-white text-sm font-bold py-3 rounded-xl flex items-center justify-center gap-2"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Submit ticket
          </button>
        </form>
      )}

      {view === 'detail' && (
        <div className="space-y-4">
          {detailLoading || !selected ? (
            <div className="bg-white rounded-2xl p-8 flex items-center justify-center gap-2 text-sm text-neutral-500">
              <Loader2 className="w-4 h-4 animate-spin text-zaam-green-600" />
              Loading conversation…
            </div>
          ) : (
            <>
              <div className="bg-white rounded-2xl p-5 shadow-soft-sm border border-neutral-200/80 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border ${statusClass(selected.status)}`}>
                    {statusLabel(selected.status)}
                  </span>
                  <span className="text-[11px] text-neutral-500 capitalize">{selected.priority} priority</span>
                  <span className="text-[11px] text-neutral-500">
                    {CATEGORIES.find((c) => c.value === selected.category)?.label}
                  </span>
                  {selected.orderNumber && (
                    <span className="text-[11px] font-medium text-zaam-green-700">Order {selected.orderNumber}</span>
                  )}
                </div>
                <h2 className="text-base font-bold text-neutral-900">{selected.subject}</h2>
                <p className="text-[11px] text-neutral-500">
                  Opened {new Date(selected.createdAt).toLocaleString()}
                </p>
              </div>

              <div className="bg-white rounded-2xl p-5 shadow-soft-sm border border-neutral-200/80 space-y-3">
                <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Conversation</h3>
                <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                  {(selected.messages || []).length === 0 ? (
                    <p className="text-xs text-neutral-500 whitespace-pre-wrap">{selected.description}</p>
                  ) : (
                    (selected.messages || []).map((m) => {
                      const isCustomer = m.senderType === 'customer';
                      return (
                        <div
                          key={m.id}
                          className={`rounded-xl p-3 text-xs space-y-1 ${
                            isCustomer
                              ? 'bg-zaam-green-50 border border-zaam-green-100 ml-4'
                              : 'bg-neutral-50 border border-neutral-200 mr-4'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-bold text-neutral-800">
                              {isCustomer ? 'You' : m.senderName || 'Zaam Support'}
                            </span>
                            <span className="text-[10px] text-neutral-400">
                              {new Date(m.createdAt).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-neutral-700 whitespace-pre-wrap leading-relaxed">{m.message}</p>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {canReply ? (
                <form onSubmit={submitReply} className="bg-white rounded-2xl p-5 shadow-soft-sm border border-neutral-200/80 space-y-3">
                  <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">Your reply</label>
                  <textarea
                    className="w-full border border-neutral-200 rounded-xl px-3 py-2.5 text-sm min-h-[100px] focus:outline-none focus:ring-2 focus:ring-zaam-green-500/30 focus:border-zaam-green-500"
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    placeholder="Add more detail or reply to the support team"
                    required
                  />
                  <button
                    type="submit"
                    disabled={submitting || !reply.trim()}
                    className="w-full bg-zaam-green-600 hover:bg-zaam-green-700 disabled:opacity-60 text-white text-sm font-bold py-3 rounded-xl flex items-center justify-center gap-2"
                  >
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    Send reply
                  </button>
                </form>
              ) : (
                <p className="text-center text-xs text-neutral-500 py-2">
                  This ticket is {selected.status.replace(/_/g, ' ')} and no longer accepts replies.
                </p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
