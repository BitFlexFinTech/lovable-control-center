// StreamEngine Types - YouTube Automation Platform

export type YouTubePersonaRole = 
  | 'content_strategist' 
  | 'seo_specialist' 
  | 'analytics_expert' 
  | 'monetization_manager' 
  | 'community_manager' 
  | 'live_producer';

export type VideoStatus = 
  | 'idea' 
  | 'scripting' 
  | 'filming' 
  | 'editing' 
  | 'review' 
  | 'scheduled' 
  | 'published' 
  | 'archived';

export type CrisisSeverity = 'low' | 'medium' | 'high' | 'critical';

export type DealStatus = 
  | 'prospecting' 
  | 'outreach' 
  | 'negotiating' 
  | 'contracted' 
  | 'active' 
  | 'completed' 
  | 'cancelled';

export type CollabStatus = 
  | 'discovered' 
  | 'analyzing' 
  | 'outreach' 
  | 'discussing' 
  | 'planning' 
  | 'scheduled' 
  | 'completed' 
  | 'declined';

export interface YouTubeChannel {
  id: string;
  siteId: string;
  personaId?: string;
  channelId: string;
  channelName: string;
  channelUrl?: string;
  subscriberCount: number;
  videoCount: number;
  viewCount: number;
  thumbnailUrl?: string;
  description?: string;
  country?: string;
  customUrl?: string;
  keywords: string[];
  isVerified: boolean;
  isMonetized: boolean;
  healthScore: number;
  lastSyncedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface YouTubePersona {
  id: string;
  siteId: string;
  basePersonaId?: string;
  channelId?: string;
  role: YouTubePersonaRole;
  name: string;
  avatarUrl?: string;
  systemPrompt?: string;
  capabilities: string[];
  dailySchedule: Record<string, any>;
  performanceMetrics: Record<string, any>;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface YouTubeVideo {
  id: string;
  channelId: string;
  videoId: string;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  status: VideoStatus;
  publishedAt?: string;
  durationSeconds?: number;
  viewCount: number;
  likeCount: number;
  dislikeCount: number;
  commentCount: number;
  tags: string[];
  categoryId?: string;
  isMonetized: boolean;
  isShorts: boolean;
  seoScore: number;
  engagementRate: number;
  ctr: number;
  avgViewDuration: number;
  createdAt: string;
  updatedAt: string;
}

export interface YouTubeContentCalendarItem {
  id: string;
  channelId: string;
  videoId?: string;
  personaId?: string;
  title: string;
  description?: string;
  scheduledDate: string;
  scheduledTime?: string;
  status: VideoStatus;
  contentType: string;
  priority: string;
  notes?: string;
  checklist: { task: string; completed: boolean }[];
  assignedPersonas: string[];
  createdAt: string;
  updatedAt: string;
}

export interface YouTubeAnalytics {
  id: string;
  channelId: string;
  videoId?: string;
  date: string;
  views: number;
  watchTimeMinutes: number;
  subscribersGained: number;
  subscribersLost: number;
  likes: number;
  dislikes: number;
  comments: number;
  shares: number;
  impressions: number;
  ctr: number;
  avgViewDuration: number;
  revenueCents: number;
  rpmCents: number;
  cpmCents: number;
  trafficSources: Record<string, number>;
  demographics: Record<string, any>;
  devices: Record<string, number>;
  createdAt: string;
}

export interface YouTubeChannelHealth {
  id: string;
  channelId: string;
  overallGrade: string;
  overallScore: number;
  seoScore: number;
  audienceScore: number;
  monetizationScore: number;
  contentScore: number;
  engagementScore: number;
  growthScore: number;
  consistencyScore: number;
  categoryBreakdown: Record<string, any>;
  recommendations: HealthRecommendation[];
  quickWins: QuickWin[];
  calculatedAt: string;
  createdAt: string;
}

export interface HealthRecommendation {
  id: string;
  category: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'high' | 'medium' | 'low';
  toolLink?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'dismissed';
}

export interface QuickWin {
  id: string;
  title: string;
  description: string;
  estimatedImpact: string;
  timeToComplete: string;
  action: string;
}

export interface YouTubeCrisisEvent {
  id: string;
  channelId: string;
  videoId?: string;
  severity: CrisisSeverity;
  type: string;
  title: string;
  description?: string;
  detectedAt: string;
  resolvedAt?: string;
  status: string;
  sentimentScore: number;
  dislikeRatio: number;
  negativeCommentCount: number;
  responseRecommendations: CrisisResponse[];
  actionsTaken: string[];
  escalationLevel: number;
  assignedPersonaId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CrisisResponse {
  id: string;
  type: 'acknowledge' | 'apologize' | 'explain' | 'ignore' | 'delete';
  message: string;
  riskLevel: 'low' | 'medium' | 'high';
  effectiveness: number;
  recommended: boolean;
}

export interface YouTubeBrandDeal {
  id: string;
  channelId: string;
  brandName: string;
  brandLogoUrl?: string;
  brandWebsite?: string;
  contactName?: string;
  contactEmail?: string;
  status: DealStatus;
  dealType: string;
  rateOfferedCents: number;
  rateNegotiatedCents: number;
  deliverables: Deliverable[];
  contractUrl?: string;
  contractSignedAt?: string;
  startDate?: string;
  endDate?: string;
  paymentTerms?: string;
  paymentStatus: string;
  notes?: string;
  assignedPersonaId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Deliverable {
  id: string;
  type: string;
  description: string;
  dueDate?: string;
  status: 'pending' | 'in_progress' | 'submitted' | 'approved' | 'revision_requested';
  videoId?: string;
}

export interface YouTubeCollaboration {
  id: string;
  channelId: string;
  partnerChannelId: string;
  partnerChannelName: string;
  partnerSubscriberCount: number;
  partnerThumbnailUrl?: string;
  status: CollabStatus;
  compatibilityScore: number;
  audienceOverlapPercent: number;
  contentSynergyScore: number;
  growthPotentialScore: number;
  collabType?: string;
  proposedConcept?: string;
  outreachMessage?: string;
  responseReceived: boolean;
  scheduledDate?: string;
  videoId?: string;
  results: CollabResults;
  assignedPersonaId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CollabResults {
  viewsGenerated?: number;
  subscribersGained?: number;
  engagementRate?: number;
  audienceRetention?: number;
}

export interface YouTubeVideoIdea {
  id: string;
  channelId: string;
  title: string;
  description?: string;
  source: string;
  sourceData: Record<string, any>;
  score: number;
  estimatedViews: number;
  estimatedCtr: number;
  trendRelevance: number;
  audienceMatch: number;
  competitionLevel: string;
  tags: string[];
  keywords: string[];
  thumbnailConcepts: string[];
  status: string;
  promotedToCalendar: boolean;
  calendarId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface YouTubeLiveStream {
  id: string;
  channelId: string;
  videoId?: string;
  streamId?: string;
  title: string;
  description?: string;
  scheduledStart?: string;
  actualStart?: string;
  actualEnd?: string;
  status: string;
  peakViewers: number;
  avgViewers: number;
  totalChatMessages: number;
  totalSuperChatsCents: number;
  totalMemberships: number;
  highlights: StreamHighlight[];
  moderationStats: ModerationStats;
  postStreamAnalytics: Record<string, any>;
  assignedPersonaId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StreamHighlight {
  id: string;
  timestamp: number;
  type: 'peak_viewers' | 'super_chat' | 'raid' | 'milestone' | 'clip_worthy';
  description: string;
  clipUrl?: string;
}

export interface ModerationStats {
  messagesModerated: number;
  usersTimedOut: number;
  usersBanned: number;
  spamBlocked: number;
  toxicityBlocked: number;
}

export interface YouTubeMerchStore {
  id: string;
  channelId: string;
  provider: string;
  storeUrl?: string;
  storeId?: string;
  isConnected: boolean;
  totalProducts: number;
  totalSalesCents: number;
  totalRevenueCents: number;
  lastSyncedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface YouTubeChannelPortfolio {
  id: string;
  userId: string;
  name: string;
  description?: string;
  channels: string[];
  primaryChannelId?: string;
  totalSubscribers: number;
  totalViews: number;
  totalVideos: number;
  aggregateHealthScore: number;
  createdAt: string;
  updatedAt: string;
}

export interface YouTubeAudienceInsights {
  id: string;
  channelId: string;
  date: string;
  ageGroups: Record<string, number>;
  genderDistribution: Record<string, number>;
  geography: Record<string, number>;
  interests: string[];
  watchTimePatterns: Record<string, number>;
  deviceTypes: Record<string, number>;
  trafficSources: Record<string, number>;
  subscriberGrowthRate: number;
  returningViewerRate: number;
  createdAt: string;
}

export interface YouTubeMonetization {
  id: string;
  channelId: string;
  date: string;
  adRevenueCents: number;
  superChatCents: number;
  membershipCents: number;
  merchCents: number;
  sponsorshipCents: number;
  affiliateCents: number;
  totalCents: number;
  estimatedRpmCents: number;
  estimatedCpmCents: number;
  monetizedPlaybacks: number;
  createdAt: string;
}
