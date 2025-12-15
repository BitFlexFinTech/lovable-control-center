/**
 * SYSTEM PRIME OBJECTIVE — CONTROL CENTER GLOBAL REMEDIATION + PRODUCTION READINESS
 * 
 * This module contains the comprehensive analysis rules and configurations
 * for auditing and remediating ALL Lovable-imported sites plus the Control Center itself.
 */

// Control Center Feature Checklist
export const CONTROL_CENTER_FEATURES = {
  pages: [
    { id: 'overview', name: 'Overview Dashboard', route: '/' },
    { id: 'sites', name: 'Sites Management', route: '/sites' },
    { id: 'tenants', name: 'Tenants Management', route: '/tenants' },
    { id: 'users', name: 'Users Management', route: '/users' },
    { id: 'mail', name: 'Mail App', route: '/mail' },
    { id: 'password-manager', name: 'Password Manager', route: '/password-manager' },
    { id: 'roles', name: 'Roles & Permissions', route: '/roles' },
    { id: 'integrations', name: 'Integrations', route: '/integrations' },
    { id: 'audit-logs', name: 'Audit Logs', route: '/audit-logs' },
    { id: 'settings', name: 'Settings', route: '/settings' },
    { id: 'whatsapp', name: 'WhatsApp', route: '/whatsapp' },
    { id: 'analyze', name: 'Analyze', route: '/analyze' },
    { id: 'social-prefill', name: 'Social Prefill', route: '/social-prefill' },
    { id: 'nexuspay', name: 'Billing Management', route: '/nexuspay' },
    { id: 'guided-tour', name: 'Guided Tour', route: '/guided-tour' },
  ],
  criticalFeatures: [
    { id: 'auth', name: 'Authentication', description: 'Login/Signup/Session management' },
    { id: 'site-crud', name: 'Site CRUD', description: 'Create, Read, Update, Delete sites' },
    { id: 'tenant-crud', name: 'Tenant CRUD', description: 'Multi-tenant management' },
    { id: 'user-management', name: 'User Management', description: 'User roles and permissions' },
    { id: 'integration-setup', name: 'Integration Setup', description: 'Complete integration setup dialogs' },
    { id: 'password-vault', name: 'Password Vault', description: 'Credential storage and management' },
    { id: 'health-monitoring', name: 'Health Monitoring', description: 'Real-time site health checks' },
    { id: 'notification-center', name: 'Notification Center', description: 'Alert system' },
    { id: 'audit-logging', name: 'Audit Logging', description: 'Action tracking and compliance' },
  ],
  buttons: [
    'Create Site',
    'Import App',
    'Go Live',
    'Run Analysis',
    'Complete Setup',
    'Transfer Site',
    'Connect Integration',
    'Create Tenant',
    'Invite User',
    'Settings Save',
    'Maintenance Mode Toggle',
    'Theme Toggle',
  ],
};

// Production Readiness Requirements
export const PRODUCTION_READINESS_REQUIREMENTS = {
  security: [
    { id: 'auth-implemented', name: 'Authentication Implemented', category: 'security' },
    { id: 'rls-policies', name: 'Row Level Security Policies', category: 'security' },
    { id: 'api-key-management', name: 'API Key Management', category: 'security' },
    { id: 'secrets-handling', name: 'Secrets Handling', category: 'security' },
    { id: 'session-management', name: 'Session Management', category: 'security' },
  ],
  reliability: [
    { id: 'error-handling', name: 'Error Handling', category: 'reliability' },
    { id: 'retry-backoff', name: 'Retry/Backoff Logic', category: 'reliability' },
    { id: 'rate-limit-compliance', name: 'Rate Limit Compliance', category: 'reliability' },
    { id: 'graceful-shutdown', name: 'Graceful Shutdown', category: 'reliability' },
    { id: 'health-endpoints', name: 'Health Check Endpoints', category: 'reliability' },
  ],
  observability: [
    { id: 'structured-logs', name: 'Structured Logging', category: 'observability' },
    { id: 'metrics', name: 'Metrics Collection', category: 'observability' },
    { id: 'dashboards', name: 'Monitoring Dashboards', category: 'observability' },
    { id: 'alerts', name: 'Alert Configuration', category: 'observability' },
  ],
  ux: [
    { id: 'responsive-layout', name: 'Responsive Layouts', category: 'ux' },
    { id: 'accessibility', name: 'Accessibility (a11y)', category: 'ux' },
    { id: 'error-surfaces', name: 'User-Friendly Error Messages', category: 'ux' },
    { id: 'loading-states', name: 'Loading States', category: 'ux' },
    { id: 'onboarding', name: 'Onboarding Flows', category: 'ux' },
  ],
  dataIntegrity: [
    { id: 'schema-validation', name: 'Schema Validation', category: 'data' },
    { id: 'migrations', name: 'Database Migrations', category: 'data' },
    { id: 'backups', name: 'Backup System', category: 'data' },
    { id: 'audit-logs', name: 'Audit Logs', category: 'data' },
  ],
  performance: [
    { id: 'latency-targets', name: 'Latency Targets (<200ms)', category: 'performance' },
    { id: 'throughput', name: 'Throughput Handling', category: 'performance' },
    { id: 'autosync-consistency', name: 'Autosync Consistency', category: 'performance' },
    { id: 'caching', name: 'Caching Strategy', category: 'performance' },
  ],
};

