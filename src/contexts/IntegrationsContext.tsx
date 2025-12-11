import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Integration, LinkedApp } from '@/types';
import { CONTROL_CENTER_INTEGRATIONS } from '@/types/credentials';

// App color palette
export const APP_COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#8B5CF6', // Purple
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#EC4899', // Pink
  '#14B8A6', // Teal
  '#F97316', // Orange
  '#6366F1', // Indigo
  '#84CC16', // Lime
];

// Control Center app identifier
const CONTROL_CENTER_APP: LinkedApp = {
  siteId: 'control-center',
  siteName: 'Control Center',
  domain: 'control-center.lovable.app',
  color: '#06B6D4', // Cyan for Control Center
  linkedAt: new Date().toISOString(),
};

// Default integrations catalog - expanded with all Control Center requirements
const DEFAULT_INTEGRATIONS: Integration[] = [
  // ============= DOMAIN =============
  { id: 'namecheap', name: 'Namecheap', description: 'Domain registration and DNS management', icon: '🌐', category: 'Domain', status: 'pending', linkedApps: [] },
  
  // ============= DATABASE & AUTH =============
  { id: 'supabase', name: 'Supabase', description: 'Database, Authentication, Realtime & Storage (Auth0 not needed)', icon: '⚡', category: 'Database', status: 'pending', linkedApps: [] },
  
  // ============= HOSTING =============
  { id: 'lovable-cloud', name: 'Lovable Cloud', description: 'App hosting and deployment platform', icon: '💜', category: 'Hosting', status: 'pending', linkedApps: [] },
  
  // ============= INFRASTRUCTURE =============
  { id: 'letsencrypt', name: "Let's Encrypt", description: 'Free SSL/TLS certificate provisioning', icon: '🔒', category: 'Infrastructure', status: 'pending', linkedApps: [] },
  
  // ============= PAYMENTS =============
  { id: 'stripe', name: 'Stripe', description: 'Payment processing and subscription management', icon: '💳', category: 'Payments', status: 'pending', linkedApps: [] },
  { id: 'paypal', name: 'PayPal', description: 'Online payment processing', icon: '💰', category: 'Payments', status: 'pending', linkedApps: [] },
  
  // ============= EMAIL =============
  { id: 'sendgrid', name: 'SendGrid', description: 'Transactional and marketing emails', icon: '✉️', category: 'Email', status: 'pending', linkedApps: [] },
  { id: 'gmail-api', name: 'Gmail API', description: 'Google email sync via OAuth 2.0', icon: '📧', category: 'Email', status: 'pending', linkedApps: [] },
  { id: 'microsoft-graph', name: 'Microsoft Graph', description: 'Outlook email sync via OAuth 2.0', icon: '📬', category: 'Email', status: 'pending', linkedApps: [] },
  { id: 'mailchimp', name: 'Mailchimp', description: 'Email marketing automation', icon: '🐵', category: 'Email', status: 'pending', linkedApps: [] },
  
  // ============= ANALYTICS =============
  { id: 'google-analytics', name: 'Google Analytics', description: 'Website traffic and user behavior', icon: '📊', category: 'Analytics', status: 'pending', linkedApps: [] },
  { id: 'mixpanel', name: 'Mixpanel', description: 'Product analytics and insights', icon: '📈', category: 'Analytics', status: 'pending', linkedApps: [] },
  
  // ============= AUTH (handled by Supabase) =============
  // Auth0 removed - using Supabase Auth instead for cost savings

  // ============= STORAGE =============
  { id: 'aws-s3', name: 'AWS S3', description: 'Cloud file storage', icon: '☁️', category: 'Storage', status: 'pending', linkedApps: [] },
  { id: 'cloudinary', name: 'Cloudinary', description: 'Image and video management', icon: '🖼️', category: 'Storage', status: 'pending', linkedApps: [] },
  
  // ============= DEVELOPMENT =============
  { id: 'github', name: 'GitHub', description: 'Version control and deployments', icon: '🐙', category: 'Development', status: 'pending', linkedApps: [] },
  { id: 'vercel', name: 'Vercel', description: 'Frontend deployment and hosting', icon: '▲', category: 'Development', status: 'pending', linkedApps: [] },
  
  // ============= COMMUNICATION =============
  { id: 'slack', name: 'Slack', description: 'Team notifications and alerts', icon: '💬', category: 'Communication', status: 'pending', linkedApps: [] },
  { id: 'discord', name: 'Discord', description: 'Community messaging and voice', icon: '🎮', category: 'Communication', status: 'pending', linkedApps: [] },
  
  // ============= SOCIAL =============
  { id: 'instagram', name: 'Instagram', description: 'Social media management and posting', icon: '📸', category: 'Social', status: 'pending', linkedApps: [] },
  { id: 'facebook', name: 'Facebook', description: 'Social media and advertising', icon: '👥', category: 'Social', status: 'pending', linkedApps: [] },
  { id: 'tiktok', name: 'TikTok', description: 'Short-form video platform', icon: '🎵', category: 'Social', status: 'pending', linkedApps: [] },
  { id: 'twitter', name: 'X (Twitter)', description: 'Social networking and microblogging', icon: '𝕏', category: 'Social', status: 'pending', linkedApps: [] },
  { id: 'youtube', name: 'YouTube', description: 'Video hosting and streaming', icon: '▶️', category: 'Social', status: 'pending', linkedApps: [] },
  { id: 'linkedin', name: 'LinkedIn', description: 'Professional networking', icon: '💼', category: 'Social', status: 'pending', linkedApps: [] },
];

