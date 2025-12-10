import { useState, useEffect } from 'react';
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface ToastAction {
  label: string;
  onClick: () => void;
}

interface EnhancedToastProps {
  id: string;
  title: string;
  description?: string;
  variant?: 'default' | 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  action?: ToastAction;
  onDismiss: (id: string) => void;
  progress?: boolean;
}

export const EnhancedToast: React.FC<EnhancedToastProps> = ({
  id,
  title,
  description,
  variant = 'default',
  duration = 5000,
  action,
  onDismiss,
  progress = true,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [progressWidth, setProgressWidth] = useState(100);

  useEffect(() => {
    // Animate in
    requestAnimationFrame(() => setIsVisible(true));

    // Progress bar animation
    if (progress && duration > 0) {
      const startTime = Date.now();
      const interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
        setProgressWidth(remaining);

        if (remaining === 0) {
          clearInterval(interval);
        }
      }, 50);

      return () => clearInterval(interval);
    }
  }, [duration, progress]);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => onDismiss(id), 300);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, id, onDismiss]);

  const icons = {
    default: null,
    success: CheckCircle2,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
  };

  const colors = {
    default: 'border-border',
    success: 'border-green-500/50 bg-green-500/5',
    error: 'border-destructive/50 bg-destructive/5',
    warning: 'border-yellow-500/50 bg-yellow-500/5',
    info: 'border-blue-500/50 bg-blue-500/5',
  };

  const iconColors = {
    default: 'text-foreground',
    success: 'text-green-500',
    error: 'text-destructive',
    warning: 'text-yellow-500',
    info: 'text-blue-500',
  };

  const progressColors = {
    default: 'bg-foreground/20',
    success: 'bg-green-500',
    error: 'bg-destructive',
    warning: 'bg-yellow-500',
    info: 'bg-blue-500',
  };

  const Icon = icons[variant];

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-lg border bg-background p-4 shadow-lg transition-all duration-300',
        colors[variant],
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      )}
    >
      <div className="flex gap-3">
        {Icon && (
          <Icon className={cn('h-5 w-5 shrink-0 mt-0.5', iconColors[variant])} />
        )}
        
        <div className="flex-1 space-y-1">
          <p className="text-sm font-semibold">{title}</p>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
          {action && (
            <Button
              variant="link"
              size="sm"
              className="h-auto p-0 text-sm"
              onClick={action.onClick}
            >
              {action.label}
            </Button>
          )}
        </div>

        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(() => onDismiss(id), 300);
          }}
          className="shrink-0 rounded-md p-1 hover:bg-muted transition-colors"
        >
          <X className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>

      {progress && duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted/50">
          <div
            className={cn('h-full transition-all ease-linear', progressColors[variant])}
            style={{ width: `${progressWidth}%` }}
          />
        </div>
      )}
    </div>
  );
};
