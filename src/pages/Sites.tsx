import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MoreHorizontal, ExternalLink, Settings, RefreshCw, Search, Globe, Rocket, ArrowRight, CreditCard, BarChart3, Crown, User, Layers, Search as SearchIcon, ChevronDown, Import, Loader2, Eye, Link as LinkIcon, AlertCircle, GitBranch, Pencil, RotateCw, Trash2 } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { StatusPill } from '@/components/dashboard/StatusPill';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useTenant } from '@/contexts/TenantContext';
import { useSites, useUpdateSite, useDeleteSite } from '@/hooks/useSupabaseSites';
import { useSiteIntegrations } from '@/hooks/useSupabaseIntegrations';
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
import { ResyncIntegrationsDialog } from '@/components/sites/ResyncIntegrationsDialog';
import { EmbeddedSiteViewer } from '@/components/sites/EmbeddedSiteViewer';
import { VerifyProjectsDialog } from '@/components/sites/VerifyProjectsDialog';
import { RenameSiteDialog } from '@/components/sites/RenameSiteDialog';
import { PermissionGate } from '@/components/permissions/PermissionGate';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useToast } from '@/hooks/use-toast';
import { SiteOwnerType, SubscriptionTier } from '@/types/billing';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';


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
  const [isEmbeddedViewerOpen, setIsEmbeddedViewerOpen] = useState(false);
  const [isVerifyOpen, setIsVerifyOpen] = useState(false);
  const [isResyncOpen, setIsResyncOpen] = useState(false);
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [selectedSite, setSelectedSite] = useState<typeof sites[0] | null>(null);
  const [isRefreshingMetadata, setIsRefreshingMetadata] = useState<string | null>(null);
  const [isControlCenterLive, setIsControlCenterLive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [ownerFilter, setOwnerFilter] = useState<'all' | SiteOwnerType>('all');
  const [viewMode, setViewMode] = useState<'list' | 'comparison'>('list');
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [siteToDelete, setSiteToDelete] = useState<typeof sites[0] | null>(null);
  const [togglingStatus, setTogglingStatus] = useState<string | null>(null);

  const updateSite = useUpdateSite();
  const deleteSite = useDeleteSite();

  // Fetch site integrations for resync dialog
  const { data: siteIntegrations = [] } = useSiteIntegrations(selectedSite?.id);

  const filteredSites = sites
    .filter(site => site.name.toLowerCase().includes(searchQuery.toLowerCase()) || (site.domain?.toLowerCase().includes(searchQuery.toLowerCase())))
    .filter(site => ownerFilter === 'all' || site.owner_type === ownerFilter);

  const adminSites = filteredSites.filter(s => s.owner_type === 'admin' || !s.owner_type);
  const customerSites = filteredSites.filter(s => s.owner_type === 'customer');
  
  // Count pending creation sites for verify button
  const pendingSites = useMemo(() => 
    sites.filter(s => s.status === 'pending_creation'),
    [sites]
  );

  const getTenantName = (tenantId: string | null) => {
    if (!tenantId) return 'Unknown';
    return allTenants.find(t => t.id === tenantId)?.name || 'Unknown';
  };

  const handleGoLive = (site: typeof sites[0]) => { setSelectedSite(site); setIsGoLiveOpen(true); };
  const handleTransfer = (site: typeof sites[0]) => { setSelectedSite(site); setIsTransferOpen(true); };
  const handleUpgrade = (site: typeof sites[0]) => { setSelectedSite(site); setIsUpgradeOpen(true); };
  const handleSEOManager = (site: typeof sites[0]) => { setSelectedSite(site); setIsSEOManagerOpen(true); };
  const handleOpenSite = (site: typeof sites[0]) => { setSelectedSite(site); setIsEmbeddedViewerOpen(true); };
  const handleResync = (site: typeof sites[0]) => { setSelectedSite(site); setIsResyncOpen(true); };
  const handleRename = (site: typeof sites[0]) => { setSelectedSite(site); setIsRenameOpen(true); };

  const handleRefreshMetadata = async (site: typeof sites[0]) => {
    if (!site.lovable_url) {
      toast({ title: 'No Lovable URL', description: 'This site has no linked Lovable project URL.', variant: 'destructive' });
      return;
    }

    setIsRefreshingMetadata(site.id);
    try {
      const { data, error } = await supabase.functions.invoke('fetch-lovable-project', {
        body: { lovableUrl: site.lovable_url },
      });

      if (error) throw error;

      if (data?.projectName) {
        // Update site name
        await supabase.from('sites').update({ name: data.projectName }).eq('id', site.id);
        // Also update imported_apps if exists
        await supabase.from('imported_apps').update({ project_name: data.projectName }).eq('site_id', site.id);
        
        toast({ title: 'Metadata refreshed', description: `Site renamed to "${data.projectName}"` });
        refetch();
      } else {
        toast({ title: 'Could not fetch name', description: 'The project name could not be extracted from Lovable.', variant: 'destructive' });
      }
    } catch (error) {
      console.error('Error refreshing metadata:', error);
      toast({ title: 'Refresh failed', description: 'Could not fetch project name from Lovable.', variant: 'destructive' });
    } finally {
      setIsRefreshingMetadata(null);
    }
  };

  const handleGoLiveComplete = async () => {
    if (!selectedSite) return;
    toast({ title: 'Site is now live!', description: `${selectedSite.name} has been published.` });
    refetch();
  };

  const handleTransferComplete = () => {
    toast({ title: 'Transfer initiated', description: 'Invitation sent to customer.' });
    refetch();
  };

  const handleDeleteSite = (site: typeof sites[0]) => {
    setSiteToDelete(site);
    setIsDeleteOpen(true);
  };

  const confirmDeleteSite = async () => {
    if (!siteToDelete) return;
    try {
      // Delete from imported_apps first (cascade)
      await supabase.from('imported_apps').delete().eq('site_id', siteToDelete.id);
      // Delete from sites
      await deleteSite.mutateAsync(siteToDelete.id);
      toast({ title: 'Site deleted', description: `${siteToDelete.name} has been removed.` });
      refetch();
    } catch (error) {
      toast({ title: 'Delete failed', variant: 'destructive' });
    } finally {
      setIsDeleteOpen(false);
      setSiteToDelete(null);
    }
  };

  const handleToggleDemoLive = async (site: typeof sites[0]) => {
    const newStatus = site.status === 'live' ? 'demo' : 'live';
    setTogglingStatus(site.id);
    try {
      await updateSite.mutateAsync({ id: site.id, status: newStatus });
      toast({ title: `Site is now ${newStatus}`, description: `${site.name} status updated.` });
      refetch();
    } catch (error) {
      toast({ title: 'Update failed', variant: 'destructive' });
    } finally {
      setTogglingStatus(null);
    }
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
          <div className="flex items-center gap-2">
            {isDemo ? <Badge className="bg-status-warning/20 text-status-warning border-status-warning/30">Demo</Badge> : <Badge className="bg-status-active/20 text-status-active border-status-active/30">Live</Badge>}
            <Switch
              checked={!isDemo}
              onCheckedChange={() => handleToggleDemoLive(site)}
              disabled={togglingStatus === site.id}
              className="scale-75"
            />
          </div>
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
              <DropdownMenuItem className="gap-2" onClick={() => handleOpenSite(site)}>
                <Eye className="h-4 w-4" />Open Site
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2"><Settings className="h-4 w-4" />Settings</DropdownMenuItem>
              <DropdownMenuItem className="gap-2" onClick={() => handleRename(site)}>
                <Pencil className="h-4 w-4" />Rename
              </DropdownMenuItem>
              {site.lovable_url && (
                <DropdownMenuItem 
                  className="gap-2" 
                  onClick={() => handleRefreshMetadata(site)}
                  disabled={isRefreshingMetadata === site.id}
                >
                  <RotateCw className={`h-4 w-4 ${isRefreshingMetadata === site.id ? 'animate-spin' : ''}`} />
                  {isRefreshingMetadata === site.id ? 'Refreshing...' : 'Refresh from Lovable'}
                </DropdownMenuItem>
              )}
              <DropdownMenuItem className="gap-2" onClick={() => handleSEOManager(site)}><SearchIcon className="h-4 w-4" />SEO Manager</DropdownMenuItem>
              <DropdownMenuItem className="gap-2" onClick={() => handleResync(site)}><GitBranch className="h-4 w-4" />Re-Sync Integrations</DropdownMenuItem>
              <DropdownMenuSeparator />
              <PermissionGate feature="sites" action="update">
                {site.owner_type === 'admin' && (
                  <DropdownMenuItem className="gap-2 text-primary" onClick={() => handleTransfer(site)}><ArrowRight className="h-4 w-4" />Transfer to Customer</DropdownMenuItem>
                )}
                {isDemo && (
                  <DropdownMenuItem className="gap-2 text-status-active" onClick={() => handleGoLive(site)}><Rocket className="h-4 w-4" />Go Live</DropdownMenuItem>
                )}
              </PermissionGate>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="gap-2 text-destructive" onClick={() => handleDeleteSite(site)}>
                <Trash2 className="h-4 w-4" />Delete Site
              </DropdownMenuItem>
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
            {pendingSites.length > 0 && (
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-1.5 border-status-warning/50 text-status-warning hover:bg-status-warning/10"
                onClick={() => setIsVerifyOpen(true)}
              >
                <LinkIcon className="h-3.5 w-3.5" />
                Verify Projects
                <Badge className="ml-1 bg-status-warning/20 text-status-warning border-0 h-5 px-1.5">
                  {pendingSites.length}
                </Badge>
              </Button>
            )}
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
          <EmbeddedSiteViewer 
            isOpen={isEmbeddedViewerOpen} 
            onClose={() => setIsEmbeddedViewerOpen(false)} 
            siteUrl={selectedSite.lovable_url || selectedSite.domain || ''} 
            siteName={selectedSite.name} 
          />
          <ResyncIntegrationsDialog
            open={isResyncOpen}
            onOpenChange={setIsResyncOpen}
            site={{
              id: selectedSite.id,
              name: selectedSite.name,
              domain: selectedSite.domain || undefined,
            }}
            currentIntegrations={siteIntegrations.map((si: { integration_id: string }) => si.integration_id)}
          />
        </>
      )}
      <VerifyProjectsDialog open={isVerifyOpen} onOpenChange={setIsVerifyOpen} />
      <RenameSiteDialog 
        open={isRenameOpen} 
        onOpenChange={setIsRenameOpen} 
        site={selectedSite ? { id: selectedSite.id, name: selectedSite.name, lovable_url: selectedSite.lovable_url } : null} 
      />
      <ConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title="Delete Site"
        description={`Are you sure you want to delete "${siteToDelete?.name}"? This action cannot be undone and will remove all associated data.`}
        confirmText="Delete"
        variant="destructive"
        onConfirm={confirmDeleteSite}
      />
    </DashboardLayout>
  );
};

export default Sites;
