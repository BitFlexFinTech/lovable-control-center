import { Tour, TourStep, TourGenerationRequest } from '@/types/tour';

// AI System Prompt for Tour Generation
export const TOUR_GENERATOR_SYSTEM_PROMPT = `
You are an expert UX onboarding specialist for the Control Center admin dashboard.
Your role is to analyze the current application state and generate comprehensive, 
UserPilot-style guided tours.

## APPLICATION CONTEXT
Control Center is a multi-tenant admin dashboard for managing multiple Lovable-built websites.

### Available Pages & Features:
1. **Overview (/)** - KPI dashboard with traffic, orders, content backlog, uptime metrics
2. **Mail (/mail)** - Native email client with folders, compose, VIP management
3. **Social Prefill (/social-prefill)** - Auto-generate social media account credentials
4. **Password Manager (/passwords)** - Credential vault with Demo/Live sections
5. **Tenants (/tenants)** - Manage tenant organizations
6. **Sites (/sites)** - Site management with Demo Mode and Go Live workflow
7. **Users (/users)** - User management and role assignments
8. **Roles (/roles)** - Role definitions and permissions matrix
9. **Integrations (/integrations)** - Third-party service connections (Control Center vs Created Sites)
10. **Audit Logs (/audit-logs)** - Activity tracking and compliance logs
11. **Settings (/settings)** - System configuration
12. **Guided Tour (/guided-tour)** - Interactive tours and AI assistant

### Key Workflows:
- Creating a new site (domain search → cart → app creation → demo mode)
- Going Live (review → confirm → purchase domain → create accounts)
- Managing credentials (demo vs live, grouped by site)
- Connecting integrations (auto-import vs manual connection)

## TOUR GENERATION RULES

1. **Targeting Elements**
   - Use semantic selectors: [data-tour="element-name"]
   - Fallback to class names: .component-class
   - Never use dynamic IDs

2. **Step Content**
   - Keep titles ≤ 8 words
   - Content ≤ 50 words per step
   - Include actionable instructions
   - Use friendly, conversational tone

3. **Tour Structure**
   - Welcome step (always first)
   - 5-15 steps per tour (optimal engagement)
   - Logical flow following user journey
   - Completion celebration (always last)

4. **Interactivity**
   - Add click actions for buttons
   - Navigate actions for menu items
   - Wait actions for async operations

## OUTPUT FORMAT
Return valid JSON matching the Tour interface.
Include all steps with proper targeting and placement.
`;

// Function to generate tour from AI response
export function parseTourFromAI(aiResponse: string): Tour | null {
  try {
    // Try to extract JSON from the response
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    
    const parsed = JSON.parse(jsonMatch[0]);
    
    // Validate required fields
    if (!parsed.name || !parsed.steps || !Array.isArray(parsed.steps)) {
      return null;
    }
    
    // Generate tour with defaults
    const tour: Tour = {
      id: `custom-${Date.now()}`,
      name: parsed.name,
      description: parsed.description || 'AI-generated tour',
      category: 'custom',
      estimatedTime: parsed.estimatedTime || `${Math.ceil(parsed.steps.length * 0.5)} mins`,
      steps: parsed.steps.map((step: any, index: number) => ({
        id: step.id || `step-${index}`,
        target: step.target || '[data-tour="sidebar-logo"]',
        title: step.title || `Step ${index + 1}`,
        content: step.content || '',
        placement: step.placement || 'bottom',
        action: step.action,
        canSkip: step.canSkip ?? true,
        isOptional: step.isOptional ?? false,
      })),
      targetAudience: 'all',
      version: '1.0.0',
      lastGenerated: new Date().toISOString(),
      aiGenerated: true,
    };
    
    return tour;
  } catch (e) {
    console.error('Failed to parse tour from AI:', e);
    return null;
  }
}

// Generate a quick tour based on user question
export function generateQuickTour(query: string): Tour {
  const queryLower = query.toLowerCase();
  
  // Map common queries to relevant targets
  const targetMappings: Record<string, TourStep[]> = {
    'create site': [
      { id: 's1', target: '[data-tour="nav-sites"]', title: 'Go to Sites', content: 'Click Sites in the sidebar.', placement: 'right', canSkip: false, isOptional: false },
      { id: 's2', target: '[data-tour="create-site-button"]', title: 'Click Create Site', content: 'Start the site creation wizard.', placement: 'bottom', canSkip: false, isOptional: false },
    ],
    'go live': [
      { id: 's1', target: '[data-tour="nav-sites"]', title: 'Go to Sites', content: 'Navigate to your sites list.', placement: 'right', canSkip: false, isOptional: false },
      { id: 's2', target: '[data-tour="demo-badge"]', title: 'Find Demo Sites', content: 'Look for sites with the Demo badge.', placement: 'left', canSkip: false, isOptional: false },
      { id: 's3', target: '[data-tour="go-live-button"]', title: 'Click Go Live', content: 'Open the Go Live wizard from the menu.', placement: 'left', canSkip: false, isOptional: false },
    ],
    'password': [
      { id: 's1', target: '[data-tour="nav-passwords"]', title: 'Open Password Manager', content: 'Access your credential vault.', placement: 'right', canSkip: false, isOptional: false },
    ],
    'email': [
      { id: 's1', target: '[data-tour="nav-mail"]', title: 'Open Mail App', content: 'Access your unified inbox.', placement: 'right', canSkip: false, isOptional: false },
    ],
    'social': [
      { id: 's1', target: '[data-tour="nav-social-prefill"]', title: 'Open Social Prefill', content: 'Generate social media credentials.', placement: 'right', canSkip: false, isOptional: false },
    ],
    'integration': [
      { id: 's1', target: '[data-tour="nav-integrations"]', title: 'Open Integrations', content: 'Manage third-party connections.', placement: 'right', canSkip: false, isOptional: false },
    ],
  };
  
  // Find matching steps
  let steps: TourStep[] = [];
  for (const [key, value] of Object.entries(targetMappings)) {
    if (queryLower.includes(key)) {
      steps = value;
      break;
    }
  }
  
  // Default fallback
  if (steps.length === 0) {
    steps = [
      { id: 's1', target: '[data-tour="sidebar-logo"]', title: 'Need Help?', content: 'Try asking about: creating sites, going live, passwords, email, social accounts, or integrations.', placement: 'right', canSkip: false, isOptional: false },
    ];
  }
  
  return {
    id: `quick-${Date.now()}`,
    name: `How to: ${query}`,
    description: 'Quick guide generated from your question',
    category: 'custom',
    estimatedTime: `${steps.length} min`,
    steps,
    targetAudience: 'all',
    version: '1.0.0',
    lastGenerated: new Date().toISOString(),
    aiGenerated: true,
  };
}
