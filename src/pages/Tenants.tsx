import { useState } from 'react';
import { Plus, MoreHorizontal, ExternalLink, Settings, Power, Search, LayoutGrid, List, RefreshCw } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
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
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { PermissionGate } from '@/components/permissions/PermissionGate';
import { CreateTenantDialog } from '@/components/tenants/CreateTenantDialog';
import { TenantSettingsDialog } from '@/components/tenants/TenantSettingsDialog';
import { TenantStatsCard } from '@/components/tenants/TenantStatsCard';
import { useTenants, useCreateTenant, useDeleteTenant, useSites } from '@/hooks/useSupabaseQuery';
import { useRealtimeSubscription } from '@/hooks/useRealtimeSubscription';
import { useDebounce } from '@/hooks/useDebounce';
import { useToast } from '@/hooks/use-toast';
import { SupabaseTenant } from '@/hooks/useSupabaseTenants';

const Tenants = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<SupabaseTenant | null>(null);
  const [deleteConfirmTenant, setDeleteConfirmTenant] = useState<string | null>(null);

  // Supabase hooks
  const { data: tenantsData = [], isLoading, refetch, isFetching } = useTenants();
  const { data: sitesData = [] } = useSites();
  const createTenantMutation = useCreateTenant();
  const deleteTenantMutation = useDeleteTenant();

  // Real-time subscription
  useRealtimeSubscription({ table: 'tenants', queryKey: ['tenants'] });

  // Map Supabase data to Tenant type
  const mappedTenants: Tenant[] = tenantsData.map(t => ({
    id: t.id,
    name: t.name,
    slug: t.slug,
    environment: t.environment as 'production' | 'staging' | 'sandbox',
    baseUrl: t.base_url || `https://${t.slug}.lovable.app`,
    adminUrl: t.admin_url || `https://${t.slug}.lovable.app/admin`,
    createdAt: t.created_at,
    updatedAt: t.updated_at,
    apiKeys: { public: '' },
    permissions: [],
  }));

  const filteredTenants = mappedTenants.filter(tenant =>
    tenant.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
    tenant.slug.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  const getSiteCount = (tenantId: string) => {
    return sitesData.filter(site => site.tenant_id === tenantId).length;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleCreateTenant = async (tenant: Tenant) => {
    await createTenantMutation.mutateAsync({
      name: tenant.name,
      slug: tenant.slug,
      environment: tenant.environment,
    });
  };

  const handleUpdateTenant = (updatedTenant: Tenant) => {};

  const handleDeleteTenant = async (tenantId: string) => {
    await deleteTenantMutation.mutateAsync(tenantId);
    setDeleteConfirmTenant(null);
  };

  const handleOpenSettings = (tenant: Tenant) => { setSelectedTenant(tenant); setIsSettingsOpen(true); };
  const handleDisableTenant = (tenant: Tenant) => { toast({ title: 'Tenant Disabled', description: `${tenant.name} has been disabled.` }); };
  const handleOpenAdmin = (tenant: Tenant) => { window.open(tenant.adminUrl, '_blank'); };
  const handleRefresh = async () => { await refetch(); toast({ title: 'Tenants Refreshed' }); };

  return (
    <DashboardLayout>
      <div className="mb-8 opacity-0 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Tenants</h1>
            <p className="text-muted-foreground mt-1">Manage your organization tenants</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isFetching} className="gap-1.5">
              <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`} />Refresh
            </Button>
            <PermissionGate feature="tenants" action="create">
              <Button size="sm" className="gap-1.5" onClick={() => setIsCreateOpen(true)}>
                <Plus className="h-3.5 w-3.5" />Add Tenant
              </Button>
            </PermissionGate>
          </div>
        </div>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input type="text" placeholder="Search tenants..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full h-9 pl-9 pr-4 bg-secondary border border-transparent rounded-lg text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-all" />
        </div>
        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'table' | 'cards')}>
          <TabsList>
            <TabsTrigger value="table" className="gap-1.5"><List className="h-4 w-4" />Table</TabsTrigger>
            <TabsTrigger value="cards" className="gap-1.5"><LayoutGrid className="h-4 w-4" />Cards</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {viewMode === 'table' && (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-border">
                <TableHead>Tenant</TableHead><TableHead>Environment</TableHead><TableHead>Sites</TableHead><TableHead>Updated</TableHead><TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && [1,2,3].map(i => (<TableRow key={i}><TableCell><Skeleton className="h-10 w-40" /></TableCell><TableCell><Skeleton className="h-6 w-20" /></TableCell><TableCell><Skeleton className="h-4 w-16" /></TableCell><TableCell><Skeleton className="h-4 w-24" /></TableCell><TableCell><Skeleton className="h-8 w-8" /></TableCell></TableRow>))}
              {filteredTenants.map((tenant) => (
                <TableRow key={tenant.id} className="border-border hover:bg-muted/50">
                  <TableCell><div><p className="font-medium">{tenant.name}</p><p className="text-sm text-muted-foreground">{tenant.slug}</p></div></TableCell>
                  <TableCell><Badge variant={tenant.environment === 'production' ? 'active' : 'muted'}>{tenant.environment}</Badge></TableCell>
                  <TableCell><span className="text-sm">{getSiteCount(tenant.id)} sites</span></TableCell>
                  <TableCell><span className="text-sm text-muted-foreground">{formatDate(tenant.updatedAt)}</span></TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon-sm"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem className="gap-2" onClick={() => handleOpenAdmin(tenant)}><ExternalLink className="h-4 w-4" />Open Admin</DropdownMenuItem>
                        <PermissionGate feature="tenants" action="update">
                          <DropdownMenuItem className="gap-2" onClick={() => handleOpenSettings(tenant)}><Settings className="h-4 w-4" />Edit Settings</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="gap-2 text-status-warning" onClick={() => handleDisableTenant(tenant)}><Power className="h-4 w-4" />Disable</DropdownMenuItem>
                        </PermissionGate>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {viewMode === 'cards' && (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{filteredTenants.map((tenant) => (<TenantStatsCard key={tenant.id} tenant={tenant} />))}</div>)}

      {filteredTenants.length === 0 && !isLoading && (
        <div className="text-center py-16">
          <h3 className="text-lg font-medium mb-1">No tenants found</h3>
          <p className="text-muted-foreground mb-4">{searchQuery ? 'Try a different search.' : 'Create your first tenant.'}</p>
          <Button className="gap-1.5" onClick={() => setIsCreateOpen(true)}><Plus className="h-4 w-4" />Add Tenant</Button>
        </div>
      )}

      <CreateTenantDialog isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} onCreateTenant={handleCreateTenant} />
      <TenantSettingsDialog isOpen={isSettingsOpen} onClose={() => { setIsSettingsOpen(false); setSelectedTenant(null); }} tenant={selectedTenant} onUpdateTenant={handleUpdateTenant} onDeleteTenant={(id) => setDeleteConfirmTenant(id)} />
      <ConfirmDialog open={!!deleteConfirmTenant} onOpenChange={(open) => !open && setDeleteConfirmTenant(null)} onConfirm={() => deleteConfirmTenant && handleDeleteTenant(deleteConfirmTenant)} title="Delete Tenant" description="Are you sure? This cannot be undone." confirmText="Delete" variant="destructive" />
    </DashboardLayout>
  );
};

export default Tenants;