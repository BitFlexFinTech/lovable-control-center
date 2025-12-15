import { Settings, LogOut, Smartphone, Shield, Clock, RefreshCw } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface WhatsAppSettingsDialogProps {
  isConnected: boolean;
  phoneNumber: string | null;
  lastConnectedAt: string | null;
  onDisconnect: () => void;
  children?: React.ReactNode;
}

export function WhatsAppSettingsDialog({
  isConnected,
  phoneNumber,
  lastConnectedAt,
  onDisconnect,
  children,
}: WhatsAppSettingsDialogProps) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString();
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children || (
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Settings className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center">
              <Smartphone className="h-4 w-4 text-white" />
            </div>
            WhatsApp Settings
          </DialogTitle>
          <DialogDescription>
            Manage your WhatsApp connection and preferences.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Connection Status */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-foreground">Connection Status</h4>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "h-3 w-3 rounded-full",
                  isConnected ? "bg-green-500" : "bg-muted-foreground"
                )} />
                <div>
                  <p className="text-sm font-medium">
                    {isConnected ? 'Connected' : 'Disconnected'}
                  </p>
                  {phoneNumber && (
                    <p className="text-xs text-muted-foreground">{phoneNumber}</p>
                  )}
                </div>
              </div>
              <Badge variant={isConnected ? 'default' : 'secondary'} className={cn(
                isConnected && "bg-green-500 hover:bg-green-600"
              )}>
                {isConnected ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </div>

          <Separator />

          {/* Session Info */}
          {isConnected && (
            <>
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-foreground">Session Information</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      Connected since
                    </span>
                    <span className="font-medium">{formatDate(lastConnectedAt)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <Shield className="h-4 w-4" />
                      Encryption
                    </span>
                    <span className="font-medium text-green-500">End-to-end</span>
                  </div>
                </div>
              </div>

              <Separator />
            </>
          )}

          {/* Actions */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-foreground">Actions</h4>
            <div className="space-y-2">
              {isConnected && (
                <>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start gap-2"
                    disabled
                  >
                    <RefreshCw className="h-4 w-4" />
                    Sync Messages
                    <Badge variant="secondary" className="ml-auto">Coming Soon</Badge>
                  </Button>
                  
                  <Button 
                    variant="destructive" 
                    className="w-full justify-start gap-2"
                    onClick={onDisconnect}
                  >
                    <LogOut className="h-4 w-4" />
                    Disconnect WhatsApp
                  </Button>
                </>
              )}
              
              {!isConnected && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Connect your WhatsApp to manage settings.
                </p>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
