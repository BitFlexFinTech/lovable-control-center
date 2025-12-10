export type Environment = 'production' | 'staging' | 'development';

export type SiteStatus = 'active' | 'warning' | 'inactive';

export type UserRole = 'owner' | 'admin' | 'editor';

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
