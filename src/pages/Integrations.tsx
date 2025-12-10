import { useState } from 'react';
import { Plug, Filter, Search } from 'lucide-react';
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
import { useIntegrations } from '@/contexts/IntegrationsContext';
import { cn } from '@/lib/utils';

const Integrations = () => {
  const { integrations, removeIntegrationFromApp } = useIntegrations();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Get unique categories
  const categories = [...new Set(integrations.map(i => i.category))];

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

  // Group by category
  const groupedIntegrations = categories.reduce((acc, category) => {
    const items = filteredIntegrations.filter(i => i.category === category);
    if (items.length > 0) {
      acc[category] = items;
    }
    return acc;
  }, {} as Record<string, typeof filteredIntegrations>);

  // Stats
  const activeCount = integrations.filter(i => i.linkedApps.length > 0).length;
  const totalApps = new Set(integrations.flatMap(i => i.linkedApps.map(a => a.siteId))).size;

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
              <span className="font-semibold">{activeCount}</span> active
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-muted">
              <span className="font-semibold">{totalApps}</span> apps connected
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

      {/* Integration Categories */}
      {Object.entries(groupedIntegrations).length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Plug className="h-12 w-12 mx-auto mb-3 opacity-20" />
          <p>No integrations match your filters</p>
        </div>
      ) : (
        Object.entries(groupedIntegrations).map(([category, items], catIndex) => (
          <div key={category} className="mb-8">
            <h2 
              className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4 opacity-0 animate-fade-in" 
              style={{ animationDelay: `${catIndex * 50 + 100}ms` }}
            >
              {category}
              <span className="ml-2 text-xs text-muted-foreground/60">
                ({items.filter(i => i.linkedApps.length > 0).length}/{items.length} active)
              </span>
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map((integration, index) => (
                <IntegrationCard
                  key={integration.id}
                  integration={integration}
                  onRemoveApp={(siteId) => removeIntegrationFromApp(integration.id, siteId)}
                  animationDelay={(catIndex * 3 + index) * 50 + 150}
                />
              ))}
            </div>
          </div>
        ))
      )}
    </DashboardLayout>
  );
};

export default Integrations;
