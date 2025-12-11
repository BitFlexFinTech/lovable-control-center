import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MoreHorizontal, ExternalLink, Settings, RefreshCw, Search, Filter, Globe, Rocket, ArrowRight, CreditCard, BarChart3, Crown, User, Layers, Search as SearchIcon, ChevronDown } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { StatusPill } from '@/components/dashboard/StatusPill';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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
import { useTenant } from '@/contexts/TenantContext';
import { sites as initialSites, tenants } from '@/data/seed-data';
import { CreateSiteWithDomainDialog } from '@/components/mail/CreateSiteWithDomainDialog';
import { GoLiveDialog } from '@/components/sites/GoLiveDialog';
import { ControlCenterCard } from '@/components/sites/ControlCenterCard';
import { SiteOwnerBadge } from '@/components/sites/SiteOwnerBadge';
import { CustomerBillingPanel } from '@/components/sites/CustomerBillingPanel';
import { SiteTransferDialog } from '@/components/sites/SiteTransferDialog';
import { SubscriptionUpgradeDialog } from '@/components/sites/SubscriptionUpgradeDialog';
import { AnalyticsComparisonView } from '@/components/sites/AnalyticsComparisonView';
import { MultiSiteBuilderDialog } from '@/components/sites/MultiSiteBuilderDialog';
import { SEOManagerDialog } from '@/components/sites/SEOManagerDialog';
import { PermissionGate } from '@/components/permissions/PermissionGate';
import { usePasswordManager } from '@/contexts/PasswordManagerContext';
import { useToast } from '@/hooks/use-toast';
import { SiteOwnerType, SubscriptionTier } from '@/types/billing';
import { cn } from '@/lib/utils';

