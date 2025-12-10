import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Database } from '@/integrations/supabase/types';

type AppRole = Database['public']['Enums']['app_role'];

// Sites hooks
export const useSites = () => {
  return useQuery({
    queryKey: ['sites'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sites')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });
};

export const useSite = (id: string) => {
  return useQuery({
    queryKey: ['sites', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sites')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
};

export const useCreateSite = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (site: { name: string; domain?: string; tenant_id?: string; status?: string }) => {
      const { data, error } = await supabase
        .from('sites')
        .insert(site)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sites'] });
      toast({ title: 'Success', description: 'Site created successfully' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to create site', variant: 'destructive' });
    },
  });
};

export const useDeleteSite = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('sites').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sites'] });
      toast({ title: 'Success', description: 'Site deleted successfully' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to delete site', variant: 'destructive' });
    },
  });
};

// Tenants hooks
export const useTenants = () => {
  return useQuery({
    queryKey: ['tenants'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tenants')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });
};

export const useTenant = (id: string) => {
  return useQuery({
    queryKey: ['tenants', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tenants')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
};

export const useCreateTenant = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (tenant: { name: string; slug: string; environment?: string }) => {
      const { data, error } = await supabase
        .from('tenants')
        .insert(tenant)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      toast({ title: 'Success', description: 'Tenant created successfully' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to create tenant', variant: 'destructive' });
    },
  });
};

export const useDeleteTenant = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('tenants').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      toast({ title: 'Success', description: 'Tenant deleted successfully' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to delete tenant', variant: 'destructive' });
    },
  });
};

// Profiles hooks
export const useProfiles = () => {
  return useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });
};

export const useProfile = (userId: string) => {
  return useQuery({
    queryKey: ['profiles', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
};

// User roles hooks
export const useUserRoles = (userId?: string) => {
  return useQuery({
    queryKey: ['user_roles', userId],
    queryFn: async () => {
      let query = supabase.from('user_roles').select('*');
      if (userId) query = query.eq('user_id', userId);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
};

// Users with roles view
export const useUsersWithRoles = () => {
  return useQuery({
    queryKey: ['users_with_roles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('get_users_with_roles' as any)
        .select('*');
      
      if (error) {
        // Fallback to manual join
        const { data: profiles } = await supabase.from('profiles').select('*');
        const { data: roles } = await supabase.from('user_roles').select('*');
        
        return (profiles || []).map(p => ({
          ...p,
          roles: (roles || []).filter(r => r.user_id === p.user_id),
        }));
      }
      return data as any;
    },
  });
};

// Audit logs hooks with pagination
export const useAuditLogs = (pageSize = 20) => {
  return useInfiniteQuery({
    queryKey: ['audit_logs'],
    queryFn: async ({ pageParam = 0 }) => {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .range(pageParam * pageSize, (pageParam + 1) * pageSize - 1);
      
      if (error) throw error;
      return { data, nextPage: data.length === pageSize ? pageParam + 1 : undefined };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 0,
  });
};

export const useCreateAuditLog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (log: {
      action: string;
      resource: string;
      resource_id?: string;
      tenant_id?: string;
      details?: Record<string, any>;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('audit_logs')
        .insert({ ...log, user_id: user?.id })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['audit_logs'] });
    },
  });
};

// Notifications hooks
export const useNotifications = (userId?: string) => {
  return useQuery({
    queryKey: ['notifications', userId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const targetUserId = userId || user?.id;
      if (!targetUserId) return [];

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', targetUserId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: true,
  });
};

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

// Role permissions hooks
export const useRolePermissions = () => {
  return useQuery({
    queryKey: ['role_permissions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('role_permissions' as any)
        .select('*')
        .order('role', { ascending: true }) as any;
      
      if (error) throw error;
      return data as Array<{
        id: string;
        role: AppRole;
        feature: string;
        can_read: boolean;
        can_create: boolean;
        can_update: boolean;
        can_delete: boolean;
        created_at: string;
        updated_at: string;
      }>;
    },
  });
};

export const useUpdateRolePermission = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; can_read?: boolean; can_create?: boolean; can_update?: boolean; can_delete?: boolean }) => {
      const { data, error } = await supabase
        .from('role_permissions' as any)
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['role_permissions'] });
      toast({ title: 'Success', description: 'Permission updated' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to update permission', variant: 'destructive' });
    },
  });
};

// Check permission hook
export const useCheckPermission = (feature: string, action: 'read' | 'create' | 'update' | 'delete') => {
  return useQuery({
    queryKey: ['check_permission', feature, action],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data, error } = await supabase.rpc('check_permission', {
        _user_id: user.id,
        _feature: feature,
        _action: action,
      });
      
      if (error) return false;
      return data as boolean;
    },
  });
};

// Mutation hooks with optimistic updates
export const useUpdateSite = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; [key: string]: any }) => {
      const { data, error } = await supabase
        .from('sites')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onMutate: async ({ id, ...updates }) => {
      await queryClient.cancelQueries({ queryKey: ['sites'] });
      const previousSites = queryClient.getQueryData(['sites']);
      queryClient.setQueryData(['sites'], (old: any[]) =>
        old?.map(site => site.id === id ? { ...site, ...updates } : site)
      );
      return { previousSites };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(['sites'], context?.previousSites);
      toast({ title: 'Error', description: 'Failed to update site', variant: 'destructive' });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['sites'] });
    },
  });
};

// Impersonation hooks
export const useImpersonationSessions = () => {
  return useQuery({
    queryKey: ['impersonation_sessions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_impersonation_sessions' as any)
        .select('*')
        .eq('is_active', true)
        .order('started_at', { ascending: false }) as any;
      
      if (error) throw error;
      return (data || []) as Array<{
        id: string;
        admin_user_id: string;
        impersonated_role: AppRole;
        started_at: string;
        ended_at: string | null;
        reason: string | null;
        is_active: boolean;
      }>;
    },
  });
};

export const useStartImpersonation = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ role, reason }: { role: AppRole; reason?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('admin_impersonation_sessions' as any)
        .insert({
          admin_user_id: user.id,
          impersonated_role: role,
          reason,
        })
        .select()
        .single() as any;
      
      if (error) throw error;
      return data as { id: string; impersonated_role: AppRole };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['impersonation_sessions'] });
      toast({ title: 'Impersonation Started', description: `Now viewing as ${data.impersonated_role}` });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to start impersonation', variant: 'destructive' });
    },
  });
};

export const useEndImpersonation = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (sessionId: string) => {
      const { error } = await supabase
        .from('admin_impersonation_sessions' as any)
        .update({ is_active: false })
        .eq('id', sessionId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['impersonation_sessions'] });
      toast({ title: 'Impersonation Ended', description: 'Returned to your normal view' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to end impersonation', variant: 'destructive' });
    },
  });
};