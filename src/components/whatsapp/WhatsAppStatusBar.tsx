import { Wifi, WifiOff, Loader2, QrCode, RefreshCw, Phone, LogOut } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { WhatsAppConnectionStatus } from '@/pages/WhatsApp';

interface WhatsAppStatusBarProps {
  status: WhatsAppConnectionStatus;
  phoneNumber: string | null;
  onDisconnect: () => void;
}

const statusConfig: Record<WhatsAppConnectionStatus, {
  label: string;
  icon: React.ElementType;
  variant: 'default' | 'secondary' | 'destructive' | 'outline';
  className: string;
}> = {
  disconnected: {
    label: 'Disconnected',
    icon: WifiOff,
    variant: 'destructive',
    className: 'bg-red-500/10 text-red-500 border-red-500/20',
  },
  connecting: {
    label: 'Connecting...',
    icon: Loader2,
    variant: 'secondary',
    className: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  },
  'qr-required': {
    label: 'Scan QR Code',
    icon: QrCode,
    variant: 'secondary',
    className: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  },
  connected: {
    label: 'Connected',
    icon: Wifi,
    variant: 'default',
    className: 'bg-green-500/10 text-green-500 border-green-500/20',
  },
  reconnecting: {
    label: 'Reconnecting...',
    icon: RefreshCw,
    variant: 'secondary',
    className: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  },
};

export function WhatsAppStatusBar({ status, phoneNumber, onDisconnect }: WhatsAppStatusBarProps) {
  const config = statusConfig[status];
  const StatusIcon = config.icon;

  return (
    <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-card flex-shrink-0">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
            <Phone className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">WhatsApp</h1>
            <p className="text-xs text-muted-foreground">Business Messaging</p>
          </div>
        </div>

        <Badge 
          variant="outline" 
          className={cn("gap-1.5 px-3 py-1", config.className)}
        >
          <StatusIcon className={cn(
            "h-3.5 w-3.5",
            (status === 'connecting' || status === 'reconnecting') && "animate-spin"
          )} />
          {config.label}
        </Badge>

        {phoneNumber && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-green-500" />
            {phoneNumber}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        {status === 'connected' && (
          <>
            <span className="text-xs text-muted-foreground">
              Last synced: just now
            </span>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onDisconnect}
              className="text-muted-foreground hover:text-destructive"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Disconnect
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
