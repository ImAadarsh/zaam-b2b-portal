export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  subcategories?: SubCategory[];
}

export interface SubCategory {
  id: string;
  name: string;
  slug: string;
  parentId: string;
  itemCount?: number;
}

export interface ProductVariant {
  id: string;
  sku: string;
  name: string;
  flavor?: string;
  color?: string;
  size?: string;
  packSize: string; // e.g. "24 x 500ml" or "12 x 250ml"
  unitsPerCase: number;
  barcode: string;
  casePrice: number;
  unitPrice: number;
  rrp: number; // Recommended Retail Price
  stockLevel: number;
  weightKg: number;
  vatRate: number; // 0.20 for 20%
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  brand: string;
  category: string;
  subCategory: string;
  description: string;
  imageUrl: string;
  featured?: boolean;
  isPromo?: boolean;
  tierPricing: {
    minCases: number;
    pricePerCase: number;
  }[];
  variants: ProductVariant[];
  nutrition?: {
    sugarContent?: string;
    energyKcal?: string;
    caffeineMg?: string;
  };
}

export interface CartItem {
  product: Product;
  variant: ProductVariant;
  quantity: number; // in cases
}

export interface RetailerProfile {
  id: string;
  companyName: string;
  tradingName: string;
  accountNumber: string;
  vatNumber: string;
  contactName: string;
  email: string;
  phone: string;
  tier: 'Gold Wholesale' | 'Platinum Premier' | 'Silver Standard';
  creditLimit: number;
  creditUsed: number;
  paymentTerms: string; // e.g., "30 Days Net"
  deliveryAddress: {
    street: string;
    city: string;
    postcode: string;
    country: string;
  };
  assignedRep: {
    name: string;
    phone: string;
    email: string;
    avatarUrl?: string;
  };
}

export interface OrderItem {
  sku: string;
  name: string;
  variantName: string;
  quantity: number;
  pricePerCase: number;
  total: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  date: string;
  status: 'Pending' | 'Processing' | 'Dispatched' | 'Delivered' | 'Cancelled';
  paymentMethod: 'Bank Transfer (Open Banking)' | 'Credit Card' | 'Trade Credit (Wallet)';
  gatewayUsed?: string;
  deliveryMethod: string;
  items: OrderItem[];
  itemCount: number;
  totalWeightKg: number;
  subtotal: number;
  vatAmount: number;
  total: number;
  trackingNumber?: string;
  orderDate?: string;
  paymentStatus?: string;
  branch?: string | null;
  fulfillmentStatus?: string;
}

export type OrderStatusFilter = 'Pending' | 'Processing' | 'Delivered' | 'Cancelled';

export interface OrderListParams {
  page: number;
  pageSize: number;
  sort: 'date' | 'total' | 'status';
  dir: 'asc' | 'desc';
  search?: string;
  status?: OrderStatusFilter | '';
  dateFrom?: string;
  dateTo?: string;
  branchId?: string;
}

export interface OrderListResult {
  data: Order[];
  meta: { total: number; page: number; pageSize: number };
}

export interface OrderDetail extends Order {
  currency: string;
  discountAmount: number;
  shippingAmount: number;
  deliveryAddress: {
    name: string | null;
    company: string | null;
    addressLine1: string;
    addressLine2: string | null;
    city: string;
    postalCode: string;
    countryCode: string;
    phone: string | null;
  } | null;
  shipment?: { id: string; status: string; carrier: string | null; trackingNumber: string | null };
  timeline: { status: string; label: string; at: string }[];
  invoice: { invoiceNumber: string; status: string; invoiceDate: string; documentUrl: string | null } | null;
}

export interface Branch {
  id: string;
  addressType: 'shipping' | 'billing' | 'both';
  company: string | null;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  postalCode: string;
  isDefault: boolean;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'promo' | 'system' | 'delivery' | 'credit';
  date: string;
  read: boolean;
  actionUrl?: string;
}

export interface Bank {
  id: string;
  name: string;
  logo: string;
  popular?: boolean;
}

export type PaymentGatewayProvider = 'stripe_primary' | 'sumup_fallback' | 'adyen_primary' | 'truelayer_openbanking';

export interface PaymentAttemptLog {
  id: string;
  timestamp: string;
  provider: PaymentGatewayProvider;
  status: 'attempted' | 'success' | 'failed' | 'fallback_triggered';
  errorCode?: string;
  errorMessage?: string;
  durationMs: number;
}

export type SupportTicketCategory =
  | 'order_inquiry'
  | 'return'
  | 'complaint'
  | 'technical'
  | 'billing'
  | 'general'
  | 'other';

export type SupportTicketPriority = 'low' | 'medium' | 'high' | 'urgent';

export type SupportTicketStatus =
  | 'new'
  | 'open'
  | 'pending_customer'
  | 'pending_internal'
  | 'resolved'
  | 'closed'
  | 'cancelled';

export interface SupportTicketMessage {
  id: string;
  senderType: 'customer' | 'agent' | 'system';
  senderName: string | null;
  message: string;
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  subject: string;
  description: string | null;
  category: SupportTicketCategory;
  priority: SupportTicketPriority;
  status: SupportTicketStatus;
  channel: string;
  orderId: string | null;
  orderNumber: string | null;
  createdAt: string;
  updatedAt: string;
  messages?: SupportTicketMessage[];
}
