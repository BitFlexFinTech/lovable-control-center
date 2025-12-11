import { Clock, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface TokenExpirationAlertProps {
  integrationName: string;
  expiresAt: string;
  daysRemaining: number;
  onRefresh?: () => void;
}

export function TokenExpirationAlert({ 
  integrationName, 
  expiresAt, 
  daysRemaining,
  onRefresh 
}: TokenExpirationAlertProps) {
  const getSeverity = () => {
    if (daysRemaining <= 1) return 'critical';
    if (daysRemaining <= 3) return 'high';
    if (daysRemaining <= 7) return 'medium';
    return 'low';
  };

  const severity = getSeverity();
  
  const severityStyles = {
    critical: 'border-status-error bg-status-error/10 text-status-error',
    high: 'border-status-warning bg-status-warning/10 text-status-warning',
    medium: 'border-amber-500/50 bg-amber-500/10 text-amber-600',
    low: 'border-muted bg-muted/50 text-muted-foreground',
  };

  if (daysRemaining > 7) return null;

  return (
    <Alert className={cn('flex items-center justify-between', severityStyles[severity])}>
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4" />
        <AlertDescription className="text-sm">
          <span className="font-medium">{integrationName}</span> token expires in{' '}
          <span className="font-bold">
            {daysRemaining === 0 ? 'less than 24 hours' : `${daysRemaining} day${daysRemaining !== 1 ? 's' : ''}`}
          </span>
        </AlertDescription>
      </div>
      {onRefresh && (
        <Button 
          size="sm" 
          variant="ghost" 
          className="h-7 gap-1"
          onClick={onRefresh}
        >
          <RefreshCw className="h-3 w-3" />
          Refresh
        </Button>
      )}
    </Alert>
  );
}
