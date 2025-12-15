import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface KPIGaugeProps {
  value: number;
  maxValue: number;
  threshold: number;
  unit: string;
  status: 'healthy' | 'warning' | 'critical';
  invertThreshold?: boolean;
}

export function KPIGauge({ 
  value, 
  maxValue, 
  threshold, 
  unit, 
  status,
  invertThreshold = false 
}: KPIGaugeProps) {
  const percentage = Math.min((value / maxValue) * 100, 100);
  const thresholdPercentage = (threshold / maxValue) * 100;

  const getStatusColor = () => {
    switch (status) {
      case 'healthy': return 'text-green-500';
      case 'warning': return 'text-yellow-500';
      case 'critical': return 'text-red-500';
      default: return 'text-muted-foreground';
    }
  };

  const getProgressColor = () => {
    switch (status) {
      case 'healthy': return '[&>div]:bg-green-500';
      case 'warning': return '[&>div]:bg-yellow-500';
      case 'critical': return '[&>div]:bg-red-500';
      default: return '';
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between">
        <span className={cn("text-2xl font-bold", getStatusColor())}>
          {unit === '$' ? `$${value.toFixed(2)}` : `${value}${unit}`}
        </span>
        <span className="text-xs text-muted-foreground">
          threshold: {unit === '$' ? `$${threshold}` : `${threshold}${unit}`}
        </span>
      </div>
      
      <div className="relative">
        <Progress value={percentage} className={cn("h-2", getProgressColor())} />
        <div 
          className="absolute top-0 w-0.5 h-2 bg-foreground/50"
          style={{ left: `${thresholdPercentage}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>0</span>
        <span>{unit === '$' ? `$${maxValue}` : `${maxValue}${unit}`}</span>
      </div>
    </div>
  );
}
