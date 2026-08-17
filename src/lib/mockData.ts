import { Product, Category, RetailerProfile, Order, NotificationItem, Bank } from '@/types';

export const mockCategories: Category[] = [
  {
    id: 'drinks',
    name: 'Drinks & Beverages',
    slug: 'drinks',
    subcategories: [
      { id: 'energy-drinks', name: 'Energy Drinks', slug: 'energy-drinks', parentId: 'drinks', itemCount: 18 },
      { id: 'soft-drinks', name: 'Carbonated & Soft Drinks', slug: 'soft-drinks', parentId: 'drinks', itemCount: 34 },
      { id: 'juices-water', name: 'Juices & Mineral Water', slug: 'juices-water', parentId: 'drinks', itemCount: 22 },
      { id: 'hot-beverages', name: 'Coffee & Tea Syrups', slug: 'hot-beverages', parentId: 'drinks', itemCount: 12 },
    ]
  },
  {
    id: 'confectionery',
    name: 'Confectionery & Sweets',
    slug: 'confectionery',
    subcategories: [
      { id: 'chocolate-bars', name: 'Chocolate Singles & Multi-packs', slug: 'chocolate-bars', parentId: 'confectionery', itemCount: 28 },
      { id: 'gummies-candies', name: 'Gummies & Hanging Bags', slug: 'gummies-candies', parentId: 'confectionery', itemCount: 19 },
      { id: 'gum-mints', name: 'Chewing Gum & Pocket Mints', slug: 'gum-mints', parentId: 'confectionery', itemCount: 15 },
    ]
  },
  {
    id: 'crisps-snacks',
    name: 'Crisps, Nuts & Savory Snacks',
    slug: 'crisps-snacks',
    subcategories: [
      { id: 'price-marked-crisps', name: 'Price-Marked (PMP) Crisps', slug: 'price-marked-crisps', parentId: 'crisps-snacks', itemCount: 24 },
      { id: 'nuts-seeds', name: 'Bar Nuts & Pub Cards', slug: 'nuts-seeds', parentId: 'crisps-snacks', itemCount: 14 },
      { id: 'popcorn-meat', name: 'Meat Snacks & Biltong', slug: 'popcorn-meat', parentId: 'crisps-snacks', itemCount: 9 },
    ]
  },
  {
    id: 'vapes-tobacco',
    name: 'Vapes & Smoking Essentials',
    slug: 'vapes-tobacco',
    subcategories: [
      { id: 'disposable-vapes', name: 'Disposable Pods (600 Puffs)', slug: 'disposable-vapes', parentId: 'vapes-tobacco', itemCount: 42 },
      { id: 'nicotine-pouches', name: 'Nicotine Pouches & Tins', slug: 'nicotine-pouches', parentId: 'vapes-tobacco', itemCount: 16 },
      { id: 'papers-lighters', name: 'Rolling Papers, Filters & Lighters', slug: 'papers-lighters', parentId: 'vapes-tobacco', itemCount: 30 },
    ]
  },
  {
    id: 'grocery-household',
    name: 'Grocery & Retail Essentials',
    slug: 'grocery-household',
    subcategories: [
      { id: 'carrier-bags', name: 'Counter Carrier Bags & Packaging', slug: 'carrier-bags', parentId: 'grocery-household', itemCount: 8 },
      { id: 'cleaning-store', name: 'Hygiene & Paper Towels', slug: 'cleaning-store', parentId: 'grocery-household', itemCount: 11 },
    ]
  }
];

