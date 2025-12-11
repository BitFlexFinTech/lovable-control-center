import { Shield, Users, Plus } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { PermissionMatrixEditor } from '@/components/roles/PermissionMatrixEditor';
import { PermissionGate } from '@/components/permissions/PermissionGate';
import { useUserRoles } from '@/hooks/useSupabaseQuery';
import { usePermissions } from '@/hooks/usePermissions';
import { cn } from '@/lib/utils';

const ROLE_DISPLAY = {
  super_admin: { name: 'Super Admin', description: 'Full access to all tenants, sites, and settings', color: 'active' },
  admin: { name: 'Admin', description: 'Manage assigned tenants and their sites', color: 'default' },
  editor: { name: 'Editor', description: 'Content-only access to assigned sites', color: 'muted' },
};

const Roles = () => {
  const { data: userRoles = [], isLoading } = useUserRoles();
  const { isSuperAdmin } = usePermissions();

  // Count users per role
  const roleCounts = userRoles.reduce((acc, ur) => {
    acc[ur.role] = (acc[ur.role] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const roles = Object.entries(ROLE_DISPLAY).map(([key, value]) => ({
    id: key,
    ...value,
    userCount: roleCounts[key] || 0,
  }));

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-8 opacity-0 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Roles</h1>
            <p className="text-muted-foreground mt-1">
              Configure role-based access control for your organization
            </p>
          </div>
          <PermissionGate feature="roles" action="create">
            <Button size="sm" className="gap-1.5">
              <Plus className="h-3.5 w-3.5" />
              Create Role
            </Button>
          </PermissionGate>
        </div>
      </div>

      {/* Roles Grid */}
      <div className="grid gap-4 mb-8">
        {roles.map((role, index) => (
          <div 
            key={role.id}
            className="rounded-xl border border-border bg-card p-6 opacity-0 animate-slide-up hover:border-primary/30 transition-colors"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "p-2 rounded-lg",
                  role.color === 'active' && "bg-status-active/10 text-status-active",
                  role.color === 'default' && "bg-primary/10 text-primary",
                  role.color === 'muted' && "bg-muted text-muted-foreground"
                )}>
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold">{role.name}</h3>
                  <p className="text-sm text-muted-foreground">{role.description}</p>
                </div>
              </div>
              <Badge variant="muted">
                <Users className="h-3 w-3 mr-1" />
                {role.userCount} user{role.userCount !== 1 ? 's' : ''}
              </Badge>
            </div>
          </div>
        ))}
      </div>

      {/* Permission Matrix Editor */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-muted-foreground">Permission Matrix</span>
          <Separator className="flex-1" />
        </div>
        <PermissionMatrixEditor />
      </div>
    </DashboardLayout>
  );
};

export default Roles;