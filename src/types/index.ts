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
