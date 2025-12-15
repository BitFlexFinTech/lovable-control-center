import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Building2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Lightbulb,
  FileText,
  Download,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SiteAnalysisReport } from '@/utils/analyzeSystemPrompt';
import { SiteReportCard } from './SiteReportCard';

interface GlobalAnalysisReportProps {
  siteReports: SiteAnalysisReport[];
  onToggleRequirement: (siteId: string, reqId: string) => void;
  onToggleSuggestion: (siteId: string, sugId: string) => void;
  onImplementSelected: () => void;
  selectedCount: number;
}

export function GlobalAnalysisReport({
  siteReports,
  onToggleRequirement,
  onToggleSuggestion,
  onImplementSelected,
  selectedCount,
}: GlobalAnalysisReportProps) {
  // Calculate global stats
  const totalRequirements = siteReports.reduce((sum, r) => sum + r.requirements.length, 0);
  const totalSuggestions = siteReports.reduce((sum, r) => sum + r.suggestions.length, 0);
  const totalDefects = siteReports.reduce((sum, r) => sum + r.defects.length, 0);
  const totalImplemented = siteReports.reduce(
    (sum, r) => sum + r.requirements.filter(req => req.status === 'implemented').length, 
    0
  );
  const globalCoverage = totalRequirements > 0 
    ? Math.round((totalImplemented / totalRequirements) * 100) 
    : 100;

  const allGreenCount = siteReports.filter(r => r.status === 'all-green').length;
  const partialCount = siteReports.filter(r => r.status === 'partial').length;
  const blockedCount = siteReports.filter(r => r.status === 'blocked').length;

  const controlCenterReport = siteReports.find(r => r.isControlCenter);
  const siteOnlyReports = siteReports.filter(r => !r.isControlCenter);

  const globalStatus = blockedCount > 0 ? 'blocked' : partialCount > 0 ? 'partial' : 'all-green';
  const statusColors = {
    'all-green': 'text-green-500',
    'partial': 'text-yellow-500',
    'blocked': 'text-red-500',
  };

  return (
    <div className="space-y-6">
      {/* Global Summary Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Global Analysis Report
            </CardTitle>
            <div className="flex items-center gap-2">
              {selectedCount > 0 && (
                <Button onClick={onImplementSelected} className="gap-2">
                  <Zap className="h-4 w-4" />
                  Apply Selected ({selectedCount})
                </Button>
              )}
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold">{siteReports.length}</p>
              <p className="text-xs text-muted-foreground">Sites Analyzed</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold">{totalRequirements}</p>
              <p className="text-xs text-muted-foreground">Requirements</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold text-blue-500">{totalSuggestions}</p>
              <p className="text-xs text-muted-foreground">Suggestions</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold text-red-500">{totalDefects}</p>
              <p className="text-xs text-muted-foreground">Defects</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className={cn("text-2xl font-bold", statusColors[globalStatus])}>{globalCoverage}%</p>
              <p className="text-xs text-muted-foreground">Coverage</p>
            </div>
          </div>

          {/* Global Coverage Progress */}
          <div className="space-y-2 mb-6">
            <div className="flex justify-between text-sm">
              <span>Global Implementation Coverage</span>
              <span className={statusColors[globalStatus]}>{globalCoverage}%</span>
            </div>
            <Progress value={globalCoverage} className="h-3" />
          </div>

          {/* Site Status Summary */}
          <div className="flex flex-wrap gap-3">
            <Badge variant="outline" className="gap-1 bg-green-500/10 text-green-500 border-green-500/30">
              <CheckCircle2 className="h-3 w-3" />
              {allGreenCount} All Green
            </Badge>
            <Badge variant="outline" className="gap-1 bg-yellow-500/10 text-yellow-500 border-yellow-500/30">
              <AlertTriangle className="h-3 w-3" />
              {partialCount} Partial
            </Badge>
            <Badge variant="outline" className="gap-1 bg-red-500/10 text-red-500 border-red-500/30">
              <XCircle className="h-3 w-3" />
              {blockedCount} Blocked
            </Badge>
            <Badge variant="outline" className="gap-1 bg-blue-500/10 text-blue-500 border-blue-500/30">
              <Lightbulb className="h-3 w-3" />
              {totalSuggestions} Suggestions
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Site Reports */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All ({siteReports.length})</TabsTrigger>
          {controlCenterReport && (
            <TabsTrigger value="control-center" className="gap-1">
              <Building2 className="h-3 w-3" />
              Control Center
            </TabsTrigger>
          )}
          <TabsTrigger value="all-green" className="gap-1">
            <CheckCircle2 className="h-3 w-3 text-green-500" />
            All Green ({allGreenCount})
          </TabsTrigger>
          <TabsTrigger value="partial" className="gap-1">
            <AlertTriangle className="h-3 w-3 text-yellow-500" />
            Partial ({partialCount})
          </TabsTrigger>
          <TabsTrigger value="blocked" className="gap-1">
            <XCircle className="h-3 w-3 text-red-500" />
            Blocked ({blockedCount})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {controlCenterReport && (
            <SiteReportCard
              report={controlCenterReport}
              onToggleRequirement={onToggleRequirement}
              onToggleSuggestion={onToggleSuggestion}
            />
          )}
          {siteOnlyReports.map((report) => (
            <SiteReportCard
              key={report.siteId}
              report={report}
              onToggleRequirement={onToggleRequirement}
              onToggleSuggestion={onToggleSuggestion}
            />
          ))}
        </TabsContent>

        <TabsContent value="control-center" className="space-y-4">
          {controlCenterReport && (
            <SiteReportCard
              report={controlCenterReport}
              onToggleRequirement={onToggleRequirement}
              onToggleSuggestion={onToggleSuggestion}
            />
          )}
        </TabsContent>

        <TabsContent value="all-green" className="space-y-4">
          {siteReports.filter(r => r.status === 'all-green').map((report) => (
            <SiteReportCard
              key={report.siteId}
              report={report}
              onToggleRequirement={onToggleRequirement}
              onToggleSuggestion={onToggleSuggestion}
            />
          ))}
        </TabsContent>

        <TabsContent value="partial" className="space-y-4">
          {siteReports.filter(r => r.status === 'partial').map((report) => (
            <SiteReportCard
              key={report.siteId}
              report={report}
              onToggleRequirement={onToggleRequirement}
              onToggleSuggestion={onToggleSuggestion}
            />
          ))}
        </TabsContent>

        <TabsContent value="blocked" className="space-y-4">
          {siteReports.filter(r => r.status === 'blocked').map((report) => (
            <SiteReportCard
              key={report.siteId}
              report={report}
              onToggleRequirement={onToggleRequirement}
              onToggleSuggestion={onToggleSuggestion}
            />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
