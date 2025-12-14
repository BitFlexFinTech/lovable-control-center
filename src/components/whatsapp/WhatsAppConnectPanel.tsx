import { useState, useEffect } from 'react';
import { QrCode, Smartphone, Shield, Loader2, X, RefreshCw, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { WhatsAppConnectionStatus } from '@/pages/WhatsApp';

interface WhatsAppConnectPanelProps {
  status: WhatsAppConnectionStatus;
  onConnect: () => void;
  onQRScanned: () => void;
  onCancel: () => void;
}

export function WhatsAppConnectPanel({ status, onConnect, onQRScanned, onCancel }: WhatsAppConnectPanelProps) {
  const [qrExpiry, setQrExpiry] = useState(60);

  useEffect(() => {
    if (status === 'qr-required') {
      setQrExpiry(60);
      const interval = setInterval(() => {
        setQrExpiry(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [status]);

  return (
    <div className="h-full flex items-center justify-center p-8 bg-gradient-to-b from-muted/30 to-background">
      <Card className="w-full max-w-lg">
        <CardContent className="p-8">
          {status === 'disconnected' && (
            <div className="text-center space-y-6">
              <div className="h-20 w-20 rounded-full bg-gradient-to-br from-green-500 to-green-600 mx-auto flex items-center justify-center">
                <Smartphone className="h-10 w-10 text-white" />
              </div>
              
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Connect WhatsApp</h2>
                <p className="text-muted-foreground">
                  Link your WhatsApp Business account to send and receive messages directly from Control Center.
                </p>
              </div>

              <div className="space-y-3 text-left bg-muted/50 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <QrCode className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Scan QR Code</p>
                    <p className="text-xs text-muted-foreground">Open WhatsApp on your phone and scan the QR code</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">End-to-End Encrypted</p>
                    <p className="text-xs text-muted-foreground">Your messages are secured with encryption</p>
                  </div>
                </div>
              </div>

              <Button 
                size="lg" 
                className="w-full bg-green-600 hover:bg-green-700"
                onClick={onConnect}
              >
                Connect WhatsApp
              </Button>
            </div>
          )}

          {status === 'connecting' && (
            <div className="text-center space-y-6">
              <div className="h-20 w-20 rounded-full bg-muted mx-auto flex items-center justify-center">
                <Loader2 className="h-10 w-10 text-green-500 animate-spin" />
              </div>
              
              <div>
                <h2 className="text-xl font-bold text-foreground mb-2">Connecting...</h2>
                <p className="text-muted-foreground">
                  Please wait while we establish a secure connection.
                </p>
              </div>
            </div>
          )}

          {status === 'qr-required' && (
            <div className="text-center space-y-6">
              <div className="relative">
                <h2 className="text-xl font-bold text-foreground mb-4">Scan QR Code</h2>
                
                {/* QR Code Placeholder */}
                <div className="relative mx-auto w-64 h-64 bg-white rounded-2xl p-4 shadow-lg">
                  <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center relative overflow-hidden">
                    {/* Simulated QR pattern */}
                    <div className="absolute inset-4 grid grid-cols-8 gap-1">
                      {Array.from({ length: 64 }).map((_, i) => (
                        <div 
                          key={i} 
                          className={cn(
                            "rounded-sm",
                            Math.random() > 0.5 ? "bg-gray-900" : "bg-transparent"
                          )}
                        />
                      ))}
                    </div>
                    {/* Corner markers */}
                    <div className="absolute top-3 left-3 w-8 h-8 border-4 border-gray-900 rounded-md" />
                    <div className="absolute top-3 right-3 w-8 h-8 border-4 border-gray-900 rounded-md" />
                    <div className="absolute bottom-3 left-3 w-8 h-8 border-4 border-gray-900 rounded-md" />
                  </div>
                  
                  {/* WhatsApp logo in center */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-12 w-12 rounded-full bg-green-500 flex items-center justify-center shadow-lg">
                      <Smartphone className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </div>

                {/* Countdown */}
                <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <RefreshCw className={cn("h-4 w-4", qrExpiry <= 10 && "text-orange-500")} />
                  <span className={cn(qrExpiry <= 10 && "text-orange-500 font-medium")}>
                    QR expires in {qrExpiry}s
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  1. Open WhatsApp on your phone
                </p>
                <p className="text-sm text-muted-foreground">
                  2. Tap Menu <span className="font-mono">⋮</span> or Settings → Linked Devices
                </p>
                <p className="text-sm text-muted-foreground">
                  3. Tap "Link a Device" and scan this QR code
                </p>
              </div>

              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={onCancel}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button 
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  onClick={onQRScanned}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  I've Scanned
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
