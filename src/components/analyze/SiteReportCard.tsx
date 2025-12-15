import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  Building2,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Lightbulb,
  Shield,
  Gauge,
  Bug,
  Plug,
  Scale,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SiteAnalysisReport, SiteRequirement, SiteSuggestion } from '@/utils/analyzeSystemPrompt';

interface SiteReportCardProps {
  report: SiteAnalysisReport;
  onToggleRequirement: (siteId: string, reqId: string) => void;
  onToggleSuggestion: (siteId: string, sugId: string) => void;
}

const statusConfig = {
  'all-green': { label: 'All Green', color: 'bg-green-500', textColor: 'text-green-500', borderColor: 'border-green-500' },
  'partial': { label: 'Partial', color: 'bg-yellow-500', textColor: 'text-yellow-500', borderColor: 'border-yellow-500' },
  'blocked': { label: 'Blocked', color: 'bg-red-500', textColor: 'text-red-500', borderColor: 'border-red-500' },
  'pending': { label: 'Pending', color: 'bg-blue-500', textColor: 'text-blue-500', borderColor: 'border-blue-500' },
};

const categoryIcons: Record<string, React.ElementType> = {
  security: Shield,
  reliability: Gauge,
  observability: Gauge,
  ux: Lightbulb,
  data: Scale,
  performance: Gauge,
  autosync: Plug,
};

