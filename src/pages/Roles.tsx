import { Shield, Users, Eye, Edit, Trash2, Plus } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const roles = [
  {
    id: 'owner',
    name: 'Owner',
    description: 'Full access to all tenants, sites, and settings',
    color: 'active',
    permissions: ['read', 'write', 'delete', 'admin', 'billing'],
    userCount: 1,
  },
  {
    id: 'admin',
    name: 'Admin',
    description: 'Manage assigned tenants and their sites',
    color: 'default',
    permissions: ['read', 'write', 'delete', 'admin'],
    userCount: 1,
  },
  {
    id: 'editor',
    name: 'Editor',
    description: 'Content-only access to assigned sites',
    color: 'muted',
    permissions: ['read', 'write'],
    userCount: 1,
  },
];

const allPermissions = [
  { key: 'read', label: 'Read', icon: Eye },
  { key: 'write', label: 'Write', icon: Edit },
  { key: 'delete', label: 'Delete', icon: Trash2 },
  { key: 'admin', label: 'Admin', icon: Shield },
  { key: 'billing', label: 'Billing', icon: Users },
];

const Roles = () => {
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
          <Button size="sm" className="gap-1.5">
            <Plus className="h-3.5 w-3.5" />
            Create Role
          </Button>
        </div>
      </div>

      {/* Roles Grid */}
      <div className="grid gap-4">
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
                {role.userCount} user{role.userCount !== 1 ? 's' : ''}
              </Badge>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-muted-foreground mr-2">Permissions:</span>
              {allPermissions.map((perm) => {
                const hasPermission = role.permissions.includes(perm.key);
                return (
                  <Badge
                    key={perm.key}
                    variant={hasPermission ? 'secondary' : 'outline'}
                    className={cn(
                      "gap-1",
                      !hasPermission && "opacity-40"
                    )}
                  >
                    <perm.icon className="h-3 w-3" />
                    {perm.label}
                  </Badge>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
};

export default Roles;
