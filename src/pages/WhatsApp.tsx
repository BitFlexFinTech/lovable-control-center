import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLink, MessageSquare, Smartphone, QrCode, CheckCircle2 } from 'lucide-react';

export default function WhatsApp() {
  const handleOpenWhatsApp = () => {
    window.open(
      'https://web.whatsapp.com/',
      'WhatsApp',
      'width=1200,height=800,menubar=no,toolbar=no,location=no,status=no'
    );
  };

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-6">
        <Card className="max-w-md w-full text-center">
          <CardHeader className="pb-4">
            <div className="mx-auto w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
              <MessageSquare className="h-10 w-10 text-green-500" />
            </div>
            <CardTitle className="text-2xl">WhatsApp Web</CardTitle>
            <CardDescription>
              Open WhatsApp Web in a new window to manage your messages
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3 text-left">
              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium">1</div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Open WhatsApp on your phone</p>
                  <p className="text-xs text-muted-foreground">Go to Settings → Linked Devices</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium">2</div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Tap "Link a Device"</p>
                  <p className="text-xs text-muted-foreground">Point your phone at the QR code</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium">3</div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Start messaging</p>
                  <p className="text-xs text-muted-foreground">Your chats will sync automatically</p>
                </div>
              </div>
            </div>

            <Button 
              size="lg" 
              onClick={handleOpenWhatsApp} 
              className="w-full gap-2 bg-green-500 hover:bg-green-600 text-white"
            >
              <ExternalLink className="h-5 w-5" />
              Open WhatsApp Web
            </Button>

            <p className="text-xs text-muted-foreground">
              WhatsApp Web will open in a new popup window
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
