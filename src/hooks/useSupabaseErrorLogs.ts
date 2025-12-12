import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';

export interface ErrorLog {
  id: string;
  level: string;
  message: string;
  component: string | null;
  stack_trace: string | null;
  metadata: Json;
  created_at: string;
}

export function useErrorLogs(levelFilter?: string) {
  return useQuery({
    queryKey: ['error-logs', levelFilter],
    queryFn: async () => {
      let query = supabase
        .from('error_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (levelFilter && levelFilter !== 'all') {
        query = query.eq('level', levelFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as ErrorLog[];
    },
  });
}

export async function logError(
  level: 'info' | 'warning' | 'error' | 'critical',
  message: string,
  component?: string,
  metadata?: Json
) {
  const { error } = await supabase.from('error_logs').insert([{
    level,
    message,
    component: component || null,
    metadata: metadata || {},
  }]);
  if (error) console.error('Failed to log error:', error);
}
