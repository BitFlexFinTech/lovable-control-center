import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useSupabaseQuery';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface OnlineAdmin {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  online_at: string;
}

export const useAdminPresence = () => {
  const { user } = useAuth();
  const { data: profile } = useProfile(user?.id || '');
  const [onlineAdmins, setOnlineAdmins] = useState<OnlineAdmin[]>([]);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!user) return;

    const presenceChannel = supabase.channel('admin_presence', {
      config: {
        presence: {
          key: user.id,
        },
      },
    });

    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState();
        const admins: OnlineAdmin[] = [];
        
        Object.entries(state).forEach(([userId, presences]) => {
          const presence = (presences as any[])[0];
          if (presence) {
            admins.push({
              id: userId,
              email: presence.email,
              full_name: presence.full_name,
              avatar_url: presence.avatar_url,
              online_at: presence.online_at,
            });
          }
        });
        
        setOnlineAdmins(admins);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        const presence = newPresences[0];
        if (presence && key) {
          setOnlineAdmins((prev) => {
            const exists = prev.find((a) => a.id === key);
            if (exists) return prev;
            return [...prev, {
              id: key,
              email: presence.email,
              full_name: presence.full_name,
              avatar_url: presence.avatar_url,
              online_at: presence.online_at,
            }];
          });
        }
      })
      .on('presence', { event: 'leave' }, ({ key }) => {
        if (key) {
          setOnlineAdmins((prev) => prev.filter((a) => a.id !== key));
        }
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await presenceChannel.track({
            email: user.email,
            full_name: profile?.full_name,
            avatar_url: profile?.avatar_url,
            online_at: new Date().toISOString(),
          });
        }
      });

    setChannel(presenceChannel);

    return () => {
      presenceChannel.unsubscribe();
    };
  }, [user, profile]);

  return {
    onlineAdmins,
    isConnected: !!channel,
  };
};