// Requirement ID Formats
export const REQUIREMENT_ID_FORMATS = {
  controlCenter: (num: number) => `CC-REQ-${String(num).padStart(3, '0')}`,
  controlCenterSuggestion: (num: number) => `CC-SUG-${String(num).padStart(3, '0')}`,
  site: (siteName: string, num: number) => `SITE-${siteName.toUpperCase().replace(/\s+/g, '-')}-REQ-${String(num).padStart(3, '0')}`,
  siteSuggestion: (siteName: string, num: number) => `SITE-${siteName.toUpperCase().replace(/\s+/g, '-')}-SUG-${String(num).padStart(3, '0')}`,
};

// Analysis Categories
export type AnalysisCategory = 
  | 'integration' 
  | 'security' 
  | 'bug' 
  | 'feature' 
  | 'compliance' 
  | 'performance'
  | 'autosync'
  | 'ui-ux';

export type SeverityLevel = 'critical' | 'high' | 'medium' | 'low';

export type ActionType = 'auto-fix' | 'manual' | 'review' | 'suggestion';

export type SiteStatus = 'all-green' | 'partial' | 'blocked' | 'pending';

// Report Types
export interface SiteRequirement {
  id: string;
  title: string;
  description: string;
  status: 'implemented' | 'partial' | 'not-implemented';
  evidence: {
    files: string[];
    functions: string[];
    routes: string[];
    uxLocation: string;
  };
  testNames: string[];
  selected: boolean;
}

export interface SiteSuggestion {
  id: string;
  title: string;
  rationale: string;
  fixPlan: string[];
  acceptanceCriteria: string[];
  category: 'security' | 'reliability' | 'observability' | 'ux' | 'data' | 'performance' | 'autosync';
  priority: 'high' | 'medium' | 'low';
  selected: boolean;
}

export interface SiteDefect {
  id: string;
  title: string;
  causeCategory: 'auth' | 'precision' | 'rate-limits' | 'state-mgmt' | 'autosync' | 'ui-binding' | 'type-error' | 'missing-impl';
  rootCause: string;
  reproSteps: string[];
  logs: string[];
}

export interface TestResult {
  name: string;
  category: 'unit' | 'integration' | 'e2e' | 'performance';
  status: 'pass' | 'fail' | 'skip';
  duration: number;
  error?: string;
}

export interface SiteAnalysisReport {
  siteId: string;
  siteName: string;
  siteColor: string;
  isControlCenter: boolean;
  status: SiteStatus;
  requirements: SiteRequirement[];
  suggestions: SiteSuggestion[];
  defects: SiteDefect[];
  coverage: {
    implemented: number;
    partial: number;
    blocked: number;
    total: number;
    percentage: number;
  };
  testResults: TestResult[];
  lastAnalyzed: string;
}

export interface GlobalAnalysisReport {
  runId: string;
  startedAt: string;
  completedAt: string;
  siteReports: SiteAnalysisReport[];
  globalCoverage: {
    implemented: number;
    total: number;
    percentage: number;
  };
  totalRequirements: number;
  totalSuggestions: number;
  totalDefects: number;
  status: 'all-green' | 'partial' | 'blocked';
}

// Analysis Modules
export const ANALYSIS_MODULES = [
  { id: 'cc-features', name: 'Control Center Features', description: 'Scan CC buttons, pages, and hooks' },
  { id: 'cc-backend', name: 'Control Center Backend', description: 'Scan edge functions and database' },
  { id: 'site-integration', name: 'Integration Health', description: 'Check integration connections' },
  { id: 'site-security', name: 'Security Audit', description: 'Check credentials, SSL, RLS policies' },
  { id: 'site-bugs', name: 'Bug Detection', description: 'Scan error logs and health status' },
  { id: 'site-features', name: 'Feature Completeness', description: 'Check required features' },
  { id: 'site-compliance', name: 'Compliance Check', description: 'SLA, uptime, audit requirements' },
  { id: 'site-performance', name: 'Performance Analysis', description: 'Response times, autosync' },
  { id: 'production-readiness', name: 'Production Readiness', description: 'Security, reliability, observability' },
  { id: 'suggestions', name: 'Suggestion Generation', description: 'Generate improvement suggestions' },
];

// Status Colors
export const STATUS_COLORS = {
  'all-green': '#22c55e',  // green-500
  'partial': '#eab308',    // yellow-500
  'blocked': '#ef4444',    // red-500
  'pending': '#3b82f6',    // blue-500
  'control-center': '#06b6d4', // cyan-500
};

export const CONTROL_CENTER_ID = 'control-center';
export const CONTROL_CENTER_NAME = 'Control Center';
export const CONTROL_CENTER_COLOR = '#06b6d4';
