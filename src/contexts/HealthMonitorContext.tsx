import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { SiteHealth, HealthStatus } from '@/types/monitoring';
import { supabase } from '@/integrations/supabase/client';

interface HealthMonitorContextType {
  siteHealths: SiteHealth[];
  overallHealth: 'healthy' | 'degraded' | 'critical';
  isMonitoring: boolean;
  lastUpdate: string | null;
  refreshHealth: (siteId?: string) => Promise<void>;
  startMonitoring: () => void;
  stopMonitoring: () => void;
  getHealthForSite: (siteId: string) => SiteHealth | undefined;
}

const HealthMonitorContext = createContext<HealthMonitorContextType | undefined>(undefined);

// Generate health status from site data
const generateHealthStatus = (site: any): HealthStatus => {
  const status = site.health_status === 'healthy' ? 'healthy' : 
                 site.health_status === 'degraded' ? 'degraded' : 'down';
  
  return {
    status,
    uptime: site.uptime_percentage || 99.9,
    responseTime: site.response_time_ms || 150,
    lastCheck: new Date().toISOString(),
    sslValid: site.ssl_status === 'valid',
    sslExpiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
  };
};

export function HealthMonitorProvider({ children }: { children: ReactNode }) {
  const [siteHealths, setSiteHealths] = useState<SiteHealth[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<string | null>(new Date().toISOString());

  const overallHealth = siteHealths.some(h => h.health.status === 'down') 
    ? 'critical' 
    : siteHealths.some(h => h.health.status === 'degraded') 
      ? 'degraded' 
      : 'healthy';

  const fetchSiteHealths = useCallback(async () => {
    const { data: sites } = await supabase.from('sites').select('*');
    if (sites) {
      const healths: SiteHealth[] = sites.map(site => ({
        siteId: site.id,
        siteName: site.name,
        domain: site.domain,
        health: generateHealthStatus(site),
        alerts: [],
      }));
      setSiteHealths(healths);
      setLastUpdate(new Date().toISOString());
    }
  }, []);

  const refreshHealth = useCallback(async (siteId?: string) => {
    await fetchSiteHealths();
  }, [fetchSiteHealths]);

  const startMonitoring = useCallback(() => setIsMonitoring(true), []);
  const stopMonitoring = useCallback(() => setIsMonitoring(false), []);

  const getHealthForSite = useCallback((siteId: string) => {
    return siteHealths.find(h => h.siteId === siteId);
  }, [siteHealths]);

  // Initial fetch
  useEffect(() => {
    fetchSiteHealths();
  }, [fetchSiteHealths]);

  // Auto-refresh every 30 seconds when monitoring
  useEffect(() => {
    if (!isMonitoring) return;
    const interval = setInterval(fetchSiteHealths, 30000);
    return () => clearInterval(interval);
  }, [isMonitoring, fetchSiteHealths]);

  return (
    <HealthMonitorContext.Provider
      value={{
        siteHealths,
        overallHealth,
        isMonitoring,
        lastUpdate,
        refreshHealth,
        startMonitoring,
        stopMonitoring,
        getHealthForSite,
      }}
    >
      {children}
    </HealthMonitorContext.Provider>
  );
}

export function useHealthMonitor() {
  const context = useContext(HealthMonitorContext);
  if (context === undefined) {
    throw new Error('useHealthMonitor must be used within a HealthMonitorProvider');
  }
  return context;
}
