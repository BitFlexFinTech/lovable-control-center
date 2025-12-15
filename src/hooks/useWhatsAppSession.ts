import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export type SessionStatus = 'disconnected' | 'connecting' | 'qr-pending' | 'connected' | 'reconnecting';

interface WhatsAppSession {
  id: string;
  status: SessionStatus;
  phoneNumber: string | null;
  lastConnectedAt: string | null;
}

export function useWhatsAppSession() {
  const { user } = useAuth();
  const [session, setSession] = useState<WhatsAppSession | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [qrExpiry, setQrExpiry] = useState(60);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load existing session on mount
  useEffect(() => {
    if (!user) return;
    
    const loadSession = async () => {
      try {
        const { data, error } = await supabase
          .from('whatsapp_sessions')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'connected')
          .order('last_connected_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          setSession({
            id: data.id,
            status: data.status as SessionStatus,
            phoneNumber: data.phone_number,
            lastConnectedAt: data.last_connected_at,
          });
        }
      } catch (err) {
        console.error('Error loading session:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadSession();
  }, [user]);

  // Subscribe to session changes
  useEffect(() => {
    if (!session?.id) return;

    const channel = supabase
      .channel(`session-${session.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'whatsapp_sessions',
          filter: `id=eq.${session.id}`,
        },
        (payload) => {
          const newData = payload.new as any;
          setSession({
            id: newData.id,
            status: newData.status as SessionStatus,
            phoneNumber: newData.phone_number,
            lastConnectedAt: newData.last_connected_at,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session?.id]);

  // QR code expiry countdown
  useEffect(() => {
    if (!qrCode || qrExpiry <= 0) return;

    const timer = setInterval(() => {
      setQrExpiry((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setQrCode(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [qrCode, qrExpiry]);

  const requestQRCode = useCallback(async () => {
    if (!user) return;

    setError(null);
    setSession((prev) => prev ? { ...prev, status: 'connecting' } : null);

    try {
      const { data, error } = await supabase.functions.invoke('whatsapp-bridge', {
        body: { action: 'get-qr', userId: user.id },
      });

      if (error) throw error;

      if (data.success) {
        setQrCode(data.qrCode);
        setQrExpiry(data.expiresIn || 60);
        setSession({
          id: data.sessionId,
          status: 'qr-pending',
          phoneNumber: null,
          lastConnectedAt: null,
        });
      } else {
        throw new Error(data.error || 'Failed to get QR code');
      }
    } catch (err: any) {
      console.error('Error requesting QR code:', err);
      setError(err.message);
      toast.error('Failed to generate QR code');
    }
  }, [user]);

  const confirmScan = useCallback(async () => {
    if (!session?.id || !user) return;

    try {
      const { data, error } = await supabase.functions.invoke('whatsapp-bridge', {
        body: { 
          action: 'confirm-scan', 
          sessionId: session.id, 
          userId: user.id,
        },
      });

      if (error) throw error;

      if (data.success) {
        setQrCode(null);
        setSession({
          id: session.id,
          status: 'connected',
          phoneNumber: data.phoneNumber,
          lastConnectedAt: new Date().toISOString(),
        });
        toast.success('WhatsApp connected successfully!');
      } else {
        throw new Error(data.error || 'Failed to confirm scan');
      }
    } catch (err: any) {
      console.error('Error confirming scan:', err);
      setError(err.message);
      toast.error('Failed to connect WhatsApp');
    }
  }, [session?.id, user]);

  const disconnect = useCallback(async () => {
    if (!session?.id) return;

    try {
      const { data, error } = await supabase.functions.invoke('whatsapp-bridge', {
        body: { action: 'disconnect', sessionId: session.id },
      });

      if (error) throw error;

      setSession(null);
      setQrCode(null);
      toast.success('WhatsApp disconnected');
    } catch (err: any) {
      console.error('Error disconnecting:', err);
      toast.error('Failed to disconnect');
    }
  }, [session?.id]);

  const refreshQR = useCallback(async () => {
    setQrCode(null);
    await requestQRCode();
  }, [requestQRCode]);

  return {
    session,
    qrCode,
    qrExpiry,
    isLoading,
    error,
    requestQRCode,
    confirmScan,
    disconnect,
    refreshQR,
    isConnected: session?.status === 'connected',
    status: session?.status || 'disconnected',
  };
}
