import { useState, useEffect } from 'react';
import { 
  Rocket, 
  CheckCircle2, 
  Circle, 
  Loader2, 
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  RefreshCw,
  Play
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface ChecklistItem {
  id: string;
  category: string;
  title: string;
  description: string;
  status: 'pending' | 'checking' | 'passed' | 'failed' | 'warning';
  required: boolean;
  actionLabel?: string;
  actionUrl?: string;
}

const initialChecklist: ChecklistItem[] = [
  // Critical Infrastructure
  {
    id: 'db-connection',
    category: 'Infrastructure',
    title: 'Database Connection',
    description: 'Verify Supabase database is connected and accessible',
    status: 'pending',
    required: true,
  },
  {
    id: 'auth-config',
    category: 'Infrastructure',
    title: 'Authentication Setup',
    description: 'Auth0 integration configured with proper callbacks',
    status: 'pending',
    required: true,
  },
  {
    id: 'ssl-certs',
    category: 'Infrastructure',
    title: 'SSL Certificates',
    description: 'All domains have valid SSL certificates',
    status: 'pending',
    required: true,
  },
  {
    id: 'dns-config',
    category: 'Infrastructure',
    title: 'DNS Configuration',
    description: 'Domain DNS records properly configured',
    status: 'pending',
    required: true,
  },
  // Integrations
  {
    id: 'email-service',
    category: 'Integrations',
    title: 'Email Service (SendGrid)',
    description: 'Email delivery pipeline configured and tested',
    status: 'pending',
    required: true,
  },
  {
    id: 'storage-s3',
    category: 'Integrations',
    title: 'File Storage (AWS S3)',
    description: 'S3 bucket configured for file uploads',
    status: 'pending',
    required: true,
  },
  {
    id: 'analytics',
    category: 'Integrations',
    title: 'Analytics (Google Analytics)',
    description: 'GA4 tracking configured for all sites',
    status: 'pending',
    required: false,
  },
  {
    id: 'slack-alerts',
    category: 'Integrations',
    title: 'Slack Notifications',
    description: 'Slack webhook configured for alerts',
    status: 'pending',
    required: false,
  },
  // Security
  {
    id: 'api-keys',
    category: 'Security',
    title: 'API Keys Secured',
    description: 'All API keys stored securely in environment',
    status: 'pending',
    required: true,
  },
  {
    id: 'rate-limiting',
    category: 'Security',
    title: 'Rate Limiting',
    description: 'API rate limiting configured',
    status: 'pending',
    required: true,
  },
  {
    id: 'cors-config',
    category: 'Security',
    title: 'CORS Configuration',
    description: 'Cross-origin policies properly set',
    status: 'pending',
    required: true,
  },
  // Monitoring
  {
    id: 'health-checks',
    category: 'Monitoring',
    title: 'Health Checks Active',
    description: 'Automated health monitoring enabled',
    status: 'pending',
    required: true,
  },
  {
    id: 'backup-schedule',
    category: 'Monitoring',
    title: 'Backup Schedule',
    description: 'Automated daily backups configured',
    status: 'pending',
    required: true,
  },
  {
    id: 'error-logging',
    category: 'Monitoring',
    title: 'Error Logging',
    description: 'Error tracking and logging enabled',
    status: 'pending',
    required: true,
  },
];

export function PreLaunchChecklist() {
  const { toast } = useToast();
  const [checklist, setChecklist] = useState<ChecklistItem[]>(initialChecklist);
  const [isRunning, setIsRunning] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [showGoLiveDialog, setShowGoLiveDialog] = useState(false);

  const categories = [...new Set(checklist.map(item => item.category))];

  const passedCount = checklist.filter(i => i.status === 'passed').length;
  const failedCount = checklist.filter(i => i.status === 'failed').length;
  const warningCount = checklist.filter(i => i.status === 'warning').length;
  const requiredPassed = checklist.filter(i => i.required && i.status === 'passed').length;
  const requiredTotal = checklist.filter(i => i.required).length;
  const progress = (passedCount / checklist.length) * 100;
  const canGoLive = requiredPassed === requiredTotal;

  const runChecks = async () => {
    setIsRunning(true);

    for (let i = 0; i < checklist.length; i++) {
      // Set to checking
      setChecklist(prev => prev.map((item, idx) => 
        idx === i ? { ...item, status: 'checking' } : item
      ));

      // Simulate check
      await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 400));

      // Random result (mostly passing for demo)
      const random = Math.random();
      const status: ChecklistItem['status'] = 
        random > 0.15 ? 'passed' : 
        random > 0.05 ? 'warning' : 'failed';

      setChecklist(prev => prev.map((item, idx) => 
        idx === i ? { ...item, status } : item
      ));
    }

    setIsRunning(false);
    toast({
      title: 'Validation Complete',
      description: `${passedCount} passed, ${failedCount} failed, ${warningCount} warnings`,
    });
  };

  const handleGoLive = async () => {
    setShowGoLiveDialog(false);
    toast({
      title: 'Going Live...',
      description: 'Control Center is being deployed to production.',
    });

    await new Promise(resolve => setTimeout(resolve, 3000));

    toast({
      title: '🚀 Control Center is Live!',
      description: 'Your platform is now running in production mode.',
    });
  };

  const getStatusIcon = (status: ChecklistItem['status']) => {
    switch (status) {
      case 'passed':
        return <CheckCircle2 className="h-4 w-4 text-status-active" />;
      case 'failed':
        return <AlertTriangle className="h-4 w-4 text-status-inactive" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-status-warning" />;
      case 'checking':
        return <Loader2 className="h-4 w-4 text-primary animate-spin" />;
      default:
        return <Circle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <>
      <Card className="opacity-0 animate-fade-in" style={{ animationDelay: '50ms' }}>
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                  <Rocket className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <CardTitle className="text-base">Pre-Launch Checklist</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {passedCount}/{checklist.length} checks passed
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={runChecks}
                  disabled={isRunning}
                  className="gap-1.5"
                >
                  {isRunning ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <RefreshCw className="h-3.5 w-3.5" />
                  )}
                  Run Checks
                </Button>
                <Button
                  size="sm"
                  onClick={() => setShowGoLiveDialog(true)}
                  disabled={!canGoLive || isRunning}
                  className="gap-1.5"
                >
                  <Play className="h-3.5 w-3.5" />
                  Go Live
                </Button>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="icon-sm">
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </CollapsibleTrigger>
              </div>
            </div>
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-muted-foreground">Progress</span>
                <div className="flex items-center gap-2">
                  {failedCount > 0 && (
                    <Badge variant="destructive" className="text-[10px] px-1.5">
                      {failedCount} failed
                    </Badge>
                  )}
                  {warningCount > 0 && (
                    <Badge variant="warning" className="text-[10px] px-1.5">
                      {warningCount} warnings
                    </Badge>
                  )}
                  <span>{progress.toFixed(0)}%</span>
                </div>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </CardHeader>

          <CollapsibleContent>
            <CardContent className="pt-0 space-y-4">
              {categories.map((category) => (
                <div key={category}>
                  <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                    {category}
                  </h4>
                  <div className="space-y-1">
                    {checklist
                      .filter(item => item.category === category)
                      .map((item) => (
                        <div
                          key={item.id}
                          className={cn(
                            "flex items-center justify-between p-2.5 rounded-lg transition-colors",
                            item.status === 'failed' && "bg-status-inactive/5",
                            item.status === 'warning' && "bg-status-warning/5",
                            item.status === 'passed' && "bg-status-active/5",
                            item.status === 'checking' && "bg-primary/5"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            {getStatusIcon(item.status)}
                            <div>
                              <p className="text-sm font-medium flex items-center gap-2">
                                {item.title}
                                {item.required && (
                                  <span className="text-[10px] text-status-inactive">Required</span>
                                )}
                              </p>
                              <p className="text-xs text-muted-foreground">{item.description}</p>
                            </div>
                          </div>
                          {item.actionLabel && (
                            <Button variant="ghost" size="sm" className="h-7 text-xs gap-1">
                              {item.actionLabel}
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Go Live Dialog */}
      <Dialog open={showGoLiveDialog} onOpenChange={setShowGoLiveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Rocket className="h-5 w-5 text-primary" />
              Ready to Go Live?
            </DialogTitle>
            <DialogDescription>
              All required checks have passed. Your Control Center is ready for production deployment.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-status-active/10 rounded-lg border border-status-active/30">
              <div className="flex items-center gap-2 text-status-active mb-2">
                <CheckCircle2 className="h-4 w-4" />
                <span className="font-medium">Pre-flight checks passed</span>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1 ml-6">
                <li>• {requiredPassed}/{requiredTotal} required checks passed</li>
                <li>• All critical integrations connected</li>
                <li>• SSL certificates valid</li>
                <li>• Backup system configured</li>
              </ul>
            </div>
            {warningCount > 0 && (
              <div className="p-4 bg-status-warning/10 rounded-lg border border-status-warning/30">
                <div className="flex items-center gap-2 text-status-warning mb-2">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="font-medium">{warningCount} warnings to review</span>
                </div>
                <p className="text-sm text-muted-foreground ml-6">
                  These are non-critical items that may need attention.
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowGoLiveDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleGoLive} className="gap-1.5 bg-status-active hover:bg-status-active/90">
              <Rocket className="h-4 w-4" />
              Deploy to Production
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
