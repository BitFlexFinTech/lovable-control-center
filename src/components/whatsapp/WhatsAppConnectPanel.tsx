import { QrCode, Smartphone, Shield, Loader2, X, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface WhatsAppConnectPanelProps {
  status: 'disconnected' | 'connecting' | 'qr-pending' | 'connected' | 'reconnecting';
  qrCode: string | null;
  qrExpiry: number;
  error: string | null;
  onConnect: () => void;
  onConfirmScan: () => void;
  onCancel: () => void;
  onRefreshQR: () => void;
}

export function WhatsAppConnectPanel({ 
  status, 
  qrCode,
  qrExpiry,
  error,
  onConnect, 
  onConfirmScan, 
  onCancel,
  onRefreshQR,
}: WhatsAppConnectPanelProps) {
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

              {error && (
                <div className="flex items-center gap-2 p-3 bg-destructive/10 rounded-lg text-destructive text-sm">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

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

          {status === 'qr-pending' && (
            <div className="text-center space-y-6">
              <div className="relative">
                <h2 className="text-xl font-bold text-foreground mb-4">Scan QR Code</h2>
                
                {/* QR Code Display */}
                <div className="relative mx-auto w-64 h-64 bg-white rounded-2xl p-4 shadow-lg">
                  {qrCode ? (
                    <div className="w-full h-full flex items-center justify-center relative">
                      {/* Real QR Code would be rendered here via a QR library */}
                      {/* For now, show the QR data as visual representation */}
                      <div className="absolute inset-4 grid grid-cols-8 gap-1">
                        {Array.from({ length: 64 }).map((_, i) => {
                          // Generate deterministic pattern from QR code data
                          const hash = qrCode.charCodeAt(i % qrCode.length) + i;
                          return (
                            <div 
                              key={i} 
                              className={cn(
                                "rounded-sm transition-all duration-300",
                                hash % 3 !== 0 ? "bg-gray-900" : "bg-transparent"
                              )}
                            />
                          );
                        })}
                      </div>
                      
                      {/* Corner markers */}
                      <div className="absolute top-3 left-3 w-8 h-8 border-4 border-gray-900 rounded-md" />
                      <div className="absolute top-3 right-3 w-8 h-8 border-4 border-gray-900 rounded-md" />
                      <div className="absolute bottom-3 left-3 w-8 h-8 border-4 border-gray-900 rounded-md" />
                      
                      {/* WhatsApp logo in center */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="h-12 w-12 rounded-full bg-green-500 flex items-center justify-center shadow-lg">
                          <Smartphone className="h-6 w-6 text-white" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Loader2 className="h-8 w-8 text-green-500 animate-spin" />
                    </div>
                  )}
                </div>

                {/* Countdown */}
                <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  {qrExpiry > 0 ? (
                    <>
                      <RefreshCw className={cn("h-4 w-4", qrExpiry <= 10 && "text-orange-500")} />
                      <span className={cn(qrExpiry <= 10 && "text-orange-500 font-medium")}>
                        QR expires in {qrExpiry}s
                      </span>
                    </>
                  ) : (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={onRefreshQR}
                      className="gap-2"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Refresh QR Code
                    </Button>
                  )}
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
                  onClick={onConfirmScan}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  I've Scanned
                </Button>
              </div>
            </div>
          )}

          {status === 'reconnecting' && (
            <div className="text-center space-y-6">
              <div className="h-20 w-20 rounded-full bg-muted mx-auto flex items-center justify-center">
                <RefreshCw className="h-10 w-10 text-green-500 animate-spin" />
              </div>
              
              <div>
                <h2 className="text-xl font-bold text-foreground mb-2">Reconnecting...</h2>
                <p className="text-muted-foreground">
                  Restoring your WhatsApp session.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
