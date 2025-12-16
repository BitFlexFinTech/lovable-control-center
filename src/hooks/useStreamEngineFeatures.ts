import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { 
  YouTubeChannelHealth, 
  YouTubeCrisisEvent, 
  YouTubeBrandDeal,
  YouTubeCollaboration,
  YouTubeVideoIdea,
  YouTubeLiveStream
} from '@/types/streamengine';

// Channel Health
export function useChannelHealth(channelId?: string) {
  return useQuery({
    queryKey: ['youtube-health', channelId],
    queryFn: async () => {
      if (!channelId) return null;
      
      const { data, error } = await supabase
        .from('youtube_channel_health')
        .select('*')
        .eq('channel_id', channelId)
        .order('calculated_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (error) throw error;
      if (!data) return null;
      
      return {
        id: data.id,
        channelId: data.channel_id,
        overallGrade: data.overall_grade || 'C',
        overallScore: data.overall_score || 50,
        seoScore: data.seo_score || 0,
        audienceScore: data.audience_score || 0,
        monetizationScore: data.monetization_score || 0,
        contentScore: data.content_score || 0,
        engagementScore: data.engagement_score || 0,
        growthScore: data.growth_score || 0,
        consistencyScore: data.consistency_score || 0,
        categoryBreakdown: (data.category_breakdown as Record<string, unknown>) || {},
        recommendations: (data.recommendations as unknown[]) || [],
        quickWins: (data.quick_wins as unknown[]) || [],
        calculatedAt: data.calculated_at,
        createdAt: data.created_at,
      } as unknown as YouTubeChannelHealth;
    },
    enabled: !!channelId,
  });
}

// Crisis Events
export function useCrisisEvents(channelId?: string, status?: string) {
  return useQuery({
    queryKey: ['youtube-crises', channelId, status],
    queryFn: async () => {
      let query = supabase
        .from('youtube_crisis_events')
        .select('*')
        .order('detected_at', { ascending: false });
      
      if (channelId) query = query.eq('channel_id', channelId);
      if (status) query = query.eq('status', status);
      
      const { data, error } = await query;
      if (error) throw error;
      
      return (data || []).map(c => ({
        id: c.id,
        channelId: c.channel_id,
        videoId: c.video_id,
        severity: c.severity,
        type: c.type,
        title: c.title,
        description: c.description,
        detectedAt: c.detected_at,
        resolvedAt: c.resolved_at,
        status: c.status || 'active',
        sentimentScore: Number(c.sentiment_score) || 0,
        dislikeRatio: Number(c.dislike_ratio) || 0,
        negativeCommentCount: c.negative_comment_count || 0,
        responseRecommendations: (c.response_recommendations as unknown[]) || [],
        actionsTaken: (c.actions_taken as string[]) || [],
        escalationLevel: c.escalation_level || 1,
        assignedPersonaId: c.assigned_persona_id,
        createdAt: c.created_at,
        updatedAt: c.updated_at,
      })) as unknown as YouTubeCrisisEvent[];
    },
  });
}

// Brand Deals
export function useBrandDeals(channelId?: string) {
  return useQuery({
    queryKey: ['youtube-deals', channelId],
    queryFn: async () => {
      let query = supabase
        .from('youtube_brand_deals')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (channelId) query = query.eq('channel_id', channelId);
      
      const { data, error } = await query;
      if (error) throw error;
      
      return (data || []).map(d => ({
        id: d.id,
        channelId: d.channel_id,
        brandName: d.brand_name,
        brandLogoUrl: d.brand_logo_url,
        brandWebsite: d.brand_website,
        contactName: d.contact_name,
        contactEmail: d.contact_email,
        status: d.status,
        dealType: d.deal_type || 'sponsored_video',
        rateOfferedCents: d.rate_offered_cents || 0,
        rateNegotiatedCents: d.rate_negotiated_cents || 0,
        deliverables: (d.deliverables as unknown[]) || [],
        contractUrl: d.contract_url,
        contractSignedAt: d.contract_signed_at,
        startDate: d.start_date,
        endDate: d.end_date,
        paymentTerms: d.payment_terms,
        paymentStatus: d.payment_status || 'pending',
        notes: d.notes,
        assignedPersonaId: d.assigned_persona_id,
        createdAt: d.created_at,
        updatedAt: d.updated_at,
      })) as unknown as YouTubeBrandDeal[];
    },
  });
}

// Collaborations
export function useCollaborations(channelId?: string) {
  return useQuery({
    queryKey: ['youtube-collabs', channelId],
    queryFn: async () => {
      let query = supabase
        .from('youtube_collaborations')
        .select('*')
        .order('compatibility_score', { ascending: false });
      
      if (channelId) query = query.eq('channel_id', channelId);
      
      const { data, error } = await query;
      if (error) throw error;
      
      return (data || []).map(c => ({
        id: c.id,
        channelId: c.channel_id,
        partnerChannelId: c.partner_channel_id,
        partnerChannelName: c.partner_channel_name,
        partnerSubscriberCount: c.partner_subscriber_count || 0,
        partnerThumbnailUrl: c.partner_thumbnail_url,
        status: c.status,
        compatibilityScore: c.compatibility_score || 0,
        audienceOverlapPercent: Number(c.audience_overlap_percent) || 0,
        contentSynergyScore: c.content_synergy_score || 0,
        growthPotentialScore: c.growth_potential_score || 0,
        collabType: c.collab_type,
        proposedConcept: c.proposed_concept,
        outreachMessage: c.outreach_message,
        responseReceived: c.response_received || false,
        scheduledDate: c.scheduled_date,
        videoId: c.video_id,
        results: (c.results as Record<string, unknown>) || {},
        assignedPersonaId: c.assigned_persona_id,
        createdAt: c.created_at,
        updatedAt: c.updated_at,
      })) as unknown as YouTubeCollaboration[];
    },
  });
}

// Video Ideas
export function useVideoIdeas(channelId?: string, status?: string) {
  return useQuery({
    queryKey: ['youtube-ideas', channelId, status],
    queryFn: async () => {
      let query = supabase
        .from('youtube_video_ideas')
        .select('*')
        .order('score', { ascending: false });
      
      if (channelId) query = query.eq('channel_id', channelId);
      if (status) query = query.eq('status', status);
      
      const { data, error } = await query;
      if (error) throw error;
      
      return (data || []).map(i => ({
        id: i.id,
        channelId: i.channel_id,
        title: i.title,
        description: i.description,
        source: i.source || 'ai_generated',
        sourceData: (i.source_data as Record<string, unknown>) || {},
        score: i.score || 50,
        estimatedViews: i.estimated_views || 0,
        estimatedCtr: Number(i.estimated_ctr) || 0,
        trendRelevance: i.trend_relevance || 0,
        audienceMatch: i.audience_match || 0,
        competitionLevel: i.competition_level || 'medium',
        tags: i.tags || [],
        keywords: i.keywords || [],
        thumbnailConcepts: (i.thumbnail_concepts as string[]) || [],
        status: i.status || 'new',
        promotedToCalendar: i.promoted_to_calendar || false,
        calendarId: i.calendar_id,
        createdAt: i.created_at,
        updatedAt: i.updated_at,
      })) as unknown as YouTubeVideoIdea[];
    },
  });
}

// Live Streams
export function useLiveStreams(channelId?: string) {
  return useQuery({
    queryKey: ['youtube-streams', channelId],
    queryFn: async () => {
      let query = supabase
        .from('youtube_live_streams')
        .select('*')
        .order('scheduled_start', { ascending: false });
      
      if (channelId) query = query.eq('channel_id', channelId);
      
      const { data, error } = await query;
      if (error) throw error;
      
      return (data || []).map(s => ({
        id: s.id,
        channelId: s.channel_id,
        videoId: s.video_id,
        streamId: s.stream_id,
        title: s.title,
        description: s.description,
        scheduledStart: s.scheduled_start,
        actualStart: s.actual_start,
        actualEnd: s.actual_end,
        status: s.status || 'scheduled',
        peakViewers: s.peak_viewers || 0,
        avgViewers: s.avg_viewers || 0,
        totalChatMessages: s.total_chat_messages || 0,
        totalSuperChatsCents: s.total_super_chats_cents || 0,
        totalMemberships: s.total_memberships || 0,
        highlights: (s.highlights as unknown[]) || [],
        moderationStats: (s.moderation_stats as Record<string, unknown>) || {},
        postStreamAnalytics: (s.post_stream_analytics as Record<string, unknown>) || {},
        assignedPersonaId: s.assigned_persona_id,
        createdAt: s.created_at,
        updatedAt: s.updated_at,
      })) as unknown as YouTubeLiveStream[];
    },
  });
}

// Mutations
export function useUpdateCrisisStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const updates: Record<string, unknown> = { status };
      if (status === 'resolved') {
        updates.resolved_at = new Date().toISOString();
      }
      
      const { error } = await supabase
        .from('youtube_crisis_events')
        .update(updates)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['youtube-crises'] });
    },
  });
}

export function usePromoteIdea() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ ideaId, newStatus }: { ideaId: string; newStatus: string }) => {
      const { error } = await supabase
        .from('youtube_video_ideas')
        .update({ 
          status: newStatus,
          promoted_to_calendar: newStatus === 'scheduled',
        })
        .eq('id', ideaId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['youtube-ideas'] });
    },
  });
}

export function useUpdateDealStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ dealId, status }: { dealId: string; status: string }) => {
      const { error } = await supabase
        .from('youtube_brand_deals')
        .update({ status: status as any })
        .eq('id', dealId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['youtube-deals'] });
    },
  });
}