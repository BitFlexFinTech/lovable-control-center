import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { YouTubeChannel, YouTubePersona, YouTubeVideo, YouTubeContentCalendarItem } from '@/types/streamengine';

// Fetch all YouTube channels for a site
export function useYouTubeChannels(siteId?: string) {
  return useQuery({
    queryKey: ['youtube-channels', siteId],
    queryFn: async () => {
      let query = supabase
        .from('youtube_channels')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (siteId) {
        query = query.eq('site_id', siteId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      
      return (data || []).map(ch => ({
        id: ch.id,
        siteId: ch.site_id,
        personaId: ch.persona_id,
        channelId: ch.channel_id,
        channelName: ch.channel_name,
        channelUrl: ch.channel_url,
        subscriberCount: ch.subscriber_count || 0,
        videoCount: ch.video_count || 0,
        viewCount: ch.view_count || 0,
        thumbnailUrl: ch.thumbnail_url,
        description: ch.description,
        country: ch.country,
        customUrl: ch.custom_url,
        keywords: ch.keywords || [],
        isVerified: ch.is_verified || false,
        isMonetized: ch.is_monetized || false,
        healthScore: ch.health_score || 0,
        lastSyncedAt: ch.last_synced_at,
        createdAt: ch.created_at,
        updatedAt: ch.updated_at,
      })) as YouTubeChannel[];
    },
    enabled: true,
  });
}

// Fetch single channel
export function useYouTubeChannel(channelId?: string) {
  return useQuery({
    queryKey: ['youtube-channel', channelId],
    queryFn: async () => {
      if (!channelId) return null;
      
      const { data, error } = await supabase
        .from('youtube_channels')
        .select('*')
        .eq('id', channelId)
        .single();
      
      if (error) throw error;
      
      return {
        id: data.id,
        siteId: data.site_id,
        personaId: data.persona_id,
        channelId: data.channel_id,
        channelName: data.channel_name,
        channelUrl: data.channel_url,
        subscriberCount: data.subscriber_count || 0,
        videoCount: data.video_count || 0,
        viewCount: data.view_count || 0,
        thumbnailUrl: data.thumbnail_url,
        description: data.description,
        country: data.country,
        customUrl: data.custom_url,
        keywords: data.keywords || [],
        isVerified: data.is_verified || false,
        isMonetized: data.is_monetized || false,
        healthScore: data.health_score || 0,
        lastSyncedAt: data.last_synced_at,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      } as YouTubeChannel;
    },
    enabled: !!channelId,
  });
}

// Fetch YouTube personas
export function useYouTubePersonas(channelId?: string) {
  return useQuery({
    queryKey: ['youtube-personas', channelId],
    queryFn: async () => {
      let query = supabase
        .from('youtube_personas')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (channelId) {
        query = query.eq('channel_id', channelId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      
      return (data || []).map(p => ({
        id: p.id,
        siteId: p.site_id,
        basePersonaId: p.base_persona_id,
        channelId: p.channel_id,
        role: p.role,
        name: p.name,
        avatarUrl: p.avatar_url,
        systemPrompt: p.system_prompt,
        capabilities: p.capabilities || [],
        dailySchedule: p.daily_schedule || {},
        performanceMetrics: p.performance_metrics || {},
        status: p.status || 'active',
        createdAt: p.created_at,
        updatedAt: p.updated_at,
      })) as YouTubePersona[];
    },
  });
}

// Fetch videos for a channel
export function useYouTubeVideos(channelId?: string) {
  return useQuery({
    queryKey: ['youtube-videos', channelId],
    queryFn: async () => {
      if (!channelId) return [];
      
      const { data, error } = await supabase
        .from('youtube_videos')
        .select('*')
        .eq('channel_id', channelId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return (data || []).map(v => ({
        id: v.id,
        channelId: v.channel_id,
        videoId: v.video_id,
        title: v.title,
        description: v.description,
        thumbnailUrl: v.thumbnail_url,
        status: v.status,
        publishedAt: v.published_at,
        durationSeconds: v.duration_seconds,
        viewCount: v.view_count || 0,
        likeCount: v.like_count || 0,
        dislikeCount: v.dislike_count || 0,
        commentCount: v.comment_count || 0,
        tags: v.tags || [],
        categoryId: v.category_id,
        isMonetized: v.is_monetized || false,
        isShorts: v.is_shorts || false,
        seoScore: v.seo_score || 0,
        engagementRate: v.engagement_rate || 0,
        ctr: v.ctr || 0,
        avgViewDuration: v.avg_view_duration || 0,
        createdAt: v.created_at,
        updatedAt: v.updated_at,
      })) as YouTubeVideo[];
    },
    enabled: !!channelId,
  });
}

// Fetch content calendar
export function useYouTubeContentCalendar(channelId?: string) {
  return useQuery({
    queryKey: ['youtube-calendar', channelId],
    queryFn: async () => {
      if (!channelId) return [];
      
      const { data, error } = await supabase
        .from('youtube_content_calendar')
        .select('*')
        .eq('channel_id', channelId)
        .order('scheduled_date', { ascending: true });
      
      if (error) throw error;
      
      return (data || []).map(c => ({
        id: c.id,
        channelId: c.channel_id,
        videoId: c.video_id,
        personaId: c.persona_id,
        title: c.title,
        description: c.description,
        scheduledDate: c.scheduled_date,
        scheduledTime: c.scheduled_time,
        status: c.status,
        contentType: c.content_type || 'video',
        priority: c.priority || 'medium',
        notes: c.notes,
        checklist: c.checklist || [],
        assignedPersonas: c.assigned_personas || [],
        createdAt: c.created_at,
        updatedAt: c.updated_at,
      })) as YouTubeContentCalendarItem[];
    },
    enabled: !!channelId,
  });
}

// Alias for backward compatibility
export const useContentCalendar = useYouTubeContentCalendar;

// Add channel mutation
export function useAddYouTubeChannel() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (channel: Partial<YouTubeChannel>) => {
      const { data, error } = await supabase
        .from('youtube_channels')
        .insert({
          site_id: channel.siteId,
          channel_id: channel.channelId,
          channel_name: channel.channelName,
          channel_url: channel.channelUrl,
          subscriber_count: channel.subscriberCount || 0,
          thumbnail_url: channel.thumbnailUrl,
          description: channel.description,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['youtube-channels'] });
    },
  });
}
