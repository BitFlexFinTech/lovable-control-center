import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MoreHorizontal, ExternalLink, Settings, RefreshCw, Search, Globe, Rocket, ArrowRight, CreditCard, BarChart3, Crown, User, Layers, Search as SearchIcon, ChevronDown, Import, Loader2 } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { StatusPill } from '@/components/dashboard/StatusPill';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTenant } from '@/contexts/TenantContext';
import { useSites } from '@/hooks/useSupabaseSites';
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
import { ImportAppDialog } from '@/components/sites/ImportAppDialog';
import { PermissionGate } from '@/components/permissions/PermissionGate';
import { useToast } from '@/hooks/use-toast';
import { SiteOwnerType, SubscriptionTier } from '@/types/billing';
import { Skeleton } from '@/components/ui/skeleton';

const Sites = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: sites = [], isLoading, refetch } = useSites();
  const { currentTenant, allTenants } = useTenant();

  const [isCreateSiteOpen, setIsCreateSiteOpen] = useState(false);
  const [isGoLiveOpen, setIsGoLiveOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);
  const [isMultiSiteOpen, setIsMultiSiteOpen] = useState(false);
  const [isSEOManagerOpen, setIsSEOManagerOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [selectedSite, setSelectedSite] = useState<typeof sites[0] | null>(null);
  const [isControlCenterLive, setIsControlCenterLive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [ownerFilter, setOwnerFilter] = useState<'all' | SiteOwnerType>('all');
  const [viewMode, setViewMode] = useState<'list' | 'comparison'>('list');

  const filteredSites = sites
    .filter(site => site.name.toLowerCase().includes(searchQuery.toLowerCase()) || (site.domain?.toLowerCase().includes(searchQuery.toLowerCase())))
    .filter(site => ownerFilter === 'all' || site.owner_type === ownerFilter);

  const adminSites = filteredSites.filter(s => s.owner_type === 'admin' || !s.owner_type);
  const customerSites = filteredSites.filter(s => s.owner_type === 'customer');

  const getTenantName = (tenantId: string | null) => {
    if (!tenantId) return 'Unknown';
    return allTenants.find(t => t.id === tenantId)?.name || 'Unknown';
  };

  const handleGoLive = (site: typeof sites[0]) => { setSelectedSite(site); setIsGoLiveOpen(true); };
  const handleTransfer = (site: typeof sites[0]) => { setSelectedSite(site); setIsTransferOpen(true); };
  const handleUpgrade = (site: typeof sites[0]) => { setSelectedSite(site); setIsUpgradeOpen(true); };
  const handleSEOManager = (site: typeof sites[0]) => { setSelectedSite(site); setIsSEOManagerOpen(true); };

  const handleGoLiveComplete = async () => {
    if (!selectedSite) return;
    toast({ title: 'Site is now live!', description: `${selectedSite.name} has been published.` });
    refetch();
  };

  const handleTransferComplete = () => {
    toast({ title: 'Transfer initiated', description: 'Invitation sent to customer.' });
    refetch();
  };

  const handleUpgradeComplete = (newTier: SubscriptionTier) => {
    toast({ title: 'Subscription upgraded', description: `Now on ${newTier} plan.` });
    refetch();
  };

  const renderSiteRow = (site: typeof sites[0]) => {
    const isDemo = site.status === 'demo' || site.status === 'draft';
    const statusValue = site.status === 'live' || site.status === 'active' ? 'active' : site.status === 'inactive' ? 'inactive' : 'active';

    return (
      <TableRow key={site.id} className="border-border hover:bg-muted/50">
        <TableCell>
          <div className="flex items-center gap-3">
            {site.app_color && <div className="w-1 h-8 rounded-full" style={{ backgroundColor: site.app_color }} />}
            <div>
              <p className="font-medium">{site.name}</p>
              <p className="text-sm text-muted-foreground truncate max-w-[200px]">{site.domain || site.lovable_url}</p>
            </div>
          </div>
        </TableCell>
        <TableCell><SiteOwnerBadge ownerType={(site.owner_type || 'admin') as SiteOwnerType} showTier /></TableCell>
        <TableCell><span className="text-sm">{getTenantName(site.tenant_id)}</span></TableCell>
        <TableCell>
          {isDemo ? <Badge className="bg-status-warning/20 text-status-warning border-status-warning/30">Demo</Badge> : <Badge className="bg-status-active/20 text-status-active border-status-active/30">Live</Badge>}
        </TableCell>
        <TableCell><StatusPill status={statusValue as 'active' | 'inactive'} /></TableCell>
        <TableCell><span className="text-sm text-muted-foreground">-</span></TableCell>
        <TableCell>
          <span className={(site.response_time_ms || 150) < 200 ? 'text-status-active' : (site.response_time_ms || 150) < 500 ? 'text-status-warning' : 'text-status-inactive'}>
            {site.response_time_ms || 150}ms
          </span>
        </TableCell>
        <TableCell>
          <DropdownMenu>
            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon-sm"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem className="gap-2"><ExternalLink className="h-4 w-4" />Open Site</DropdownMenuItem>
              <DropdownMenuItem className="gap-2"><Settings className="h-4 w-4" />Settings</DropdownMenuItem>
              <DropdownMenuItem className="gap-2" onClick={() => handleSEOManager(site)}><SearchIcon className="h-4 w-4" />SEO Manager</DropdownMenuItem>
              <DropdownMenuSeparator />
              <PermissionGate feature="sites" action="update">
                {site.owner_type === 'admin' && (
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
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => refetch()}><RefreshCw className="h-3.5 w-3.5" />Refresh</Button>
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
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setIsImportOpen(true)} className="gap-2">
                    <Import className="h-4 w-4" />Import from Lovable
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
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-16 w-full rounded-xl" />
              ))}
            </div>
          ) : (
            <>
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
                </div>
              )}

              {sites.length === 0 && !isLoading && (
                <div className="text-center py-12 text-muted-foreground">
                  <Globe className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">No sites yet</p>
                  <p className="text-sm">Create a new site or import an existing Lovable project</p>
                </div>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="comparison"><div className="text-center py-8 text-muted-foreground">Analytics comparison requires site data</div></TabsContent>
      </Tabs>

      <CreateSiteWithDomainDialog isOpen={isCreateSiteOpen} onClose={() => setIsCreateSiteOpen(false)} onCreate={() => refetch()} tenantId={currentTenant?.id || ''} />
      <MultiSiteBuilderDialog isOpen={isMultiSiteOpen} onClose={() => setIsMultiSiteOpen(false)} onBuild={() => refetch()} />
      <ImportAppDialog open={isImportOpen} onOpenChange={setIsImportOpen} />
      <SEOManagerDialog isOpen={isSEOManagerOpen} onClose={() => setIsSEOManagerOpen(false)} site={null} onSave={(seoData) => console.log('SEO saved:', seoData)} />
      {selectedSite && (
        <>
          <GoLiveDialog isOpen={isGoLiveOpen} onClose={() => setIsGoLiveOpen(false)} siteName={selectedSite.name} siteDomain={selectedSite.domain || ''} domainPrice={12.99} credentials={[]} onGoLive={handleGoLiveComplete} />
          <SiteTransferDialog isOpen={isTransferOpen} onClose={() => setIsTransferOpen(false)} siteName={selectedSite.name} siteId={selectedSite.id} onTransfer={handleTransferComplete} />
          <SubscriptionUpgradeDialog isOpen={isUpgradeOpen} onClose={() => setIsUpgradeOpen(false)} siteName={selectedSite.name} currentTier="free" onUpgrade={handleUpgradeComplete} />
        </>
      )}
    </DashboardLayout>
  );
};

export default Sites;
