import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// NPM package to integration ID mapping
const NPM_TO_INTEGRATION_MAP: Record<string, string> = {
  // Payments
  '@stripe/stripe-js': 'stripe',
  'stripe': 'stripe',
  '@paypal/react-paypal-js': 'paypal',
  'paypal-rest-sdk': 'paypal',
  
  // Database
  '@supabase/supabase-js': 'supabase',
  'firebase': 'firebase',
  '@firebase/app': 'firebase',
  
  // Email
  '@sendgrid/mail': 'sendgrid',
  'nodemailer': 'sendgrid',
  '@mailchimp/mailchimp_marketing': 'mailchimp',
  'resend': 'resend',
  
  // Storage
  '@aws-sdk/client-s3': 'aws-s3',
  'aws-sdk': 'aws-s3',
  'cloudinary': 'cloudinary',
  
  // Communication
  '@slack/web-api': 'slack',
  '@slack/bolt': 'slack',
  'discord.js': 'discord',
  'twilio': 'twilio',
  
  // Social Media
  'react-facebook-login': 'facebook',
  'react-instagram-embed': 'instagram',
  'react-twitter-widgets': 'twitter',
  'twitter-api-v2': 'twitter',
  'react-youtube': 'youtube',
  'react-linkedin-login-oauth2': 'linkedin',
  
  // Analytics
  'react-ga4': 'google-analytics',
  'mixpanel-browser': 'mixpanel',
  'posthog-js': 'posthog',
  '@amplitude/analytics-browser': 'amplitude',
  
  // Authentication
  '@auth0/auth0-react': 'auth0',
  'next-auth': 'nextauth',
  '@clerk/clerk-react': 'clerk',
  
  // Development & AI
  '@octokit/rest': 'github',
  'openai': 'openai',
  '@anthropic-ai/sdk': 'anthropic',
  
  // Monitoring
  '@sentry/react': 'sentry',
  '@sentry/browser': 'sentry',
  'logrocket': 'logrocket',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { githubUrl, owner, repo } = await req.json();
    
    let repoOwner = owner;
    let repoName = repo;

    // Parse GitHub URL if provided
    if (githubUrl) {
      const patterns = [
        /github\.com\/([^\/]+)\/([^\/\?\#]+)/,
        /^([^\/]+)\/([^\/]+)$/,
      ];

      for (const pattern of patterns) {
        const match = githubUrl.match(pattern);
        if (match && match[1] && match[2]) {
          repoOwner = match[1];
          repoName = match[2].replace(/\.git$/, '');
          break;
        }
      }
    }

    if (!repoOwner || !repoName) {
      return new Response(
        JSON.stringify({ error: 'Invalid GitHub URL or owner/repo not provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Fetching package.json from ${repoOwner}/${repoName}`);

    // Fetch package.json from GitHub API (works for public repos without auth)
    const response = await fetch(
      `https://api.github.com/repos/${repoOwner}/${repoName}/contents/package.json`,
      {
        headers: {
          'Accept': 'application/vnd.github.v3.raw',
          'User-Agent': 'Control-Center-App',
        },
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        return new Response(
          JSON.stringify({ 
            error: 'Repository or package.json not found',
            hint: 'Make sure the repository is public and contains a package.json file',
          }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ 
          error: `GitHub API error: ${response.status}`,
          hint: response.status === 403 ? 'Rate limit exceeded. Try again later.' : 'Unknown error',
        }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const packageJson = await response.json();
    
    // Extract all dependencies
    const allDeps = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies,
    };

    const allDependencies = Object.keys(allDeps);
    const detectedIntegrations: string[] = [];
    const matchedPackages: { package: string; integration: string }[] = [];

    for (const dep of allDependencies) {
      const integrationId = NPM_TO_INTEGRATION_MAP[dep];
      if (integrationId && !detectedIntegrations.includes(integrationId)) {
        detectedIntegrations.push(integrationId);
        matchedPackages.push({ package: dep, integration: integrationId });
      }
    }

    console.log(`Detected ${detectedIntegrations.length} integrations from ${allDependencies.length} dependencies`);

    return new Response(
      JSON.stringify({
        success: true,
        repoOwner,
        repoName,
        projectName: packageJson.name || repoName,
        detectedIntegrations,
        matchedPackages,
        totalDependencies: allDependencies.length,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error fetching GitHub dependencies:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: 'Failed to fetch dependencies', details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
