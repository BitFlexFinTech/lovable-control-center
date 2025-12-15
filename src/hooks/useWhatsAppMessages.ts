import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface WhatsAppMessage {
  id: string;
  chatId: string;
  content: string;
  timestamp: string;
  direction: 'inbound' | 'outbound';
  status: 'sent' | 'delivered' | 'read' | 'failed';
  mediaType?: string;
  mediaUrl?: string;
}

export function useWhatsAppMessages(chatId: string | undefined) {
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch messages from database
  const fetchMessages = useCallback(async () => {
    if (!chatId) {
      setMessages([]);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('whatsapp_messages')
        .select('*')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const formattedMessages: WhatsAppMessage[] = (data || []).map((msg) => ({
        id: msg.id,
        chatId: msg.chat_id || '',
        content: msg.content || '',
        timestamp: msg.created_at || '',
        direction: msg.direction as 'inbound' | 'outbound',
        status: (msg.status || 'sent') as WhatsAppMessage['status'],
        mediaType: msg.media_type || undefined,
        mediaUrl: msg.media_url || undefined,
      }));

      setMessages(formattedMessages);
    } catch (err: any) {
      console.error('Error fetching messages:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [chatId]);

  // Initial fetch
  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Subscribe to realtime changes
  useEffect(() => {
    if (!chatId) return;

    const channel = supabase
      .channel(`messages-${chatId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'whatsapp_messages',
          filter: `chat_id=eq.${chatId}`,
        },
        (payload) => {
          console.log('Message change:', payload);

          if (payload.eventType === 'INSERT') {
            const newMsg = payload.new as any;
            const formattedMsg: WhatsAppMessage = {
              id: newMsg.id,
              chatId: newMsg.chat_id || '',
              content: newMsg.content || '',
              timestamp: newMsg.created_at || '',
              direction: newMsg.direction as 'inbound' | 'outbound',
              status: (newMsg.status || 'sent') as WhatsAppMessage['status'],
              mediaType: newMsg.media_type || undefined,
              mediaUrl: newMsg.media_url || undefined,
            };
            
            setMessages((prev) => {
              // Avoid duplicates
              if (prev.some((m) => m.id === formattedMsg.id)) return prev;
              return [...prev, formattedMsg];
            });
          } else if (payload.eventType === 'UPDATE') {
            const updatedMsg = payload.new as any;
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === updatedMsg.id
                  ? { ...msg, status: updatedMsg.status || msg.status }
                  : msg
              )
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatId]);

  const sendMessage = useCallback(async (content: string) => {
    if (!chatId || !content.trim()) return;

    setIsSending(true);

    // Optimistic update
    const tempId = `temp-${Date.now()}`;
    const optimisticMessage: WhatsAppMessage = {
      id: tempId,
      chatId,
      content: content.trim(),
      timestamp: new Date().toISOString(),
      direction: 'outbound',
      status: 'sent',
    };

    setMessages((prev) => [...prev, optimisticMessage]);

    try {
      // Get chat details for the phone number
      const { data: chatData } = await supabase
        .from('whatsapp_chats')
        .select('contact_phone')
        .eq('id', chatId)
        .single();

      if (!chatData) throw new Error('Chat not found');

      // Send via edge function
      const { data, error } = await supabase.functions.invoke('whatsapp-send', {
        body: {
          to: chatData.contact_phone,
          message: content.trim(),
          chatId,
        },
      });

      if (error) throw error;

      // Update message with real ID and status
      if (data?.messageId) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === tempId
              ? { ...msg, id: data.messageId, status: 'delivered' }
              : msg
          )
        );
      }

      // Simulate read status after delay
      setTimeout(() => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === tempId || msg.id === data?.messageId
              ? { ...msg, status: 'read' }
              : msg
          )
        );
      }, 2000);

    } catch (err: any) {
      console.error('Error sending message:', err);
      toast.error('Failed to send message');
      
      // Mark as failed
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempId ? { ...msg, status: 'failed' } : msg
        )
      );
    } finally {
      setIsSending(false);
    }
  }, [chatId]);

  const retryMessage = useCallback(async (messageId: string) => {
    const message = messages.find((m) => m.id === messageId);
    if (!message || message.status !== 'failed') return;

    // Remove failed message and resend
    setMessages((prev) => prev.filter((m) => m.id !== messageId));
    await sendMessage(message.content);
  }, [messages, sendMessage]);

  return {
    messages,
    isLoading,
    isSending,
    error,
    sendMessage,
    retryMessage,
    refetch: fetchMessages,
  };
}