export const mockProducts: Product[] = [
  {
    id: 'prod-monster-energy-500ml',
    sku: 'MNST-500-CASE',
    name: 'Monster Energy 500ml Cans (PMP £1.69 / Plain)',
    brand: 'Monster Energy',
    category: 'drinks',
    subCategory: 'energy-drinks',
    description: 'High-caffeine energy drink crafted for sustained endurance. A dominant UK wholesale market leader with rapid shelf rotation and strong POR margins.',
    imageUrl: 'https://images.unsplash.com/photo-1622543925917-763c34d1a86e?auto=format&fit=crop&w=600&q=80',
    featured: true,
    isPromo: true,
    tierPricing: [
      { minCases: 1, pricePerCase: 13.99 },
      { minCases: 5, pricePerCase: 13.49 },
      { minCases: 15, pricePerCase: 12.95 },
      { minCases: 40, pricePerCase: 12.49 }
    ],
    variants: [
      {
        id: 'var-monster-original',
        sku: 'MNST-ORIG-24',
        name: 'Original Green (PMP £1.65)',
        flavor: 'Original Carbonated Citrus Blend',
        color: '#10B981',
        packSize: '12 x 500ml',
        unitsPerCase: 12,
        barcode: '5060166692383',
        casePrice: 13.99,
        unitPrice: 1.16,
        rrp: 1.65,
        stockLevel: 142,
        weightKg: 6.8,
        vatRate: 0.20
      },
      {
        id: 'var-monster-ultra-white',
        sku: 'MNST-ULTRA-24',
        name: 'Ultra White (Zero Sugar)',
        flavor: 'Crisp Citrus Lemon',
        color: '#E2E8F0',
        packSize: '12 x 500ml',
        unitsPerCase: 12,
        barcode: '5060166694851',
        casePrice: 13.99,
        unitPrice: 1.16,
        rrp: 1.65,
        stockLevel: 98,
        weightKg: 6.8,
        vatRate: 0.20
      },
      {
        id: 'var-monster-mango-loco',
        sku: 'MNST-MANGO-24',
        name: 'Juiced Mango Loco',
        flavor: 'Exotic Mango Tropical Juice',
        color: '#F59E0B',
        packSize: '12 x 500ml',
        unitsPerCase: 12,
        barcode: '5060166697203',
        casePrice: 14.25,
        unitPrice: 1.18,
        rrp: 1.70,
        stockLevel: 75,
        weightKg: 6.8,
        vatRate: 0.20
      },
      {
        id: 'var-monster-pipeline-punch',
        sku: 'MNST-PIPELINE-24',
        name: 'Pipeline Punch (Pink Passion)',
        flavor: 'Passion Fruit, Orange & Guava',
        color: '#EC4899',
        packSize: '12 x 500ml',
        unitsPerCase: 12,
        barcode: '5060166696411',
        casePrice: 14.25,
        unitPrice: 1.18,
        rrp: 1.70,
        stockLevel: 56,
        weightKg: 6.8,
        vatRate: 0.20
      }
    ],
    nutrition: {
      sugarContent: '11g / 100ml (Original)',
      energyKcal: '47 kcal / 100ml',
      caffeineMg: '32mg / 100ml'
    }
  },
  {
    id: 'prod-redbull-250ml',
    sku: 'RDBL-250-CASE',
    name: 'Red Bull Energy Drink 250ml Slim Cans',
    brand: 'Red Bull',
    category: 'drinks',
    subCategory: 'energy-drinks',
    description: 'Vitalizes Body and Mind. Premium European formula in fast-moving impulse format.',
    imageUrl: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=600&q=80',
    featured: true,
    tierPricing: [
      { minCases: 1, pricePerCase: 24.50 },
      { minCases: 5, pricePerCase: 23.90 },
      { minCases: 20, pricePerCase: 22.80 }
    ],
    variants: [
      {
        id: 'var-redbull-classic',
        sku: 'RDBL-REG-24',
        name: 'Regular Formula',
        flavor: 'Original Alpine',
        color: '#3B82F6',
        packSize: '24 x 250ml',
        unitsPerCase: 24,
        barcode: '9002490100070',
        casePrice: 24.50,
        unitPrice: 1.02,
        rrp: 1.55,
        stockLevel: 210,
        weightKg: 6.5,
        vatRate: 0.20
      },
      {
        id: 'var-redbull-sugarfree',
        sku: 'RDBL-SF-24',
        name: 'Sugar Free (Silver/Blue)',
        flavor: 'Light Citrus Energy',
        color: '#94A3B8',
        packSize: '24 x 250ml',
        unitsPerCase: 24,
        barcode: '9002490100087',
        casePrice: 24.50,
        unitPrice: 1.02,
        rrp: 1.55,
        stockLevel: 84,
        weightKg: 6.5,
        vatRate: 0.20
      }
    ]
  },
  {
    id: 'prod-coca-cola-330ml',
    sku: 'COKE-330-CAN',
    name: 'Coca-Cola Original Taste 330ml Cans',
    brand: 'Coca-Cola',
    category: 'drinks',
    subCategory: 'soft-drinks',
    description: 'The world favourite carbonated soft drink. High turnover rate for convenience stores, restaurants, and fast-food takeaways.',
    imageUrl: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?auto=format&fit=crop&w=600&q=80',
    featured: false,
    tierPricing: [
      { minCases: 1, pricePerCase: 10.99 },
      { minCases: 10, pricePerCase: 10.49 },
      { minCases: 50, pricePerCase: 9.89 }
    ],
    variants: [
      {
        id: 'var-coke-classic',
        sku: 'COKE-REG-24',
        name: 'Original Red Can',
        flavor: 'Classic Cola',
        color: '#DC2626',
        packSize: '24 x 330ml',
        unitsPerCase: 24,
        barcode: '5449000000996',
        casePrice: 10.99,
        unitPrice: 0.45,
        rrp: 0.90,
        stockLevel: 320,
        weightKg: 8.6,
        vatRate: 0.20
      },
      {
        id: 'var-coke-zero',
        sku: 'COKE-ZERO-24',
        name: 'Coke Zero Sugar (Black Can)',
        flavor: 'Zero Sugar Cola',
        color: '#111827',
        packSize: '24 x 330ml',
        unitsPerCase: 24,
        barcode: '5449000131805',
        casePrice: 9.99,
        unitPrice: 0.41,
        rrp: 0.85,
        stockLevel: 190,
        weightKg: 8.6,
        vatRate: 0.20
      }
    ]
  },
  {
    id: 'prod-cadbury-dairy-milk',
    sku: 'CADB-BAR-CASE',
    name: 'Cadbury Dairy Milk Chocolate Standard Bars (PMP £1.25)',
    brand: 'Cadbury',
    category: 'confectionery',
    subCategory: 'chocolate-bars',
    description: 'UK #1 Chocolate Brand. Rich creamy British milk chocolate in impulse counter display boxes.',
    imageUrl: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=600&q=80',
    featured: true,
    tierPricing: [
      { minCases: 1, pricePerCase: 18.20 },
      { minCases: 4, pricePerCase: 17.60 }
    ],
    variants: [
      {
        id: 'var-cadbury-milk',
        sku: 'CADB-DM-24',
        name: 'Dairy Milk Classic 45g',
        flavor: 'Creamy Milk Chocolate',
        color: '#6D28D9',
        packSize: '24 x 45g Box',
        unitsPerCase: 24,
        barcode: '7622210400030',
        casePrice: 18.20,
        unitPrice: 0.75,
        rrp: 1.25,
        stockLevel: 95,
        weightKg: 1.4,
        vatRate: 0.20
      },
      {
        id: 'var-cadbury-caramel',
        sku: 'CADB-CAR-24',
        name: 'Caramel Filled Bar 45g',
        flavor: 'Soft Gooey Caramel',
        color: '#F59E0B',
        packSize: '24 x 45g Box',
        unitsPerCase: 24,
        barcode: '7622210400153',
        casePrice: 18.20,
        unitPrice: 0.75,
        rrp: 1.25,
        stockLevel: 62,
        weightKg: 1.4,
        vatRate: 0.20
      }
    ]
  },
  {
    id: 'prod-walkers-crisps',
    sku: 'WLK-PMP-CASE',
    name: 'Walkers Grab Bag Crisps (PMP £1.25)',
    brand: 'Walkers',
    category: 'crisps-snacks',
    subCategory: 'price-marked-crisps',
    description: '100% Great British Potatoes, fresh cooked crunch. Ready hanging box format.',
    imageUrl: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=600&q=80',
    featured: false,
    tierPricing: [
      { minCases: 1, pricePerCase: 19.80 },
      { minCases: 6, pricePerCase: 18.90 }
    ],
    variants: [
      {
        id: 'var-walkers-cheese-onion',
        sku: 'WLK-CO-32',
        name: 'Cheese & Onion 45g',
        flavor: 'Mature Cheddar & Onion',
        color: '#10B981',
        packSize: '32 x 45g Case',
        unitsPerCase: 32,
        barcode: '5000328100124',
        casePrice: 19.80,
        unitPrice: 0.61,
        rrp: 1.25,
        stockLevel: 110,
        weightKg: 1.9,
        vatRate: 0.20
      },
      {
        id: 'var-walkers-ready-salted',
        sku: 'WLK-RS-32',
        name: 'Ready Salted 45g',
        flavor: 'Sea Salt',
        color: '#EF4444',
        packSize: '32 x 45g Case',
        unitsPerCase: 32,
        barcode: '5000328100131',
        casePrice: 19.80,
        unitPrice: 0.61,
        rrp: 1.25,
        stockLevel: 80,
        weightKg: 1.9,
        vatRate: 0.20
      }
    ]
  },
  {
    id: 'prod-lost-mary-bm600',
    sku: 'LM-BM600-CASE',
    name: 'Lost Mary BM600 Disposable Vape Pods (20mg)',
    brand: 'Lost Mary / ElfBar',
    category: 'vapes-tobacco',
    subCategory: 'disposable-vapes',
    description: 'TPD Compliant 2ml 20mg Nicotine Salt 600 Puffs. Full batch verification QR stickers on every retail unit.',
    imageUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=600&q=80',
    featured: true,
    isPromo: true,
    tierPricing: [
      { minCases: 1, pricePerCase: 27.50 },
      { minCases: 5, pricePerCase: 26.00 },
      { minCases: 20, pricePerCase: 24.50 }
    ],
    variants: [
      {
        id: 'var-lostmary-blue-razz',
        sku: 'LM-BR-10',
        name: 'Blue Razz Ice (10 Pack)',
        flavor: 'Blueberry Raspberry Menthol',
        color: '#3B82F6',
        packSize: '10 x 1 Device Display Box',
        unitsPerCase: 10,
        barcode: '6937662900018',
        casePrice: 27.50,
        unitPrice: 2.75,
        rrp: 5.99,
        stockLevel: 180,
        weightKg: 0.6,
        vatRate: 0.20
      },
      {
        id: 'var-lostmary-watermelon',
        sku: 'LM-WM-10',
        name: 'Watermelon Ice (10 Pack)',
        flavor: 'Juicy Watermelon Frost',
        color: '#F43F5E',
        packSize: '10 x 1 Device Display Box',
        unitsPerCase: 10,
        barcode: '6937662900025',
        casePrice: 27.50,
        unitPrice: 2.75,
        rrp: 5.99,
        stockLevel: 135,
        weightKg: 0.6,
        vatRate: 0.20
      }
    ]
  }
];

