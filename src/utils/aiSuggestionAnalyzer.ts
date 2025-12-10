import { Site, AISuggestion } from '@/types';

// AI Suggestion Analyzer System Prompt
export const AI_SUGGESTION_SYSTEM_PROMPT = `
As a senior prompt engineer, your task is to analyze the Control Center platform and generate actionable improvement suggestions.

You are a Senior Full-Stack Engineer analyzing a multi-tenant admin dashboard. Your role is to:
1. Identify performance bottlenecks and optimization opportunities
2. Detect security vulnerabilities and recommend fixes  
3. Suggest UX/UI improvements for better user experience
4. Recommend SEO optimizations for public-facing pages
5. Identify missing or misconfigured integrations

For each suggestion, provide:
- Clear, actionable title
- Detailed description of the issue
- Expected impact if implemented
- Technical implementation details
- Estimated time to implement
- Files that will be affected
- A detailed prompt for implementation

Prioritize suggestions by:
- HIGH: Security issues, critical performance problems, broken functionality
- MEDIUM: UX improvements, moderate performance gains, best practices
- LOW: Nice-to-have features, minor optimizations, cosmetic improvements
`;

// Generate mock AI suggestions based on site data
export function generateAISuggestions(sites: Site[]): AISuggestion[] {
  const suggestions: AISuggestion[] = [];
  const now = new Date().toISOString();

  sites.forEach((site, index) => {
    // Performance suggestions for slow sites
    if (site.healthCheck.responseTime > 200) {
      suggestions.push({
        id: `suggestion-perf-${site.id}`,
        title: 'Optimize Response Time',
        description: `${site.name} has a response time of ${site.healthCheck.responseTime}ms which is above the recommended 200ms threshold.`,
        category: 'performance',
        priority: site.healthCheck.responseTime > 500 ? 'high' : 'medium',
        targetSiteId: site.id,
        targetSiteName: site.name,
        expectedImpact: 'Reduce response time by 40-60%, improving user experience and SEO rankings',
        technicalDetails: {
          filesAffected: ['src/api/routes.ts', 'src/middleware/cache.ts', 'src/utils/optimize.ts'],
          estimatedTime: '2-3 hours',
          complexity: 'moderate',
          prompt: `As a senior prompt engineer, your task is to optimize the response time for ${site.name}. Current response time is ${site.healthCheck.responseTime}ms. Implement caching middleware, optimize database queries, and add response compression. Target response time should be under 150ms.`,
        },
        status: 'pending',
        createdAt: now,
      });
    }

    // Traffic decline suggestions
    if (site.metrics.trafficChange < 0) {
      suggestions.push({
        id: `suggestion-traffic-${site.id}`,
        title: 'Address Traffic Decline',
        description: `${site.name} has experienced a ${Math.abs(site.metrics.trafficChange)}% decline in traffic.`,
        category: 'seo',
        priority: Math.abs(site.metrics.trafficChange) > 5 ? 'high' : 'medium',
        targetSiteId: site.id,
        targetSiteName: site.name,
        expectedImpact: 'Recover lost traffic and improve organic search visibility',
        technicalDetails: {
          filesAffected: ['src/pages/index.tsx', 'public/sitemap.xml', 'src/components/SEO.tsx'],
          estimatedTime: '3-4 hours',
          complexity: 'moderate',
          prompt: `As a senior prompt engineer, your task is to analyze and improve SEO for ${site.name} which has seen a ${Math.abs(site.metrics.trafficChange)}% traffic decline. Review meta tags, implement structured data, optimize page speed, and ensure mobile responsiveness.`,
        },
        status: 'pending',
        createdAt: now,
      });
    }

    // Uptime suggestions
    if (site.healthCheck.uptime < 99.5) {
      suggestions.push({
        id: `suggestion-uptime-${site.id}`,
        title: 'Improve Site Reliability',
        description: `${site.name} uptime is ${site.healthCheck.uptime}% which is below the 99.5% SLA target.`,
        category: 'performance',
        priority: 'high',
        targetSiteId: site.id,
        targetSiteName: site.name,
        expectedImpact: 'Achieve 99.9% uptime through improved error handling and monitoring',
        technicalDetails: {
          filesAffected: ['src/middleware/errorHandler.ts', 'src/utils/healthCheck.ts', 'src/config/monitoring.ts'],
          estimatedTime: '4-5 hours',
          complexity: 'complex',
          prompt: `As a senior prompt engineer, your task is to improve reliability for ${site.name} with current uptime of ${site.healthCheck.uptime}%. Implement comprehensive error handling, add health check endpoints, configure automatic restarts, and set up monitoring alerts.`,
        },
        status: 'pending',
        createdAt: now,
      });
    }

    // Demo mode suggestions
    if (site.demoMode?.isDemo) {
      suggestions.push({
        id: `suggestion-golive-${site.id}`,
        title: 'Prepare for Production',
        description: `${site.name} is still in Demo Mode. Review the Go Live checklist to ensure production readiness.`,
        category: 'integration',
        priority: 'low',
        targetSiteId: site.id,
        targetSiteName: site.name,
        expectedImpact: 'Transition to production with all integrations properly configured',
        technicalDetails: {
          filesAffected: ['src/config/production.ts', 'src/integrations/index.ts'],
          estimatedTime: '1-2 hours',
          complexity: 'simple',
          prompt: `As a senior prompt engineer, your task is to prepare ${site.name} for production deployment. Review all integration credentials, ensure environment variables are set, validate SSL certificates, and configure production database connections.`,
        },
        status: 'pending',
        createdAt: now,
      });
    }
  });

  // Control Center suggestions
  suggestions.push({
    id: 'suggestion-cc-security',
    title: 'Enable Two-Factor Authentication',
    description: 'Control Center admin accounts should have 2FA enabled for enhanced security.',
    category: 'security',
    priority: 'high',
    targetSiteId: 'control-center',
    targetSiteName: 'Control Center',
    expectedImpact: 'Significantly reduce risk of unauthorized access to admin functions',
    technicalDetails: {
      filesAffected: ['src/auth/twoFactor.ts', 'src/components/auth/TwoFactorSetup.tsx', 'src/pages/Settings.tsx'],
      estimatedTime: '3-4 hours',
      complexity: 'moderate',
      prompt: 'As a senior prompt engineer, your task is to implement TOTP-based two-factor authentication for Control Center. Add QR code generation, backup codes, and verification flow. Integrate with the existing authentication system.',
    },
    status: 'pending',
    createdAt: now,
  });

  return suggestions;
}