import { useState } from 'react';
import { RefreshCw, Plus, Sparkles } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { SiteAnalyticsCard } from '@/components/dashboard/SiteAnalyticsCard';
import { AISuggestionBox } from '@/components/dashboard/AISuggestionBox';
import { ProductionReadiness } from '@/components/dashboard/ProductionReadiness';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useTenant } from '@/contexts/TenantContext';
import { sites } from '@/data/seed-data';
import { generateAISuggestions } from '@/utils/aiSuggestionAnalyzer';
import { AISuggestion } from '@/types';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const { toast } = useToast();
  const { currentTenant } = useTenant();
  const [suggestions, setSuggestions] = useState<AISuggestion[]>(() => generateAISuggestions(sites));

  const filteredSites = currentTenant
    ? sites.filter(site => site.tenantId === currentTenant.id)
    : sites;

  const handleImplementSuggestion = (suggestion: AISuggestion) => {
    toast({
      title: 'Implementation Started',
      description: `Implementing: ${suggestion.title}`,
    });
    setSuggestions(prev => prev.map(s => 
      s.id === suggestion.id ? { ...s, status: 'implementing' as const } : s
    ));
  };

  const handleChatSuggestion = (suggestion: AISuggestion) => {
    toast({
      title: 'Opening Chat',
      description: `Discussing: ${suggestion.title}`,
    });
  };

  const handleDismissSuggestion = (suggestionId: string) => {
    setSuggestions(prev => prev.map(s => 
      s.id === suggestionId ? { ...s, status: 'dismissed' as const } : s
    ));
    toast({
      title: 'Suggestion Dismissed',
      description: 'You can always regenerate suggestions later.',
    });
  };

  const handleViewSiteSuggestions = (siteId: string) => {
    const siteSuggestions = suggestions.filter(s => s.targetSiteId === siteId && s.status === 'pending');
    toast({
      title: `${siteSuggestions.length} Suggestions`,
      description: 'Scroll down to view AI recommendations.',
    });
  };

  // Get suggestions for each site
  const getSiteSuggestions = (siteId: string) => 
    suggestions.filter(s => s.targetSiteId === siteId);

  const pendingSuggestions = suggestions.filter(s => s.status === 'pending');

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

      {/* Production Readiness + AI Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
        <ProductionReadiness />
        <div className="lg:col-span-2 rounded-xl border bg-card p-5 opacity-0 animate-fade-in" style={{ animationDelay: '50ms' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">AI Analysis Summary</h3>
            </div>
            <Badge variant="secondary">{pendingSuggestions.length} suggestions</Badge>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            As a senior prompt engineer, I've analyzed your sites and identified {pendingSuggestions.length} improvement opportunities across performance, security, and SEO.
          </p>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 rounded-lg bg-status-inactive/10">
              <span className="text-2xl font-bold text-status-inactive">
                {pendingSuggestions.filter(s => s.priority === 'high').length}
              </span>
              <p className="text-xs text-muted-foreground mt-1">High Priority</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-status-warning/10">
              <span className="text-2xl font-bold text-status-warning">
                {pendingSuggestions.filter(s => s.priority === 'medium').length}
              </span>
              <p className="text-xs text-muted-foreground mt-1">Medium Priority</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-primary/10">
              <span className="text-2xl font-bold text-primary">
                {pendingSuggestions.filter(s => s.priority === 'low').length}
              </span>
              <p className="text-xs text-muted-foreground mt-1">Low Priority</p>
            </div>
          </div>
        </div>
      </div>

      {/* Sites Section Header */}
      <div className="flex items-center gap-3 mb-4 opacity-0 animate-fade-in" style={{ animationDelay: '100ms' }}>
        <span className="text-sm font-medium text-muted-foreground">Site Analytics</span>
        <Separator className="flex-1" />
        <Badge variant="secondary">
          {filteredSites.length} site{filteredSites.length !== 1 ? 's' : ''} 
          {currentTenant ? ` in ${currentTenant.name}` : ''}
        </Badge>
      </div>

      {/* Site Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
        {filteredSites.map((site, index) => (
          <SiteAnalyticsCard 
            key={site.id} 
            site={site} 
            suggestions={getSiteSuggestions(site.id)}
            onViewSuggestions={handleViewSiteSuggestions}
            delay={150 + index * 50} 
          />
        ))}
      </div>

      {filteredSites.length === 0 && (
        <div className="text-center py-16 opacity-0 animate-fade-in" style={{ animationDelay: '200ms' }}>
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

      {/* AI Suggestions Section */}
      {pendingSuggestions.length > 0 && (
        <>
          <div className="flex items-center gap-3 mb-4 opacity-0 animate-fade-in" style={{ animationDelay: '250ms' }}>
            <span className="text-sm font-medium text-muted-foreground">AI Recommendations</span>
            <Separator className="flex-1" />
          </div>
          <AISuggestionBox
            suggestions={suggestions}
            onImplement={handleImplementSuggestion}
            onChat={handleChatSuggestion}
            onDismiss={handleDismissSuggestion}
          />
        </>
      )}
    </DashboardLayout>
  );
};

export default Index;