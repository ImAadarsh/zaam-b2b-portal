import { Product, Category, Order, OrderDetail, OrderListParams, OrderListResult, Branch, RetailerProfile, NotificationItem, SupportTicket, SupportTicketMessage, SupportTicketCategory, SupportTicketPriority } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_ZAAM_API_URL || 'http://localhost:4000/api/b2b';

const ACCESS_KEY = 'zaam_b2b_access';
const REFRESH_KEY = 'zaam_b2b_refresh';

export function getB2bAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ACCESS_KEY);
}

export function setB2bTokens(accessToken: string, refreshToken?: string) {
  localStorage.setItem(ACCESS_KEY, accessToken);
  if (refreshToken) localStorage.setItem(REFRESH_KEY, refreshToken);
}

export function clearB2bTokens() {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getB2bAccessToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string> | undefined)
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}${path}`, { ...init, headers, cache: 'no-store' });
  if (res.status === 401 && typeof window !== 'undefined') {
    const refresh = localStorage.getItem(REFRESH_KEY);
    if (refresh && !path.includes('/auth/')) {
      const refreshed = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: refresh })
      });
      if (refreshed.ok) {
        const json = await refreshed.json();
        if (json.accessToken) {
          setB2bTokens(json.accessToken, json.refreshToken);
          return request<T>(path, init);
        }
      }
      clearB2bTokens();
    }
  }

  if (path.includes('/wallet/statement') || path.includes('/catalog/export')) {
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      throw new Error(json?.error?.message || `Request failed (${res.status})`);
    }
    return (await res.text()) as T;
  }

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json?.error?.message || `Request failed (${res.status})`);
  }
  return json as T;
}

export const zaamApi = {
  async login(email: string, password: string): Promise<{ accessToken: string; refreshToken: string; retailer: RetailerProfile }> {
    const json = await request<{ accessToken: string; refreshToken: string; retailer: RetailerProfile }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    setB2bTokens(json.accessToken, json.refreshToken);
    return json;
  },

  async getMe(): Promise<RetailerProfile> {
    const json = await request<{ data: RetailerProfile }>('/me');
    return json.data;
  },

  async updateProfile(payload: Partial<{ companyName: string; firstName: string; lastName: string; phone: string; taxId: string }>) {
    const json = await request<{ data: RetailerProfile }>('/me', { method: 'PATCH', body: JSON.stringify(payload) });
    return json.data;
  },

  async changePassword(currentPassword: string, newPassword: string) {
    const json = await request<{ data: { success: boolean } }>('/me/password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword })
    });
    return json.data;
  },

  async getProducts(params?: { category?: string; search?: string }): Promise<Product[]> {
    const query = new URLSearchParams();
    if (params?.category) query.set('category', params.category);
    if (params?.search) query.set('search', params.search);
    const qs = query.toString() ? `?${query.toString()}` : '';
    const json = await request<{ data: Product[] }>(`/catalog/products${qs}`);
    return json.data || [];
  },

  async getProductByBarcode(barcode: string): Promise<Product | null> {
    try {
      const json = await request<{ data: Product }>(`/catalog/products/by-barcode/${encodeURIComponent(barcode)}`);
      return json.data;
    } catch {
      return null;
    }
  },

  async getCategories(): Promise<Category[]> {
    const json = await request<{ data: Category[] }>('/catalog/categories');
    return json.data || [];
  },

  async exportCatalogCsv(): Promise<string> {
    return request<string>('/catalog/export');
  },

  async getOrders(): Promise<Order[]> {
    const json = await request<OrderListResult>('/orders?pageSize=100');
    return json.data || [];
  },

  async listOrders(params: OrderListParams): Promise<OrderListResult> {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') query.set(key, String(value));
    });
    const json = await request<OrderListResult>(`/orders?${query.toString()}`);
    return { data: json.data || [], meta: json.meta || { total: 0, page: params.page, pageSize: params.pageSize } };
  },

  async getOrder(id: string): Promise<OrderDetail> {
    const json = await request<{ data: OrderDetail }>(`/orders/${encodeURIComponent(id)}`);
    return json.data;
  },

  async createOrder(payload: {
    lines: { variantId: string; quantity: number }[];
    shippingMethod?: string;
    shippingMethodCode?: string;
    customerNotes?: string;
    paymentMethod?: 'bank_transfer' | 'card' | 'credit';
    addressId?: string;
    couponCode?: string;
    affiliateCode?: string;
    affiliateTrackingCode?: string;
    affiliateSessionId?: string;
    affiliateClickId?: string;
  }): Promise<{ success: boolean; order: Order }> {
    const json = await request<{ data: Order }>('/orders', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    return { success: true, order: json.data };
  },

  async validateCoupon(couponCode: string, subtotal: number) {
    const json = await request<{
      data: {
        couponCode: string;
        couponName: string;
        discountType: string;
        discountValue: number;
        discountAmount: number;
        currency: string;
        freeShipping: boolean;
      };
    }>('/coupons/validate', {
      method: 'POST',
      body: JSON.stringify({ couponCode, subtotal })
    });
    return json.data;
  },

  async payWithTradeCredit(orderId: string): Promise<Order> {
    const json = await request<{ data: Order }>('/payments/trade-credit', {
      method: 'POST',
      body: JSON.stringify({ orderId })
    });
    return json.data;
  },

  async payIntent(
    orderId: string,
    method: 'card' | 'bank_transfer',
    extras?: {
      bankId?: string;
      cardDetails?: { cardNumber: string; expiry: string; cvv: string; holderName?: string };
    }
  ): Promise<{
    order: Order;
    gateway?: { name: string; provider: string; mode?: string };
    message?: string;
    bankTransferInstructions?: string;
    payment?: any;
  }> {
    const json = await request<{
      data: {
        order: Order;
        gateway?: { name: string; provider: string; mode?: string };
        message?: string;
        bankTransferInstructions?: string;
        payment?: any;
      };
    }>('/payments/intent', {
      method: 'POST',
      body: JSON.stringify({ orderId, method, ...extras })
    });
    return json.data;
  },

  async getPaymentMethods() {
    const json = await request<{ data: any }>('/payments/methods');
    return json.data;
  },

  async getRetailerProfile(): Promise<RetailerProfile> {
    return this.getMe();
  },

  async getBranches(): Promise<Branch[]> {
    const json = await request<{ data: Branch[] }>('/branches');
    return json.data || [];
  },

  async createBranch(payload: any) {
    const json = await request<{ data: any }>('/branches', { method: 'POST', body: JSON.stringify(payload) });
    return json.data;
  },

  async updateBranch(id: string, payload: any) {
    const json = await request<{ data: any }>(`/branches/${id}`, { method: 'PATCH', body: JSON.stringify(payload) });
    return json.data;
  },

  async deleteBranch(id: string) {
    const json = await request<{ data: any }>(`/branches/${id}`, { method: 'DELETE' });
    return json.data;
  },

  async getBuyers() {
    const json = await request<{ data: any[] }>('/buyers');
    return json.data || [];
  },

  async createBuyer(payload: any) {
    const json = await request<{ data: any }>('/buyers', { method: 'POST', body: JSON.stringify(payload) });
    return json.data;
  },

  async updateBuyer(id: string, payload: any) {
    const json = await request<{ data: any }>(`/buyers/${id}`, { method: 'PATCH', body: JSON.stringify(payload) });
    return json.data;
  },

  async deleteBuyer(id: string) {
    const json = await request<{ data: any }>(`/buyers/${id}`, { method: 'DELETE' });
    return json.data;
  },

  async getWallet() {
    const json = await request<{ data: any }>('/wallet');
    return json.data;
  },

  async getLedger() {
    const json = await request<{ data: any[] }>('/wallet/ledger');
    return json.data || [];
  },

  async requestCreditIncrease(requestedLimit: number, reason?: string) {
    const json = await request<{ data: any }>('/wallet/credit-requests', {
      method: 'POST',
      body: JSON.stringify({ requestedLimit, reason })
    });
    return json.data;
  },

  async downloadStatement(): Promise<string> {
    return request<string>('/wallet/statement');
  },

  async getShippingOptions(amount?: number) {
    const qs = amount != null ? `?amount=${amount}` : '';
    const json = await request<{ data: any[] }>(`/shipping/options${qs}`);
    return json.data || [];
  },

  async getShipments() {
    const json = await request<{ data: any[] }>('/shipments');
    return json.data || [];
  },

  async getNotifications(): Promise<NotificationItem[]> {
    const json = await request<{ data: NotificationItem[] }>('/notifications');
    return json.data || [];
  },

  async markNotificationRead(id: string) {
    const json = await request<{ data: any }>(`/notifications/${id}/read`, { method: 'POST' });
    return json.data;
  },

  async markAllNotificationsRead() {
    const json = await request<{ data: any }>('/notifications/read-all', { method: 'POST' });
    return json.data;
  },

  async getNotificationPreferences() {
    const json = await request<{ data: any }>('/notifications/preferences');
    return json.data;
  },

  async updateNotificationPreferences(payload: any) {
    const json = await request<{ data: any }>('/notifications/preferences', {
      method: 'PATCH',
      body: JSON.stringify(payload)
    });
    return json.data;
  },

  async getReferral() {
    const json = await request<{ data: any }>('/referrals/me');
    return json.data;
  },

  async inviteReferral(payload: { referredEmail?: string; referredCompany?: string }) {
    const json = await request<{ data: any }>('/referrals/invite', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    return json.data;
  },

  async getSupportTickets(): Promise<SupportTicket[]> {
    const json = await request<{ data: SupportTicket[] }>('/support/tickets');
    return json.data || [];
  },

  async getSupportTicket(id: string): Promise<SupportTicket> {
    const json = await request<{ data: SupportTicket }>(`/support/tickets/${id}`);
    return json.data;
  },

  async createSupportTicket(payload: {
    subject: string;
    description: string;
    category?: SupportTicketCategory;
    priority?: SupportTicketPriority;
    orderId?: string;
  }): Promise<SupportTicket> {
    const json = await request<{ data: SupportTicket }>('/support/tickets', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    return json.data;
  },

  async replySupportTicket(id: string, message: string): Promise<SupportTicketMessage> {
    const json = await request<{ data: SupportTicketMessage }>(`/support/tickets/${id}/messages`, {
      method: 'POST',
      body: JSON.stringify({ message })
    });
    return json.data;
  }
};
