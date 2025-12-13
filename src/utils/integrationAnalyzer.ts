// App category bundles for integration pre-selection
export const APP_CATEGORY_BUNDLES: Record<string, { label: string; description: string; integrations: string[] }> = {
  'ecommerce': {
    label: 'E-commerce / Shop',
    description: 'Online store, marketplace, or checkout system',
    integrations: ['stripe', 'paypal', 'google-analytics', 'sendgrid', 'instagram', 'facebook', 'aws-s3'],
  },
  'saas': {
    label: 'SaaS / Dashboard',
    description: 'Software platform, admin panel, or business app',
    integrations: ['stripe', 'supabase', 'sendgrid', 'slack', 'github', 'google-analytics'],
  },
  'social': {
    label: 'Social / Content',
    description: 'Social platform, content creator tools, or media app',
    integrations: ['instagram', 'facebook', 'tiktok', 'twitter', 'youtube', 'linkedin', 'discord', 'cloudinary', 'google-analytics'],
  },
  'blog': {
    label: 'Blog / News / Portfolio',
    description: 'Content publishing, portfolio, or informational site',
    integrations: ['google-analytics', 'mailchimp', 'twitter', 'linkedin', 'github'],
  },
  'other': {
    label: 'Other / Custom',
    description: "I'll select integrations manually",
    integrations: ['google-analytics', 'sendgrid'],
  },
};

// Enhanced keyword patterns for auto-detection
const KEYWORD_PATTERNS: Array<{ keywords: string[]; integrations: string[] }> = [
  // Payment keywords
  { keywords: ['shop', 'store', 'ecommerce', 'commerce', 'checkout', 'cart', 'buy', 'payment', 'purchase', 'order'], integrations: ['stripe', 'paypal'] },
  // Social media keywords
  { keywords: ['social', 'instagram', 'tiktok', 'twitter', 'facebook', 'youtube', 'linkedin', 'creator', 'influencer'], integrations: ['instagram', 'facebook', 'tiktok', 'twitter', 'youtube', 'linkedin'] },
  // Communication keywords
  { keywords: ['chat', 'message', 'notify', 'alert', 'slack', 'discord', 'team', 'community'], integrations: ['slack', 'discord', 'sendgrid'] },
  // Video/Media keywords
  { keywords: ['video', 'stream', 'watch', 'media', 'upload', 'image', 'photo'], integrations: ['youtube', 'cloudinary', 'aws-s3'] },
  // Auth/Database keywords
  { keywords: ['auth', 'login', 'signup', 'register', 'user', 'account', 'database', 'backend', 'data'], integrations: ['supabase'] },
  // Storage keywords
  { keywords: ['file', 'upload', 'storage', 'document', 'asset'], integrations: ['aws-s3', 'cloudinary'] },
  // Development keywords
  { keywords: ['code', 'developer', 'github', 'git', 'repo', 'open-source'], integrations: ['github'] },
  // Blog/Content keywords
  { keywords: ['blog', 'post', 'article', 'news', 'content', 'publish', 'newsletter'], integrations: ['mailchimp', 'sendgrid', 'google-analytics'] },
  // SaaS keywords
  { keywords: ['saas', 'platform', 'dashboard', 'admin', 'manage', 'analytics', 'crm'], integrations: ['stripe', 'google-analytics', 'slack', 'sendgrid'] },
  // Portfolio/Agency keywords
  { keywords: ['portfolio', 'agency', 'personal', 'resume', 'cv'], integrations: ['google-analytics', 'linkedin', 'github'] },
];

export interface AnalysisResult {
  detectedIntegrations: string[];
  appType: string;
  confidence: number;
}

export function analyzeAppForIntegrations(appName: string, domain: string): AnalysisResult {
  const searchText = `${appName} ${domain}`.toLowerCase();
  const detectedIntegrations = new Set<string>();
  let matchedType = 'general';
  let matchCount = 0;

  // Check each keyword pattern
  for (const pattern of KEYWORD_PATTERNS) {
    for (const keyword of pattern.keywords) {
      if (searchText.includes(keyword)) {
        pattern.integrations.forEach(i => detectedIntegrations.add(i));
        matchCount++;
        // Set app type based on first significant match
        if (matchedType === 'general') {
          if (['shop', 'store', 'ecommerce', 'commerce', 'checkout'].includes(keyword)) matchedType = 'ecommerce';
          else if (['social', 'instagram', 'tiktok', 'creator'].includes(keyword)) matchedType = 'social';
          else if (['saas', 'dashboard', 'platform', 'admin'].includes(keyword)) matchedType = 'saas';
          else if (['blog', 'post', 'article', 'news'].includes(keyword)) matchedType = 'blog';
          else if (['portfolio', 'agency', 'personal'].includes(keyword)) matchedType = 'portfolio';
        }
        break; // Only match once per pattern
      }
    }
  }

  // Always add basic analytics as fallback
  detectedIntegrations.add('google-analytics');

  // Calculate confidence based on match count
  const confidence = matchCount >= 3 ? 0.85 : matchCount >= 1 ? 0.6 : 0.4;

  return {
    detectedIntegrations: Array.from(detectedIntegrations),
    appType: matchedType,
    confidence,
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
