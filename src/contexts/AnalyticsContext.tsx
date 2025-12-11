import React, { createContext, useContext, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';

interface AnalyticsEvent {
  eventType: 'page_view' | 'click' | 'feature_use' | 'error' | 'custom';
  eventName: string;
  metadata?: Record<string, unknown>;
}

interface AnalyticsContextType {
  trackEvent: (event: AnalyticsEvent) => Promise<void>;
  trackPageView: (pageName: string, metadata?: Record<string, unknown>) => Promise<void>;
  trackClick: (elementName: string, metadata?: Record<string, unknown>) => Promise<void>;
  trackFeatureUse: (featureName: string, metadata?: Record<string, unknown>) => Promise<void>;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  const trackEvent = useCallback(async (event: AnalyticsEvent) => {
    try {
      // Use type assertion to handle the insert
      const insertData = {
        event_type: event.eventType,
        event_name: event.eventName,
        user_id: user?.id || null,
        metadata: event.metadata || {},
      };
      await (supabase.from('analytics_events') as any).insert(insertData);
    } catch (error) {
      // Silently fail - analytics should not break the app
      console.warn('Analytics tracking failed:', error);
    }
  }, [user?.id]);

  const trackPageView = useCallback(async (pageName: string, metadata?: Record<string, unknown>) => {
    await trackEvent({
      eventType: 'page_view',
      eventName: pageName,
      metadata: { ...metadata, url: window.location.pathname },
    });
  }, [trackEvent]);

  const trackClick = useCallback(async (elementName: string, metadata?: Record<string, unknown>) => {
    await trackEvent({
      eventType: 'click',
      eventName: elementName,
      metadata,
    });
  }, [trackEvent]);

  const trackFeatureUse = useCallback(async (featureName: string, metadata?: Record<string, unknown>) => {
    await trackEvent({
      eventType: 'feature_use',
      eventName: featureName,
      metadata,
    });
  }, [trackEvent]);

  return (
    <AnalyticsContext.Provider value={{ trackEvent, trackPageView, trackClick, trackFeatureUse }}>
      {children}
    </AnalyticsContext.Provider>
  );
}

export function useAnalytics() {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
}
