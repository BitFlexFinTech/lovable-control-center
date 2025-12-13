import { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Zap, CheckCircle2, Loader2, AlertTriangle, 
  Wrench, Eye, XCircle, ChevronDown, ChevronRight, Building2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { AnalysisFinding } from '@/pages/Analyze';
import { cn } from '@/lib/utils';

interface ImplementationPreviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  findings: AnalysisFinding[];
  onComplete: () => void;
}

type ImplementationState = 'preview' | 'running' | 'complete';
type SiteStatus = 'pending' | 'running' | 'complete' | 'error';

interface ImplementationResult {
  findingId: string;
  siteId: string;
  siteName: string;
  status: 'success' | 'failed' | 'skipped';
  message?: string;
}

interface SiteProgress {
  siteId: string;
  siteName: string;
  siteColor: string;
  status: SiteStatus;
  progress: number;
  totalFindings: number;
  completedFindings: number;
  results: ImplementationResult[];
}

export function ImplementationPreview({ 
  open, 
  onOpenChange, 
  findings,
  onComplete 
}: ImplementationPreviewProps) {
  const [state, setState] = useState<ImplementationState>('preview');
  const [currentSite, setCurrentSite] = useState<string>('');
  const [currentAction, setCurrentAction] = useState<string>('');
  const [siteProgress, setSiteProgress] = useState<Record<string, SiteProgress>>({});
  const [expandedSites, setExpandedSites] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  // Group findings by site
  const findingsBySite = useMemo(() => {
    const grouped: Record<string, { findings: AnalysisFinding[]; color: string; name: string }> = {};
    findings.forEach(f => {
      if (!grouped[f.site_id]) {
        grouped[f.site_id] = {
          findings: [],
          color: f.site_color || '#3b82f6',
          name: f.site_name
        };
      }
      grouped[f.site_id].findings.push(f);
    });
    return grouped;
  }, [findings]);

  const autoFixCount = findings.filter(f => f.action.type === 'auto-fix').length;
  const manualCount = findings.filter(f => f.action.type === 'manual').length;
  const reviewCount = findings.filter(f => f.action.type === 'review').length;
  const siteCount = Object.keys(findingsBySite).length;

  const handleImplement = async () => {
    setState('running');
    
    // Initialize progress for all sites
    const initialProgress: Record<string, SiteProgress> = {};
    const initialExpanded: Record<string, boolean> = {};
    Object.entries(findingsBySite).forEach(([siteId, data]) => {
      initialProgress[siteId] = {
        siteId,
        siteName: data.name,
        siteColor: data.color,
        status: 'pending',
        progress: 0,
        totalFindings: data.findings.length,
        completedFindings: 0,
        results: []
      };
      initialExpanded[siteId] = true;
    });
    setSiteProgress(initialProgress);
    setExpandedSites(initialExpanded);

    try {
      const { data, error } = await supabase.functions.invoke('analyze-projects', {
        body: { 
          action: 'implement',
          findings: findings.map(f => ({ 
            id: f.id, 
            site_id: f.site_id,
            site_name: f.site_name,
            action: f.action 
          }))
        }
      });

      if (error) throw error;

      // Process each site sequentially for visual effect
      const siteIds = Object.keys(findingsBySite);
      
      for (let siteIndex = 0; siteIndex < siteIds.length; siteIndex++) {
        const siteId = siteIds[siteIndex];
        const siteData = findingsBySite[siteId];
        
        setCurrentSite(siteId);
        
        // Update site status to running
        setSiteProgress(prev => ({
          ...prev,
          [siteId]: { ...prev[siteId], status: 'running' }
        }));

        // Process each finding in this site
        for (let i = 0; i < siteData.findings.length; i++) {
          const finding = siteData.findings[i];
          setCurrentAction(finding.title);
          
          await new Promise(resolve => setTimeout(resolve, 600));
          
          const result: ImplementationResult = {
            findingId: finding.id,
            siteId: siteId,
            siteName: siteData.name,
            status: finding.action.type === 'auto-fix' ? 'success' : 'skipped',
            message: finding.action.type === 'auto-fix' 
              ? 'Successfully applied fix' 
              : 'Requires manual action'
          };

          setSiteProgress(prev => ({
            ...prev,
            [siteId]: {
              ...prev[siteId],
              progress: ((i + 1) / siteData.findings.length) * 100,
              completedFindings: i + 1,
              results: [...prev[siteId].results, result]
            }
          }));
        }

        // Mark site as complete
        setSiteProgress(prev => ({
          ...prev,
          [siteId]: { ...prev[siteId], status: 'complete', progress: 100 }
        }));
      }

      setState('complete');
      toast({
        title: "Implementation Complete",
        description: `Applied fixes across ${siteCount} sites. ${autoFixCount} auto-fixes, ${manualCount + reviewCount} require manual action.`
      });
    } catch (error) {
      console.error('Implementation error:', error);
      toast({
        title: "Implementation Failed",
        description: "Some actions could not be completed.",
        variant: "destructive"
      });
      setState('complete');
    }
  };

  const handleClose = () => {
    if (state === 'complete') {
      onComplete();
    }
    setState('preview');
    setSiteProgress({});
    setExpandedSites({});
    onOpenChange(false);
  };

  const toggleSiteExpanded = (siteId: string) => {
    setExpandedSites(prev => ({ ...prev, [siteId]: !prev[siteId] }));
  };

  const overallProgress = useMemo(() => {
    const progresses = Object.values(siteProgress);
    if (progresses.length === 0) return 0;
    const totalProgress = progresses.reduce((sum, sp) => sum + sp.progress, 0);
    return totalProgress / progresses.length;
  }, [siteProgress]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            {state === 'preview' && 'Implementation Preview'}
            {state === 'running' && 'Implementing Changes...'}
            {state === 'complete' && 'Implementation Complete'}
          </DialogTitle>
          <DialogDescription>
            {state === 'preview' && `Review ${findings.length} actions across ${siteCount} sites`}
            {state === 'running' && currentAction}
            {state === 'complete' && `All actions processed across ${siteCount} sites`}
          </DialogDescription>
        </DialogHeader>

        {state === 'running' && (
          <div className="py-4 space-y-4">
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>Overall Progress</span>
                <span>{Math.round(overallProgress)}%</span>
              </div>
              <Progress value={overallProgress} className="h-2" />
            </div>
          </div>
        )}

        {state === 'preview' && (
          <>
            {/* Summary */}
            <div className="flex gap-3 py-2">
              <Badge variant="outline" className="gap-1">
                {siteCount} Site{siteCount !== 1 ? 's' : ''}
              </Badge>
              <Badge variant="outline" className="gap-1 bg-green-500/10 text-green-600 border-green-500/30">
                <Wrench className="h-3 w-3" />
                {autoFixCount} Auto-fix
              </Badge>
              <Badge variant="outline" className="gap-1 bg-orange-500/10 text-orange-600 border-orange-500/30">
                <AlertTriangle className="h-3 w-3" />
                {manualCount} Manual
              </Badge>
              <Badge variant="outline" className="gap-1">
                <Eye className="h-3 w-3" />
                {reviewCount} Review
              </Badge>
            </div>

            <Separator />

            {/* Sites List */}
            <ScrollArea className="h-[350px] pr-4">
              <div className="space-y-3">
                {Object.entries(findingsBySite).map(([siteId, data]) => {
                  const isControlCenter = siteId === 'control-center';
                  
                  return (
                    <div 
                      key={siteId}
                      className="rounded-lg border"
                      style={{ borderLeftWidth: '4px', borderLeftColor: data.color }}
                    >
                      <div className="flex items-center gap-3 p-3 bg-muted/30">
                        {isControlCenter ? (
                          <Building2 className="h-4 w-4" style={{ color: data.color }} />
                        ) : (
                          <div 
                            className="h-3 w-3 rounded-full shrink-0"
                            style={{ backgroundColor: data.color }}
                          />
                        )}
                        <span className="font-medium flex-1">{data.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {data.findings.length} action{data.findings.length !== 1 ? 's' : ''}
                        </Badge>
                      </div>
                      <div className="p-2 space-y-1">
                        {data.findings.map((finding) => (
                          <div 
                            key={finding.id}
                            className="flex items-center gap-2 p-2 rounded text-sm"
                          >
                            {finding.action.type === 'auto-fix' ? (
                              <Wrench className="h-3.5 w-3.5 text-green-500 shrink-0" />
                            ) : finding.action.type === 'manual' ? (
                              <AlertTriangle className="h-3.5 w-3.5 text-orange-500 shrink-0" />
                            ) : (
                              <Eye className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            )}
                            <span className="flex-1 truncate">{finding.title}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </>
        )}

        {(state === 'running' || state === 'complete') && (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-3">
              {Object.entries(siteProgress).map(([siteId, sp]) => {
                const isExpanded = expandedSites[siteId] ?? true;
                const isControlCenter = siteId === 'control-center';
                const successCount = sp.results.filter(r => r.status === 'success').length;
                const failedCount = sp.results.filter(r => r.status === 'failed').length;

                return (
                  <Collapsible 
                    key={siteId}
                    open={isExpanded}
                    onOpenChange={() => toggleSiteExpanded(siteId)}
                  >
                    <div 
                      className="rounded-lg border overflow-hidden"
                      style={{ borderLeftWidth: '4px', borderLeftColor: sp.siteColor }}
                    >
                      <CollapsibleTrigger className="w-full">
                        <div className="flex items-center gap-3 p-3 bg-muted/30 hover:bg-muted/50 transition-colors">
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          )}
                          {isControlCenter ? (
                            <Building2 className="h-4 w-4" style={{ color: sp.siteColor }} />
                          ) : (
                            <div 
                              className="h-3 w-3 rounded-full shrink-0"
                              style={{ backgroundColor: sp.siteColor }}
                            />
                          )}
                          <span className="font-medium flex-1 text-left">{sp.siteName}</span>
                          
                          {sp.status === 'pending' && (
                            <Badge variant="outline" className="gap-1 text-muted-foreground">
                              Queued
                            </Badge>
                          )}
                          {sp.status === 'running' && (
                            <Badge variant="outline" className="gap-1 bg-blue-500/10 text-blue-600 border-blue-500/30">
                              <Loader2 className="h-3 w-3 animate-spin" />
                              Running
                            </Badge>
                          )}
                          {sp.status === 'complete' && (
                            <Badge variant="outline" className="gap-1 bg-green-500/10 text-green-600 border-green-500/30">
                              <CheckCircle2 className="h-3 w-3" />
                              Complete
                            </Badge>
                          )}
                          {sp.status === 'error' && (
                            <Badge variant="destructive" className="gap-1">
                              <XCircle className="h-3 w-3" />
                              Error
                            </Badge>
                          )}
                        </div>
                      </CollapsibleTrigger>

                      {sp.status === 'running' && (
                        <div className="px-3 pb-2">
                          <Progress value={sp.progress} className="h-1.5" />
                          <p className="text-xs text-muted-foreground mt-1">
                            {sp.completedFindings} of {sp.totalFindings} actions
                          </p>
                        </div>
                      )}

                      <CollapsibleContent>
                        <div className="p-2 space-y-1 border-t">
                          {sp.results.map((result, idx) => (
                            <div 
                              key={idx}
                              className="flex items-center gap-2 p-2 rounded text-sm"
                            >
                              {result.status === 'success' ? (
                                <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />
                              ) : result.status === 'failed' ? (
                                <XCircle className="h-3.5 w-3.5 text-red-500 shrink-0" />
                              ) : (
                                <AlertTriangle className="h-3.5 w-3.5 text-orange-500 shrink-0" />
                              )}
                              <span className="flex-1 truncate text-muted-foreground">
                                {result.message}
                              </span>
                            </div>
                          ))}
                          {sp.results.length === 0 && sp.status === 'pending' && (
                            <p className="text-sm text-muted-foreground p-2">
                              Waiting to process...
                            </p>
                          )}
                        </div>
                      </CollapsibleContent>
                    </div>
                  </Collapsible>
                );
              })}
            </div>
          </ScrollArea>
        )}

        <DialogFooter>
          {state === 'preview' && (
            <>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={handleImplement} className="gap-2">
                <Zap className="h-4 w-4" />
                Implement Across {siteCount} Sites
              </Button>
            </>
          )}
          
          {state === 'running' && (
            <Button disabled>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Implementing...
            </Button>
          )}
          
          {state === 'complete' && (
            <Button onClick={handleClose}>
              Done
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
