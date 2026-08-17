'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Product, ProductVariant } from '@/types';

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, variant: ProductVariant, quantity?: number) => void;
  removeFromCart: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  getItemQuantity: (variantId: string) => number;
  clearCart: () => void;
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

  const addToCart = (product: Product, variant: ProductVariant, quantity: number = 1) => {
    setCart(prev => {
      const existingIndex = prev.findIndex(item => item.variant.id === variant.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        const newQty = updated[existingIndex].quantity + quantity;
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: newQty
        };
        return updated;
      } else {
        return [...prev, { product, variant, quantity }];
      }
    });
  };

  const removeFromCart = (variantId: string) => {
    setCart(prev => prev.filter(item => item.variant.id !== variantId));
  };

  const updateQuantity = (variantId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(variantId);
      return;
    }
    setCart(prev =>
      prev.map(item =>
        item.variant.id === variantId ? { ...item, quantity } : item
      )
    );
  };

  const getItemQuantity = (variantId: string): number => {
    const item = cart.find(i => i.variant.id === variantId);
    return item ? item.quantity : 0;
  };

  const clearCart = () => {
    setCart([]);
  };

  // Calculations
  const totalCases = cart.reduce((acc, item) => acc + item.quantity, 0);
  const totalUnits = cart.reduce((acc, item) => acc + (item.quantity * item.variant.unitsPerCase), 0);
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
