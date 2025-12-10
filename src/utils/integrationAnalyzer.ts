// Integration detection rules based on app type/features
const INTEGRATION_RULES: Record<string, string[]> = {
  // E-commerce keywords
  shop: ['stripe', 'paypal', 'google-analytics', 'sendgrid', 'instagram', 'facebook'],
  store: ['stripe', 'paypal', 'google-analytics', 'sendgrid', 'instagram', 'facebook'],
  ecommerce: ['stripe', 'paypal', 'google-analytics', 'sendgrid', 'instagram', 'facebook'],
  commerce: ['stripe', 'paypal', 'google-analytics', 'sendgrid'],
  market: ['stripe', 'paypal', 'google-analytics', 'instagram'],
  
  // Social/Content keywords
  blog: ['google-analytics', 'mailchimp', 'twitter', 'facebook', 'github'],
  social: ['instagram', 'facebook', 'tiktok', 'twitter', 'youtube', 'linkedin'],
  media: ['instagram', 'youtube', 'tiktok', 'cloudinary'],
  content: ['google-analytics', 'mailchimp', 'twitter'],
  news: ['google-analytics', 'twitter', 'facebook', 'sendgrid'],
  
  // SaaS keywords
  saas: ['stripe', 'google-analytics', 'slack', 'sendgrid', 'auth0', 'github'],
  app: ['google-analytics', 'sendgrid', 'slack', 'auth0'],
  platform: ['stripe', 'google-analytics', 'sendgrid', 'auth0', 'aws-s3'],
  dashboard: ['google-analytics', 'slack', 'github'],
  
  // Community keywords
  community: ['discord', 'slack', 'google-analytics', 'mailchimp'],
  forum: ['discord', 'google-analytics', 'sendgrid'],
  hub: ['discord', 'slack', 'google-analytics'],
  
  // Portfolio/Personal
  portfolio: ['google-analytics', 'github', 'linkedin', 'twitter'],
  personal: ['google-analytics', 'twitter', 'linkedin'],
  agency: ['google-analytics', 'instagram', 'slack', 'sendgrid'],
  
  // Default fallback
  default: ['google-analytics', 'sendgrid'],
};

export interface AnalysisResult {
  detectedIntegrations: string[];
  appType: string;
  confidence: number;
}

export function analyzeAppForIntegrations(appName: string, domain: string): AnalysisResult {
  const searchText = `${appName} ${domain}`.toLowerCase();
  const detectedIntegrations = new Set<string>();
  let matchedType = 'default';
  let maxMatches = 0;

  // Check each rule
  for (const [keyword, integrations] of Object.entries(INTEGRATION_RULES)) {
    if (keyword === 'default') continue;
    
    if (searchText.includes(keyword)) {
      if (integrations.length > maxMatches) {
        maxMatches = integrations.length;
        matchedType = keyword;
      }
      integrations.forEach(i => detectedIntegrations.add(i));
    }
  }

  // If no matches, use defaults
  if (detectedIntegrations.size === 0) {
    INTEGRATION_RULES.default.forEach(i => detectedIntegrations.add(i));
    matchedType = 'general';
  }

  // Always add basic analytics
  detectedIntegrations.add('google-analytics');

  return {
    detectedIntegrations: Array.from(detectedIntegrations),
    appType: matchedType,
    confidence: detectedIntegrations.size > 2 ? 0.85 : 0.6,
  };
}

// TLD pricing configuration
export const POPULAR_TLDS = [
  { tld: '.com', basePrice: 12.99, recommended: true },
  { tld: '.io', basePrice: 39.99, popular: true },
  { tld: '.co', basePrice: 24.99 },
  { tld: '.net', basePrice: 14.99 },
  { tld: '.org', basePrice: 12.99 },
  { tld: '.dev', basePrice: 14.99 },
  { tld: '.app', basePrice: 14.99 },
  { tld: '.ai', basePrice: 79.99, premium: true },
];
