import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Loader2, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AnalysisModule {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'complete' | 'error';
  duration?: number;
}

interface AnalysisProgressProps {
  modules: AnalysisModule[];
}

export function AnalysisProgress({ modules }: AnalysisProgressProps) {
  const completedCount = modules.filter(m => m.status === 'complete').length;
  const progress = (completedCount / modules.length) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          Analyzing Projects...
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Progress value={progress} className="h-2" />
        
        <div className="grid gap-2">
          {modules.map((module) => (
            <div 
              key={module.id}
              className={cn(
                "flex items-center justify-between p-3 rounded-lg border transition-colors",
                module.status === 'running' && "bg-primary/5 border-primary/20",
                module.status === 'complete' && "bg-green-500/5 border-green-500/20",
                module.status === 'pending' && "opacity-50"
              )}
            >
              <div className="flex items-center gap-3">
                {module.status === 'complete' && (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                )}
                {module.status === 'running' && (
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                )}
                {module.status === 'pending' && (
                  <Circle className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="font-medium">{module.name}</span>
              </div>
              
              {module.duration && (
                <span className="text-sm text-muted-foreground">
                  {module.duration.toFixed(1)}s
                </span>
              )}
              
              {module.status === 'running' && (
                <span className="text-sm text-primary animate-pulse">
                  Running...
                </span>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
