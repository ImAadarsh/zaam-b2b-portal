'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { CartItem, Product, ProductVariant } from '@/types';
import { getB2bAccessToken, zaamApi } from '@/lib/api';
import { getMaxOrderQty } from '@/lib/product';

/** Outcome of a cart change: the quantity now in the basket and whether stock limited it. */
export interface CartChangeResult {
  quantity: number;
  capped: boolean;
  max: number;
}

export interface CartStockIssue {
  item: CartItem;
  max: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, variant: ProductVariant, quantity?: number) => CartChangeResult;
  removeFromCart: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => CartChangeResult;
  getItemQuantity: (variantId: string) => number;
  clearCart: () => void;
  /** Lines asking for more than current stock (stock may have dropped since they were added). */
  stockIssues: CartStockIssue[];
  /** Caps every line to current stock and drops out-of-stock lines. */
  fixStockIssues: () => void;
  refreshStock: () => Promise<void>;
  totalCases: number;
  totalUnits: number;
  totalWeightKg: number;
  subtotal: number;
  vatAmount: number;
  totalAmount: number;
  isCartDrawerOpen: boolean;
  setIsCartDrawerOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load cart from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('zaam_b2b_cart');
      if (stored) {
        setCart(JSON.parse(stored));
      }
    } catch (e) {
      console.warn('Failed to load cart from localStorage', e);
    }
    setIsLoaded(true);
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem('zaam_b2b_cart', JSON.stringify(cart));
    } catch (e) {
      console.warn('Failed to save cart to localStorage', e);
    }
  }, [cart, isLoaded]);

  /** Re-reads stock (and unit info) for basket lines; the stored snapshot can be days old. */
  const refreshStock = useCallback(async () => {
    if (!getB2bAccessToken()) return;
    try {
      const products = await zaamApi.getProducts();
      const fresh = new Map<string, ProductVariant>();
      for (const p of products) for (const v of p.variants) fresh.set(v.id, v);
      setCart(prev =>
        prev.map(item => {
          const v = fresh.get(item.variant.id);
          return {
            ...item,
            variant: v
              ? { ...item.variant, stockLevel: v.stockLevel, saleUnit: v.saleUnit, unitsPerCase: v.unitsPerCase, packSize: v.packSize }
              : { ...item.variant, stockLevel: 0 }
          };
        })
      );
    } catch (e) {
      console.warn('Failed to refresh basket stock', e);
    }
  }, []);

  const hasItems = cart.length > 0;
  useEffect(() => {
    if (isLoaded && hasItems) void refreshStock();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, isCartDrawerOpen]);

  // Calculate dynamic volume tier price for a product based on total cases ordered for that product
  const getProductUnitPrice = (product: Product, variant: ProductVariant, quantity: number): number => {
    let effectivePrice = variant.casePrice;
    if (product.tierPricing && product.tierPricing.length > 0) {
      const sortedTiers = [...product.tierPricing].sort((a, b) => b.minCases - a.minCases);
      const matchedTier = sortedTiers.find(t => quantity >= t.minCases);
      if (matchedTier) {
        effectivePrice = matchedTier.pricePerCase;
      }
    }
    return effectivePrice;
  };

  const addToCart = (product: Product, variant: ProductVariant, quantity: number = 1): CartChangeResult => {
    const max = getMaxOrderQty(variant);
    const existing = cart.find(item => item.variant.id === variant.id)?.quantity ?? 0;
    const wanted = existing + Math.max(0, Math.floor(quantity));
    const next = Math.min(wanted, max);
    if (next <= 0) return { quantity: 0, capped: wanted > max, max };
    setCart(prev => {
      const existingIndex = prev.findIndex(item => item.variant.id === variant.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = { ...updated[existingIndex], variant, quantity: next };
        return updated;
      }
      return [...prev, { product, variant, quantity: next }];
    });
    return { quantity: next, capped: wanted > max, max };
  };

  const removeFromCart = (variantId: string) => {
    setCart(prev => prev.filter(item => item.variant.id !== variantId));
  };

  const updateQuantity = (variantId: string, quantity: number): CartChangeResult => {
    const item = cart.find(i => i.variant.id === variantId);
    const max = item ? getMaxOrderQty(item.variant) : 0;
    if (quantity <= 0 || !item) {
      removeFromCart(variantId);
      return { quantity: 0, capped: false, max };
    }
    // Lowering an over-stock line is always allowed; raising stops at stock.
    const next = quantity > item.quantity ? Math.min(quantity, Math.max(max, 0)) : quantity;
    if (next <= 0) {
      removeFromCart(variantId);
      return { quantity: 0, capped: true, max };
    }
    if (next !== item.quantity) {
      setCart(prev => prev.map(i => (i.variant.id === variantId ? { ...i, quantity: next } : i)));
    }
    return { quantity: next, capped: next < quantity, max };
  };

  const getItemQuantity = (variantId: string): number => {
    const item = cart.find(i => i.variant.id === variantId);
    return item ? item.quantity : 0;
  };

  const clearCart = () => {
    setCart([]);
  };

  const stockIssues: CartStockIssue[] = cart
    .map(item => ({ item, max: getMaxOrderQty(item.variant) }))
    .filter(({ item, max }) => item.quantity > max);

  const fixStockIssues = () => {
    setCart(prev =>
      prev
        .map(item => ({ ...item, quantity: Math.min(item.quantity, getMaxOrderQty(item.variant)) }))
        .filter(item => item.quantity > 0)
    );
  };

  // Calculations
  const totalCases = cart.reduce((acc, item) => acc + item.quantity, 0);
  const totalUnits = cart.reduce((acc, item) => acc + (item.quantity * (Number(item.variant.unitsPerCase) > 0 ? Number(item.variant.unitsPerCase) : 1)), 0);
  const totalWeightKg = Number(cart.reduce((acc, item) => acc + (item.quantity * item.variant.weightKg), 0).toFixed(2));
  
  const subtotal = Number(cart.reduce((acc, item) => {
    const pricePerCase = getProductUnitPrice(item.product, item.variant, item.quantity);
    return acc + (pricePerCase * item.quantity);
  }, 0).toFixed(2));

  const vatAmount = Number((subtotal * 0.20).toFixed(2)); // standard UK 20% VAT
  const totalAmount = Number((subtotal + vatAmount).toFixed(2));

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        getItemQuantity,
        clearCart,
        stockIssues,
        fixStockIssues,
        refreshStock,
        totalCases,
        totalUnits,
        totalWeightKg,
        subtotal,
        vatAmount,
        totalAmount,
        isCartDrawerOpen,
        setIsCartDrawerOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
