import { UsageMetrics } from '@/types/integrationHealth';

export interface IntegrationPricing {
  id: string;
  name: string;
  icon: string;
  freeTier: {
    included: string;
    limits: string;
  } | null;
  paidTiers: {
    name: string;
    price: number;
    priceUnit: 'month' | 'year' | 'usage';
    includes: string;
  }[];
  estimateMonthly: (usage: UsageMetrics) => number;
}

export const INTEGRATION_PRICING: Record<string, IntegrationPricing> = {
  supabase: {
    id: 'supabase',
    name: 'Supabase',
    icon: '⚡',
    freeTier: {
      included: '500MB database, 1GB storage, 50K MAU, Auth included',
      limits: '2 projects, 500MB bandwidth/day'
    },
    paidTiers: [
      { name: 'Pro', price: 25, priceUnit: 'month', includes: '8GB database, 100GB storage, unlimited MAU' },
      { name: 'Team', price: 599, priceUnit: 'month', includes: 'SOC2, SSO, priority support' }
    ],
    estimateMonthly: (usage) => {
      if (usage.databaseSize < 500 && usage.storage < 1000 && usage.activeUsers < 50000) return 0;
      return 25;
    }
  },
  letsencrypt: {
    id: 'letsencrypt',
    name: "Let's Encrypt",
    icon: '🔒',
    freeTier: {
      included: 'Unlimited SSL certificates',
      limits: 'Rate limits: 50 certs/domain/week'
    },
    paidTiers: [],
    estimateMonthly: () => 0
  },
  'google-analytics': {
    id: 'google-analytics',
    name: 'Google Analytics',
    icon: '📊',
    freeTier: {
      included: 'Full analytics, unlimited data',
      limits: 'Data sampling on high-volume reports'
    },
    paidTiers: [
      { name: 'GA 360', price: 12500, priceUnit: 'month', includes: 'Enterprise features, SLA, support' }
    ],
    estimateMonthly: () => 0
  },
  github: {
    id: 'github',
    name: 'GitHub',
    icon: '🐙',
    freeTier: {
      included: 'Unlimited public/private repos, 2000 Actions mins/mo',
      limits: '500MB packages storage'
    },
    paidTiers: [
      { name: 'Pro', price: 4, priceUnit: 'month', includes: 'Advanced tools, 3000 mins' },
      { name: 'Team', price: 4, priceUnit: 'month', includes: 'Per user, 3000 mins/user' }
    ],
    estimateMonthly: () => 0
  },
  'gmail-api': {
    id: 'gmail-api',
    name: 'Gmail API',
    icon: '📧',
    freeTier: {
      included: '250 quota units/user/second',
      limits: 'Personal Gmail accounts only'
    },
    paidTiers: [
      { name: 'Workspace Starter', price: 6, priceUnit: 'month', includes: 'Business email, 30GB storage' }
    ],
    estimateMonthly: () => 0
  },
  'microsoft-graph': {
    id: 'microsoft-graph',
    name: 'Microsoft Graph',
    icon: '📬',
    freeTier: {
      included: 'Free with Microsoft 365 subscription',
      limits: 'Rate limits apply per app'
    },
    paidTiers: [
      { name: 'M365 Business Basic', price: 6, priceUnit: 'month', includes: 'Email, Teams, 1TB OneDrive' }
    ],
    estimateMonthly: () => 0
  },
  'lovable-cloud': {
    id: 'lovable-cloud',
    name: 'Lovable Cloud',
    icon: '💜',
    freeTier: {
      included: 'Included with Lovable subscription',
      limits: 'Based on plan limits'
    },
    paidTiers: [],
    estimateMonthly: () => 0
  },
  slack: {
    id: 'slack',
    name: 'Slack',
    icon: '💬',
    freeTier: {
      included: '90 days message history, 10 integrations',
      limits: 'No group calls, limited storage'
    },
    paidTiers: [
      { name: 'Pro', price: 8.75, priceUnit: 'month', includes: 'Unlimited history, 10GB storage/user' },
      { name: 'Business+', price: 15, priceUnit: 'month', includes: 'SAML SSO, 20GB storage/user' }
    ],
    estimateMonthly: () => 0
  },
  sendgrid: {
    id: 'sendgrid',
    name: 'SendGrid',
    icon: '✉️',
    freeTier: {
      included: '100 emails/day forever',
      limits: 'Single sender verification'
    },
    paidTiers: [
      { name: 'Essentials', price: 19.95, priceUnit: 'month', includes: '50K emails/month' },
      { name: 'Pro', price: 89.95, priceUnit: 'month', includes: '100K emails/month, dedicated IP' }
    ],
    estimateMonthly: (usage) => {
      if (usage.emailsPerMonth <= 3000) return 0;
      if (usage.emailsPerMonth <= 50000) return 19.95;
      return 89.95;
    }
  },
  namecheap: {
    id: 'namecheap',
    name: 'Namecheap',
    icon: '🌐',
    freeTier: null,
    paidTiers: [
      { name: '.com domain', price: 10.98, priceUnit: 'year', includes: 'Domain registration, privacy' },
      { name: '.io domain', price: 32.98, priceUnit: 'year', includes: 'Premium TLD' },
      { name: '.app domain', price: 14.98, priceUnit: 'year', includes: 'SSL required TLD' }
    ],
    estimateMonthly: (usage) => (usage.domains * 12) / 12
  },
  'aws-s3': {
    id: 'aws-s3',
    name: 'AWS S3',
    icon: '☁️',
    freeTier: {
      included: '5GB storage, 20K GET, 2K PUT (12 months)',
      limits: 'Free tier expires after 12 months'
    },
    paidTiers: [
      { name: 'Standard', price: 0.023, priceUnit: 'usage', includes: 'Per GB/month storage' },
      { name: 'Glacier', price: 0.004, priceUnit: 'usage', includes: 'Archive storage per GB/month' }
    ],
    estimateMonthly: (usage) => {
      if (usage.storage <= 5000) return 0; // 5GB free
      return Math.round((usage.storage / 1000) * 0.023 * 100) / 100;
    }
  },
  stripe: {
    id: 'stripe',
    name: 'Stripe',
    icon: '💳',
    freeTier: null,
    paidTiers: [
      { name: 'Standard', price: 2.9, priceUnit: 'usage', includes: '2.9% + $0.30 per transaction' }
    ],
    estimateMonthly: () => 0 // Transaction-based
  },
  discord: {
    id: 'discord',
    name: 'Discord',
    icon: '🎮',
    freeTier: {
      included: 'Unlimited servers, voice, text',
      limits: '8MB file uploads, 720p streaming'
    },
    paidTiers: [
      { name: 'Nitro', price: 9.99, priceUnit: 'month', includes: '100MB uploads, 4K streaming' }
    ],
    estimateMonthly: () => 0
  }
};

export function calculateTotalMonthlyCost(
  activeIntegrationIds: string[], 
  usage: UsageMetrics
): { total: number; breakdown: Record<string, number> } {
  const breakdown: Record<string, number> = {};
  let total = 0;

  activeIntegrationIds.forEach(id => {
    const pricing = INTEGRATION_PRICING[id];
    if (pricing) {
      const cost = pricing.estimateMonthly(usage);
      breakdown[id] = cost;
      total += cost;
    }
  });

  return { total: Math.round(total * 100) / 100, breakdown };
}

export function getFreeTierStatus(integrationId: string): 'free' | 'freemium' | 'paid' {
  const pricing = INTEGRATION_PRICING[integrationId];
  if (!pricing) return 'paid';
  if (pricing.freeTier && pricing.paidTiers.length === 0) return 'free';
  if (pricing.freeTier) return 'freemium';
  return 'paid';
}
