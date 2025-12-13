import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Plug, Shield, Bug, Puzzle, Scale, Gauge,
  AlertTriangle, XCircle, Info, CheckCircle2, Wrench,
  ChevronDown, ChevronRight, Building2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AnalysisFinding } from '@/pages/Analyze';

interface AnalysisFindingsProps {
  findings: AnalysisFinding[];
  onToggle: (id: string) => void;
}

const categoryConfig = {
  integration: { icon: Plug, label: 'Integration', color: 'text-blue-500' },
  security: { icon: Shield, label: 'Security', color: 'text-red-500' },
  bug: { icon: Bug, label: 'Bug', color: 'text-orange-500' },
  feature: { icon: Puzzle, label: 'Feature', color: 'text-purple-500' },
  compliance: { icon: Scale, label: 'Compliance', color: 'text-yellow-500' },
  performance: { icon: Gauge, label: 'Performance', color: 'text-green-500' },
};

const severityConfig = {
  critical: { icon: XCircle, color: 'destructive', className: 'bg-red-500/10 border-red-500/30' },
  high: { icon: AlertTriangle, color: 'outline', className: 'bg-orange-500/10 border-orange-500/30 text-orange-500' },
  medium: { icon: Info, color: 'outline', className: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-500' },
  low: { icon: CheckCircle2, color: 'outline', className: 'bg-muted' },
};

export function AnalysisFindings({ findings, onToggle }: AnalysisFindingsProps) {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedSite, setSelectedSite] = useState<string>('all');
  const [expandedSites, setExpandedSites] = useState<Record<string, boolean>>({});

  // Get unique sites from findings with their colors
  const sites = useMemo(() => {
    const siteMap = new Map<string, { id: string; name: string; color: string }>();
    findings.forEach(f => {
      if (!siteMap.has(f.site_id)) {
        siteMap.set(f.site_id, {
          id: f.site_id,
          name: f.site_name,
          color: f.site_color || '#3b82f6'
        });
      }
    });
    return Array.from(siteMap.values());
  }, [findings]);

  // Initialize expanded state for all sites
  useMemo(() => {
    const expanded: Record<string, boolean> = {};
    sites.forEach(site => {
      if (expandedSites[site.id] === undefined) {
        expanded[site.id] = true;
      }
    });
    if (Object.keys(expanded).length > 0) {
      setExpandedSites(prev => ({ ...prev, ...expanded }));
    }
  }, [sites]);

  // Group findings by site
  const findingsBySite = useMemo(() => {
    const grouped: Record<string, AnalysisFinding[]> = {};
    findings.forEach(f => {
      if (!grouped[f.site_id]) {
        grouped[f.site_id] = [];
      }
      grouped[f.site_id].push(f);
    });
    return grouped;
  }, [findings]);

  // Filter findings
  const filteredFindings = useMemo(() => {
    let result = findings;
    if (activeCategory !== 'all') {
      result = result.filter(f => f.category === activeCategory);
    }
    if (selectedSite !== 'all') {
      result = result.filter(f => f.site_id === selectedSite);
    }
    return result;
  }, [findings, activeCategory, selectedSite]);

  // Re-group filtered findings by site
  const filteredBySite = useMemo(() => {
    const grouped: Record<string, AnalysisFinding[]> = {};
    filteredFindings.forEach(f => {
      if (!grouped[f.site_id]) {
        grouped[f.site_id] = [];
      }
      grouped[f.site_id].push(f);
    });
    return grouped;
  }, [filteredFindings]);

  const toggleSiteExpanded = (siteId: string) => {
    setExpandedSites(prev => ({ ...prev, [siteId]: !prev[siteId] }));
  };

  const categories = ['all', 'integration', 'security', 'bug', 'feature', 'compliance', 'performance'];

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle>Findings</CardTitle>
          <Select value={selectedSite} onValueChange={setSelectedSite}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by site" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sites</SelectItem>
              {sites.map(site => (
                <SelectItem key={site.id} value={site.id}>
                  <div className="flex items-center gap-2">
                    <div 
                      className="h-2.5 w-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: site.color }}
                    />
                    {site.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeCategory} onValueChange={setActiveCategory}>
          <TabsList className="flex-wrap h-auto gap-1 mb-4">
            <TabsTrigger value="all" className="gap-1">
              All ({findings.length})
            </TabsTrigger>
            {Object.entries(categoryConfig).map(([key, config]) => {
              const count = findings.filter(f => f.category === key).length;
              if (count === 0) return null;
              return (
                <TabsTrigger key={key} value={key} className="gap-1">
                  <config.icon className={cn("h-3 w-3", config.color)} />
                  {config.label} ({count})
                </TabsTrigger>
              );
            })}
          </TabsList>

          <div className="space-y-4">
            {filteredFindings.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No findings in this category
              </div>
            ) : (
              Object.entries(filteredBySite).map(([siteId, siteFindings]) => {
                const site = sites.find(s => s.id === siteId);
                const isExpanded = expandedSites[siteId] ?? true;
                const isControlCenter = siteId === 'control-center';

                return (
                  <Collapsible 
                    key={siteId} 
                    open={isExpanded}
                    onOpenChange={() => toggleSiteExpanded(siteId)}
                  >
                    <CollapsibleTrigger className="w-full">
                      <div 
                        className="flex items-center gap-3 p-3 rounded-lg border transition-colors hover:bg-accent/50"
                        style={{ borderLeftWidth: '4px', borderLeftColor: site?.color || '#3b82f6' }}
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        )}
                        {isControlCenter ? (
                          <Building2 className="h-4 w-4" style={{ color: site?.color }} />
                        ) : (
                          <div 
                            className="h-3 w-3 rounded-full shrink-0"
                            style={{ backgroundColor: site?.color || '#3b82f6' }}
                          />
                        )}
                        <span className="font-medium flex-1 text-left">
                          {site?.name || 'Unknown Site'}
                        </span>
                        <Badge variant="outline" className="gap-1">
                          {siteFindings.length} issue{siteFindings.length !== 1 ? 's' : ''}
                        </Badge>
                        <div className="flex gap-1">
                          {siteFindings.filter(f => f.severity === 'critical').length > 0 && (
                            <Badge variant="destructive" className="h-5 px-1.5">
                              {siteFindings.filter(f => f.severity === 'critical').length}
                            </Badge>
                          )}
                          {siteFindings.filter(f => f.severity === 'high').length > 0 && (
                            <Badge className="h-5 px-1.5 bg-orange-500/10 text-orange-500 border-orange-500/30">
                              {siteFindings.filter(f => f.severity === 'high').length}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent>
                      <div className="space-y-2 mt-2 ml-4 pl-4 border-l-2" style={{ borderColor: site?.color || '#3b82f6' }}>
                        {siteFindings.map((finding) => {
                          const category = categoryConfig[finding.category];
                          const severity = severityConfig[finding.severity];
                          const CategoryIcon = category.icon;
                          const SeverityIcon = severity.icon;

                          return (
                            <div
                              key={finding.id}
                              className={cn(
                                "flex items-start gap-3 p-4 rounded-lg border transition-colors cursor-pointer hover:bg-accent/50",
                                finding.selected && "bg-primary/5 border-primary/30"
                              )}
                              onClick={() => onToggle(finding.id)}
                            >
                              <Checkbox 
                                checked={finding.selected}
                                onCheckedChange={() => onToggle(finding.id)}
                                className="mt-1"
                              />
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                  <CategoryIcon className={cn("h-4 w-4", category.color)} />
                                  <span className="font-medium">{finding.title}</span>
                                  <Badge variant={severity.color as any} className="text-xs">
                                    <SeverityIcon className="h-3 w-3 mr-1" />
                                    {finding.severity}
                                  </Badge>
                                  {finding.action.type === 'auto-fix' && (
                                    <Badge variant="outline" className="text-xs gap-1 bg-green-500/10 text-green-600 border-green-500/30">
                                      <Wrench className="h-3 w-3" />
                                      Auto-fix
                                    </Badge>
                                  )}
                                </div>
                                
                                <p className="text-sm text-muted-foreground mb-2">
                                  {finding.description}
                                </p>
                                
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <span className="bg-muted px-2 py-0.5 rounded">
                                    {finding.action.label}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                );
              })
            )}
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
}
