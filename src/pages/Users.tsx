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
import { users, tenants, sites } from '@/data/seed-data';
import { cn } from '@/lib/utils';

const roleColors = {
  owner: 'active',
  admin: 'default',
  editor: 'muted',
} as const;

const Users = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'control-center' | 'apps'>('all');
  const [environmentFilter, setEnvironmentFilter] = useState<'all' | 'sandbox' | 'live'>('all');
  const [appFilter, setAppFilter] = useState<string>('all');

  // Get unique apps from users
  const uniqueApps = Array.from(new Set(
    users.filter(u => u.source === 'app' && u.sourceAppId)
      .map(u => u.sourceAppId)
  )).map(appId => {
    const user = users.find(u => u.sourceAppId === appId);
    return { id: appId!, name: user?.sourceAppName || 'Unknown', color: user?.sourceAppColor };
  });

  const filteredUsers = users.filter(user => {
    // Tab filter
    if (activeTab === 'control-center' && user.source !== 'control-center') return false;
    if (activeTab === 'apps' && user.source !== 'app') return false;

    // Environment filter
    if (environmentFilter !== 'all' && user.environment !== environmentFilter) return false;

    // App filter
    if (appFilter !== 'all' && user.sourceAppId !== appFilter) return false;

    // Search filter
    return user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           user.email.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Group users by source/app
  const controlCenterUsers = filteredUsers.filter(u => u.source === 'control-center');
  const appUsersByApp = filteredUsers
    .filter(u => u.source === 'app')
    .reduce((acc, user) => {
      const key = user.sourceAppId || 'unknown';
      if (!acc[key]) {
        acc[key] = {
          appId: key,
          appName: user.sourceAppName || 'Unknown',
          appColor: user.sourceAppColor,
          environment: user.environment,
          users: [],
        };
      }
      acc[key].users.push(user);
      return acc;
    }, {} as Record<string, { appId: string; appName: string; appColor?: string; environment: string; users: typeof users }>);

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
  const appCount = users.filter(u => u.source === 'app').length;

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
          <Button size="sm" className="gap-1.5">
            <Plus className="h-3.5 w-3.5" />
            Invite User
          </Button>
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
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: app.color }} />
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
                      <Badge variant={roleColors[user.role]}>
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
                          <DropdownMenuItem className="gap-2">
                            <Shield className="h-4 w-4" />
                            Edit Permissions
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="gap-2 text-destructive">
                            Remove User
                          </DropdownMenuItem>
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

      {/* App Users Sections */}
      {(activeTab === 'all' || activeTab === 'apps') && Object.values(appUsersByApp).map((group) => (
        <div key={group.appId} className="mb-6 opacity-0 animate-slide-up" style={{ animationDelay: '150ms' }}>
          <div className="flex items-center gap-2 mb-3">
            <div 
              className="h-6 w-1 rounded-full" 
              style={{ backgroundColor: group.appColor || '#6B7280' }}
            />
            <h3 className="font-medium">{group.appName} Users</h3>
            <Badge 
              variant="outline" 
              className="text-xs"
              style={{ borderColor: `${group.appColor}50`, color: group.appColor }}
            >
              {group.users.length}
            </Badge>
            <Badge className={cn(
              "text-xs ml-2",
              group.environment === 'sandbox' 
                ? "bg-status-warning/20 text-status-warning border-status-warning/30"
                : "bg-status-active/20 text-status-active border-status-active/30"
            )}>
              {group.environment === 'sandbox' ? '🟡 Sandbox' : '🟢 Live'}
            </Badge>
          </div>
          <div 
            className="rounded-xl border overflow-hidden"
            style={{ 
              borderColor: `${group.appColor}30`, 
              backgroundColor: `${group.appColor}05` 
            }}
          >
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-border">
                  <TableHead className="text-muted-foreground">User</TableHead>
                  <TableHead className="text-muted-foreground">Role</TableHead>
                  <TableHead className="text-muted-foreground">App</TableHead>
                  <TableHead className="text-muted-foreground">Environment</TableHead>
                  <TableHead className="text-muted-foreground">Last Active</TableHead>
                  <TableHead className="text-muted-foreground w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {group.users.map((user) => (
                  <TableRow key={user.id} className="border-border hover:bg-muted/50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar 
                          className="h-9 w-9 border-2" 
                          style={{ borderColor: `${user.sourceAppColor}50` }}
                        >
                          <AvatarImage src={user.avatar} alt={user.name} />
                          <AvatarFallback 
                            className="text-xs"
                            style={{ backgroundColor: `${user.sourceAppColor}20`, color: user.sourceAppColor }}
                          >
                            {user.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={roleColors[user.role]}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span 
                          className="w-2 h-2 rounded-full" 
                          style={{ backgroundColor: user.sourceAppColor }}
                        />
                        <span className="text-sm">{user.sourceAppName}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={cn(
                        "text-xs",
                        user.environment === 'sandbox' 
                          ? "bg-status-warning/20 text-status-warning border-status-warning/30"
                          : "bg-status-active/20 text-status-active border-status-active/30"
                      )}>
                        {user.environment === 'sandbox' ? 'Sandbox' : 'Live'}
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
                          <DropdownMenuItem className="gap-2">
                            <Shield className="h-4 w-4" />
                            Edit Permissions
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="gap-2 text-destructive">
                            Remove User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      ))}

      {filteredUsers.length === 0 && (
        <div className="text-center py-16 opacity-0 animate-fade-in" style={{ animationDelay: '200ms' }}>
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted mb-4">
            <Search className="h-5 w-5 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-1">No users found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search or filters.
          </p>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Users;