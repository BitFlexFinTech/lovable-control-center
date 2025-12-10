// Credential status type
export type CredentialStatus = 'demo' | 'live';

// Integration source type
export type IntegrationSource = 'control-center' | 'created-site';

// Stored credential for Password Manager
export interface StoredCredential {
  id: string;
  siteId: string;
  siteName: string;
  siteDomain: string;
  siteColor: string;
  integrationId: string;
  integrationName: string;
  integrationIcon: string;
  category: string;
  email: string;
  password: string;
  username?: string;
  additionalFields: Record<string, string>;
  status: CredentialStatus;
  source: IntegrationSource;
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

// Demo mode state
export interface DemoMode {
  isLive: boolean;
  activatedAt?: string;
  goLiveAt?: string;
}

// Integration template for all integrations
export interface IntegrationTemplate {
  id: string;
  name: string;
  icon: string;
  color: string;
  category: 'Payments' | 'Social' | 'Analytics' | 'Email' | 'Development' | 'Communication' | 'Storage' | 'Auth';
  fields: {
    key: string;
    label: string;
    required: boolean;
  }[];
}

// All integration templates
export const integrationTemplates: IntegrationTemplate[] = [
  // Payments
  {
    id: 'stripe',
    name: 'Stripe',
    icon: '💳',
    color: 'from-purple-500 to-indigo-600',
    category: 'Payments',
    fields: [
      { key: 'email', label: 'Email', required: true },
      { key: 'password', label: 'Password', required: true },
      { key: 'businessName', label: 'Business Name', required: true },
      { key: 'country', label: 'Country', required: true },
      { key: 'website', label: 'Website', required: true },
    ],
  },
  {
    id: 'paypal',
    name: 'PayPal',
    icon: '💰',
    color: 'from-blue-500 to-blue-700',
    category: 'Payments',
    fields: [
      { key: 'email', label: 'Email', required: true },
      { key: 'password', label: 'Password', required: true },
      { key: 'businessName', label: 'Business Name', required: true },
      { key: 'phone', label: 'Phone', required: true },
    ],
  },
  // Email Services
  {
    id: 'sendgrid',
    name: 'SendGrid',
    icon: '✉️',
    color: 'from-blue-400 to-cyan-500',
    category: 'Email',
    fields: [
      { key: 'email', label: 'Email', required: true },
      { key: 'password', label: 'Password', required: true },
      { key: 'companyName', label: 'Company Name', required: true },
      { key: 'website', label: 'Website', required: true },
    ],
  },
  {
    id: 'mailgun',
    name: 'Mailgun',
    icon: '📨',
    color: 'from-red-500 to-orange-500',
    category: 'Email',
    fields: [
      { key: 'email', label: 'Email', required: true },
      { key: 'password', label: 'Password', required: true },
      { key: 'sendingDomain', label: 'Sending Domain', required: true },
    ],
  },
  {
    id: 'mailchimp',
    name: 'Mailchimp',
    icon: '📧',
    color: 'from-yellow-500 to-yellow-600',
    category: 'Email',
    fields: [
      { key: 'email', label: 'Email', required: true },
      { key: 'password', label: 'Password', required: true },
      { key: 'companyName', label: 'Company Name', required: true },
    ],
  },
  // Analytics
  {
    id: 'google-analytics',
    name: 'Google Analytics',
    icon: '📊',
    color: 'from-orange-400 to-yellow-500',
    category: 'Analytics',
    fields: [
      { key: 'email', label: 'Email', required: true },
      { key: 'password', label: 'Password', required: true },
      { key: 'propertyName', label: 'Property Name', required: true },
    ],
  },
  {
    id: 'mixpanel',
    name: 'Mixpanel',
    icon: '📈',
    color: 'from-purple-400 to-pink-500',
    category: 'Analytics',
    fields: [
      { key: 'email', label: 'Email', required: true },
      { key: 'password', label: 'Password', required: true },
      { key: 'projectName', label: 'Project Name', required: true },
    ],
  },
  // Auth
  {
    id: 'auth0',
    name: 'Auth0',
    icon: '🔐',
    color: 'from-gray-700 to-gray-900',
    category: 'Auth',
    fields: [
      { key: 'email', label: 'Email', required: true },
      { key: 'password', label: 'Password', required: true },
      { key: 'tenantName', label: 'Tenant Name', required: true },
      { key: 'domain', label: 'Auth0 Domain', required: true },
    ],
  },
  // Storage
  {
    id: 'aws-s3',
    name: 'AWS S3',
    icon: '☁️',
    color: 'from-orange-500 to-orange-700',
    category: 'Storage',
    fields: [
      { key: 'email', label: 'Email', required: true },
      { key: 'password', label: 'Password', required: true },
      { key: 'bucketName', label: 'Bucket Name', required: true },
      { key: 'region', label: 'Region', required: true },
    ],
  },
  {
    id: 'cloudinary',
    name: 'Cloudinary',
    icon: '🖼️',
    color: 'from-blue-500 to-indigo-600',
    category: 'Storage',
    fields: [
      { key: 'email', label: 'Email', required: true },
      { key: 'password', label: 'Password', required: true },
      { key: 'cloudName', label: 'Cloud Name', required: true },
    ],
  },
  // Development
  {
    id: 'github',
    name: 'GitHub',
    icon: '🐙',
    color: 'from-gray-800 to-black',
    category: 'Development',
    fields: [
      { key: 'email', label: 'Email', required: true },
      { key: 'password', label: 'Password', required: true },
      { key: 'username', label: 'Username', required: true },
    ],
  },
  {
    id: 'vercel',
    name: 'Vercel',
    icon: '▲',
    color: 'from-gray-900 to-black',
    category: 'Development',
    fields: [
      { key: 'email', label: 'Email', required: true },
      { key: 'password', label: 'Password', required: true },
      { key: 'teamName', label: 'Team Name', required: false },
    ],
  },
  // Communication
  {
    id: 'slack',
    name: 'Slack',
    icon: '💬',
    color: 'from-purple-600 to-pink-600',
    category: 'Communication',
    fields: [
      { key: 'email', label: 'Email', required: true },
      { key: 'password', label: 'Password', required: true },
      { key: 'workspaceName', label: 'Workspace Name', required: true },
    ],
  },
  {
    id: 'discord',
    name: 'Discord',
    icon: '🎮',
    color: 'from-indigo-500 to-indigo-700',
    category: 'Communication',
    fields: [
      { key: 'email', label: 'Email', required: true },
      { key: 'password', label: 'Password', required: true },
      { key: 'username', label: 'Username', required: true },
      { key: 'serverName', label: 'Server Name', required: false },
    ],
  },
  // Social
  {
    id: 'instagram',
    name: 'Instagram',
    icon: '📸',
    color: 'from-pink-500 to-purple-600',
    category: 'Social',
    fields: [
      { key: 'email', label: 'Email', required: true },
      { key: 'password', label: 'Password', required: true },
      { key: 'username', label: 'Username', required: true },
      { key: 'fullName', label: 'Full Name', required: true },
    ],
  },
  {
    id: 'facebook',
    name: 'Facebook',
    icon: '👥',
    color: 'from-blue-600 to-blue-800',
    category: 'Social',
    fields: [
      { key: 'email', label: 'Email', required: true },
      { key: 'password', label: 'Password', required: true },
      { key: 'pageName', label: 'Page Name', required: true },
    ],
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    icon: '🎵',
    color: 'from-gray-900 to-gray-700',
    category: 'Social',
    fields: [
      { key: 'email', label: 'Email', required: true },
      { key: 'password', label: 'Password', required: true },
      { key: 'username', label: 'Username', required: true },
      { key: 'businessName', label: 'Business Name', required: true },
    ],
  },
  {
    id: 'twitter',
    name: 'X (Twitter)',
    icon: '𝕏',
    color: 'from-gray-800 to-black',
    category: 'Social',
    fields: [
      { key: 'email', label: 'Email', required: true },
      { key: 'password', label: 'Password', required: true },
      { key: 'username', label: 'Username', required: true },
    ],
  },
  {
    id: 'youtube',
    name: 'YouTube',
    icon: '▶️',
    color: 'from-red-500 to-red-700',
    category: 'Social',
    fields: [
      { key: 'email', label: 'Email', required: true },
      { key: 'password', label: 'Password', required: true },
      { key: 'channelName', label: 'Channel Name', required: true },
    ],
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: '💼',
    color: 'from-blue-700 to-blue-900',
    category: 'Social',
    fields: [
      { key: 'email', label: 'Email', required: true },
      { key: 'password', label: 'Password', required: true },
      { key: 'companyName', label: 'Company Name', required: true },
    ],
  },
];

// Control Center required integrations
export const CONTROL_CENTER_INTEGRATIONS = [
  'auth0',
  'sendgrid',
  'google-analytics',
  'aws-s3',
  'slack',
  'github',
];

export const CONTROL_CENTER_APP = {
  siteId: 'control-center',
  siteName: 'Control Center',
  domain: 'controlcenter.lovable.app',
  color: '#00D4FF',
  isControlCenter: true,
};
