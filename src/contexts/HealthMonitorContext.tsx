import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { SiteHealth, HealthStatus } from '@/types/monitoring';
import { sites } from '@/data/seed-data';

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

// Generate mock health data
const generateHealthStatus = (): HealthStatus => {
  const random = Math.random();
  const status: HealthStatus['status'] = random > 0.9 ? 'down' : random > 0.8 ? 'degraded' : 'healthy';
  
  return {
    status,
    uptime: status === 'down' ? 0 : 95 + Math.random() * 5,
    responseTime: status === 'down' ? 0 : 50 + Math.random() * 200,
    lastCheck: new Date().toISOString(),
    sslValid: Math.random() > 0.1,
    sslExpiresAt: new Date(Date.now() + Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
  };
};

const generateInitialHealths = (): SiteHealth[] => {
  return sites.map(site => ({
    siteId: site.id,
    siteName: site.name,
    domain: site.domain,
    health: generateHealthStatus(),
    alerts: [],
  }));
};

export function HealthMonitorProvider({ children }: { children: ReactNode }) {
  const [siteHealths, setSiteHealths] = useState<SiteHealth[]>(generateInitialHealths);
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<string | null>(new Date().toISOString());

  const overallHealth = siteHealths.some(h => h.health.status === 'down') 
    ? 'critical' 
    : siteHealths.some(h => h.health.status === 'degraded') 
      ? 'degraded' 
      : 'healthy';

  const refreshHealth = useCallback(async (siteId?: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (siteId) {
      setSiteHealths(prev => prev.map(h => 
        h.siteId === siteId 
          ? { ...h, health: generateHealthStatus() }
          : h
      ));
    } else {
      setSiteHealths(prev => prev.map(h => ({
        ...h,
        health: generateHealthStatus(),
      })));
    }
    setLastUpdate(new Date().toISOString());
  }, []);

  const startMonitoring = useCallback(() => {
    setIsMonitoring(true);
  }, []);

  const stopMonitoring = useCallback(() => {
    setIsMonitoring(false);
  }, []);

  const getHealthForSite = useCallback((siteId: string) => {
    return siteHealths.find(h => h.siteId === siteId);
  }, [siteHealths]);

  // Auto-refresh every 30 seconds when monitoring
  useEffect(() => {
    if (!isMonitoring) return;

    const interval = setInterval(() => {
      refreshHealth();
    }, 30000);

    return () => clearInterval(interval);
  }, [isMonitoring, refreshHealth]);

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