export const mockRetailer: RetailerProfile = {
  id: 'usr-zaam-ret-4891',
  companyName: 'Premier Express Hanley Ltd',
  tradingName: 'Premier Express - Stafford St',
  accountNumber: 'ZAAM-B2B-98421',
  vatNumber: 'GB 384 9201 55',
  contactName: 'Tariq Al-Mansoor',
  email: 'orders@premierexpress-hanley.co.uk',
  phone: '+44 7700 900142',
  tier: 'Gold Wholesale',
  creditLimit: 15000.00,
  creditUsed: 3840.50,
  paymentTerms: '30 Days Net EOM',
  deliveryAddress: {
    street: '14-16 Stafford Street',
    city: 'Stoke-on-Trent, Staffordshire',
    postcode: 'ST1 1JW',
    country: 'United Kingdom'
  },
  assignedRep: {
    name: 'Hamza Malik',
    phone: '+44 7911 123456',
    email: 'h.malik@zaamgroup.co.uk',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'
  }
};

export const mockOrders: Order[] = [
  {
    id: 'ord-90214',
    orderNumber: 'ZM-2026-90214',
    date: '14 Aug 2026',
    status: 'Dispatched',
    paymentMethod: 'Bank Transfer (Open Banking)',
    gatewayUsed: 'TrueLayer Open Banking API',
    deliveryMethod: 'Next Working Day Pallet Freight',
    trackingNumber: 'DX-FR-889021',
    itemCount: 42,
    totalWeightKg: 285.6,
    subtotal: 785.40,
    vatAmount: 157.08,
    total: 942.48,
    items: [
      { sku: 'MNST-ORIG-24', name: 'Monster Energy 500ml', variantName: 'Original Green (12x500ml)', quantity: 20, pricePerCase: 12.95, total: 259.00 },
      { sku: 'RDBL-REG-24', name: 'Red Bull Energy 250ml', variantName: 'Regular Formula (24x250ml)', quantity: 15, pricePerCase: 23.90, total: 358.50 },
      { sku: 'LM-BR-10', name: 'Lost Mary BM600 Pods', variantName: 'Blue Razz Ice (10 Pack)', quantity: 7, pricePerCase: 24.00, total: 167.90 }
    ]
  },
  {
    id: 'ord-89842',
    orderNumber: 'ZM-2026-89842',
    date: '08 Aug 2026',
    status: 'Delivered',
    paymentMethod: 'Credit Card',
    gatewayUsed: 'Primary: Stripe UK Terminal (Verified)',
    deliveryMethod: 'Standard 48H Courier Dispatch',
    trackingNumber: 'RM-TR-499120',
    itemCount: 18,
    totalWeightKg: 94.2,
    subtotal: 312.50,
    vatAmount: 62.50,
    total: 375.00,
    items: [
      { sku: 'COKE-REG-24', name: 'Coca-Cola Original', variantName: 'Red Cans 330ml (24pk)', quantity: 12, pricePerCase: 10.49, total: 125.88 },
      { sku: 'CADB-DM-24', name: 'Cadbury Dairy Milk', variantName: 'Dairy Milk Classic 45g', quantity: 6, pricePerCase: 17.60, total: 105.60 }
    ]
  },
  {
    id: 'ord-89210',
    orderNumber: 'ZM-2026-89210',
    date: '01 Aug 2026',
    status: 'Delivered',
    paymentMethod: 'Trade Credit (Wallet)',
    deliveryMethod: 'Click & Collect (Zaam Hub Stoke)',
    itemCount: 65,
    totalWeightKg: 420.0,
    subtotal: 1450.00,
    vatAmount: 290.00,
    total: 1740.00,
    items: [
      { sku: 'MNST-ULTRA-24', name: 'Monster Ultra White', variantName: 'Zero Sugar (12pk)', quantity: 30, pricePerCase: 12.95, total: 388.50 },
      { sku: 'WLK-CO-32', name: 'Walkers Cheese & Onion', variantName: 'PMP £1.25 (32pk)', quantity: 35, pricePerCase: 18.90, total: 661.50 }
    ]
  }
];

