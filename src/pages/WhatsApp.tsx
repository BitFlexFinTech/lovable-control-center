import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { WhatsAppConnectPanel } from '@/components/whatsapp/WhatsAppConnectPanel';
import { WhatsAppChatsPanel } from '@/components/whatsapp/WhatsAppChatsPanel';
import { WhatsAppStatusBar } from '@/components/whatsapp/WhatsAppStatusBar';

export type WhatsAppConnectionStatus = 'disconnected' | 'connecting' | 'qr-required' | 'connected' | 'reconnecting';

export default function WhatsApp() {
  const [status, setStatus] = useState<WhatsAppConnectionStatus>('disconnected');
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null);

  const handleConnect = () => {
    setStatus('connecting');
    // Simulate connection process
    setTimeout(() => {
      setStatus('qr-required');
    }, 1500);
  };

  const handleQRScanned = () => {
    setStatus('connecting');
    setTimeout(() => {
      setStatus('connected');
      setPhoneNumber('+1 (555) 123-4567');
    }, 2000);
  };

  const handleDisconnect = () => {
    setStatus('disconnected');
    setPhoneNumber(null);
  };

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-4rem)] flex flex-col overflow-hidden">
        {/* Status Bar */}
        <WhatsAppStatusBar 
          status={status} 
          phoneNumber={phoneNumber}
          onDisconnect={handleDisconnect}
        />

        {/* Main Content - No scroll on page, only internal panels scroll */}
        <div className="flex-1 overflow-hidden">
          {status === 'connected' ? (
            <WhatsAppChatsPanel />
          ) : (
            <WhatsAppConnectPanel 
              status={status}
              onConnect={handleConnect}
              onQRScanned={handleQRScanned}
              onCancel={() => setStatus('disconnected')}
            />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
