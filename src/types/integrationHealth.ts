export interface IntegrationHealthStatus {
  integrationId: string;
  status: 'healthy' | 'warning' | 'error' | 'unknown';
  connectionStatus: 'connected' | 'disconnected' | 'expired' | 'rate_limited';
  lastChecked: string;
  lastSuccessfulCall?: string;
  
  // API Quota tracking
  quota?: {
    used: number;
    limit: number;
    resetAt: string;
    percentUsed: number;
  };
  
  // Token expiration
  tokenExpiration?: {
    expiresAt: string;
    daysRemaining: number;
    needsRefresh: boolean;
  };
  
  // Rate limiting
  rateLimit?: {
    remaining: number;
    limit: number;
    resetAt: string;
    isLimited: boolean;
  };
  
  // Error details
  error?: {
    code: string;
    message: string;
    occurredAt: string;
    resolution?: string;
  };
}

export interface HealthAlert {
  id: string;
  integrationId: string;
  integrationName: string;
  type: 'quota_warning' | 'token_expiring' | 'connection_error' | 'rate_limit';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  actionRequired: string;
  createdAt: string;
  acknowledged: boolean;
}

export interface UsageMetrics {
  emailsPerMonth: number;
  activeUsers: number;
  databaseSize: number; // MB
  storage: number; // MB
  apiCalls: number;
  domains: number;
}