interface IntegrationsContextType {
  integrations: Integration[];
  usedColors: string[];
  addIntegrationForApp: (integrationId: string, app: LinkedApp) => void;
  removeIntegrationFromApp: (integrationId: string, siteId: string) => void;
  getIntegrationsForApp: (siteId: string) => Integration[];
  getAppsForIntegration: (integrationId: string) => LinkedApp[];
  importIntegrationsForApp: (integrationIds: string[], app: LinkedApp) => void;
  getNextAppColor: () => string;
  activateIntegration: (integrationId: string) => void;
  isControlCenterInitialized: boolean;
}

const IntegrationsContext = createContext<IntegrationsContextType | undefined>(undefined);

export function IntegrationsProvider({ children }: { children: ReactNode }) {
  const [integrations, setIntegrations] = useState<Integration[]>(DEFAULT_INTEGRATIONS);
  const [usedColors, setUsedColors] = useState<string[]>([]);
  const [isControlCenterInitialized, setIsControlCenterInitialized] = useState(false);

  // Auto-import Control Center integrations on first load
  useEffect(() => {
    if (!isControlCenterInitialized) {
      setIntegrations(prev => prev.map(integration => {
        if (CONTROL_CENTER_INTEGRATIONS.includes(integration.id)) {
          const alreadyLinked = integration.linkedApps.some(a => a.siteId === CONTROL_CENTER_APP.siteId);
          if (alreadyLinked) return integration;
          return {
            ...integration,
            status: 'imported' as const,
            linkedApps: [...integration.linkedApps, CONTROL_CENTER_APP],
          };
        }
        return integration;
      }));
      setIsControlCenterInitialized(true);
    }
  }, [isControlCenterInitialized]);

  const getNextAppColor = (): string => {
    const availableColors = APP_COLORS.filter(c => !usedColors.includes(c));
    const color = availableColors.length > 0 ? availableColors[0] : APP_COLORS[usedColors.length % APP_COLORS.length];
    setUsedColors(prev => [...prev, color]);
    return color;
  };

  const addIntegrationForApp = (integrationId: string, app: LinkedApp) => {
    setIntegrations(prev => prev.map(integration => {
      if (integration.id === integrationId) {
        const exists = integration.linkedApps.some(a => a.siteId === app.siteId);
        if (exists) return integration;
        return {
          ...integration,
          status: 'imported' as const,
          linkedApps: [...integration.linkedApps, app],
        };
      }
      return integration;
    }));
  };

  const removeIntegrationFromApp = (integrationId: string, siteId: string) => {
    setIntegrations(prev => prev.map(integration => {
      if (integration.id === integrationId) {
        const newLinkedApps = integration.linkedApps.filter(a => a.siteId !== siteId);
        return {
          ...integration,
          status: newLinkedApps.length > 0 ? 'imported' as const : 'pending' as const,
          linkedApps: newLinkedApps,
        };
      }
      return integration;
    }));
  };

  const getIntegrationsForApp = (siteId: string): Integration[] => {
    return integrations.filter(i => i.linkedApps.some(a => a.siteId === siteId));
  };

  const getAppsForIntegration = (integrationId: string): LinkedApp[] => {
    const integration = integrations.find(i => i.id === integrationId);
    return integration?.linkedApps || [];
  };

  const importIntegrationsForApp = (integrationIds: string[], app: LinkedApp) => {
    setIntegrations(prev => prev.map(integration => {
      if (integrationIds.includes(integration.id)) {
        const exists = integration.linkedApps.some(a => a.siteId === app.siteId);
        if (exists) return integration;
        return {
          ...integration,
          status: 'imported' as const,
          linkedApps: [...integration.linkedApps, app],
        };
      }
      return integration;
    }));
  };

  const activateIntegration = (integrationId: string) => {
    setIntegrations(prev => prev.map(integration => {
      if (integration.id === integrationId) {
        return {
          ...integration,
          status: 'active' as const,
        };
      }
      return integration;
    }));
  };

  return (
    <IntegrationsContext.Provider value={{
      integrations,
      usedColors,
      addIntegrationForApp,
      removeIntegrationFromApp,
      getIntegrationsForApp,
      getAppsForIntegration,
      importIntegrationsForApp,
      getNextAppColor,
      activateIntegration,
      isControlCenterInitialized,
    }}>
      {children}
    </IntegrationsContext.Provider>
  );
}

export function useIntegrations() {
  const context = useContext(IntegrationsContext);
  if (!context) {
    throw new Error('useIntegrations must be used within an IntegrationsProvider');
  }
  return context;
}
