import { useState } from 'react';
import { Plus, MoreHorizontal, Mail, Shield, Search, Building2, Zap } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PermissionGate } from '@/components/permissions/PermissionGate';
import { cn } from '@/lib/utils';
import { useSupabaseUsers } from '@/hooks/useSupabaseUsers';
import { useTenants } from '@/hooks/useSupabaseTenants';
import { useSites } from '@/hooks/useSupabaseSites';
import { Skeleton } from '@/components/ui/skeleton';

const roleColors = {
  owner: 'active',
  admin: 'default',
  editor: 'muted',
  super_admin: 'active',
} as const;

const Users = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'control-center' | 'apps'>('all');
  const [environmentFilter, setEnvironmentFilter] = useState<'all' | 'sandbox' | 'live'>('all');
  const [appFilter, setAppFilter] = useState<string>('all');

  const { data: supabaseUsers = [], isLoading: usersLoading } = useSupabaseUsers();
  const { data: tenants = [], isLoading: tenantsLoading } = useTenants();
  const { data: sites = [], isLoading: sitesLoading } = useSites();

  const isLoading = usersLoading || tenantsLoading || sitesLoading;

  // Transform Supabase users to display format
  const users = supabaseUsers.map(u => ({
    id: u.id,
    email: u.email || '',
    name: u.full_name || u.email || 'Unknown',
    avatar: u.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.email}`,
    role: (u.roles[0]?.role || 'editor') as 'owner' | 'admin' | 'editor',
    tenantAssignments: u.roles.map(r => r.tenant_id).filter(Boolean) as string[],
    lastActive: u.updated_at,
    createdAt: u.created_at,
    source: 'control-center' as const,
    environment: 'live' as const,
  }));

  // Get unique apps from sites
  const uniqueApps = sites.map(site => ({
    id: site.id,
    name: site.name,
    color: site.app_color,
  }));

  const filteredUsers = users.filter(user => {
    // Tab filter - control center users only for now
    if (activeTab === 'apps') return false; // No app users yet

    // Search filter
    return user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           user.email.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Group users by source/app
  const controlCenterUsers = filteredUsers.filter(u => u.source === 'control-center');

  const getTenantNames = (tenantIds: string[]) => {
    return tenantIds.map(id => tenants.find(t => t.id === id)?.name || 'Unknown');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const ccCount = users.filter(u => u.source === 'control-center').length;
  const appCount = 0; // App users not implemented yet

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="mb-8">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-8 opacity-0 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
            <p className="text-muted-foreground mt-1">
              Manage user access across Control Center and Apps
            </p>
          </div>
          <PermissionGate feature="users" action="create">
            <Button size="sm" className="gap-1.5">
              <Plus className="h-3.5 w-3.5" />
              Invite User
            </Button>
          </PermissionGate>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="mb-6">
        <TabsList>
          <TabsTrigger value="all" className="gap-2">
            All Users
            <Badge variant="secondary" className="text-xs">{users.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="control-center" className="gap-2">
            <Zap className="h-3.5 w-3.5" />
            Control Center
            <Badge variant="secondary" className="text-xs">{ccCount}</Badge>
          </TabsTrigger>
          <TabsTrigger value="apps" className="gap-2">
            <Building2 className="h-3.5 w-3.5" />
            App Users
            <Badge variant="secondary" className="text-xs">{appCount}</Badge>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Filters */}
      <div className="mb-6 flex items-center gap-3 opacity-0 animate-slide-up" style={{ animationDelay: '50ms' }}>
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9 pl-9 pr-4 bg-secondary border border-transparent rounded-lg text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
          />
        </div>

        <Select value={environmentFilter} onValueChange={(v) => setEnvironmentFilter(v as any)}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Environment" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Environments</SelectItem>
            <SelectItem value="sandbox">Sandbox</SelectItem>
            <SelectItem value="live">Live</SelectItem>
          </SelectContent>
        </Select>

        {activeTab !== 'control-center' && (
          <Select value={appFilter} onValueChange={setAppFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="All Apps" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Apps</SelectItem>
              {uniqueApps.map(app => (
                <SelectItem key={app.id} value={app.id}>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: app.color || '#6B7280' }} />
                    {app.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Control Center Users Section */}
      {(activeTab === 'all' || activeTab === 'control-center') && controlCenterUsers.length > 0 && (
        <div className="mb-6 opacity-0 animate-slide-up" style={{ animationDelay: '100ms' }}>
          <div className="flex items-center gap-2 mb-3">
            <div className="h-6 w-1 rounded-full bg-primary" />
            <h3 className="font-medium">Control Center Users</h3>
            <Badge variant="outline" className="text-primary border-primary/30">{controlCenterUsers.length}</Badge>
          </div>
          <div className="rounded-xl border border-primary/30 bg-primary/5 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-border">
                  <TableHead className="text-muted-foreground">User</TableHead>
                  <TableHead className="text-muted-foreground">Role</TableHead>
                  <TableHead className="text-muted-foreground">Tenants</TableHead>
                  <TableHead className="text-muted-foreground">Environment</TableHead>
                  <TableHead className="text-muted-foreground">Last Active</TableHead>
                  <TableHead className="text-muted-foreground w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {controlCenterUsers.map((user) => (
                  <TableRow key={user.id} className="border-border hover:bg-primary/10">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 border-2 border-primary/30">
                          <AvatarImage src={user.avatar} alt={user.name} />
                          <AvatarFallback className="bg-primary/10 text-primary text-xs">
                            {user.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{user.name}</p>
                            <Badge variant="outline" className="text-xs text-primary border-primary/30">CC</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={roleColors[user.role] || 'muted'}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 flex-wrap">
                        {getTenantNames(user.tenantAssignments).slice(0, 2).map((name, i) => (
                          <Badge key={i} variant="muted" className="text-xs">
                            {name}
                          </Badge>
                        ))}
                        {user.tenantAssignments.length > 2 && (
                          <Badge variant="muted" className="text-xs">
                            +{user.tenantAssignments.length - 2}
                          </Badge>
                        )}
                        {user.tenantAssignments.length === 0 && (
                          <span className="text-xs text-muted-foreground">All tenants</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-status-active/20 text-status-active border-status-active/30">
                        Live
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {formatDate(user.lastActive)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon-sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem className="gap-2">
                            <Mail className="h-4 w-4" />
                            Send Message
                          </DropdownMenuItem>
                          <PermissionGate feature="roles" action="update">
                            <DropdownMenuItem className="gap-2">
                              <Shield className="h-4 w-4" />
                              Edit Permissions
                            </DropdownMenuItem>
                          </PermissionGate>
                          <DropdownMenuSeparator />
                          <PermissionGate feature="users" action="delete">
                            <DropdownMenuItem className="gap-2 text-destructive">
                              Remove User
                            </DropdownMenuItem>
                          </PermissionGate>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredUsers.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <Search className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-lg mb-1">No users found</h3>
          <p className="text-muted-foreground max-w-sm">
            {searchQuery ? 'Try adjusting your search or filters' : 'No users have been added yet'}
          </p>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Users;
