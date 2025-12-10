import { useState } from 'react';
import { Plus, MoreHorizontal, ExternalLink, Settings, Power, Search, LayoutGrid, List, RefreshCw } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { CreateTenantDialog } from '@/components/tenants/CreateTenantDialog';
import { TenantSettingsDialog } from '@/components/tenants/TenantSettingsDialog';
import { TenantStatsCard } from '@/components/tenants/TenantStatsCard';
import { tenants as initialTenants, sites } from '@/data/seed-data';
import { Tenant } from '@/types';
import { useToast } from '@/hooks/use-toast';

const Tenants = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [tenantsData, setTenantsData] = useState<Tenant[]>(initialTenants);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const filteredTenants = tenantsData.filter(tenant =>
    tenant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tenant.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getSiteCount = (tenantId: string) => {
    return sites.filter(site => site.tenantId === tenantId).length;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleCreateTenant = (tenant: Tenant) => {
    setTenantsData(prev => [tenant, ...prev]);
  };

  const handleUpdateTenant = (updatedTenant: Tenant) => {
    setTenantsData(prev => prev.map(t => t.id === updatedTenant.id ? updatedTenant : t));
  };

  const handleDeleteTenant = (tenantId: string) => {
    setTenantsData(prev => prev.filter(t => t.id !== tenantId));
  };

  const handleOpenSettings = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setIsSettingsOpen(true);
  };

  const handleDisableTenant = (tenant: Tenant) => {
    toast({
      title: 'Tenant Disabled',
      description: `${tenant.name} has been disabled.`,
    });
  };

  const handleOpenAdmin = (tenant: Tenant) => {
    window.open(tenant.adminUrl, '_blank');
    toast({
      title: 'Opening Admin Panel',
      description: `Navigating to ${tenant.name} admin...`,
    });
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
    toast({
      title: 'Tenants Refreshed',
      description: 'All tenant data has been updated.',
    });
  };

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-8 opacity-0 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Tenants</h1>
            <p className="text-muted-foreground mt-1">
              Manage your organization tenants and their configurations
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="gap-1.5"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button size="sm" className="gap-1.5" onClick={() => setIsCreateOpen(true)}>
              <Plus className="h-3.5 w-3.5" />
              Add Tenant
            </Button>
          </div>
        </div>
      </div>

      {/* Search and View Toggle */}
      <div className="mb-6 opacity-0 animate-slide-up flex items-center justify-between" style={{ animationDelay: '50ms' }}>
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search tenants..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9 pl-9 pr-4 bg-secondary border border-transparent rounded-lg text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
          />
        </div>
        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'table' | 'cards')}>
          <TabsList>
            <TabsTrigger value="table" className="gap-1.5">
              <List className="h-4 w-4" />
              Table
            </TabsTrigger>
            <TabsTrigger value="cards" className="gap-1.5">
              <LayoutGrid className="h-4 w-4" />
              Cards
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="rounded-xl border border-border bg-card overflow-hidden opacity-0 animate-slide-up" style={{ animationDelay: '100ms' }}>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-border">
                <TableHead className="text-muted-foreground">Tenant</TableHead>
                <TableHead className="text-muted-foreground">Environment</TableHead>
                <TableHead className="text-muted-foreground">Sites</TableHead>
                <TableHead className="text-muted-foreground">Updated</TableHead>
                <TableHead className="text-muted-foreground w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTenants.map((tenant) => (
                <TableRow key={tenant.id} className="border-border hover:bg-muted/50">
                  <TableCell>
                    <div>
                      <p className="font-medium">{tenant.name}</p>
                      <p className="text-sm text-muted-foreground">{tenant.slug}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={tenant.environment === 'production' ? 'active' : 'muted'}
                    >
                      {tenant.environment}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{getSiteCount(tenant.id)} sites</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {formatDate(tenant.updatedAt)}
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
                        <DropdownMenuItem 
                          className="gap-2"
                          onClick={() => handleOpenAdmin(tenant)}
                        >
                          <ExternalLink className="h-4 w-4" />
                          Open Admin
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="gap-2"
                          onClick={() => handleOpenSettings(tenant)}
                        >
                          <Settings className="h-4 w-4" />
                          Edit Settings
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="gap-2 text-status-warning"
                          onClick={() => handleDisableTenant(tenant)}
                        >
                          <Power className="h-4 w-4" />
                          Disable Tenant
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Cards View */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 opacity-0 animate-slide-up" style={{ animationDelay: '100ms' }}>
          {filteredTenants.map((tenant) => (
            <TenantStatsCard key={tenant.id} tenant={tenant} />
          ))}
        </div>
      )}

      {filteredTenants.length === 0 && (
        <div className="text-center py-16 opacity-0 animate-fade-in" style={{ animationDelay: '150ms' }}>
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted mb-4">
            <Plus className="h-5 w-5 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-1">No tenants found</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery ? 'Try a different search term.' : 'Get started by creating your first tenant.'}
          </p>
          <Button className="gap-1.5" onClick={() => setIsCreateOpen(true)}>
            <Plus className="h-4 w-4" />
            Add Tenant
          </Button>
        </div>
      )}

      {/* Create Tenant Dialog */}
      <CreateTenantDialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreateTenant={handleCreateTenant}
      />

      {/* Tenant Settings Dialog */}
      <TenantSettingsDialog
        isOpen={isSettingsOpen}
        onClose={() => {
          setIsSettingsOpen(false);
          setSelectedTenant(null);
        }}
        tenant={selectedTenant}
        onUpdateTenant={handleUpdateTenant}
        onDeleteTenant={handleDeleteTenant}
      />
    </DashboardLayout>
  );
};

export default Tenants;
