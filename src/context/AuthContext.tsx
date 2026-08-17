'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { RetailerProfile } from '@/types';
import { clearB2bTokens, getB2bAccessToken, zaamApi } from '@/lib/api';

interface AuthContextType {
  retailer: RetailerProfile | null;
  isAuthenticated: boolean;
  isReady: boolean;
  updateCreditUsed: (amountChange: number) => void;
  availableCredit: number;
  selectedBranch: string;
  setSelectedBranch: (branch: string) => void;
  branches: string[];
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [retailer, setRetailer] = useState<RetailerProfile | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<string>('Primary delivery address');

  const refreshProfile = useCallback(async () => {
    const profile = await zaamApi.getMe();
    setRetailer(profile);
    if (profile.deliveryAddress?.street) {
      setSelectedBranch(`${profile.deliveryAddress.street}, ${profile.deliveryAddress.city}`);
    }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        if (getB2bAccessToken()) {
          await refreshProfile();
        }
      } catch {
        clearB2bTokens();
        setRetailer(null);
      } finally {
        setIsReady(true);
      }
    })();
  }, [refreshProfile]);

  const login = async (email: string, password: string) => {
    const result = await zaamApi.login(email, password);
    setRetailer(result.retailer);
    if (result.retailer.deliveryAddress?.street) {
      setSelectedBranch(`${result.retailer.deliveryAddress.street}, ${result.retailer.deliveryAddress.city}`);
    }
  };

  const logout = () => {
    clearB2bTokens();
    setRetailer(null);
  };

  const updateCreditUsed = (amountChange: number) => {
    setRetailer((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        creditUsed: Math.min(prev.creditLimit, Math.max(0, prev.creditUsed + amountChange))
      };
    });
  };

  const availableCredit = retailer ? Number((retailer.creditLimit - retailer.creditUsed).toFixed(2)) : 0;
  const branches = retailer?.deliveryAddress?.street
    ? [`${retailer.deliveryAddress.street}, ${retailer.deliveryAddress.city}`.trim()]
    : [selectedBranch];

  return (
    <AuthContext.Provider
      value={{
        retailer,
        isAuthenticated: Boolean(retailer),
        isReady,
        updateCreditUsed,
        availableCredit,
        selectedBranch,
        setSelectedBranch,
        branches,
        login,
        logout,
        refreshProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
