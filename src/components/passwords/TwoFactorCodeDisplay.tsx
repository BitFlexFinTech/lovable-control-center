import { useState, useEffect } from 'react';
import { Shield, Copy, Eye, EyeOff, Trash2, Clock } from 'lucide-react';
import { TwoFactorAccount, TOTPCode } from '@/types/twoFactor';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface TwoFactorCodeDisplayProps {
  account: TwoFactorAccount;
  code: TOTPCode | undefined;
  onRemove?: (id: string) => void;
}

export function TwoFactorCodeDisplay({ account, code, onRemove }: TwoFactorCodeDisplayProps) {
  const { toast } = useToast();
  const [isRevealed, setIsRevealed] = useState(true);
  
  const displayCode = code?.code || '------';
  const timeRemaining = code?.timeRemaining || 30;
  const period = code?.period || 30;
  const progress = (timeRemaining / period) * 100;

  const copyCode = () => {
    navigator.clipboard.writeText(displayCode);
    toast({ title: 'Code copied!', description: 'TOTP code copied to clipboard' });
  };

  // Format code with space in middle (123 456)
  const formattedCode = isRevealed 
    ? `${displayCode.slice(0, 3)} ${displayCode.slice(3)}`
    : '••• •••';

  return (
    <div className="flex items-center gap-4 p-4 rounded-lg bg-card border border-border hover:border-primary/30 transition-colors">
      {/* Icon */}
      <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-2xl shrink-0">
        {account.integrationIcon}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="font-medium">{account.integrationName}</h4>
          <Badge variant="outline" className="text-xs">
            {account.siteName}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground truncate">{account.email}</p>
      </div>

      {/* Code Display */}
      <div className="flex items-center gap-3">
        {/* Timer Progress */}
        <div className="flex flex-col items-center gap-1 w-12">
          <div className="relative w-10 h-10">
            <svg className="w-10 h-10 transform -rotate-90">
              <circle
                cx="20"
                cy="20"
                r="16"
                stroke="currentColor"
                strokeWidth="3"
                fill="none"
                className="text-muted/30"
              />
              <circle
                cx="20"
                cy="20"
                r="16"
                stroke="currentColor"
                strokeWidth="3"
                fill="none"
                strokeDasharray={100}
                strokeDashoffset={100 - progress}
                className={cn(
                  "transition-all duration-1000",
                  timeRemaining <= 5 ? "text-status-inactive" : 
                  timeRemaining <= 10 ? "text-status-warning" : "text-primary"
                )}
                style={{ strokeDasharray: '100', strokeDashoffset: 100 - progress }}
              />
            </svg>
            <span className={cn(
              "absolute inset-0 flex items-center justify-center text-xs font-medium",
              timeRemaining <= 5 ? "text-status-inactive" : 
              timeRemaining <= 10 ? "text-status-warning" : "text-muted-foreground"
            )}>
              {timeRemaining}s
            </span>
          </div>
        </div>

        {/* Code */}
        <div 
          className={cn(
            "px-4 py-2 rounded-lg font-mono text-2xl font-bold tracking-widest cursor-pointer",
            "bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20",
            "hover:from-primary/15 hover:to-primary/10 transition-colors",
            timeRemaining <= 5 && "animate-pulse"
          )}
          onClick={copyCode}
        >
          {formattedCode}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon-sm" onClick={() => setIsRevealed(!isRevealed)}>
            {isRevealed ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="icon-sm" onClick={copyCode}>
            <Copy className="h-4 w-4" />
          </Button>
          {onRemove && (
            <Button 
              variant="ghost" 
              size="icon-sm" 
              className="text-destructive hover:text-destructive"
              onClick={() => onRemove(account.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}