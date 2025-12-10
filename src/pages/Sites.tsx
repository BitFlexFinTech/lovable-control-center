import { useState } from 'react';
import { Plus, MoreHorizontal, ExternalLink, Settings, RefreshCw, Search, Filter } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { StatusPill } from '@/components/dashboard/StatusPill';
import { Badge } from '@/components/ui/badge';
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
import { useTenant } from '@/contexts/TenantContext';
import { sites as initialSites, tenants } from '@/data/seed-data';
import { CreateSiteDialog } from '@/components/mail/CreateSiteDialog';
import { useToast } from '@/hooks/use-toast';

const Sites = () => {
  const { toast } = useToast();
  const [isCreateSiteOpen, setIsCreateSiteOpen] = useState(false);
  const [sites, setSites] = useState(initialSites);
  const { currentTenant } = useTenant();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSites = sites
    .filter(site => 
      currentTenant ? site.tenantId === currentTenant.id : true
    )
    .filter(site =>
      site.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      site.url.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const getTenantName = (tenantId: string) => {
    return tenants.find(t => t.id === tenantId)?.name || 'Unknown';
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

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-8 opacity-0 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Sites</h1>
            <p className="text-muted-foreground mt-1">
              Monitor and manage all your sites and their health status
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-1.5">
              <RefreshCw className="h-3.5 w-3.5" />
              Health Check
            </Button>
            <Button size="sm" className="gap-1.5" onClick={() => setIsCreateSiteOpen(true)}>
              <Plus className="h-3.5 w-3.5" />
              Add Site
            </Button>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 flex items-center gap-3 opacity-0 animate-slide-up" style={{ animationDelay: '50ms' }}>
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search sites..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9 pl-9 pr-4 bg-secondary border border-transparent rounded-lg text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
          />
        </div>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Filter className="h-3.5 w-3.5" />
          Filters
        </Button>
      </div>

      {/* Sites Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden opacity-0 animate-slide-up" style={{ animationDelay: '100ms' }}>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border">
              <TableHead className="text-muted-foreground">Site</TableHead>
              <TableHead className="text-muted-foreground">Tenant</TableHead>
              <TableHead className="text-muted-foreground">Status</TableHead>
              <TableHead className="text-muted-foreground">Dashboards</TableHead>
              <TableHead className="text-muted-foreground">Health</TableHead>
              <TableHead className="text-muted-foreground">Last Sync</TableHead>
              <TableHead className="text-muted-foreground w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSites.map((site) => (
              <TableRow key={site.id} className="border-border hover:bg-muted/50">
                <TableCell>
                  <div>
                    <p className="font-medium">{site.name}</p>
                    <p className="text-sm text-muted-foreground truncate max-w-[200px]">{site.url}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm">{getTenantName(site.tenantId)}</span>
                </TableCell>
                <TableCell>
                  <StatusPill status={site.status} />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    {site.dashboards.slice(0, 3).map((dashboard) => (
                      <Badge key={dashboard.id} variant="muted" className="text-xs">
                        {dashboard.name}
                      </Badge>
                    ))}
                    {site.dashboards.length > 3 && (
                      <Badge variant="muted" className="text-xs">
                        +{site.dashboards.length - 3}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <span className={
                      site.healthCheck.responseTime < 200 ? 'text-status-active' :
                      site.healthCheck.responseTime < 500 ? 'text-status-warning' :
                      'text-status-inactive'
                    }>
                      {site.healthCheck.responseTime}ms
                    </span>
                    <span className="text-muted-foreground ml-2">
                      {site.healthCheck.uptime}% up
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground">
                    {formatDate(site.lastSync)}
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
                        <ExternalLink className="h-4 w-4" />
                        Open Site
                      </DropdownMenuItem>
                      <DropdownMenuItem className="gap-2">
                        <Settings className="h-4 w-4" />
                        Settings
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="gap-2">
                        <RefreshCw className="h-4 w-4" />
                        Force Sync
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <CreateSiteDialog
        isOpen={isCreateSiteOpen}
        onClose={() => setIsCreateSiteOpen(false)}
        onCreate={(siteData, emailAccounts) => {
          toast({
            title: 'Site created with email accounts',
            description: `Created: ${emailAccounts.map(a => a.email).join(', ')}`,
          });
        }}
        tenantId={currentTenant?.id || 'tenant-1'}
      />
    </DashboardLayout>
  );
};

export default Sites;
