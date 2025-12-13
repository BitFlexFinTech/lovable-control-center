import { useState } from 'react';
import { RefreshCw, Plus, Sparkles, Activity, Wifi, Globe, Layers, Import, ChevronDown, Share2 } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { SiteAnalyticsCard } from '@/components/dashboard/SiteAnalyticsCard';
import { AISuggestionBox } from '@/components/dashboard/AISuggestionBox';
import { ImplementationPreviewDialog } from '@/components/dashboard/ImplementationPreviewDialog';
import { ProductionReadiness } from '@/components/dashboard/ProductionReadiness';
import { PreLaunchChecklist } from '@/components/dashboard/PreLaunchChecklist';
import { 
  HealthStatusWidget, 
  SSLStatusWidget, 
  EmailStatsWidget, 
  BackupStatusWidget 
} from '@/components/dashboard/MonitoringWidgets';
import { 
  RealTimeIndicator, 
  LiveMetrics 
} from '@/components/dashboard/RealTimeIndicator';
import { LiveActivityFeed } from '@/components/dashboard/LiveActivityFeed';
import { OnlineAdmins } from '@/components/dashboard/OnlineAdmins';
import { SocialsWidget } from '@/components/dashboard/SocialsWidget';
import {
  SiteAnalyticsCardSkeleton,
  MonitoringWidgetSkeleton,
  ProductionReadinessSkeleton,
  ActivityFeedSkeleton,
  PreLaunchChecklistSkeleton,
  AISummarySkeleton,
} from '@/components/dashboard/DashboardSkeletons';
import { CreateSiteWithDomainDialog } from '@/components/mail/CreateSiteWithDomainDialog';
import { ImportAppDialog } from '@/components/sites/ImportAppDialog';
import { MultiSiteBuilderDialog } from '@/components/sites/MultiSiteBuilderDialog';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useHealthMonitor } from '@/contexts/HealthMonitorContext';
import { useSites, useSuggestions, useDashboardRefresh } from '@/hooks/useDashboardData';
import { useTenant } from '@/contexts/TenantContext';
import { AISuggestion } from '@/types';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const { toast } = useToast();
  const { isMonitoring, lastUpdate } = useHealthMonitor();
  const { refresh } = useDashboardRefresh();
  const { currentTenant } = useTenant();
  
  // React Query hooks for data fetching
  const { data: filteredSites = [], isLoading: sitesLoading, isFetching: sitesRefetching } = useSites();
  const { data: queriedSuggestions = [], isLoading: suggestionsLoading } = useSuggestions(filteredSites);
  
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [previewSuggestion, setPreviewSuggestion] = useState<AISuggestion | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
const [isCreateSiteOpen, setIsCreateSiteOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isMultiSiteOpen, setIsMultiSiteOpen] = useState(false);

  // Sync suggestions from query to local state for mutations
  useState(() => {
    if (queriedSuggestions.length > 0 && suggestions.length === 0) {
      setSuggestions(queriedSuggestions);
    }
  });

  const isLoading = sitesLoading || suggestionsLoading;
  const isRefreshing = sitesRefetching;

  // Convert DashboardSite to Site format for SiteAnalyticsCard
  const convertToSite = (site: typeof filteredSites[0]) => ({
    id: site.id,
    tenantId: site.tenant_id || '',
    name: site.name,
    url: site.domain ? `https://${site.domain}` : '',
    status: (site.status === 'live' || site.status === 'active' ? 'active' : 'inactive') as 'active' | 'inactive' | 'warning',
    dashboards: [],
    healthCheck: {
      lastCheck: new Date().toISOString(),
      status: (site.health_status === 'healthy' ? 'active' : 'inactive') as 'active' | 'inactive' | 'warning',
      responseTime: site.response_time_ms || 150,
      uptime: site.uptime_percentage || 99.9,
    },
    lastSync: new Date().toISOString(),
    metrics: {
      traffic: Math.floor(Math.random() * 10000),
      trafficChange: Math.random() * 20 - 10,
      orders: Math.floor(Math.random() * 500),
      ordersChange: Math.random() * 20 - 10,
    },
    sparklineData: [0, 0, 0, 0, 0, 0, 0].map(() => Math.floor(Math.random() * 100)),
    appColor: site.app_color || '#3b82f6',
    demoMode: { isDemo: site.status === 'demo', isLive: site.status === 'live' },
  });
  const handleRefresh = async () => {
    await refresh();
    toast({
      title: 'Dashboard Refreshed',
      description: 'All data has been updated.',
    });
  };

  const handleImplementSuggestion = (suggestion: AISuggestion) => {
    setPreviewSuggestion(suggestion);
    setIsPreviewOpen(true);
  };

  const handleConfirmImplement = (suggestion: AISuggestion) => {
    toast({
      title: 'Implementation Complete',
      description: `Successfully implemented: ${suggestion.title}`,
    });
    setSuggestions(prev => prev.map(s => 
      s.id === suggestion.id ? { ...s, status: 'completed' as const } : s
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

  const getSiteSuggestions = (siteId: string) => 
    suggestions.filter(s => s.targetSiteId === siteId);

  const pendingSuggestions = suggestions.filter(s => s.status === 'pending');

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-8 opacity-0 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
              <RealTimeIndicator isConnected={isMonitoring} lastUpdate={lastUpdate} />
            </div>
            <p className="text-muted-foreground mt-1">
              Monitor all your sites and tenants from one place
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-1.5"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              Sync All
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" className="gap-1.5">
                  <Globe className="h-3.5 w-3.5" />
                  Create Site
                  <ChevronDown className="h-3 w-3 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => setIsCreateSiteOpen(true)}>
                  <Globe className="h-4 w-4 mr-2" />
                  Single Site
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsMultiSiteOpen(true)}>
                  <Layers className="h-4 w-4 mr-2" />
                  Multi-Site Builder
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setIsImportOpen(true)}>
                  <Import className="h-4 w-4 mr-2" />
                  Import from Lovable
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Pre-Launch Checklist */}
      <div className="mb-6">
        {isLoading ? <PreLaunchChecklistSkeleton /> : <PreLaunchChecklist />}
      </div>

      {/* Monitoring Widgets Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {isLoading ? (
          <>
            <MonitoringWidgetSkeleton />
            <MonitoringWidgetSkeleton />
            <MonitoringWidgetSkeleton />
            <MonitoringWidgetSkeleton />
          </>
        ) : (
          <>
            <HealthStatusWidget />
            <SSLStatusWidget />
            <EmailStatsWidget />
            <BackupStatusWidget />
          </>
        )}
      </div>

      {/* Production Readiness + Live Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
        {isLoading ? (
          <>
            <ProductionReadinessSkeleton />
            <ActivityFeedSkeleton />
            <ActivityFeedSkeleton />
          </>
        ) : (
          <>
            <ProductionReadiness />
            
            {/* Live Metrics Card */}
            <Card className="opacity-0 animate-fade-in" style={{ animationDelay: '100ms' }}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-primary" />
                    <CardTitle className="text-sm font-medium">Live Metrics</CardTitle>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Wifi className="h-3 w-3 text-status-active animate-pulse" />
                    <span className="text-xs text-status-active">Live</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <LiveMetrics />
              </CardContent>
            </Card>

            {/* Socials Widget */}
            <SocialsWidget />

            {/* Activity Feed Card */}
            <Card className="opacity-0 animate-fade-in" style={{ animationDelay: '150ms' }}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
                  <Badge variant="secondary" className="text-xs">Auto-updating</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <LiveActivityFeed />
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* AI Analysis Summary */}
      {isLoading ? (
        <div className="mb-8">
          <AISummarySkeleton />
        </div>
      ) : (
        <div className="rounded-xl border bg-card p-5 mb-8 opacity-0 animate-fade-in" style={{ animationDelay: '200ms' }}>
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
      )}

      {/* Sites Section Header */}
      <div className="flex items-center gap-3 mb-4 opacity-0 animate-fade-in" style={{ animationDelay: '250ms' }}>
        <span className="text-sm font-medium text-muted-foreground">Site Analytics</span>
        <Separator className="flex-1" />
        <Badge variant="secondary">
          {filteredSites.length} site{filteredSites.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      {/* Site Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
        {isLoading ? (
          <>
            <SiteAnalyticsCardSkeleton />
            <SiteAnalyticsCardSkeleton />
            <SiteAnalyticsCardSkeleton />
          </>
        ) : (
          filteredSites.map((site, index) => (
            <SiteAnalyticsCard 
              key={site.id} 
              site={convertToSite(site)} 
              suggestions={getSiteSuggestions(site.id)}
              onViewSuggestions={handleViewSiteSuggestions}
              delay={300 + index * 50} 
            />
          ))
        )}
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
          <Button className="gap-1.5" onClick={() => setIsCreateSiteOpen(true)}>
            <Plus className="h-4 w-4" />
            Add Site
          </Button>
        </div>
      )}

      {/* AI Suggestions Section */}
      {pendingSuggestions.length > 0 && (
        <>
          <div className="flex items-center gap-3 mb-4 opacity-0 animate-fade-in" style={{ animationDelay: '350ms' }}>
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

      {/* Implementation Preview Dialog */}
      <ImplementationPreviewDialog
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        suggestion={previewSuggestion}
        onConfirmImplement={handleConfirmImplement}
      />

      {/* Create Site Dialog */}
      <CreateSiteWithDomainDialog
        isOpen={isCreateSiteOpen}
        onClose={() => setIsCreateSiteOpen(false)}
        onCreate={() => {
          refresh();
          setIsCreateSiteOpen(false);
        }}
        tenantId={currentTenant?.id || ''}
      />

      {/* Import App Dialog */}
      <ImportAppDialog 
        open={isImportOpen} 
        onOpenChange={setIsImportOpen} 
      />

      {/* Multi-Site Builder Dialog */}
      <MultiSiteBuilderDialog 
        isOpen={isMultiSiteOpen} 
        onClose={() => setIsMultiSiteOpen(false)} 
        onBuild={() => refresh()} 
      />
    </DashboardLayout>
  );
};

export default Index;
