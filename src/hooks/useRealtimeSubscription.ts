import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';

type TableName = 'sites' | 'tenants' | 'profiles' | 'user_roles';

interface UseRealtimeOptions {
  table: TableName;
  queryKey: string[];
  enabled?: boolean;
}

export const useRealtimeSubscription = ({ 
  table, 
  queryKey, 
  enabled = true 
}: UseRealtimeOptions) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!enabled) return;

    let channel: RealtimeChannel;

    const setupSubscription = () => {
      channel = supabase
        .channel(`${table}-changes`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: table,
          },
          (payload) => {
            // Invalidate the query to refetch data
            queryClient.invalidateQueries({ queryKey });

            // Optimistic update for INSERT
            if (payload.eventType === 'INSERT') {
              queryClient.setQueryData(queryKey, (old: any[] | undefined) => {
                if (!old) return [payload.new];
                return [payload.new, ...old];
              });
            }

            // Optimistic update for UPDATE
            if (payload.eventType === 'UPDATE') {
              queryClient.setQueryData(queryKey, (old: any[] | undefined) => {
                if (!old) return old;
                return old.map((item) =>
                  item.id === payload.new.id ? payload.new : item
                );
              });
            }

            // Optimistic update for DELETE
            if (payload.eventType === 'DELETE') {
              queryClient.setQueryData(queryKey, (old: any[] | undefined) => {
                if (!old) return old;
                return old.filter((item) => item.id !== payload.old.id);
              });
            }
          }
        )
        .subscribe();
    };

    setupSubscription();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [table, queryKey, enabled, queryClient]);
};

// Hook for subscribing to multiple tables
export const useMultipleRealtimeSubscriptions = (
  subscriptions: UseRealtimeOptions[]
) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channels: RealtimeChannel[] = [];

    subscriptions.forEach(({ table, queryKey, enabled = true }) => {
      if (!enabled) return;

      const channel = supabase
        .channel(`${table}-changes-${Date.now()}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: table,
          },
          () => {
            queryClient.invalidateQueries({ queryKey });
          }
        )
        .subscribe();

      channels.push(channel);
    });

    return () => {
      channels.forEach((channel) => {
        supabase.removeChannel(channel);
      });
    };
  }, [subscriptions, queryClient]);
};
