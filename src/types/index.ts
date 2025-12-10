export type Environment = 'production' | 'staging' | 'development';

export type SiteStatus = 'active' | 'warning' | 'inactive';

export type UserRole = 'owner' | 'admin' | 'editor';

// Cart item for domain checkout
export interface CartItem {
  id: string;
  domain: string;
  tld: string;
  baseDomain: string;
  price: number;
  isPremium: boolean;
  addedAt: string;
}

// Linked app with color coding
export interface LinkedApp {
  siteId: string;
  siteName: string;
  domain: string;
  color: string;
  linkedAt: string;
}

// Integration with multi-app support
export interface Integration {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'Payments' | 'Social' | 'Analytics' | 'Email' | 'Development' | 'Communication' | 'Storage' | 'Auth';
  status: 'active' | 'imported' | 'pending' | 'error';
  linkedApps: LinkedApp[];
  configuredAt?: string;
  lastSync?: string;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  baseUrl: string;
  adminUrl: string;
  environment: Environment;
  apiKeys: {
    public: string;
    private?: string;
  };
  permissions: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Dashboard {
  id: string;
  name: string;
  route: string;
  icon: string;
}

export interface HealthCheck {
  lastCheck: string;
  status: SiteStatus;
  responseTime: number;
  uptime: number;
}

export interface DemoMode {
  isDemo: boolean;
  isLive: boolean;
  activatedAt?: string;
  goLiveAt?: string;
}

export interface Site {
  id: string;
  tenantId: string;
  name: string;
  url: string;
  status: SiteStatus;
  dashboards: Dashboard[];
  healthCheck: HealthCheck;
  lastSync: string;
  metrics: {
    traffic: number;
    trafficChange: number;
    orders: number;
    ordersChange: number;
  };
  sparklineData: number[];
  // New fields for domain and integrations
  domain?: string;
  domainStatus?: 'pending' | 'purchased' | 'active';
  requiredIntegrations?: string[];
  appColor?: string;
  // Demo mode fields
  demoMode?: DemoMode;
  integrationCount?: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: UserRole;
  tenantAssignments: string[];
  lastActive: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  tenantId: string;
  tenantName: string;
  details: string;
  timestamp: string;
  ipAddress: string;
}

export interface KPI {
  label: string;
  value: string | number;
  change: number;
  trend: 'up' | 'down' | 'neutral';
  icon: string;
}
