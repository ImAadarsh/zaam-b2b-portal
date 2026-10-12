'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, MapPin, FileCheck2, BellRing, Lock, Users, Download, ChevronRight, LogOut, X, Headphones } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useNotifications } from '@/context/NotificationContext';
import { zaamApi } from '@/lib/api';

type Panel = 'profile' | 'branches' | 'buyers' | 'notifications' | 'password' | null;

export const SettingsMenu: React.FC = () => {
  const router = useRouter();
  const { retailer, logout, refreshProfile, refreshBranches } = useAuth();
  const { showToast } = useNotifications();
  const [panel, setPanel] = useState<Panel>(null);
  const [branches, setBranches] = useState<any[]>([]);
  const [buyers, setBuyers] = useState<any[]>([]);
  const [prefs, setPrefs] = useState<any>(null);
  const [profileForm, setProfileForm] = useState({ companyName: '', phone: '', taxId: '', firstName: '', lastName: '' });
  const [branchForm, setBranchForm] = useState({ addressLine1: '', city: '', postalCode: '', countryCode: 'GB', company: '' });
  const [buyerForm, setBuyerForm] = useState({ name: '', email: '', role: 'buyer', spendingCap: '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '' });

  useEffect(() => {
    if (!retailer) return;
    const parts = (retailer.contactName || '').split(' ');
    setProfileForm({
      companyName: retailer.companyName || '',
      phone: retailer.phone || '',
      taxId: retailer.vatNumber || '',
      firstName: parts[0] || '',
      lastName: parts.slice(1).join(' ') || ''
    });
  }, [retailer]);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('panel') === 'branches') open('branches');
  }, []);

  const open = async (p: Panel) => {
    setPanel(p);
    try {
      if (p === 'branches') setBranches(await zaamApi.getBranches());
      if (p === 'buyers') setBuyers(await zaamApi.getBuyers());
      if (p === 'notifications') setPrefs(await zaamApi.getNotificationPreferences());
    } catch (e: any) {
      showToast(e.message || 'Failed to load', 'error');
    }
  };

  if (!retailer) return null;

  const sections = [
    {
      title: 'Company & Multi-Branch Management',
      items: [
        { icon: Building2, label: 'Company Profile & VAT Details', desc: `${retailer.companyName} • VAT: ${retailer.vatNumber || '—'}`, action: () => open('profile') },
        { icon: MapPin, label: 'Registered Delivery Branches', desc: 'Manage shipping addresses', action: () => open('branches') },
        { icon: Users, label: 'Authorized Store Staff & Buyers', desc: 'Manage buyers and spending caps', action: () => open('buyers') }
      ]
    },
    {
      title: 'Help & Support',
      items: [
        {
          icon: Headphones,
          label: 'Support tickets',
          desc: 'Raise and track account support requests',
          action: () => router.push('/account/support')
        }
      ]
    },
    {
      title: 'Wholesale Contracts & Compliance',
      items: [
        {
          icon: FileCheck2,
          label: 'B2B Trade Supply Terms',
          desc: retailer.paymentTerms || 'Trade terms',
          action: () => showToast(`Payment terms on file: ${retailer.paymentTerms}`, 'info')
        },
        {
          icon: Download,
          label: 'Download Price List (CSV)',
          desc: 'Full wholesale SKU catalog export',
          action: async () => {
            try {
              const csv = await zaamApi.exportCatalogCsv();
              const blob = new Blob([csv], { type: 'text/csv' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'zaam-b2b-price-list.csv';
              a.click();
              URL.revokeObjectURL(url);
              showToast('Price list downloaded', 'success');
            } catch (e: any) {
              showToast(e.message || 'Export failed', 'error');
            }
          }
        }
      ]
    },
    {
      title: 'Security & Preferences',
      items: [
        { icon: BellRing, label: 'Notification Preferences', desc: 'Price, stock, order and credit alerts', action: () => open('notifications') },
        { icon: Lock, label: 'Change Password', desc: 'Update portal login password', action: () => open('password') }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      {sections.map((sec, idx) => (
        <div key={idx} className="bg-white rounded-2xl p-5 shadow-soft-sm border border-neutral-200/80 space-y-3">
          <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">{sec.title}</h4>
          <div className="space-y-1">
            {sec.items.map((item, itemIdx) => {
              const Icon = item.icon;
              return (
                <button
                  key={itemIdx}
                  onClick={item.action}
                  className="w-full p-3 rounded-xl hover:bg-neutral-50 border border-transparent hover:border-neutral-200 transition-all flex items-center justify-between text-left group"
                >
                  <div className="flex items-center space-x-3.5">
                    <div className="p-2.5 rounded-xl bg-neutral-100 group-hover:bg-zaam-green-50 text-neutral-700 group-hover:text-zaam-green-700 transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-neutral-900 group-hover:text-zaam-green-700 transition-colors">{item.label}</p>
                      <p className="text-[11px] text-neutral-500">{item.desc}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-neutral-400" />
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <button onClick={logout} className="w-full p-3.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-2xl border border-rose-200 text-xs font-bold flex items-center justify-center space-x-2">
        <LogOut className="w-4 h-4" />
        <span>Sign Out of Wholesale Portal</span>
      </button>

      {panel && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-5 space-y-4 shadow-xl max-h-[85vh] overflow-auto">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-neutral-900 capitalize">{panel}</h3>
              <button onClick={() => setPanel(null)}><X className="w-4 h-4" /></button>
            </div>

            {panel === 'profile' && (
              <div className="space-y-2">
                {(['companyName', 'firstName', 'lastName', 'phone', 'taxId'] as const).map((k) => (
                  <input key={k} className="w-full border rounded-xl px-3 py-2 text-xs" placeholder={k} value={(profileForm as any)[k]} onChange={(e) => setProfileForm({ ...profileForm, [k]: e.target.value })} />
                ))}
                <button
                  className="w-full bg-zaam-green-600 text-white text-xs font-bold py-2.5 rounded-xl"
                  onClick={async () => {
                    try {
                      await zaamApi.updateProfile(profileForm);
                      await refreshProfile();
                      showToast('Profile updated', 'success');
                      setPanel(null);
                    } catch (e: any) {
                      showToast(e.message, 'error');
                    }
                  }}
                >
                  Save profile
                </button>
              </div>
            )}

            {panel === 'branches' && (
              <div className="space-y-3">
                {branches.map((b) => (
                  <div key={b.id} className="border rounded-xl p-3 text-xs flex justify-between gap-2">
                    <div>
                      <div className="font-bold">{b.company || b.addressLine1}</div>
                      <div className="text-neutral-500">{b.addressLine1}, {b.city} {b.postalCode}</div>
                    </div>
                    <button className="text-rose-600" onClick={async () => { await zaamApi.deleteBranch(b.id); setBranches(await zaamApi.getBranches()); await refreshBranches(); }}>Delete</button>
                  </div>
                ))}
                <div className="grid gap-2">
                  <input className="border rounded-xl px-3 py-2 text-xs" placeholder="Branch / store name (optional)" value={branchForm.company} onChange={(e) => setBranchForm({ ...branchForm, company: e.target.value })} />
                  <input className="border rounded-xl px-3 py-2 text-xs" placeholder="Address line 1" value={branchForm.addressLine1} onChange={(e) => setBranchForm({ ...branchForm, addressLine1: e.target.value })} />
                  <input className="border rounded-xl px-3 py-2 text-xs" placeholder="City" value={branchForm.city} onChange={(e) => setBranchForm({ ...branchForm, city: e.target.value })} />
                  <input className="border rounded-xl px-3 py-2 text-xs" placeholder="Postcode" value={branchForm.postalCode} onChange={(e) => setBranchForm({ ...branchForm, postalCode: e.target.value })} />
                  <button
                    className="bg-zaam-green-600 text-white text-xs font-bold py-2.5 rounded-xl"
                    onClick={async () => {
                      try {
                        await zaamApi.createBranch(branchForm);
                        setBranches(await zaamApi.getBranches());
                        await refreshBranches();
                        setBranchForm({ addressLine1: '', city: '', postalCode: '', countryCode: 'GB', company: '' });
                        showToast('Branch added', 'success');
                      } catch (e: any) {
                        showToast(e.message, 'error');
                      }
                    }}
                  >
                    Add branch
                  </button>
                </div>
              </div>
            )}

            {panel === 'buyers' && (
              <div className="space-y-3">
                {buyers.map((b) => (
                  <div key={b.id} className="border rounded-xl p-3 text-xs flex justify-between">
                    <div>
                      <div className="font-bold">{b.name}</div>
                      <div className="text-neutral-500">{b.email} · {b.role}</div>
                    </div>
                    <button className="text-rose-600" onClick={async () => { await zaamApi.deleteBuyer(b.id); setBuyers(await zaamApi.getBuyers()); }}>Remove</button>
                  </div>
                ))}
                <input className="w-full border rounded-xl px-3 py-2 text-xs" placeholder="Name" value={buyerForm.name} onChange={(e) => setBuyerForm({ ...buyerForm, name: e.target.value })} />
                <input className="w-full border rounded-xl px-3 py-2 text-xs" placeholder="Email" value={buyerForm.email} onChange={(e) => setBuyerForm({ ...buyerForm, email: e.target.value })} />
                <button
                  className="w-full bg-zaam-green-600 text-white text-xs font-bold py-2.5 rounded-xl"
                  onClick={async () => {
                    try {
                      await zaamApi.createBuyer({
                        name: buyerForm.name,
                        email: buyerForm.email,
                        role: buyerForm.role,
                        spendingCap: buyerForm.spendingCap ? Number(buyerForm.spendingCap) : null
                      });
                      setBuyers(await zaamApi.getBuyers());
                      showToast('Buyer added', 'success');
                    } catch (e: any) {
                      showToast(e.message, 'error');
                    }
                  }}
                >
                  Add buyer
                </button>
              </div>
            )}

            {panel === 'notifications' && prefs && (
              <div className="space-y-2 text-xs">
                {([
                  ['priceAlerts', 'Price alerts'],
                  ['stockSms', 'Stock SMS'],
                  ['orderUpdates', 'Order updates'],
                  ['creditAlerts', 'Credit alerts'],
                  ['marketing', 'Marketing'],
                  ['channelEmail', 'Email channel'],
                  ['channelSms', 'SMS channel'],
                  ['channelWhatsapp', 'WhatsApp channel']
                ] as const).map(([key, label]) => (
                  <label key={key} className="flex items-center justify-between border rounded-xl px-3 py-2">
                    <span>{label}</span>
                    <input
                      type="checkbox"
                      checked={!!prefs[key]}
                      onChange={(e) => setPrefs({ ...prefs, [key]: e.target.checked })}
                    />
                  </label>
                ))}
                <button
                  className="w-full bg-zaam-green-600 text-white text-xs font-bold py-2.5 rounded-xl"
                  onClick={async () => {
                    try {
                      await zaamApi.updateNotificationPreferences(prefs);
                      showToast('Preferences saved', 'success');
                      setPanel(null);
                    } catch (e: any) {
                      showToast(e.message, 'error');
                    }
                  }}
                >
                  Save preferences
                </button>
              </div>
            )}

            {panel === 'password' && (
              <div className="space-y-2">
                <input type="password" className="w-full border rounded-xl px-3 py-2 text-xs" placeholder="Current password" value={passwordForm.currentPassword} onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} />
                <input type="password" className="w-full border rounded-xl px-3 py-2 text-xs" placeholder="New password" value={passwordForm.newPassword} onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} />
                <button
                  className="w-full bg-zaam-green-600 text-white text-xs font-bold py-2.5 rounded-xl"
                  onClick={async () => {
                    try {
                      await zaamApi.changePassword(passwordForm.currentPassword, passwordForm.newPassword);
                      showToast('Password updated', 'success');
                      setPanel(null);
                    } catch (e: any) {
                      showToast(e.message, 'error');
                    }
                  }}
                >
                  Update password
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
