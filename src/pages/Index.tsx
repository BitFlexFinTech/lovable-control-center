import { RefreshCw, Plus, MoreHorizontal } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { KPICard } from '@/components/dashboard/KPICard';
import { SiteCard } from '@/components/dashboard/SiteCard';
import { ProductionReadiness } from '@/components/dashboard/ProductionReadiness';
import { Button } from '@/components/ui/button';
import { useTenant } from '@/contexts/TenantContext';
import { kpis, sites } from '@/data/seed-data';

const Index = () => {
  const { currentTenant } = useTenant();

  const filteredSites = currentTenant
    ? sites.filter(site => site.tenantId === currentTenant.id)
    : sites;

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-8 opacity-0 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {currentTenant ? currentTenant.name : 'Overview'}
            </h1>
            <p className="text-muted-foreground mt-1">
              {currentTenant 
                ? `Manage ${currentTenant.name} sites and settings`
                : 'Monitor all your sites and tenants from one place'
              }
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-1.5">
              <RefreshCw className="h-3.5 w-3.5" />
              Sync All
            </Button>
            <Button size="sm" className="gap-1.5">
              <Plus className="h-3.5 w-3.5" />
              Add Site
            </Button>
          </div>
        </div>
      </div>

      {/* KPIs + Production Readiness */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {kpis.map((kpi, index) => (
          <KPICard key={kpi.label} kpi={kpi} delay={index * 50} />
        ))}
        <ProductionReadiness />
      </div>

      {/* Sites Section */}
      <div className="mb-6 flex items-center justify-between opacity-0 animate-fade-in" style={{ animationDelay: '200ms' }}>
        <div>
          <h2 className="text-lg font-semibold">Sites</h2>
          <p className="text-sm text-muted-foreground">
            {filteredSites.length} site{filteredSites.length !== 1 ? 's' : ''} 
            {currentTenant ? ` in ${currentTenant.name}` : ' across all tenants'}
          </p>
        </div>
        <Button variant="ghost" size="icon-sm">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredSites.map((site, index) => (
          <SiteCard key={site.id} site={site} delay={250 + index * 50} />
        ))}
      </div>

      {filteredSites.length === 0 && (
        <div className="text-center py-16 opacity-0 animate-fade-in" style={{ animationDelay: '300ms' }}>
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted mb-4">
            <Plus className="h-5 w-5 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-1">No sites found</h3>
          <p className="text-muted-foreground mb-4">
            Get started by adding your first site.
          </p>
          <Button className="gap-1.5">
            <Plus className="h-4 w-4" />
            Add Site
          </Button>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Index;
