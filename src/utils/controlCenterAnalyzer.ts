// AI System Prompt for Control Center Integration Analysis
// This prompt is designed to analyze the Control Center codebase and identify
// all third-party integrations required to run it in a production environment.

export const INTEGRATION_ANALYZER_PROMPT = `
You are a senior DevOps engineer analyzing a Control Center admin dashboard codebase 
to identify ALL third-party integrations required to run it in a production environment.

## APPLICATION CONTEXT

The Control Center is a multi-tenant admin dashboard for managing multiple Lovable-built 
websites from a single interface. Key features include:

1. **Multi-Tenant Management** - Manage multiple sites from one dashboard
2. **Domain Registration** - Register domains via Namecheap API
3. **Mail App** - Native email client with Gmail/Outlook OAuth sync
4. **Social Account Prefiller** - Auto-generate accounts for 7 platforms
5. **Password Manager** - Central vault for all integration credentials
6. **Guided Tours** - AI-powered onboarding system
7. **Audit Logging** - Track all admin actions

## ANALYSIS RULES

1. **Scan for API References**
   - Look for: fetch(), API endpoints, SDK imports, OAuth flows
   - Check: service names in comments, config files, environment variables
   - Identify: external service dependencies in package.json

2. **Categorize by Criticality**
   - CRITICAL: Required for core functionality (won't run without these)
   - IMPORTANT: Enhances functionality significantly
   - OPTIONAL: Nice-to-have features

3. **Production Checklist**
   Every production Control Center MUST have:
   
   □ Authentication Provider (Auth0, Clerk, Supabase Auth)
     - Admin login/logout
     - Session management
     - Role-based access control
   
   □ Database (Supabase, Firebase, PlanetScale)
     - Store tenants, sites, credentials, audit logs
     - Real-time subscriptions for live updates
   
   □ Domain Registrar API (Namecheap, GoDaddy, Cloudflare)
     - Check domain availability
     - Register domains programmatically
     - Manage DNS records
   
   □ SSL Certificate Provider (Let's Encrypt, ZeroSSL)
     - Auto-provision HTTPS for custom domains
     - Certificate renewal automation
   
   □ Transactional Email (SendGrid, SES, Resend)
     - System notifications
     - Password resets
     - Admin alerts
   
   □ Email Sync APIs
     - Gmail API (Google OAuth 2.0)
     - Microsoft Graph API (Outlook OAuth 2.0)
     - IMAP/SMTP for manual connections
   
   □ Analytics (Google Analytics, Mixpanel, PostHog)
     - Dashboard usage tracking
     - Feature adoption metrics
   
   □ File Storage (AWS S3, Cloudinary, Supabase Storage)
     - Backup storage
     - Asset management
   
   □ Version Control (GitHub, GitLab)
     - Code repository management
     - Deployment triggers
   
   □ Hosting Platform (Lovable Cloud, Vercel, Netlify)
     - App hosting
     - Edge functions
     - CDN distribution
   
   □ Communication (Slack, Discord)
     - Admin alerts
     - Error notifications
     - Team collaboration

## DISCOVERED INTEGRATIONS FOR THIS CONTROL CENTER

Based on codebase analysis, the following integrations are REQUIRED:

### CRITICAL (Core Platform)
| Integration | Purpose | Category |
|-------------|---------|----------|
| Auth0 | Admin authentication & RBAC | Auth |
| Supabase | Database, auth, realtime, storage | Database |
| Namecheap | Domain registration & DNS | Domain |
| Let's Encrypt | SSL certificate provisioning | Infrastructure |

### IMPORTANT (Feature Dependencies)
| Integration | Purpose | Category |
|-------------|---------|----------|
| SendGrid | Transactional emails | Email |
| Gmail API | Email sync via OAuth | Email |
| Microsoft Graph | Outlook sync via OAuth | Email |
| Google Analytics | Usage analytics | Analytics |
| AWS S3 | File storage & backups | Storage |
| GitHub | Version control | Development |
| Lovable Cloud | Hosting platform | Hosting |
| Slack | Admin notifications | Communication |

### OPTIONAL (Enhanced Features)
| Integration | Purpose | Category |
|-------------|---------|----------|
| DiceBear | Avatar generation | Utility |
| Cloudinary | Image optimization | Storage |

## OUTPUT FORMAT

Return a structured list of integrations with:
- id: unique identifier
- name: display name
- description: what it does
- category: Domain | Database | Hosting | Infrastructure | Auth | Email | Analytics | Storage | Development | Communication
- criticality: critical | important | optional
- fields: required configuration fields
`;

// Integration criticality levels
export type IntegrationCriticality = 'critical' | 'important' | 'optional';

