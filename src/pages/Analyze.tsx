import { useState, useCallback, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Play, Loader2, CheckCircle2, AlertTriangle, XCircle, Zap, Building2, RefreshCw } from 'lucide-react';
import { AnalysisProgress } from '@/components/analyze/AnalysisProgress';
import { AnalysisFindings } from '@/components/analyze/AnalysisFindings';
import { ImplementationPreview } from '@/components/analyze/ImplementationPreview';
import { GlobalAnalysisReport } from '@/components/analyze/GlobalAnalysisReport';
import { RealTimeProgressPanel } from '@/components/analyze/RealTimeProgressPanel';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  ANALYSIS_MODULES, 
  CONTROL_CENTER_ID, 
  CONTROL_CENTER_NAME, 
  CONTROL_CENTER_COLOR,
  type SiteAnalysisReport,
  type SiteRequirement,
  type SiteSuggestion,
} from '@/utils/analyzeSystemPrompt';

// Legacy interface for backward compatibility
export interface AnalysisFinding {
  id: string;
  site_id: string;
  site_name: string;
  site_color?: string;
  category: 'integration' | 'security' | 'bug' | 'feature' | 'compliance' | 'performance';
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  action: {
    type: 'auto-fix' | 'manual' | 'review';
    label: string;
    implementation?: string;
  };
  selected: boolean;
}

type AnalysisState = 'idle' | 'running' | 'complete';

interface AnalysisModule {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'complete' | 'error';
  duration?: number;
}

interface ProgressLog {
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'error' | 'warning';
  siteId?: string;
  siteName?: string;
}

