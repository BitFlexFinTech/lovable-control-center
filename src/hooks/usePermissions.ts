import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Database } from '@/integrations/supabase/types';

type AppRole = Database['public']['Enums']['app_role'];

export type Feature = 
  | 'sites' 
  | 'tenants' 
  | 'users' 
  | 'roles' 
  | 'billing' 
  | 'audit_logs' 
  | 'integrations' 
  | 'passwords' 
  | 'mail';

export type Action = 'read' | 'create' | 'update' | 'delete';

interface Permission {
  can_read: boolean;
  can_create: boolean;
  can_update: boolean;
  can_delete: boolean;
}

export const usePermissions = () => {
  const { user } = useAuth();

  const { data: userRole } = useQuery({
    queryKey: ['user_role', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) return null;
      return data?.role as AppRole | null;
    },
    enabled: !!user?.id,
  });

  const { data: permissions } = useQuery({
    queryKey: ['role_permissions', userRole],
    queryFn: async () => {
      if (!userRole) return {};
      const { data, error } = await supabase
        .from('role_permissions' as any)
        .select('*')
        .eq('role', userRole);
      
      if (error) return {};
      
      const permMap: Record<string, Permission> = {};
      (data as any[])?.forEach((p) => {
        permMap[p.feature] = {
          can_read: p.can_read,
          can_create: p.can_create,
          can_update: p.can_update,
          can_delete: p.can_delete,
        };
      });
      return permMap;
    },
    enabled: !!userRole,
  });

  const hasPermission = (feature: Feature, action: Action): boolean => {
    // Super admin always has permission
    if (userRole === 'super_admin') return true;
    
    const featurePerms = permissions?.[feature];
    if (!featurePerms) return false;
    
    switch (action) {
      case 'read': return featurePerms.can_read;
      case 'create': return featurePerms.can_create;
      case 'update': return featurePerms.can_update;
      case 'delete': return featurePerms.can_delete;
      default: return false;
    }
  };

  const canRead = (feature: Feature) => hasPermission(feature, 'read');
  const canCreate = (feature: Feature) => hasPermission(feature, 'create');
  const canUpdate = (feature: Feature) => hasPermission(feature, 'update');
  const canDelete = (feature: Feature) => hasPermission(feature, 'delete');

  return {
    userRole,
    permissions,
    hasPermission,
    canRead,
    canCreate,
    canUpdate,
    canDelete,
    isSuperAdmin: userRole === 'super_admin',
    isAdmin: userRole === 'admin' || userRole === 'super_admin',
    isEditor: userRole === 'editor',
  };
};