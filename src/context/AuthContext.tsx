'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { Branch, RetailerProfile } from '@/types';
import { clearB2bTokens, getB2bAccessToken, zaamApi } from '@/lib/api';

interface AuthContextType {
  retailer: RetailerProfile | null;
  isAuthenticated: boolean;
  isReady: boolean;
  updateCreditUsed: (amountChange: number) => void;
  availableCredit: number;
  branches: Branch[];
  selectedBranch: Branch | null;
  selectedBranchId: string | null;
  setSelectedBranchId: (id: string) => void;
  refreshBranches: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const BRANCH_KEY = 'zaam_b2b_branch';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [retailer, setRetailer] = useState<RetailerProfile | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranchId, setSelectedBranchIdState] = useState<string | null>(null);

  const refreshBranches = useCallback(async () => {
    const rows = (await zaamApi.getBranches()).filter((b) => b.addressType !== 'billing');
    setBranches(rows);
    setSelectedBranchIdState((current) => {
      const stored = current ?? localStorage.getItem(BRANCH_KEY);
      if (stored && rows.some((b) => b.id === stored)) return stored;
      return rows.find((b) => b.isDefault)?.id ?? rows[0]?.id ?? null;
    });
  }, []);

  const setSelectedBranchId = (id: string) => {
    setSelectedBranchIdState(id);
    localStorage.setItem(BRANCH_KEY, id);
  };

  const refreshProfile = useCallback(async () => {
    const profile = await zaamApi.getMe();
    setRetailer(profile);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        if (getB2bAccessToken()) {
          await refreshProfile();
          await refreshBranches().catch(() => setBranches([]));
        }
      } catch {
        clearB2bTokens();
        setRetailer(null);
      } finally {
        setIsReady(true);
      }
    })();
  }, [refreshProfile, refreshBranches]);

  const login = async (email: string, password: string) => {
    const result = await zaamApi.login(email, password);
    setRetailer(result.retailer);
    await refreshBranches().catch(() => setBranches([]));
  };

  const logout = () => {
    clearB2bTokens();
    localStorage.removeItem(BRANCH_KEY);
    setRetailer(null);
    setBranches([]);
    setSelectedBranchIdState(null);
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
  const selectedBranch = branches.find((b) => b.id === selectedBranchId) ?? null;

  return (
    <AuthContext.Provider
      value={{
        retailer,
        isAuthenticated: Boolean(retailer),
        isReady,
        updateCreditUsed,
        availableCredit,
        branches,
        selectedBranch,
        selectedBranchId,
        setSelectedBranchId,
        refreshBranches,
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
