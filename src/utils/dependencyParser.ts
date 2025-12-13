// NPM package to Control Center integration ID mapping
export const NPM_TO_INTEGRATION_MAP: Record<string, string> = {
  // Payments
  '@stripe/stripe-js': 'stripe',
  'stripe': 'stripe',
  '@paypal/react-paypal-js': 'paypal',
  'paypal-rest-sdk': 'paypal',
  '@paypal/checkout-server-sdk': 'paypal',
  
  // Database
  '@supabase/supabase-js': 'supabase',
  'firebase': 'firebase',
  'firebase-admin': 'firebase',
  '@firebase/app': 'firebase',
  'mongoose': 'mongodb',
  'mongodb': 'mongodb',
  '@prisma/client': 'prisma',
  
  // Email
  '@sendgrid/mail': 'sendgrid',
  '@sendgrid/client': 'sendgrid',
  'nodemailer': 'sendgrid',
  '@mailchimp/mailchimp_marketing': 'mailchimp',
  'postmark': 'postmark',
  '@postmarkapp/postmark.js': 'postmark',
  'resend': 'resend',
  
  // Storage
  '@aws-sdk/client-s3': 'aws-s3',
  'aws-sdk': 'aws-s3',
  'cloudinary': 'cloudinary',
  '@google-cloud/storage': 'google-cloud-storage',
  
  // Communication
  '@slack/web-api': 'slack',
  '@slack/bolt': 'slack',
  'discord.js': 'discord',
  '@twilio/voice-sdk': 'twilio',
  'twilio': 'twilio',
  
  // Social Media
  'react-facebook-login': 'facebook',
  '@types/facebook-js-sdk': 'facebook',
  'react-instagram-embed': 'instagram',
  'instagram-private-api': 'instagram',
  'react-twitter-widgets': 'twitter',
  'twitter-api-v2': 'twitter',
  'react-youtube': 'youtube',
  '@google-cloud/video-intelligence': 'youtube',
  'react-linkedin-login-oauth2': 'linkedin',
  'tiktok-api': 'tiktok',
  
  // Analytics
  'react-ga4': 'google-analytics',
  '@analytics/google-analytics': 'google-analytics',
  'mixpanel-browser': 'mixpanel',
  'mixpanel': 'mixpanel',
  '@segment/analytics-next': 'segment',
  'posthog-js': 'posthog',
  'amplitude-js': 'amplitude',
  '@amplitude/analytics-browser': 'amplitude',
  
  // Authentication
  '@auth0/auth0-react': 'auth0',
  '@auth0/nextjs-auth0': 'auth0',
  'auth0-js': 'auth0',
  'next-auth': 'nextauth',
  '@clerk/clerk-react': 'clerk',
  '@clerk/nextjs': 'clerk',
  
  // Development
  '@octokit/rest': 'github',
  '@octokit/core': 'github',
  'openai': 'openai',
  '@anthropic-ai/sdk': 'anthropic',
  'langchain': 'langchain',
  '@google/generative-ai': 'google-ai',
  'replicate': 'replicate',
  
  // CMS & Content
  'contentful': 'contentful',
  '@sanity/client': 'sanity',
  'strapi-sdk-js': 'strapi',
  '@directus/sdk': 'directus',
  
  // E-commerce
  'shopify-buy': 'shopify',
  '@shopify/shopify-api': 'shopify',
  'woocommerce-rest-api': 'woocommerce',
  'swell-js': 'swell',
  
  // Maps & Location
  '@googlemaps/js-api-loader': 'google-maps',
  'mapbox-gl': 'mapbox',
  'leaflet': 'openstreetmap',
  
  // Search
  'algoliasearch': 'algolia',
  '@elastic/elasticsearch': 'elasticsearch',
  'meilisearch': 'meilisearch',
  
  // Monitoring
  '@sentry/react': 'sentry',
  '@sentry/browser': 'sentry',
  'logrocket': 'logrocket',
  '@datadog/browser-rum': 'datadog',
};

export interface ParsedDependencies {
  detectedIntegrations: string[];
  allDependencies: string[];
  matchedPackages: { package: string; integration: string }[];
}

/**
 * Parse package.json content and return detected integrations
 */
export function parsePackageJson(content: string): ParsedDependencies {
  try {
    const pkg = JSON.parse(content);
    const allDeps = {
      ...pkg.dependencies,
      ...pkg.devDependencies,
    };

    const allDependencies = Object.keys(allDeps);
    const detectedIntegrations = new Set<string>();
    const matchedPackages: { package: string; integration: string }[] = [];

    for (const dep of allDependencies) {
      const integrationId = NPM_TO_INTEGRATION_MAP[dep];
      if (integrationId) {
        detectedIntegrations.add(integrationId);
        matchedPackages.push({ package: dep, integration: integrationId });
      }
    }

    return {
      detectedIntegrations: Array.from(detectedIntegrations),
      allDependencies,
      matchedPackages,
    };
  } catch (error) {
    console.error('Failed to parse package.json:', error);
    return {
      detectedIntegrations: [],
      allDependencies: [],
      matchedPackages: [],
    };
  }
}

/**
 * Extract owner and repo from GitHub URL
 */
export function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
  const patterns = [
    /github\.com\/([^\/]+)\/([^\/\?\#]+)/,
    /^([^\/]+)\/([^\/]+)$/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1] && match[2]) {
      return {
        owner: match[1],
        repo: match[2].replace(/\.git$/, ''),
      };
    }
  }

  return null;
}
