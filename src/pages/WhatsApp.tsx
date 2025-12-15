import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { WhatsAppConnectPanel } from '@/components/whatsapp/WhatsAppConnectPanel';
import { WhatsAppChatsPanel } from '@/components/whatsapp/WhatsAppChatsPanel';
import { WhatsAppStatusBar } from '@/components/whatsapp/WhatsAppStatusBar';
import { WhatsAppSettingsDialog } from '@/components/whatsapp/WhatsAppSettingsDialog';
import { useWhatsAppSession } from '@/hooks/useWhatsAppSession';
import { Skeleton } from '@/components/ui/skeleton';

export type WhatsAppConnectionStatus = 'disconnected' | 'connecting' | 'qr-pending' | 'connected' | 'reconnecting';

export default function WhatsApp() {
  const {
    session,
    qrCode,
    qrExpiry,
    isLoading,
    error,
    requestQRCode,
    confirmScan,
    disconnect,
    refreshQR,
    isConnected,
    status,
  } = useWhatsAppSession();

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="h-[calc(100vh-4rem)] flex flex-col overflow-hidden">
          <div className="h-10 border-b border-border">
            <Skeleton className="h-full w-full" />
          </div>
          <div className="flex-1 flex items-center justify-center">
            <Skeleton className="h-96 w-96 rounded-lg" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-4rem)] flex flex-col overflow-hidden">
        {/* Status Bar */}
        <WhatsAppStatusBar 
          status={status as WhatsAppConnectionStatus}
          phoneNumber={session?.phoneNumber || null}
          onDisconnect={disconnect}
          settingsButton={
            <WhatsAppSettingsDialog
              isConnected={isConnected}
              phoneNumber={session?.phoneNumber || null}
              lastConnectedAt={session?.lastConnectedAt || null}
              onDisconnect={disconnect}
            />
          }
        />

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          {isConnected && session?.id ? (
            <WhatsAppChatsPanel sessionId={session.id} />
          ) : (
            <WhatsAppConnectPanel 
              status={status as WhatsAppConnectionStatus}
              qrCode={qrCode}
              qrExpiry={qrExpiry}
              error={error}
              onConnect={requestQRCode}
              onConfirmScan={confirmScan}
              onCancel={() => disconnect()}
              onRefreshQR={refreshQR}
            />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