// Analyzed integration result
export interface AnalyzedIntegration {
  id: string;
  name: string;
  description: string;
  category: string;
  criticality: IntegrationCriticality;
  purpose: string;
}

// Full analysis result
export interface ControlCenterAnalysisResult {
  criticalIntegrations: AnalyzedIntegration[];
  importantIntegrations: AnalyzedIntegration[];
  optionalIntegrations: AnalyzedIntegration[];
  totalCount: number;
  missingCount: number;
  recommendations: string[];
}

// Pre-analyzed integrations for the Control Center
// This is the result of analyzing the codebase
export const CONTROL_CENTER_ANALYSIS: ControlCenterAnalysisResult = {
  criticalIntegrations: [
    { id: 'auth0', name: 'Auth0', description: 'Admin authentication and RBAC', category: 'Auth', criticality: 'critical', purpose: 'Admin login, session management, role-based access' },
    { id: 'supabase', name: 'Supabase', description: 'Database, auth, realtime, and storage', category: 'Database', criticality: 'critical', purpose: 'Store tenants, sites, credentials, audit logs' },
    { id: 'namecheap', name: 'Namecheap', description: 'Domain registration and DNS management', category: 'Domain', criticality: 'critical', purpose: 'Register domains, check availability, manage DNS' },
    { id: 'letsencrypt', name: "Let's Encrypt", description: 'Free SSL/TLS certificate provisioning', category: 'Infrastructure', criticality: 'critical', purpose: 'Auto-provision HTTPS for custom domains' },
  ],
  importantIntegrations: [
    { id: 'sendgrid', name: 'SendGrid', description: 'Transactional and marketing emails', category: 'Email', criticality: 'important', purpose: 'System notifications, password resets, admin alerts' },
    { id: 'gmail-api', name: 'Gmail API', description: 'Google email sync via OAuth 2.0', category: 'Email', criticality: 'important', purpose: 'Sync Gmail accounts in Mail App' },
    { id: 'microsoft-graph', name: 'Microsoft Graph', description: 'Outlook email sync via OAuth 2.0', category: 'Email', criticality: 'important', purpose: 'Sync Outlook accounts in Mail App' },
    { id: 'google-analytics', name: 'Google Analytics', description: 'Website traffic and user behavior', category: 'Analytics', criticality: 'important', purpose: 'Dashboard usage tracking, feature adoption' },
    { id: 'aws-s3', name: 'AWS S3', description: 'Cloud file storage and backups', category: 'Storage', criticality: 'important', purpose: 'Store backups, assets, and exports' },
    { id: 'github', name: 'GitHub', description: 'Version control and deployments', category: 'Development', criticality: 'important', purpose: 'Code repository, deployment triggers' },
    { id: 'lovable-cloud', name: 'Lovable Cloud', description: 'App hosting and deployment platform', category: 'Hosting', criticality: 'important', purpose: 'Host Control Center, edge functions, CDN' },
    { id: 'slack', name: 'Slack', description: 'Team notifications and alerts', category: 'Communication', criticality: 'important', purpose: 'Admin alerts, error notifications' },
  ],
  optionalIntegrations: [
    { id: 'cloudinary', name: 'Cloudinary', description: 'Image and video optimization', category: 'Storage', criticality: 'optional', purpose: 'Optimize images for better performance' },
    { id: 'mixpanel', name: 'Mixpanel', description: 'Product analytics and insights', category: 'Analytics', criticality: 'optional', purpose: 'Deep product analytics' },
  ],
  totalCount: 14,
  missingCount: 0,
  recommendations: [
    'Ensure all critical integrations are connected before going live',
    'Configure OAuth credentials for Gmail and Microsoft Graph APIs',
    'Set up Namecheap API with whitelisted IP addresses',
    'Verify SSL certificate auto-renewal is configured',
  ],
};

// Get all Control Center integration IDs
export function getControlCenterIntegrationIds(): string[] {
  const { criticalIntegrations, importantIntegrations, optionalIntegrations } = CONTROL_CENTER_ANALYSIS;
  return [
    ...criticalIntegrations.map(i => i.id),
    ...importantIntegrations.map(i => i.id),
    ...optionalIntegrations.map(i => i.id),
  ];
}

// Get integrations by criticality
export function getIntegrationsByCriticality(criticality: IntegrationCriticality): AnalyzedIntegration[] {
  switch (criticality) {
    case 'critical':
      return CONTROL_CENTER_ANALYSIS.criticalIntegrations;
    case 'important':
      return CONTROL_CENTER_ANALYSIS.importantIntegrations;
    case 'optional':
      return CONTROL_CENTER_ANALYSIS.optionalIntegrations;
  }
}