export const mockNotifications: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'Flash Promo: Monster Energy Tier Discounts',
    message: 'Order 15+ cases of Monster Energy to lock in £12.95/case until Friday midnight.',
    type: 'promo',
    date: '10 mins ago',
    read: false,
    actionUrl: '/shop?cat=drinks'
  },
  {
    id: 'notif-2',
    title: 'Shipment Dispatched: Pallet ZM-2026-90214',
    message: 'Your 42-case order has left Zaam Central Hub. Estimated delivery tomorrow 09:30 AM.',
    type: 'delivery',
    date: '2 hours ago',
    read: false
  },
  {
    id: 'notif-3',
    title: 'Trade Credit Statement Generated',
    message: 'July statement is now ready. Remaining available credit: £11,159.50.',
    type: 'credit',
    date: '1 day ago',
    read: true,
    actionUrl: '/wallet'
  }
];

export const mockUKBanks: Bank[] = [
  { id: 'barclays', name: 'Barclays Bank UK', logo: '🏛️', popular: true },
  { id: 'monzo', name: 'Monzo Bank Business', logo: '💳', popular: true },
  { id: 'hsbc', name: 'HSBC UK Commercial', logo: '🏦', popular: true },
  { id: 'lloyds', name: 'Lloyds Bank Commercial', logo: '🐎', popular: true },
  { id: 'natwest', name: 'NatWest Business Banking', logo: '🔺', popular: true },
  { id: 'santander', name: 'Santander UK', logo: '🔥', popular: true },
  { id: 'revolut', name: 'Revolut Business', logo: '⚡', popular: true },
  { id: 'aib', name: 'AIB (Allied Irish Bank UK)', logo: '☘️', popular: false },
  { id: 'nationwide', name: 'Nationwide Building Society', logo: '🏠', popular: false },
  { id: 'starling', name: 'Starling Bank Business', logo: '⭐', popular: false },
  { id: 'tsb', name: 'TSB Bank', logo: '🔵', popular: false },
  { id: 'rbs', name: 'Royal Bank of Scotland (RBS)', logo: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', popular: false }
];
