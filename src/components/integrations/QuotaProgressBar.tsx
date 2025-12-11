import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

interface QuotaProgressBarProps {
  used: number;
  limit: number;
  label?: string;
  resetAt?: string;
  showPercentage?: boolean;
}

export function QuotaProgressBar({ 
  used, 
  limit, 
  label, 
  resetAt,
  showPercentage = true 
}: QuotaProgressBarProps) {
  const percentage = Math.min(Math.round((used / limit) * 100), 100);
  
  const getColorClass = () => {
    if (percentage >= 90) return 'bg-status-error';
    if (percentage >= 75) return 'bg-status-warning';
    return 'bg-status-active';
  };

  const getTextColorClass = () => {
    if (percentage >= 90) return 'text-status-error';
    if (percentage >= 75) return 'text-status-warning';
    return 'text-status-active';
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        {label && <span className="text-muted-foreground">{label}</span>}
        {showPercentage && (
          <span className={cn('font-medium', getTextColorClass())}>
            {percentage}%
          </span>
        )}
      </div>
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
        <div 
          className={cn('h-full transition-all duration-300', getColorClass())}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{used.toLocaleString()} / {limit.toLocaleString()}</span>
        {resetAt && (
          <span>Resets {new Date(resetAt).toLocaleDateString()}</span>
        )}
      </div>
    </div>
  );
}
