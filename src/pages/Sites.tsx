import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MoreHorizontal, ExternalLink, Settings, RefreshCw, Search, Filter, Globe, Rocket } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { StatusPill } from '@/components/dashboard/StatusPill';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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
import { CreateSiteWithDomainDialog } from '@/components/mail/CreateSiteWithDomainDialog';
import { GoLiveDialog } from '@/components/sites/GoLiveDialog';
import { ControlCenterCard } from '@/components/sites/ControlCenterCard';
import { usePasswordManager } from '@/contexts/PasswordManagerContext';
import { useToast } from '@/hooks/use-toast';

const Sites = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isCreateSiteOpen, setIsCreateSiteOpen] = useState(false);
  const [isGoLiveOpen, setIsGoLiveOpen] = useState(false);
  const [selectedSite, setSelectedSite] = useState<typeof initialSites[0] | null>(null);
  const [sites, setSites] = useState(initialSites);
  const [isControlCenterLive, setIsControlCenterLive] = useState(false);
  const { currentTenant } = useTenant();
  const { credentials } = usePasswordManager();
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

  const handleCreateSite = (siteData: any, emailAccounts: any[]) => {
    const newSite = {
      id: `site-${Date.now()}`,
      tenantId: currentTenant?.id || 'tenant-1',
      name: siteData.name,
      url: siteData.url,
      status: 'active' as const,
      dashboards: [],
      healthCheck: {
        lastCheck: new Date().toISOString(),
        status: 'active' as const,
        responseTime: 150,
        uptime: 100,
      },
      lastSync: new Date().toISOString(),
      metrics: {
        traffic: 0,
        trafficChange: 0,
        orders: 0,
        ordersChange: 0,
      },
      sparklineData: [0, 0, 0, 0, 0, 0, 0],
    };
    
    setSites(prev => [newSite, ...prev]);
  };

  const handleGoLive = (site: typeof initialSites[0]) => {
    setSelectedSite(site);
    setIsGoLiveOpen(true);
  };

  const handleGoLiveComplete = async () => {
    if (!selectedSite) return;
    setSites(prev => prev.map(s => 
      s.id === selectedSite.id 
        ? { ...s, demoMode: { isDemo: false, isLive: true, goLiveAt: new Date().toISOString() } }
        : s
    ));
    toast({ title: 'Site is now live!', description: `${selectedSite.name} has been published.` });
  };

  const handleControlCenterGoLive = () => {
    toast({ 
      title: 'Control Center is now live!', 
      description: 'All systems are operational in production mode.' 
    });
    setIsControlCenterLive(true);
  };

  const handleHealthCheck = () => {
    toast({ 
      title: 'Health check initiated', 
      description: 'Running diagnostics on all systems...' 
    });
  };

  const siteCredentials = selectedSite 
    ? credentials.filter(c => c.siteId === selectedSite.id)
    : [];

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
              <Globe className="h-3.5 w-3.5" />
              Create Site
            </Button>
          </div>
        </div>
      </div>

      {/* Pinned Control Center Card */}
      <div className="mb-6">
        <ControlCenterCard
          isLive={isControlCenterLive}
          onGoLive={handleControlCenterGoLive}
          onSettings={() => navigate('/settings')}
          onHealthCheck={handleHealthCheck}
        />
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3 mb-4 opacity-0 animate-fade-in" style={{ animationDelay: '100ms' }}>
        <span className="text-sm font-medium text-muted-foreground">Created Sites</span>
        <Separator className="flex-1" />
        <Badge variant="secondary">{filteredSites.length} sites</Badge>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 flex items-center gap-3 opacity-0 animate-slide-up" style={{ animationDelay: '150ms' }}>
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
      <div className="rounded-xl border border-border bg-card overflow-hidden opacity-0 animate-slide-up" style={{ animationDelay: '200ms' }}>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border">
              <TableHead className="text-muted-foreground">Site</TableHead>
              <TableHead className="text-muted-foreground">Tenant</TableHead>
              <TableHead className="text-muted-foreground">Mode</TableHead>
              <TableHead className="text-muted-foreground">Status</TableHead>
              <TableHead className="text-muted-foreground">Integrations</TableHead>
              <TableHead className="text-muted-foreground">Health</TableHead>
              <TableHead className="text-muted-foreground w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody data-tour="sites-table">
            {filteredSites.map((site) => {
              const isDemo = site.demoMode?.isDemo !== false;
              const integrationCount = site.integrationCount || site.requiredIntegrations?.length || 0;
              
              return (
                <TableRow key={site.id} className="border-border hover:bg-muted/50">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {site.appColor && (
                        <div 
                          className="w-1 h-8 rounded-full" 
                          style={{ backgroundColor: site.appColor }}
                        />
                      )}
                      <div>
                        <p className="font-medium">{site.name}</p>
                        <p className="text-sm text-muted-foreground truncate max-w-[200px]">{site.url}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{getTenantName(site.tenantId)}</span>
                  </TableCell>
                  <TableCell>
                    {isDemo ? (
                      <Badge data-tour="demo-badge" className="bg-status-warning/20 text-status-warning border-status-warning/30">
                        Demo
                      </Badge>
                    ) : (
                      <Badge className="bg-status-active/20 text-status-active border-status-active/30">
                        Live
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <StatusPill status={site.status} />
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {integrationCount} accounts
                    </span>
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
                    </div>
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
                        {isDemo && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="gap-2 text-status-active"
                              onClick={() => handleGoLive(site)}
                              data-tour="go-live-button"
                            >
                              <Rocket className="h-4 w-4" />
                              Go Live
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <CreateSiteWithDomainDialog
        isOpen={isCreateSiteOpen}
        onClose={() => setIsCreateSiteOpen(false)}
        onCreate={handleCreateSite}
        tenantId={currentTenant?.id || 'tenant-1'}
      />

      {selectedSite && (
        <GoLiveDialog
          isOpen={isGoLiveOpen}
          onClose={() => setIsGoLiveOpen(false)}
          siteName={selectedSite.name}
          siteDomain={selectedSite.domain || selectedSite.url.replace('https://', '')}
          domainPrice={12.99}
          credentials={siteCredentials}
          onGoLive={handleGoLiveComplete}
        />
      )}
    </DashboardLayout>
  );
};

export default Sites;