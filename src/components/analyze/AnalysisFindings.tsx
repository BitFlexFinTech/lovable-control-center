import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plug, Shield, Bug, Puzzle, Scale, Gauge,
  AlertTriangle, XCircle, Info, CheckCircle2, Wrench
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

  const filteredFindings = activeCategory === 'all' 
    ? findings 
    : findings.filter(f => f.category === activeCategory);

  const categories = ['all', 'integration', 'security', 'bug', 'feature', 'compliance', 'performance'];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Findings</CardTitle>
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

          <div className="space-y-2">
            {filteredFindings.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No findings in this category
              </div>
            ) : (
              filteredFindings.map((finding) => {
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
                          {finding.site_name}
                        </span>
                        <span>•</span>
                        <span>{finding.action.label}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
}