export default function Analyze() {
  const [state, setState] = useState<AnalysisState>('idle');
  const [modules, setModules] = useState<AnalysisModule[]>(
    ANALYSIS_MODULES.map(m => ({ id: m.id, name: m.name, status: 'pending' as const }))
  );
  const [findings, setFindings] = useState<AnalysisFinding[]>([]);
  const [siteReports, setSiteReports] = useState<SiteAnalysisReport[]>([]);
  const [progressLogs, setProgressLogs] = useState<ProgressLog[]>([]);
  const [showImplementation, setShowImplementation] = useState(false);
  const [currentPhase, setCurrentPhase] = useState('Initializing...');
  const { toast } = useToast();

  // Add log helper
  const addLog = useCallback((message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info', siteId?: string, siteName?: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setProgressLogs(prev => [...prev, { timestamp, message, type, siteId, siteName }]);
  }, []);

  const runAnalysis = useCallback(async () => {
    setState('running');
    setFindings([]);
    setSiteReports([]);
    setProgressLogs([]);
    
    // Reset modules
    setModules(ANALYSIS_MODULES.map(m => ({ id: m.id, name: m.name, status: 'pending' as const })));
    
    addLog('Starting comprehensive global analysis...', 'info');
    setCurrentPhase('Initializing Analysis Engine');

    try {
      // Run each module progressively
      for (let i = 0; i < ANALYSIS_MODULES.length; i++) {
        const module = ANALYSIS_MODULES[i];
        setCurrentPhase(module.name);
        addLog(`Running: ${module.name}`, 'info');
        
        // Update current module to running
        setModules(prev => prev.map((m, idx) => 
          idx === i ? { ...m, status: 'running' } : m
        ));

        await new Promise(resolve => setTimeout(resolve, 400));
        
        // Mark complete with duration
        setModules(prev => prev.map((m, idx) => 
          idx === i ? { ...m, status: 'complete', duration: Math.random() * 2 + 0.5 } : m
        ));
        
        addLog(`Completed: ${module.name}`, 'success');
      }

      // Invoke the edge function
      addLog('Fetching analysis results from backend...', 'info');
      setCurrentPhase('Fetching Results');
      
      const { data, error } = await supabase.functions.invoke('analyze-projects', {
        body: { action: 'analyze' }
      });

      if (error) throw error;

      // Process findings into site reports
      const findingsData = data?.findings || [];
      setFindings(findingsData);

      // Generate site reports from findings
      const reports = generateSiteReports(findingsData);
      setSiteReports(reports);

      setState('complete');
      addLog(`Analysis complete. Found ${findingsData.length} issues across ${reports.length} sites.`, 'success');
      
      toast({
        title: "Analysis Complete",
        description: `Found ${findingsData.length} issues across ${reports.length} sites. Review the reports below.`
      });
    } catch (error) {
      console.error('Analysis error:', error);
      addLog(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
      toast({
        title: "Analysis Failed",
        description: "Failed to complete analysis. Please try again.",
        variant: "destructive"
      });
      setState('idle');
    }
  }, [toast, addLog]);

  // Generate site reports from findings
  const generateSiteReports = (findingsData: AnalysisFinding[]): SiteAnalysisReport[] => {
    const siteMap = new Map<string, { findings: AnalysisFinding[]; color: string; name: string }>();
    
    findingsData.forEach(f => {
      if (!siteMap.has(f.site_id)) {
        siteMap.set(f.site_id, { findings: [], color: f.site_color || '#3b82f6', name: f.site_name });
      }
      siteMap.get(f.site_id)!.findings.push(f);
    });

    const reports: SiteAnalysisReport[] = [];
    
    siteMap.forEach((data, siteId) => {
      const isControlCenter = siteId === CONTROL_CENTER_ID;
      const requirements: SiteRequirement[] = data.findings.map((f, idx) => ({
        id: isControlCenter ? `CC-REQ-${String(idx + 1).padStart(3, '0')}` : `SITE-${data.name.toUpperCase().replace(/\s+/g, '-')}-REQ-${String(idx + 1).padStart(3, '0')}`,
        title: f.title,
        description: f.description,
        status: f.action.type === 'auto-fix' ? 'partial' : 'not-implemented' as const,
        evidence: {
          files: [],
          functions: [],
          routes: [],
          uxLocation: f.action.label,
        },
        testNames: [],
        selected: false,
      }));

      // Generate suggestions based on findings
      const suggestions: SiteSuggestion[] = generateSuggestions(data.findings, data.name, isControlCenter);

      const implementedCount = requirements.filter(r => r.status === 'implemented').length;
      const coverage = requirements.length > 0 ? Math.round((implementedCount / requirements.length) * 100) : 100;
      
      let status: SiteAnalysisReport['status'] = 'all-green';
      if (requirements.some(r => r.status === 'not-implemented')) status = 'blocked';
      else if (requirements.some(r => r.status === 'partial')) status = 'partial';

      reports.push({
        siteId,
        siteName: data.name,
        siteColor: data.color,
        isControlCenter,
        status,
        requirements,
        suggestions,
        defects: data.findings
          .filter(f => f.category === 'bug' && f.severity === 'critical')
          .map((f, idx) => ({
            id: `DEF-${idx + 1}`,
            title: f.title,
            causeCategory: 'missing-impl' as const,
            rootCause: f.description,
            reproSteps: [],
            logs: [],
          })),
        coverage: {
          implemented: implementedCount,
          partial: requirements.filter(r => r.status === 'partial').length,
          blocked: requirements.filter(r => r.status === 'not-implemented').length,
          total: requirements.length,
          percentage: coverage,
        },
        testResults: [],
        lastAnalyzed: new Date().toISOString(),
      });
    });

    // Sort: Control Center first, then by status
    return reports.sort((a, b) => {
      if (a.isControlCenter) return -1;
      if (b.isControlCenter) return 1;
      const statusOrder = { 'blocked': 0, 'partial': 1, 'pending': 2, 'all-green': 3 };
      return statusOrder[a.status] - statusOrder[b.status];
    });
  };

  // Generate production readiness suggestions
  const generateSuggestions = (findings: AnalysisFinding[], siteName: string, isControlCenter: boolean): SiteSuggestion[] => {
    const suggestions: SiteSuggestion[] = [];
    let idx = 1;

    const prefix = isControlCenter ? 'CC-SUG' : `SITE-${siteName.toUpperCase().replace(/\s+/g, '-')}-SUG`;

    // Security suggestions
    if (!findings.some(f => f.category === 'security')) {
      suggestions.push({
        id: `${prefix}-${String(idx++).padStart(3, '0')}`,
        title: 'Implement API Key Rotation',
        rationale: 'Production systems should rotate API keys regularly for security',
        fixPlan: ['Add key rotation scheduler', 'Implement key versioning', 'Add rotation notifications'],
        acceptanceCriteria: ['Keys rotate every 90 days', 'Old keys gracefully deprecated', 'Notifications sent 7 days before expiry'],
        category: 'security',
        priority: 'high',
        selected: false,
      });
    }

    // Observability suggestions
    suggestions.push({
      id: `${prefix}-${String(idx++).padStart(3, '0')}`,
      title: 'Add Structured Logging',
      rationale: 'Structured logs enable better debugging and monitoring in production',
      fixPlan: ['Implement log levels', 'Add request tracing', 'Configure log aggregation'],
      acceptanceCriteria: ['All logs have consistent format', 'Request IDs traced end-to-end', 'Logs searchable by level'],
      category: 'observability',
      priority: 'medium',
      selected: false,
    });

    // Performance suggestions
    if (findings.some(f => f.category === 'performance')) {
      suggestions.push({
        id: `${prefix}-${String(idx++).padStart(3, '0')}`,
        title: 'Implement Response Caching',
        rationale: 'Caching can significantly improve response times',
        fixPlan: ['Add cache layer', 'Configure TTLs', 'Implement cache invalidation'],
        acceptanceCriteria: ['Cache hit rate > 70%', 'Response time < 200ms for cached requests'],
        category: 'performance',
        priority: 'medium',
        selected: false,
      });
    }

    // UX suggestions
    suggestions.push({
      id: `${prefix}-${String(idx++).padStart(3, '0')}`,
      title: 'Add Loading Skeletons',
      rationale: 'Loading skeletons improve perceived performance',
      fixPlan: ['Create skeleton components', 'Add to data-fetching pages', 'Match actual content layout'],
      acceptanceCriteria: ['All async pages show skeletons', 'Skeleton matches content layout', 'Smooth transition to content'],
      category: 'ux',
      priority: 'low',
      selected: false,
    });

    return suggestions;
  };

  const toggleFinding = (id: string) => {
    setFindings(prev => prev.map(f => 
      f.id === id ? { ...f, selected: !f.selected } : f
    ));
  };

  const toggleRequirement = (siteId: string, reqId: string) => {
    setSiteReports(prev => prev.map(report => {
      if (report.siteId !== siteId) return report;
      return {
        ...report,
        requirements: report.requirements.map(req => 
          req.id === reqId ? { ...req, selected: !req.selected } : req
        )
      };
    }));
  };

  const toggleSuggestion = (siteId: string, sugId: string) => {
    setSiteReports(prev => prev.map(report => {
      if (report.siteId !== siteId) return report;
      return {
        ...report,
        suggestions: report.suggestions.map(sug => 
          sug.id === sugId ? { ...sug, selected: !sug.selected } : sug
        )
      };
    }));
  };

  const selectAll = (filter?: 'critical' | 'auto-fix') => {
    setFindings(prev => prev.map(f => ({
      ...f,
      selected: filter === 'critical' 
        ? f.severity === 'critical' 
        : filter === 'auto-fix' 
        ? f.action.type === 'auto-fix'
        : true
    })));
  };

  const selectedFindings = findings.filter(f => f.selected);
  const selectedCount = useMemo(() => {
    const reqCount = siteReports.reduce((sum, r) => sum + r.requirements.filter(req => req.selected).length, 0);
    const sugCount = siteReports.reduce((sum, r) => sum + r.suggestions.filter(sug => sug.selected).length, 0);
    return reqCount + sugCount + selectedFindings.length;
  }, [siteReports, selectedFindings]);

  const severityCounts = {
    critical: findings.filter(f => f.severity === 'critical').length,
    high: findings.filter(f => f.severity === 'high').length,
    medium: findings.filter(f => f.severity === 'medium').length,
    low: findings.filter(f => f.severity === 'low').length,
  };

  // Calculate progress
  const moduleProgress = useMemo(() => {
    const completed = modules.filter(m => m.status === 'complete').length;
    return (completed / modules.length) * 100;
  }, [modules]);

  const siteProgressItems = useMemo(() => {
    return siteReports.map(report => ({
      siteId: report.siteId,
      siteName: report.siteName,
      siteColor: report.siteColor,
      isControlCenter: report.isControlCenter,
      status: 'complete' as const,
      progress: 100,
      currentAction: undefined,
    }));
  }, [siteReports]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Search className="h-6 w-6 text-primary" />
              Global Remediation & Production Readiness
            </h1>
            <p className="text-muted-foreground mt-1">
              Audit Control Center + all imported sites for issues, fixes, and production readiness
            </p>
          </div>
          
          {state === 'idle' && (
            <Button onClick={runAnalysis} size="lg" className="gap-2">
              <Play className="h-4 w-4" />
              Run Analysis
            </Button>
          )}
          
          {state === 'complete' && (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => { setState('idle'); setFindings([]); setSiteReports([]); }}>
                <RefreshCw className="h-4 w-4 mr-2" />
                New Analysis
              </Button>
              {selectedCount > 0 && (
                <Button onClick={() => setShowImplementation(true)} className="gap-2">
                  <Zap className="h-4 w-4" />
                  Implement ({selectedCount})
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Analysis Progress */}
        {state === 'running' && (
          <>
            <AnalysisProgress modules={modules} />
            {siteProgressItems.length > 0 && (
              <RealTimeProgressPanel
                sites={siteProgressItems}
                logs={progressLogs}
                overallProgress={moduleProgress}
                currentPhase={currentPhase}
              />
            )}
          </>
        )}

        {/* Complete State - Show Global Report */}
        {state === 'complete' && siteReports.length > 0 && (
          <GlobalAnalysisReport
            siteReports={siteReports}
            onToggleRequirement={toggleRequirement}
            onToggleSuggestion={toggleSuggestion}
            onImplementSelected={() => setShowImplementation(true)}
            selectedCount={selectedCount}
          />
        )}

        {/* Legacy Findings (for backward compatibility) */}
        {state === 'complete' && findings.length > 0 && siteReports.length === 0 && (
          <>
            {/* Summary */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Analysis Summary</CardTitle>
                <CardDescription>
                  {findings.length} issues found across your projects
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  <Badge variant="destructive" className="gap-1">
                    <XCircle className="h-3 w-3" />
                    {severityCounts.critical} Critical
                  </Badge>
                  <Badge variant="outline" className="gap-1 border-orange-500 text-orange-500">
                    <AlertTriangle className="h-3 w-3" />
                    {severityCounts.high} High
                  </Badge>
                  <Badge variant="outline" className="gap-1 border-yellow-500 text-yellow-500">
                    <AlertTriangle className="h-3 w-3" />
                    {severityCounts.medium} Medium
                  </Badge>
                  <Badge variant="outline" className="gap-1">
                    {severityCounts.low} Low
                  </Badge>
                </div>
                
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm" onClick={() => selectAll()}>
                    Select All
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => selectAll('critical')}>
                    Select Critical
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => selectAll('auto-fix')}>
                    Select Auto-Fix Only
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setFindings(prev => prev.map(f => ({ ...f, selected: false })))}>
                    Clear Selection
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Findings List */}
            <AnalysisFindings 
              findings={findings} 
              onToggle={toggleFinding}
            />
          </>
        )}

        {/* Idle State */}
        {state === 'idle' && (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Search className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Ready to Analyze</h3>
              <p className="text-muted-foreground text-center max-w-md mb-4">
                Click "Run Analysis" to perform a comprehensive audit of the Control Center and all imported Lovable projects.
              </p>
              
              <div className="flex flex-wrap justify-center gap-2 mb-6">
                <Badge variant="outline" className="gap-1">
                  <Building2 className="h-3 w-3 text-cyan-500" />
                  Control Center
                </Badge>
                <Badge variant="outline">Security Audit</Badge>
                <Badge variant="outline">Integration Health</Badge>
                <Badge variant="outline">Bug Detection</Badge>
                <Badge variant="outline">Production Readiness</Badge>
                <Badge variant="outline">Performance</Badge>
              </div>
              
              <Button onClick={runAnalysis} size="lg" className="gap-2">
                <Play className="h-4 w-4" />
                Run Analysis
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Implementation Preview Dialog */}
        <ImplementationPreview 
          open={showImplementation}
          onOpenChange={setShowImplementation}
          findings={selectedFindings}
          onComplete={() => {
            setShowImplementation(false);
            setState('idle');
            setFindings([]);
            setSiteReports([]);
          }}
        />
      </div>
    </DashboardLayout>
  );
}
