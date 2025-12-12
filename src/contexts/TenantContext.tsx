import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

interface Tenant {
  id: string;
  name: string;
  slug: string;
  environment: string;
  base_url: string | null;
  admin_url: string | null;
  ssl_enabled: boolean | null;
  backups_enabled: boolean | null;
  custom_domain: boolean | null;
  created_at: string;
  updated_at: string;
}

interface TenantContextType {
  currentTenant: Tenant | null;
  allTenants: Tenant[];
  isLoading: boolean;
  setCurrentTenant: (tenant: Tenant | null) => void;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function TenantProvider({ children }: { children: ReactNode }) {
  const [currentTenant, setCurrentTenant] = useState<Tenant | null>(null);

  const { data: allTenants = [], isLoading } = useQuery({
    queryKey: ['tenants'],
    queryFn: async () => {
      const { data, error } = await supabase.from('tenants').select('*').order('name');
      if (error) throw error;
      return data as Tenant[];
    },
  });

  // Auto-select first tenant if none selected
  useEffect(() => {
    if (!currentTenant && allTenants.length > 0) {
      setCurrentTenant(allTenants[0]);
    }
  }, [allTenants, currentTenant]);

  return (
    <TenantContext.Provider
      value={{
        currentTenant,
        allTenants,
        isLoading,
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
