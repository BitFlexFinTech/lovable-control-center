import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface SupabaseUser {
  id: string;
  user_id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
  roles: { role: string; tenant_id: string | null }[];
}

export function useSupabaseUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: async (): Promise<SupabaseUser[]> => {
      // Fetch profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch user roles
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*');

      if (rolesError) throw rolesError;

      // Map profiles with their roles
      return (profiles || []).map(profile => ({
        id: profile.id,
        user_id: profile.user_id,
        email: profile.email,
        full_name: profile.full_name,
        avatar_url: profile.avatar_url,
        created_at: profile.created_at,
        updated_at: profile.updated_at,
        roles: (roles || [])
          .filter(r => r.user_id === profile.user_id)
          .map(r => ({ role: r.role, tenant_id: r.tenant_id })),
      }));
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useSupabaseUserCount() {
  return useQuery({
    queryKey: ['users-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      if (error) throw error;
      return count || 0;
    },
    staleTime: 1000 * 60 * 5,
  });
}
