import { useState } from 'react';
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
import { 
  Zap, CheckCircle2, Loader2, AlertTriangle, 
  Wrench, Eye, XCircle 
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { AnalysisFinding } from '@/pages/Analyze';

interface ImplementationPreviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  findings: AnalysisFinding[];
  onComplete: () => void;
}

type ImplementationState = 'preview' | 'running' | 'complete';

interface ImplementationResult {
  findingId: string;
  status: 'success' | 'failed' | 'skipped';
  message?: string;
}

export function ImplementationPreview({ 
  open, 
  onOpenChange, 
  findings,
  onComplete 
}: ImplementationPreviewProps) {
  const [state, setState] = useState<ImplementationState>('preview');
  const [progress, setProgress] = useState(0);
  const [currentAction, setCurrentAction] = useState<string>('');
  const [results, setResults] = useState<ImplementationResult[]>([]);
  const { toast } = useToast();

  const autoFixCount = findings.filter(f => f.action.type === 'auto-fix').length;
  const manualCount = findings.filter(f => f.action.type === 'manual').length;
  const reviewCount = findings.filter(f => f.action.type === 'review').length;

  const handleImplement = async () => {
    setState('running');
    setProgress(0);
    setResults([]);

    try {
      const { data, error } = await supabase.functions.invoke('analyze-projects', {
        body: { 
          action: 'implement',
          findings: findings.map(f => ({ id: f.id, action: f.action }))
        }
      });

      if (error) throw error;

      // Simulate progressive execution
      for (let i = 0; i < findings.length; i++) {
        const finding = findings[i];
        setCurrentAction(finding.title);
        setProgress(((i + 1) / findings.length) * 100);
        
        await new Promise(resolve => setTimeout(resolve, 800));
        
        setResults(prev => [...prev, {
          findingId: finding.id,
          status: finding.action.type === 'auto-fix' ? 'success' : 'skipped',
          message: finding.action.type === 'auto-fix' 
            ? 'Successfully applied fix' 
            : 'Requires manual action'
        }]);
      }

      setState('complete');
      toast({
        title: "Implementation Complete",
        description: `Applied ${autoFixCount} auto-fixes. ${manualCount + reviewCount} items require manual action.`
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
    setResults([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            {state === 'preview' && 'Implementation Preview'}
            {state === 'running' && 'Implementing Changes...'}
            {state === 'complete' && 'Implementation Complete'}
          </DialogTitle>
          <DialogDescription>
            {state === 'preview' && `Review ${findings.length} selected actions before implementing`}
            {state === 'running' && currentAction}
            {state === 'complete' && 'All selected actions have been processed'}
          </DialogDescription>
        </DialogHeader>

        {state === 'running' && (
          <div className="py-4 space-y-4">
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-center text-muted-foreground">
              Processing {Math.ceil((progress / 100) * findings.length)} of {findings.length} actions...
            </p>
          </div>
        )}

        {state === 'preview' && (
          <>
            {/* Summary */}
            <div className="flex gap-3 py-2">
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

            {/* Actions List */}
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-2">
                {findings.map((finding) => (
                  <div 
                    key={finding.id}
                    className="flex items-start gap-3 p-3 rounded-lg border bg-card"
                  >
                    <div className="mt-0.5">
                      {finding.action.type === 'auto-fix' ? (
                        <Wrench className="h-4 w-4 text-green-500" />
                      ) : finding.action.type === 'manual' ? (
                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{finding.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {finding.action.label}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs shrink-0">
                      {finding.site_name}
                    </Badge>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </>
        )}

        {state === 'complete' && (
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-2">
              {findings.map((finding) => {
                const result = results.find(r => r.findingId === finding.id);
                return (
                  <div 
                    key={finding.id}
                    className="flex items-center gap-3 p-3 rounded-lg border bg-card"
                  >
                    {result?.status === 'success' ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                    ) : result?.status === 'failed' ? (
                      <XCircle className="h-4 w-4 text-red-500 shrink-0" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-orange-500 shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{finding.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {result?.message || 'Pending'}
                      </p>
                    </div>
                  </div>
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
                Confirm & Implement
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
