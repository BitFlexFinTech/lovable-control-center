import { Check, X } from 'lucide-react';
import { useRolePermissions, useUpdateRolePermission } from '@/hooks/useSupabaseQuery';
import { usePermissions } from '@/hooks/usePermissions';
import { cn } from '@/lib/utils';
import { Database } from '@/integrations/supabase/types';

type AppRole = Database['public']['Enums']['app_role'];

const FEATURES = [
  { key: 'sites', label: 'Sites' },
  { key: 'tenants', label: 'Tenants' },
  { key: 'users', label: 'Users' },
  { key: 'roles', label: 'Roles' },
  { key: 'billing', label: 'Billing' },
  { key: 'audit_logs', label: 'Audit Logs' },
  { key: 'integrations', label: 'Integrations' },
  { key: 'passwords', label: 'Passwords' },
  { key: 'mail', label: 'Mail' },
];

const ACTIONS = [
  { key: 'can_read', label: 'Read' },
  { key: 'can_create', label: 'Create' },
  { key: 'can_update', label: 'Update' },
  { key: 'can_delete', label: 'Delete' },
];

const ROLES: AppRole[] = ['super_admin', 'admin', 'editor'];

const ROLE_LABELS: Record<AppRole, string> = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  editor: 'Editor',
};

export const PermissionMatrixEditor = () => {
  const { data: permissions, isLoading } = useRolePermissions();
  const updatePermission = useUpdateRolePermission();
  const { isSuperAdmin } = usePermissions();

  const getPermission = (role: AppRole, feature: string) => {
    return permissions?.find((p) => p.role === role && p.feature === feature);
  };

  const togglePermission = (permId: string, action: keyof typeof ACTIONS[number], currentValue: boolean) => {
    if (!isSuperAdmin) return;
    updatePermission.mutate({ id: permId, [action]: !currentValue });
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-muted rounded w-1/4" />
        <div className="h-64 bg-muted rounded" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Permission Matrix</h3>
        <p className="text-sm text-muted-foreground">
          Configure what each role can access across all features
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 font-medium text-muted-foreground">Feature</th>
              {ROLES.map((role) => (
                <th key={role} colSpan={4} className="text-center py-3 px-2 font-medium">
                  <span className={cn(
                    "inline-block px-3 py-1 rounded-full text-xs",
                    role === 'super_admin' && "bg-status-active/10 text-status-active",
                    role === 'admin' && "bg-primary/10 text-primary",
                    role === 'editor' && "bg-muted text-muted-foreground"
                  )}>
                    {ROLE_LABELS[role]}
                  </span>
                </th>
              ))}
            </tr>
            <tr className="border-b border-border bg-muted/30">
              <th className="py-2 px-4" />
              {ROLES.map((role) => (
                ACTIONS.map((action) => (
                  <th key={`${role}-${action.key}`} className="py-2 px-1 text-[10px] text-muted-foreground font-normal">
                    {action.label}
                  </th>
                ))
              ))}
            </tr>
          </thead>
          <tbody>
            {FEATURES.map((feature) => (
              <tr key={feature.key} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                <td className="py-3 px-4 font-medium">{feature.label}</td>
                {ROLES.map((role) => {
                  const perm = getPermission(role, feature.key);
                  if (!perm) return ACTIONS.map((a) => <td key={`${role}-${a.key}`} className="py-3 px-1 text-center">-</td>);
                  
                  return ACTIONS.map((action) => {
                    const hasPermission = perm[action.key as keyof typeof perm] as boolean;
                    const isSuperAdminPerm = role === 'super_admin';
                    
                    return (
                      <td key={`${role}-${action.key}`} className="py-3 px-1 text-center">
                        <button
                          onClick={() => !isSuperAdminPerm && togglePermission(perm.id, action.key as any, hasPermission)}
                          disabled={isSuperAdminPerm || !isSuperAdmin || updatePermission.isPending}
                          className={cn(
                            "w-7 h-7 rounded-md flex items-center justify-center transition-all",
                            hasPermission 
                              ? "bg-status-active/20 text-status-active" 
                              : "bg-muted text-muted-foreground",
                            !isSuperAdminPerm && isSuperAdmin && "hover:scale-110 cursor-pointer",
                            (isSuperAdminPerm || !isSuperAdmin) && "opacity-60 cursor-not-allowed"
                          )}
                        >
                          {hasPermission ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                        </button>
                      </td>
                    );
                  });
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!isSuperAdmin && (
        <p className="text-sm text-muted-foreground italic">
          Only Super Admins can modify role permissions
        </p>
      )}
    </div>
  );
};