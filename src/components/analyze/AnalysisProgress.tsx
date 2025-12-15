import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Loader2, Circle, XCircle, Building2, Shield, Bug, Plug, Gauge, Scale, Lightbulb, FileCode } from 'lucide-react';
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

const moduleIcons: Record<string, React.ElementType> = {
  'cc-features': Building2,
  'cc-backend': FileCode,
  'site-integration': Plug,
  'site-security': Shield,
  'site-bugs': Bug,
  'site-features': Lightbulb,
  'site-compliance': Scale,
  'site-performance': Gauge,
  'production-readiness': CheckCircle2,
  'suggestions': Lightbulb,
};

export function AnalysisProgress({ modules }: AnalysisProgressProps) {
  const completedCount = modules.filter(m => m.status === 'complete').length;
  const progress = (completedCount / modules.length) * 100;
  const currentModule = modules.find(m => m.status === 'running');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <span>Analyzing Control Center + All Sites...</span>
        </CardTitle>
        {currentModule && (
          <p className="text-sm text-muted-foreground">
            Current: {currentModule.name}
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span>Overall Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
        
        <div className="grid gap-2 md:grid-cols-2">
          {modules.map((module) => {
            const Icon = moduleIcons[module.id] || Circle;
            
            return (
              <div 
                key={module.id}
                className={cn(
                  "flex items-center justify-between p-3 rounded-lg border transition-colors",
                  module.status === 'running' && "bg-primary/5 border-primary/20",
                  module.status === 'complete' && "bg-green-500/5 border-green-500/20",
                  module.status === 'error' && "bg-red-500/5 border-red-500/20",
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
                  {module.status === 'error' && (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium text-sm">{module.name}</span>
                </div>
                
                {module.duration && (
                  <span className="text-xs text-muted-foreground">
                    {module.duration.toFixed(1)}s
                  </span>
                )}
                
                {module.status === 'running' && (
                  <span className="text-xs text-primary animate-pulse">
                    Running...
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
