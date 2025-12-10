import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Tenant } from '@/types';
import { tenants } from '@/data/seed-data';

interface TenantContextType {
  currentTenant: Tenant | null;
  allTenants: Tenant[];
  setCurrentTenant: (tenant: Tenant | null) => void;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function TenantProvider({ children }: { children: ReactNode }) {
  const [currentTenant, setCurrentTenant] = useState<Tenant | null>(null);

  return (
    <TenantContext.Provider
      value={{
        currentTenant,
        allTenants: tenants,
        setCurrentTenant,
      }}
    >
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
}