export function SiteReportCard({ report, onToggleRequirement, onToggleSuggestion }: SiteReportCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showRequirements, setShowRequirements] = useState(true);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [showDefects, setShowDefects] = useState(true);

  const config = statusConfig[report.status];
  const isControlCenter = report.isControlCenter;

  const requirementStats = {
    implemented: report.requirements.filter(r => r.status === 'implemented').length,
    partial: report.requirements.filter(r => r.status === 'partial').length,
    notImplemented: report.requirements.filter(r => r.status === 'not-implemented').length,
  };

  return (
    <Card 
      className={cn(
        "transition-all",
        isControlCenter && "border-cyan-500/50 bg-cyan-500/5"
      )}
      style={{ borderLeftWidth: '4px', borderLeftColor: report.siteColor }}
    >
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-accent/50 transition-colors pb-3">
            <div className="flex items-center gap-3">
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
              
              {isControlCenter ? (
                <Building2 className="h-5 w-5" style={{ color: report.siteColor }} />
              ) : (
                <div 
                  className="h-4 w-4 rounded-full shrink-0"
                  style={{ backgroundColor: report.siteColor }}
                />
              )}
              
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{report.siteName}</h3>
                  <Badge 
                    variant="outline" 
                    className={cn("text-xs", config.textColor, config.borderColor)}
                  >
                    {config.label}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {report.requirements.length} requirements • {report.suggestions.length} suggestions • {report.defects.length} defects
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="text-right">
                  <p className="text-sm font-medium">{report.coverage.percentage}%</p>
                  <p className="text-xs text-muted-foreground">Coverage</p>
                </div>
                <div className="w-16">
                  <Progress 
                    value={report.coverage.percentage} 
                    className="h-2"
                  />
                </div>
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0 space-y-4">
            {/* Coverage Summary */}
            <div className="grid grid-cols-4 gap-3 p-3 bg-muted/50 rounded-lg">
              <div className="text-center">
                <p className="text-lg font-semibold text-green-500">{requirementStats.implemented}</p>
                <p className="text-xs text-muted-foreground">Implemented</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-yellow-500">{requirementStats.partial}</p>
                <p className="text-xs text-muted-foreground">Partial</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-red-500">{requirementStats.notImplemented}</p>
                <p className="text-xs text-muted-foreground">Missing</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-blue-500">{report.suggestions.length}</p>
                <p className="text-xs text-muted-foreground">Suggestions</p>
              </div>
            </div>

            {/* Requirements Section */}
            {report.requirements.length > 0 && (
              <Collapsible open={showRequirements} onOpenChange={setShowRequirements}>
                <CollapsibleTrigger className="flex items-center gap-2 w-full p-2 rounded hover:bg-accent/50">
                  {showRequirements ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  <span className="font-medium text-sm">Requirements ({report.requirements.length})</span>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-2 mt-2">
                  {report.requirements.map((req) => (
                    <RequirementItem 
                      key={req.id} 
                      requirement={req} 
                      onToggle={() => onToggleRequirement(report.siteId, req.id)}
                    />
                  ))}
                </CollapsibleContent>
              </Collapsible>
            )}

            {/* Suggestions Section */}
            {report.suggestions.length > 0 && (
              <Collapsible open={showSuggestions} onOpenChange={setShowSuggestions}>
                <CollapsibleTrigger className="flex items-center gap-2 w-full p-2 rounded hover:bg-accent/50">
                  {showSuggestions ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  <Lightbulb className="h-4 w-4 text-blue-500" />
                  <span className="font-medium text-sm">Suggestions ({report.suggestions.length})</span>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-2 mt-2">
                  {report.suggestions.map((sug) => (
                    <SuggestionItem 
                      key={sug.id} 
                      suggestion={sug} 
                      onToggle={() => onToggleSuggestion(report.siteId, sug.id)}
                    />
                  ))}
                </CollapsibleContent>
              </Collapsible>
            )}

            {/* Defects Section */}
            {report.defects.length > 0 && (
              <Collapsible open={showDefects} onOpenChange={setShowDefects}>
                <CollapsibleTrigger className="flex items-center gap-2 w-full p-2 rounded hover:bg-accent/50">
                  {showDefects ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  <Bug className="h-4 w-4 text-red-500" />
                  <span className="font-medium text-sm">Defects ({report.defects.length})</span>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-2 mt-2">
                  {report.defects.map((defect) => (
                    <div 
                      key={defect.id}
                      className="p-3 rounded-lg border border-red-500/30 bg-red-500/5"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <XCircle className="h-4 w-4 text-red-500" />
                        <span className="font-medium text-sm">{defect.title}</span>
                        <Badge variant="outline" className="text-xs">{defect.causeCategory}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{defect.rootCause}</p>
                    </div>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

function RequirementItem({ requirement, onToggle }: { requirement: SiteRequirement; onToggle: () => void }) {
  const statusIcon = {
    'implemented': <CheckCircle2 className="h-4 w-4 text-green-500" />,
    'partial': <AlertTriangle className="h-4 w-4 text-yellow-500" />,
    'not-implemented': <XCircle className="h-4 w-4 text-red-500" />,
  };

  return (
    <div 
      className={cn(
        "flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors hover:bg-accent/50",
        requirement.selected && "bg-primary/5 border-primary/30"
      )}
      onClick={onToggle}
    >
      <Checkbox checked={requirement.selected} onCheckedChange={onToggle} className="mt-0.5" />
      {statusIcon[requirement.status]}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium text-sm">{requirement.title}</span>
          <Badge variant="outline" className="text-xs font-mono">{requirement.id}</Badge>
        </div>
        <p className="text-xs text-muted-foreground">{requirement.description}</p>
        {requirement.evidence.uxLocation && (
          <p className="text-xs text-muted-foreground mt-1">
            Location: {requirement.evidence.uxLocation}
          </p>
        )}
      </div>
    </div>
  );
}

function SuggestionItem({ suggestion, onToggle }: { suggestion: SiteSuggestion; onToggle: () => void }) {
  const CategoryIcon = categoryIcons[suggestion.category] || Lightbulb;
  const priorityColors = {
    high: 'text-red-500 border-red-500/30',
    medium: 'text-yellow-500 border-yellow-500/30',
    low: 'text-blue-500 border-blue-500/30',
  };

  return (
    <div 
      className={cn(
        "flex items-start gap-3 p-3 rounded-lg border border-blue-500/30 bg-blue-500/5 cursor-pointer transition-colors hover:bg-blue-500/10",
        suggestion.selected && "bg-primary/5 border-primary/30"
      )}
      onClick={onToggle}
    >
      <Checkbox checked={suggestion.selected} onCheckedChange={onToggle} className="mt-0.5" />
      <CategoryIcon className="h-4 w-4 text-blue-500 mt-0.5" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className="font-medium text-sm">{suggestion.title}</span>
          <Badge variant="outline" className="text-xs font-mono">{suggestion.id}</Badge>
          <Badge variant="outline" className={cn("text-xs", priorityColors[suggestion.priority])}>
            {suggestion.priority}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">{suggestion.rationale}</p>
        {suggestion.acceptanceCriteria.length > 0 && (
          <div className="mt-2">
            <p className="text-xs font-medium text-muted-foreground mb-1">Acceptance Criteria:</p>
            <ul className="text-xs text-muted-foreground list-disc list-inside">
              {suggestion.acceptanceCriteria.slice(0, 2).map((criteria, i) => (
                <li key={i}>{criteria}</li>
              ))}
              {suggestion.acceptanceCriteria.length > 2 && (
                <li className="text-muted-foreground/70">+{suggestion.acceptanceCriteria.length - 2} more</li>
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
