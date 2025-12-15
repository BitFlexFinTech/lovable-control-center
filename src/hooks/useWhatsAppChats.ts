import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

export interface WhatsAppChat {
  id: string;
  sessionId: string;
  name: string;
  phone: string;
  avatar?: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  isPinned: boolean;
  isMuted: boolean;
}

export function useWhatsAppChats(sessionId: string | undefined) {
  const [chats, setChats] = useState<WhatsAppChat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Fetch chats from database
  const fetchChats = useCallback(async () => {
    if (!sessionId) {
      setChats([]);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('whatsapp_chats')
        .select('*')
        .eq('session_id', sessionId)
        .order('is_pinned', { ascending: false })
        .order('last_message_at', { ascending: false });

      if (error) throw error;

      const formattedChats: WhatsAppChat[] = (data || []).map((chat) => ({
        id: chat.id,
        sessionId: chat.session_id || '',
        name: chat.contact_name || chat.contact_phone,
        phone: chat.contact_phone,
        avatar: chat.profile_picture_url || undefined,
        lastMessage: chat.last_message_preview || '',
        lastMessageAt: chat.last_message_at || chat.created_at || '',
        unreadCount: chat.unread_count || 0,
        isPinned: chat.is_pinned || false,
        isMuted: chat.is_muted || false,
      }));

      setChats(formattedChats);
    } catch (err: any) {
      console.error('Error fetching chats:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]);

  // Initial fetch
  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  // Subscribe to realtime changes
  useEffect(() => {
    if (!sessionId) return;

    const channel = supabase
      .channel(`chats-${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'whatsapp_chats',
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          console.log('Chat change:', payload);
          
          if (payload.eventType === 'INSERT') {
            const newChat = payload.new as any;
            setChats((prev) => [{
              id: newChat.id,
              sessionId: newChat.session_id || '',
              name: newChat.contact_name || newChat.contact_phone,
              phone: newChat.contact_phone,
              avatar: newChat.profile_picture_url || undefined,
              lastMessage: newChat.last_message_preview || '',
              lastMessageAt: newChat.last_message_at || newChat.created_at || '',
              unreadCount: newChat.unread_count || 0,
              isPinned: newChat.is_pinned || false,
              isMuted: newChat.is_muted || false,
            }, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            const updatedChat = payload.new as any;
            setChats((prev) => prev.map((chat) =>
              chat.id === updatedChat.id
                ? {
                    ...chat,
                    name: updatedChat.contact_name || updatedChat.contact_phone,
                    lastMessage: updatedChat.last_message_preview || '',
                    lastMessageAt: updatedChat.last_message_at || '',
                    unreadCount: updatedChat.unread_count || 0,
                    isPinned: updatedChat.is_pinned || false,
                    isMuted: updatedChat.is_muted || false,
                  }
                : chat
            ));
          } else if (payload.eventType === 'DELETE') {
            const deletedId = (payload.old as any).id;
            setChats((prev) => prev.filter((chat) => chat.id !== deletedId));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId]);

  const markAsRead = useCallback(async (chatId: string) => {
    try {
      await supabase.from('whatsapp_chats').update({ unread_count: 0 }).eq('id', chatId);
      setChats((prev) =>
        prev.map((chat) =>
          chat.id === chatId ? { ...chat, unreadCount: 0 } : chat
        )
      );
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  }, []);

  const togglePin = useCallback(async (chatId: string) => {
    const chat = chats.find((c) => c.id === chatId);
    if (!chat) return;

    try {
      await supabase
        .from('whatsapp_chats')
        .update({ is_pinned: !chat.isPinned })
        .eq('id', chatId);
    } catch (err) {
      console.error('Error toggling pin:', err);
    }
  }, [chats]);

  const toggleMute = useCallback(async (chatId: string) => {
    const chat = chats.find((c) => c.id === chatId);
    if (!chat) return;

    try {
      await supabase
        .from('whatsapp_chats')
        .update({ is_muted: !chat.isMuted })
        .eq('id', chatId);
    } catch (err) {
      console.error('Error toggling mute:', err);
    }
  }, [chats]);

  return {
    chats,
    isLoading,
    error,
    refetch: fetchChats,
    markAsRead,
    togglePin,
    toggleMute,
  };
}
