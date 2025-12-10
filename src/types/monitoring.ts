// Health Monitoring Types
export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'down';
  uptime: number;
  responseTime: number;
  lastCheck: string;
  sslValid: boolean;
  sslExpiresAt?: string;
}

export interface SiteHealth {
  siteId: string;
  siteName: string;
  domain: string;
  health: HealthStatus;
  alerts: Alert[];
}

export interface Alert {
  id: string;
  type: 'downtime' | 'ssl_expiring' | 'high_latency' | 'security' | 'billing' | 'system';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  siteId?: string;
  actionUrl?: string;
  actionLabel?: string;
}

export interface Notification {
  id: string;
  type: 'alert' | 'info' | 'success' | 'warning';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  category: 'system' | 'security' | 'billing' | 'site' | 'integration';
  actionUrl?: string;
  actionLabel?: string;
}

// SSL Certificate Types
export interface SSLCertificate {
  id: string;
  domain: string;
  siteId: string;
  issuedAt: string;
  expiresAt: string;
  status: 'active' | 'expiring_soon' | 'expired' | 'pending' | 'failed';
  issuer: string;
  autoRenew: boolean;
  lastRenewalAttempt?: string;
  renewalError?: string;
}

// Email Pipeline Types
export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  htmlContent: string;
  textContent: string;
  category: 'transactional' | 'marketing' | 'notification' | 'system';
  variables: string[];
  createdAt: string;
  updatedAt: string;
}

export interface EmailDelivery {
  id: string;
  templateId: string;
  to: string;
  subject: string;
  status: 'queued' | 'sent' | 'delivered' | 'bounced' | 'failed';
  sentAt?: string;
  deliveredAt?: string;
  openedAt?: string;
  clickedAt?: string;
  error?: string;
}

export interface EmailStats {
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  failed: number;
}

// Backup Types
export interface Backup {
  id: string;
  siteId?: string;
  tenantId?: string;
  type: 'full' | 'incremental' | 'database' | 'files';
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  size: number;
  createdAt: string;
  completedAt?: string;
  expiresAt: string;
  retentionDays: number;
  downloadUrl?: string;
  error?: string;
}

export interface BackupSchedule {
  id: string;
  name: string;
  frequency: 'hourly' | 'daily' | 'weekly' | 'monthly';
  time: string;
  retentionDays: number;
  enabled: boolean;
  lastRun?: string;
  nextRun: string;
  targetType: 'all' | 'tenant' | 'site';
  targetId?: string;
}

// Tenant Extended Types
export interface TenantSettings {
  maxSites: number;
  maxUsers: number;
  storageLimit: number;
  bandwidthLimit: number;
  customDomainEnabled: boolean;
  sslEnabled: boolean;
  backupEnabled: boolean;
  backupFrequency: 'daily' | 'weekly' | 'monthly';
}

export interface TenantStats {
  totalSites: number;
  activeSites: number;
  totalUsers: number;
  storageUsed: number;
  bandwidthUsed: number;
  lastActivity: string;
}

export interface TenantBilling {
  plan: 'free' | 'starter' | 'professional' | 'enterprise';
  status: 'active' | 'past_due' | 'canceled' | 'trial';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  amount: number;
  currency: string;
}
