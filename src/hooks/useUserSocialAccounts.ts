import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface UserSocialAccount {
  id: string;
  user_id: string;
  platform: string;
  username: string | null;
  display_name: string | null;
  profile_image_url: string | null;
  is_connected: boolean;
  connected_at: string;
  last_synced_at: string | null;
}

export type SocialPlatform = 'twitter' | 'instagram' | 'linkedin' | 'facebook' | 'tiktok' | 'youtube';

export const SOCIAL_PLATFORMS: Record<SocialPlatform, { name: string; icon: string; color: string }> = {
  twitter: { name: 'X (Twitter)', icon: '𝕏', color: '#000000' },
  instagram: { name: 'Instagram', icon: '📷', color: '#E4405F' },
  linkedin: { name: 'LinkedIn', icon: '💼', color: '#0A66C2' },
  facebook: { name: 'Facebook', icon: '📘', color: '#1877F2' },
  tiktok: { name: 'TikTok', icon: '🎵', color: '#000000' },
  youtube: { name: 'YouTube', icon: '▶️', color: '#FF0000' },
};

export function useUserSocialAccounts() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['user-social-accounts', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('user_social_accounts')
        .select('*')
        .eq('user_id', user.id)
        .order('connected_at', { ascending: false });
      
      if (error) throw error;
      return data as UserSocialAccount[];
    },
    enabled: !!user?.id,
  });
}

export function useConnectSocialAccount() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      platform, 
      username, 
      displayName,
      profileImageUrl 
    }: { 
      platform: SocialPlatform; 
      username: string;
      displayName?: string;
      profileImageUrl?: string;
    }) => {
      if (!user?.id) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('user_social_accounts')
        .upsert({
          user_id: user.id,
          platform,
          username,
          display_name: displayName || username,
          profile_image_url: profileImageUrl,
          is_connected: true,
          connected_at: new Date().toISOString(),
        }, { onConflict: 'user_id,platform' })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-social-accounts'] });
    },
  });
}

export function useDisconnectSocialAccount() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (accountId: string) => {
      const { error } = await supabase
        .from('user_social_accounts')
        .update({ is_connected: false })
        .eq('id', accountId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-social-accounts'] });
    },
  });
}
