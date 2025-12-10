import { useState } from 'react';
import { Plug, Search } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { IntegrationCard } from '@/components/integrations/IntegrationCard';
import { IntegrationSection } from '@/components/integrations/IntegrationSection';
import { useIntegrations } from '@/contexts/IntegrationsContext';
import { CONTROL_CENTER_INTEGRATIONS, CONTROL_CENTER_APP } from '@/types/credentials';

const Integrations = () => {
  const { integrations, removeIntegrationFromApp, addIntegrationForApp } = useIntegrations();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [ccSectionOpen, setCcSectionOpen] = useState(true);
  const [sitesSectionOpen, setSitesSectionOpen] = useState(true);

  // All available categories including new ones for Control Center
  const allCategories = [
    'Domain', 'Database', 'Hosting', 'Infrastructure',
    'Payments', 'Email', 'Analytics', 'Auth', 
    'Storage', 'Development', 'Communication', 'Social'
  ];
  
  // Get categories that have integrations
  const categories = allCategories.filter(cat => 
    integrations.some(i => i.category === cat)
  );

  // Filter integrations
  const filteredIntegrations = integrations.filter(integration => {
    const matchesSearch = integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         integration.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || integration.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && integration.linkedApps.length > 0) ||
                         (statusFilter === 'inactive' && integration.linkedApps.length === 0);
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Separate Control Center integrations from Created Sites integrations
  const controlCenterIntegrations = filteredIntegrations.filter(i => 
    CONTROL_CENTER_INTEGRATIONS.includes(i.id)
  );
  
  const createdSiteIntegrations = filteredIntegrations.filter(i => 
    !CONTROL_CENTER_INTEGRATIONS.includes(i.id) || 
    i.linkedApps.some(app => app.siteId !== 'control-center')
  );

  // Group created site integrations by category
  const groupedSiteIntegrations = categories.reduce((acc, category) => {
    const items = createdSiteIntegrations.filter(i => i.category === category);
    if (items.length > 0) {
      acc[category] = items;
    }
    return acc;
  }, {} as Record<string, typeof createdSiteIntegrations>);

  // Stats
  const ccActiveCount = controlCenterIntegrations.filter(i => 
    i.linkedApps.some(a => a.siteId === 'control-center')
  ).length;
  const siteActiveCount = createdSiteIntegrations.filter(i => 
    i.linkedApps.some(a => a.siteId !== 'control-center')
  ).length;
  const totalApps = new Set(integrations.flatMap(i => i.linkedApps.map(a => a.siteId))).size;

  const handleConnectCC = (integrationId: string) => {
    addIntegrationForApp(integrationId, {
      siteId: 'control-center',
      siteName: CONTROL_CENTER_APP.siteName,
      domain: CONTROL_CENTER_APP.domain,
      color: CONTROL_CENTER_APP.color,
      linkedAt: new Date().toISOString(),
    });
  };

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-8 opacity-0 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Integrations</h1>
            <p className="text-muted-foreground mt-1">
              Third-party services connected to your apps
            </p>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary">
              <span className="font-semibold">{ccActiveCount}</span> Control Center
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-status-active/10 text-status-active">
              <span className="font-semibold">{siteActiveCount}</span> Sites
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-muted">
              <span className="font-semibold">{totalApps}</span> apps
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6 opacity-0 animate-fade-in" style={{ animationDelay: '50ms' }}>
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search integrations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(cat => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">In Use</SelectItem>
            <SelectItem value="inactive">Not in Use</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Control Center Section */}
      <IntegrationSection
        title="Control Center Integrations"
        description="Core integrations required to run the Control Center platform"
        variant="control-center"
        activeCount={ccActiveCount}
        totalCount={controlCenterIntegrations.length}
        isOpen={ccSectionOpen}
        onOpenChange={setCcSectionOpen}
      >
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {controlCenterIntegrations.map((integration, index) => (
            <IntegrationCard
              key={integration.id}
              integration={integration}
              onRemoveApp={(siteId) => removeIntegrationFromApp(integration.id, siteId)}
              onConnect={() => handleConnectCC(integration.id)}
              animationDelay={index * 50}
            />
          ))}
        </div>
      </IntegrationSection>

      {/* Created Sites Section */}
      <IntegrationSection
        title="Created Sites Integrations"
        description="Integrations for your Lovable-built websites"
        variant="created-sites"
        activeCount={siteActiveCount}
        totalCount={createdSiteIntegrations.length}
        isOpen={sitesSectionOpen}
        onOpenChange={setSitesSectionOpen}
      >
        {Object.entries(groupedSiteIntegrations).length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Plug className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p>No integrations match your filters</p>
          </div>
        ) : (
          Object.entries(groupedSiteIntegrations).map(([category, items], catIndex) => (
            <div key={category} className="mb-6 last:mb-0">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
                {category}
                <span className="ml-2 text-xs text-muted-foreground/60">
                  ({items.filter(i => i.linkedApps.length > 0).length}/{items.length} active)
                </span>
              </h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((integration, index) => (
                  <IntegrationCard
                    key={integration.id}
                    integration={integration}
                    onRemoveApp={(siteId) => removeIntegrationFromApp(integration.id, siteId)}
                    animationDelay={(catIndex * 3 + index) * 50}
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </IntegrationSection>
    </DashboardLayout>
  );
};

export default Integrations;
