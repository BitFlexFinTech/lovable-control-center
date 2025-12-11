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
  },
  paypal: {
    id: 'paypal',
    name: 'PayPal',
    icon: '💰',
    freeTier: null,
    paidTiers: [
      { name: 'Standard', price: 2.99, priceUnit: 'usage', includes: '2.99% + $0.49 per transaction' }
    ],
    estimateMonthly: () => 0
  },
  twilio: {
    id: 'twilio',
    name: 'Twilio',
    icon: '📱',
    freeTier: {
      included: '$15 trial credit',
      limits: 'Trial numbers only'
    },
    paidTiers: [
      { name: 'SMS', price: 0.0079, priceUnit: 'usage', includes: 'Per SMS sent' },
      { name: 'Voice', price: 0.0085, priceUnit: 'usage', includes: 'Per minute' }
    ],
    estimateMonthly: () => 0
  },
  cloudflare: {
    id: 'cloudflare',
    name: 'Cloudflare',
    icon: '🛡️',
    freeTier: {
      included: 'Unlimited bandwidth, DDoS protection, SSL',
      limits: '3 page rules, basic analytics'
    },
    paidTiers: [
      { name: 'Pro', price: 20, priceUnit: 'month', includes: 'WAF, image optimization' },
      { name: 'Business', price: 200, priceUnit: 'month', includes: 'Advanced DDoS, SLA' }
    ],
    estimateMonthly: () => 0
  },
  vercel: {
    id: 'vercel',
    name: 'Vercel',
    icon: '▲',
    freeTier: {
      included: '100GB bandwidth, serverless functions',
      limits: 'Hobby projects only, 100 deployments/day'
    },
    paidTiers: [
      { name: 'Pro', price: 20, priceUnit: 'month', includes: 'Team features, 1TB bandwidth' },
      { name: 'Enterprise', price: 0, priceUnit: 'month', includes: 'Custom pricing' }
    ],
    estimateMonthly: () => 0
  },
  mixpanel: {
    id: 'mixpanel',
    name: 'Mixpanel',
    icon: '📈',
    freeTier: {
      included: '100K monthly tracked users',
      limits: 'Core reports only'
    },
    paidTiers: [
      { name: 'Growth', price: 25, priceUnit: 'month', includes: 'Unlimited history, data pipelines' }
    ],
    estimateMonthly: (usage) => {
      if (usage.activeUsers <= 100000) return 0;
      return 25;
    }
  },
  hotjar: {
    id: 'hotjar',
    name: 'Hotjar',
    icon: '🔥',
    freeTier: {
      included: '35 daily sessions',
      limits: 'Basic heatmaps, 1 site'
    },
    paidTiers: [
      { name: 'Plus', price: 32, priceUnit: 'month', includes: '100 sessions/day' },
      { name: 'Business', price: 80, priceUnit: 'month', includes: '500 sessions/day' }
    ],
    estimateMonthly: () => 0
  },
  intercom: {
    id: 'intercom',
    name: 'Intercom',
    icon: '💬',
    freeTier: null,
    paidTiers: [
      { name: 'Starter', price: 74, priceUnit: 'month', includes: 'Basic chat, 1 seat' },
      { name: 'Pro', price: 395, priceUnit: 'month', includes: 'Advanced automation' }
    ],
    estimateMonthly: () => 74
  },
  mailchimp: {
    id: 'mailchimp',
    name: 'Mailchimp',
    icon: '🐵',
    freeTier: {
      included: '500 contacts, 1000 emails/month',
      limits: 'Limited templates, Mailchimp branding'
    },
    paidTiers: [
      { name: 'Essentials', price: 13, priceUnit: 'month', includes: '500 contacts, remove branding' },
      { name: 'Standard', price: 20, priceUnit: 'month', includes: 'Advanced automation' }
    ],
    estimateMonthly: (usage) => {
      if (usage.emailsPerMonth <= 1000) return 0;
      return 13;
    }
  },
  zendesk: {
    id: 'zendesk',
    name: 'Zendesk',
    icon: '🎧',
    freeTier: null,
    paidTiers: [
      { name: 'Suite Team', price: 55, priceUnit: 'month', includes: 'Ticketing, chat, help center' },
      { name: 'Suite Growth', price: 89, priceUnit: 'month', includes: 'Multiple ticket forms' }
    ],
    estimateMonthly: () => 55
  },
  instagram: {
    id: 'instagram',
    name: 'Instagram API',
    icon: '📸',
    freeTier: {
      included: 'Basic Display API, content publishing',
      limits: '200 calls/hour/user'
    },
    paidTiers: [],
    estimateMonthly: () => 0
  },
  tiktok: {
    id: 'tiktok',
    name: 'TikTok API',
    icon: '🎵',
    freeTier: {
      included: 'Content posting, analytics',
      limits: 'Business accounts only'
    },
    paidTiers: [],
    estimateMonthly: () => 0
  },
  twitter: {
    id: 'twitter',
    name: 'X/Twitter API',
    icon: '🐦',
    freeTier: {
      included: '1,500 tweets/month read',
      limits: 'Write access requires paid'
    },
    paidTiers: [
      { name: 'Basic', price: 100, priceUnit: 'month', includes: '50K tweets read, 10K writes' },
      { name: 'Pro', price: 5000, priceUnit: 'month', includes: 'Full archive, analytics' }
    ],
    estimateMonthly: () => 0
  },
  linkedin: {
    id: 'linkedin',
    name: 'LinkedIn API',
    icon: '💼',
    freeTier: {
      included: 'Share API, profile data',
      limits: 'Must be LinkedIn partner'
    },
    paidTiers: [],
    estimateMonthly: () => 0
  },
  youtube: {
    id: 'youtube',
    name: 'YouTube API',
    icon: '▶️',
    freeTier: {
      included: '10,000 units/day',
      limits: 'Quota varies by endpoint'
    },
    paidTiers: [],
    estimateMonthly: () => 0
  },
  openai: {
    id: 'openai',
    name: 'OpenAI',
    icon: '🤖',
    freeTier: {
      included: '$5 trial credit',
      limits: '3 months expiry'
    },
    paidTiers: [
      { name: 'GPT-4o', price: 5, priceUnit: 'usage', includes: '$5/1M input, $15/1M output' },
      { name: 'GPT-4o-mini', price: 0.15, priceUnit: 'usage', includes: '$0.15/1M input tokens' }
    ],
    estimateMonthly: () => 10
  },
  anthropic: {
    id: 'anthropic',
    name: 'Anthropic Claude',
    icon: '🧠',
    freeTier: null,
    paidTiers: [
      { name: 'Claude 3.5', price: 3, priceUnit: 'usage', includes: '$3/1M input, $15/1M output' }
    ],
    estimateMonthly: () => 10
  },
  sentry: {
    id: 'sentry',
    name: 'Sentry',
    icon: '🐛',
    freeTier: {
      included: '5K errors/month, 10K transactions',
      limits: '1 user, 30 day retention'
    },
    paidTiers: [
      { name: 'Team', price: 26, priceUnit: 'month', includes: '50K errors, unlimited users' },
      { name: 'Business', price: 80, priceUnit: 'month', includes: '100K errors, SSO' }
    ],
    estimateMonthly: () => 0
  },
  datadog: {
    id: 'datadog',
    name: 'Datadog',
    icon: '🐕',
    freeTier: {
      included: '1 host, 1 day retention',
      limits: 'Infrastructure monitoring only'
    },
    paidTiers: [
      { name: 'Pro', price: 15, priceUnit: 'month', includes: 'Per host, 15 month retention' },
      { name: 'Enterprise', price: 23, priceUnit: 'month', includes: 'Machine learning, SLA' }
    ],
    estimateMonthly: () => 0
  },
  algolia: {
    id: 'algolia',
    name: 'Algolia',
    icon: '🔍',
    freeTier: {
      included: '10K search requests/month, 10K records',
      limits: 'Community support only'
    },
    paidTiers: [
      { name: 'Grow', price: 0, priceUnit: 'usage', includes: 'Pay as you go after free' },
      { name: 'Premium', price: 1, priceUnit: 'usage', includes: 'Per 1K requests' }
    ],
    estimateMonthly: () => 0
  },
  auth0: {
    id: 'auth0',
    name: 'Auth0',
    icon: '🔐',
    freeTier: {
      included: '7,500 MAU, 2 social providers',
      limits: 'No custom domains'
    },
    paidTiers: [
      { name: 'Essential', price: 23, priceUnit: 'month', includes: 'Custom domain, 500 MAU' },
      { name: 'Professional', price: 240, priceUnit: 'month', includes: '1000 MAU, MFA' }
    ],
    estimateMonthly: (usage) => {
      if (usage.activeUsers <= 7500) return 0;
      return 23;
    }
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
