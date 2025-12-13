import { useState, useCallback } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Play, Loader2, CheckCircle2, AlertTriangle, XCircle, Zap } from 'lucide-react';
import { AnalysisProgress } from '@/components/analyze/AnalysisProgress';
import { AnalysisFindings } from '@/components/analyze/AnalysisFindings';
import { ImplementationPreview } from '@/components/analyze/ImplementationPreview';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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

export default function Analyze() {
  const [state, setState] = useState<AnalysisState>('idle');
  const [modules, setModules] = useState<AnalysisModule[]>([
    { id: 'integration', name: 'Integration Health', status: 'pending' },
    { id: 'security', name: 'Security Audit', status: 'pending' },
    { id: 'bug', name: 'Bug Detection', status: 'pending' },
    { id: 'feature', name: 'Feature Completeness', status: 'pending' },
    { id: 'compliance', name: 'Compliance Check', status: 'pending' },
    { id: 'performance', name: 'Performance Analysis', status: 'pending' },
  ]);
  const [findings, setFindings] = useState<AnalysisFinding[]>([]);
  const [showImplementation, setShowImplementation] = useState(false);
  const { toast } = useToast();

  const runAnalysis = useCallback(async () => {
    setState('running');
    setFindings([]);
    
    // Reset modules
    setModules(prev => prev.map(m => ({ ...m, status: 'pending', duration: undefined })));

    try {
      const { data, error } = await supabase.functions.invoke('analyze-projects', {
        body: { action: 'analyze' }
      });

      if (error) throw error;

      // Simulate progressive module completion for UX
      for (let i = 0; i < modules.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 500));
        setModules(prev => prev.map((m, idx) => 
          idx === i ? { ...m, status: 'complete', duration: Math.random() * 3 + 1 } : 
          idx === i + 1 ? { ...m, status: 'running' } : m
        ));
      }

      setFindings(data?.findings || []);
      setState('complete');
      
      toast({
        title: "Analysis Complete",
        description: `Found ${data?.findings?.length || 0} issues across your projects.`
      });
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: "Analysis Failed",
        description: "Failed to complete analysis. Please try again.",
        variant: "destructive"
      });
      setState('idle');
    }
  }, [toast, modules.length]);

  const toggleFinding = (id: string) => {
    setFindings(prev => prev.map(f => 
      f.id === id ? { ...f, selected: !f.selected } : f
    ));
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
  const severityCounts = {
    critical: findings.filter(f => f.severity === 'critical').length,
    high: findings.filter(f => f.severity === 'high').length,
    medium: findings.filter(f => f.severity === 'medium').length,
    low: findings.filter(f => f.severity === 'low').length,
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Search className="h-6 w-6 text-primary" />
              Project Analyzer
            </h1>
            <p className="text-muted-foreground mt-1">
              Scan all imported Lovable projects for issues and improvements
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
              <Button variant="outline" onClick={() => setState('idle')}>
                New Analysis
              </Button>
              {selectedFindings.length > 0 && (
                <Button onClick={() => setShowImplementation(true)} className="gap-2">
                  <Zap className="h-4 w-4" />
                  Implement ({selectedFindings.length})
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Analysis Progress */}
        {state === 'running' && (
          <AnalysisProgress modules={modules} />
        )}

        {/* Findings */}
        {state === 'complete' && (
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
              <p className="text-muted-foreground text-center max-w-md mb-6">
                Click "Run Analysis" to scan all your imported Lovable projects for integration gaps, 
                security issues, bugs, incomplete features, and more.
              </p>
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
          }}
        />
      </div>
    </DashboardLayout>
  );
}