const Sites = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isCreateSiteOpen, setIsCreateSiteOpen] = useState(false);
  const [isGoLiveOpen, setIsGoLiveOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);
  const [isMultiSiteOpen, setIsMultiSiteOpen] = useState(false);
  const [isSEOManagerOpen, setIsSEOManagerOpen] = useState(false);
  const [selectedSite, setSelectedSite] = useState<typeof initialSites[0] | null>(null);
  const [sites, setSites] = useState(initialSites);
  const [isControlCenterLive, setIsControlCenterLive] = useState(false);
  const { currentTenant } = useTenant();
  const { credentials } = usePasswordManager();
  const [searchQuery, setSearchQuery] = useState('');
  const [ownerFilter, setOwnerFilter] = useState<'all' | SiteOwnerType>('all');
  const [viewMode, setViewMode] = useState<'list' | 'comparison'>('list');
  const [expandedBilling, setExpandedBilling] = useState<string | null>(null);

  const filteredSites = sites
    .filter(site => currentTenant ? site.tenantId === currentTenant.id : true)
    .filter(site => site.name.toLowerCase().includes(searchQuery.toLowerCase()) || site.url.toLowerCase().includes(searchQuery.toLowerCase()))
    .filter(site => ownerFilter === 'all' || site.ownerType === ownerFilter);

  const adminSites = filteredSites.filter(s => s.ownerType === 'admin' || !s.ownerType);
  const customerSites = filteredSites.filter(s => s.ownerType === 'customer');

  const getTenantName = (tenantId: string) => tenants.find(t => t.id === tenantId)?.name || 'Unknown';

  const handleCreateSite = (siteData: any) => {
    const newSite = {
      id: `site-${Date.now()}`,
      tenantId: currentTenant?.id || 'tenant-1',
      name: siteData.name,
      url: siteData.url,
      status: 'active' as const,
      dashboards: [],
      healthCheck: { lastCheck: new Date().toISOString(), status: 'active' as const, responseTime: 150, uptime: 100 },
      lastSync: new Date().toISOString(),
      metrics: { traffic: 0, trafficChange: 0, orders: 0, ordersChange: 0 },
      sparklineData: [0, 0, 0, 0, 0, 0, 0],
      ownerType: 'admin' as SiteOwnerType,
    };
    setSites(prev => [newSite, ...prev]);
  };

  const handleGoLive = (site: typeof initialSites[0]) => { setSelectedSite(site); setIsGoLiveOpen(true); };
  
  const handleGoLiveComplete = async () => {
    if (!selectedSite) return;
    setSites(prev => prev.map(s => s.id === selectedSite.id ? { ...s, demoMode: { isDemo: false, isLive: true, goLiveAt: new Date().toISOString() } } : s));
    toast({ title: 'Site is now live!', description: `${selectedSite.name} has been published.` });
  };

  const handleTransfer = (site: typeof initialSites[0]) => { setSelectedSite(site); setIsTransferOpen(true); };

  const handleTransferComplete = (customerId: string, tier: SubscriptionTier) => {
    if (!selectedSite) return;
    setSites(prev => prev.map(s => s.id === selectedSite.id ? {
      ...s,
      ownerType: 'customer' as SiteOwnerType,
      ownerId: customerId,
      billing: { subscriptionTier: tier, status: 'active', currentPeriodStart: new Date().toISOString(), currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), monthlyPrice: tier === 'free' ? 0 : tier === 'starter' ? 29 : tier === 'pro' ? 79 : 199 },
    } : s));
    toast({ title: 'Transfer initiated', description: 'Invitation sent to customer.' });
  };

  const handleUpgrade = (site: typeof initialSites[0]) => { setSelectedSite(site); setIsUpgradeOpen(true); };

  const handleSEOManager = (site: typeof initialSites[0]) => { setSelectedSite(site); setIsSEOManagerOpen(true); };

  const handleMultiSiteBuild = (generatedSites: any[]) => {
    const newSites = generatedSites.map(gs => ({
      id: gs.id,
      tenantId: currentTenant?.id || 'tenant-1',
      name: gs.name,
      url: `https://${gs.domain}`,
      domain: gs.domain,
      status: 'active' as const,
      dashboards: [],
      healthCheck: { lastCheck: new Date().toISOString(), status: 'active' as const, responseTime: 150, uptime: 100 },
      lastSync: new Date().toISOString(),
      metrics: { traffic: 0, trafficChange: 0, orders: 0, ordersChange: 0 },
      sparklineData: [0, 0, 0, 0, 0, 0, 0],
      ownerType: 'admin' as SiteOwnerType,
      demoMode: { isDemo: true, isLive: false },
      appColor: gs.theme.primaryColor,
    }));
    setSites(prev => [...newSites, ...prev]);
  };

  const handleUpgradeComplete = (newTier: SubscriptionTier) => {
    if (!selectedSite) return;
    setSites(prev => prev.map(s => s.id === selectedSite.id && s.billing ? { ...s, billing: { ...s.billing, subscriptionTier: newTier } } : s));
    toast({ title: 'Subscription upgraded', description: `Now on ${newTier} plan.` });
  };

  const siteCredentials = selectedSite ? credentials.filter(c => c.siteId === selectedSite.id) : [];

  const renderSiteRow = (site: typeof initialSites[0]) => {
    const isDemo = site.demoMode?.isDemo !== false;
    const integrationCount = site.integrationCount || site.requiredIntegrations?.length || 0;

    return (
      <TableRow key={site.id} className="border-border hover:bg-muted/50">
        <TableCell>
          <div className="flex items-center gap-3">
            {site.appColor && <div className="w-1 h-8 rounded-full" style={{ backgroundColor: site.appColor }} />}
            <div>
              <p className="font-medium">{site.name}</p>
              <p className="text-sm text-muted-foreground truncate max-w-[200px]">{site.url}</p>
            </div>
          </div>
        </TableCell>
        <TableCell><SiteOwnerBadge ownerType={site.ownerType || 'admin'} subscriptionTier={site.billing?.subscriptionTier} showTier /></TableCell>
        <TableCell><span className="text-sm">{getTenantName(site.tenantId)}</span></TableCell>
        <TableCell>
          {isDemo ? <Badge className="bg-status-warning/20 text-status-warning border-status-warning/30">Demo</Badge> : <Badge className="bg-status-active/20 text-status-active border-status-active/30">Live</Badge>}
        </TableCell>
        <TableCell><StatusPill status={site.status} /></TableCell>
        <TableCell><span className="text-sm text-muted-foreground">{integrationCount} accounts</span></TableCell>
        <TableCell>
          <span className={site.healthCheck.responseTime < 200 ? 'text-status-active' : site.healthCheck.responseTime < 500 ? 'text-status-warning' : 'text-status-inactive'}>
            {site.healthCheck.responseTime}ms
          </span>
        </TableCell>
        <TableCell>
          <DropdownMenu>
            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon-sm"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem className="gap-2"><ExternalLink className="h-4 w-4" />Open Site</DropdownMenuItem>
              <DropdownMenuItem className="gap-2"><Settings className="h-4 w-4" />Settings</DropdownMenuItem>
              {site.ownerType === 'customer' && site.billing && (
                <DropdownMenuItem className="gap-2" onClick={() => handleUpgrade(site)}><CreditCard className="h-4 w-4" />View Billing</DropdownMenuItem>
              )}
              <DropdownMenuItem className="gap-2" onClick={() => handleSEOManager(site)}><SearchIcon className="h-4 w-4" />SEO Manager</DropdownMenuItem>
              <DropdownMenuSeparator />
              <PermissionGate feature="sites" action="update">
                {site.ownerType === 'admin' && (
                  <DropdownMenuItem className="gap-2 text-primary" onClick={() => handleTransfer(site)}><ArrowRight className="h-4 w-4" />Transfer to Customer</DropdownMenuItem>
                )}
                {isDemo && (
                  <DropdownMenuItem className="gap-2 text-status-active" onClick={() => handleGoLive(site)}><Rocket className="h-4 w-4" />Go Live</DropdownMenuItem>
                )}
              </PermissionGate>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>
    );
  };

  return (
    <DashboardLayout>
      <div className="mb-8 opacity-0 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Sites</h1>
            <p className="text-muted-foreground mt-1">Monitor and manage all your sites and their health status</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-1.5"><RefreshCw className="h-3.5 w-3.5" />Health Check</Button>
            <PermissionGate feature="sites" action="create">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" className="gap-1.5">
                    <Globe className="h-3.5 w-3.5" />Create Site<ChevronDown className="h-3 w-3 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setIsCreateSiteOpen(true)} className="gap-2">
                    <Globe className="h-4 w-4" />Single Site
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setIsMultiSiteOpen(true)} className="gap-2">
                    <Layers className="h-4 w-4" />Multi-Site Builder
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </PermissionGate>
          </div>
        </div>
      </div>

      <div className="mb-6"><ControlCenterCard isLive={isControlCenterLive} onGoLive={() => { setIsControlCenterLive(true); toast({ title: 'Control Center is now live!' }); }} onSettings={() => navigate('/settings')} onHealthCheck={() => toast({ title: 'Health check initiated' })} /></div>

      <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'list' | 'comparison')} className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList><TabsTrigger value="list">List View</TabsTrigger><TabsTrigger value="comparison" className="gap-1.5"><BarChart3 className="h-3.5 w-3.5" />Comparison</TabsTrigger></TabsList>
          <div className="flex items-center gap-3">
            <div className="relative max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input type="text" placeholder="Search sites..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full h-9 pl-9 pr-4 bg-secondary border border-transparent rounded-lg text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-all" />
            </div>
            <Select value={ownerFilter} onValueChange={(v) => setOwnerFilter(v as 'all' | SiteOwnerType)}>
              <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="all">All Sites</SelectItem><SelectItem value="admin">Admin</SelectItem><SelectItem value="customer">Customer</SelectItem></SelectContent>
            </Select>
          </div>
        </div>

        <TabsContent value="list" className="space-y-6">
          {/* Admin Sites Section */}
          {adminSites.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-3"><Crown className="h-4 w-4 text-primary" /><span className="text-sm font-medium">Admin Sites</span><Separator className="flex-1" /><Badge variant="secondary" className="bg-primary/10 text-primary">{adminSites.length}</Badge></div>
              <div className="rounded-xl border border-primary/20 bg-gradient-to-b from-primary/5 to-transparent overflow-hidden">
                <Table>
                  <TableHeader><TableRow className="hover:bg-transparent border-border"><TableHead>Site</TableHead><TableHead>Owner</TableHead><TableHead>Tenant</TableHead><TableHead>Mode</TableHead><TableHead>Status</TableHead><TableHead>Integrations</TableHead><TableHead>Health</TableHead><TableHead className="w-[50px]"></TableHead></TableRow></TableHeader>
                  <TableBody>{adminSites.map(renderSiteRow)}</TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* Customer Sites Section */}
          {customerSites.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-3"><User className="h-4 w-4 text-status-active" /><span className="text-sm font-medium">Customer Sites</span><Separator className="flex-1" /><Badge variant="secondary" className="bg-status-active/10 text-status-active">{customerSites.length}</Badge></div>
              <div className="rounded-xl border border-status-active/20 bg-gradient-to-b from-status-active/5 to-transparent overflow-hidden">
                <Table>
                  <TableHeader><TableRow className="hover:bg-transparent border-border"><TableHead>Site</TableHead><TableHead>Owner</TableHead><TableHead>Tenant</TableHead><TableHead>Mode</TableHead><TableHead>Status</TableHead><TableHead>Integrations</TableHead><TableHead>Health</TableHead><TableHead className="w-[50px]"></TableHead></TableRow></TableHeader>
                  <TableBody>{customerSites.map(renderSiteRow)}</TableBody>
                </Table>
              </div>
              {/* Billing Panels */}
              <div className="space-y-2 mt-4">{customerSites.filter(s => s.billing).map(site => (<CustomerBillingPanel key={site.id} siteName={site.name} billing={site.billing!} paymentHistory={site.paymentHistory || []} onUpgrade={() => handleUpgrade(site)} />))}</div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="comparison"><AnalyticsComparisonView sites={filteredSites} /></TabsContent>
      </Tabs>

      <CreateSiteWithDomainDialog isOpen={isCreateSiteOpen} onClose={() => setIsCreateSiteOpen(false)} onCreate={handleCreateSite} tenantId={currentTenant?.id || 'tenant-1'} />
      <MultiSiteBuilderDialog isOpen={isMultiSiteOpen} onClose={() => setIsMultiSiteOpen(false)} onBuild={handleMultiSiteBuild} />
      <SEOManagerDialog isOpen={isSEOManagerOpen} onClose={() => setIsSEOManagerOpen(false)} site={selectedSite} onSave={(seoData) => console.log('SEO saved:', seoData)} />
      {selectedSite && (<><GoLiveDialog isOpen={isGoLiveOpen} onClose={() => setIsGoLiveOpen(false)} siteName={selectedSite.name} siteDomain={selectedSite.domain || selectedSite.url.replace('https://', '')} domainPrice={12.99} credentials={siteCredentials} onGoLive={handleGoLiveComplete} /><SiteTransferDialog isOpen={isTransferOpen} onClose={() => setIsTransferOpen(false)} siteName={selectedSite.name} siteId={selectedSite.id} onTransfer={handleTransferComplete} /><SubscriptionUpgradeDialog isOpen={isUpgradeOpen} onClose={() => setIsUpgradeOpen(false)} siteName={selectedSite.name} currentTier={selectedSite.billing?.subscriptionTier || 'free'} onUpgrade={handleUpgradeComplete} /></>)}
    </DashboardLayout>
  );
};

export default Sites;