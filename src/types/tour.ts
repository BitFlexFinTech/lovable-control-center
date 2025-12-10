// Tour step targeting
export interface TourStep {
  id: string;
  target: string;           // CSS selector for element to highlight
  title: string;
  content: string;          // Markdown supported
  placement: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: {
    type: 'click' | 'navigate' | 'input' | 'wait';
    target?: string;
    value?: string;
  };
  canSkip: boolean;
  isOptional: boolean;
}

// Complete tour definition
export interface Tour {
  id: string;
  name: string;
  description: string;
  category: 'onboarding' | 'feature' | 'workflow' | 'custom';
  estimatedTime: string;    // e.g., "5 mins"
  steps: TourStep[];
  prerequisites?: string[]; // Tour IDs that should be completed first
  targetAudience: 'new-user' | 'admin' | 'all';
  version: string;          // For auto-update tracking
  lastGenerated: string;
  aiGenerated: boolean;
}

// Tour progress tracking
export interface TourProgress {
  tourId: string;
  currentStep: number;
  completed: boolean;
  startedAt: string;
  completedAt?: string;
  skippedSteps: string[];
}

// AI generation request
export interface TourGenerationRequest {
  type: 'full-onboarding' | 'feature-specific' | 'custom-query';
  query?: string;           // For custom queries from chat
  targetPage?: string;
  includeSubPages?: boolean;
}

// Chat message for AI assistant
export interface TourChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  suggestedTour?: Tour;
}
