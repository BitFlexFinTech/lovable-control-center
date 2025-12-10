// SEO Types for AI-powered SEO generation

export interface SEOMetadata {
  title: string;
  description: string;
  keywords: string[];
  ogTitle: string;
  ogDescription: string;
  ogImage?: string;
  twitterTitle: string;
  twitterDescription: string;
  twitterCard: 'summary' | 'summary_large_image';
  canonicalUrl: string;
  structuredData?: Record<string, any>;
}

export interface SEOAnalysis {
  score: number;
  issues: SEOIssue[];
  recommendations: SEORecommendation[];
}

export interface SEOIssue {
  type: 'error' | 'warning' | 'info';
  message: string;
  field: string;
}

export interface SEORecommendation {
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  impact: string;
}

export interface SEOPreviewType {
  type: 'google' | 'facebook' | 'twitter';
  title: string;
  description: string;
  url: string;
  image?: string;
}
