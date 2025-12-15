import { useState, useEffect } from 'react';
import { WhatsAppChatList, type WhatsAppChatListItem } from './WhatsAppChatList';
import { WhatsAppMessageThread } from './WhatsAppMessageThread';
import { useWhatsAppChats, type WhatsAppChat } from '@/hooks/useWhatsAppChats';
import { useWhatsAppMessages } from '@/hooks/useWhatsAppMessages';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageSquare } from 'lucide-react';

// Re-export types for backward compatibility
export type { WhatsAppChat } from '@/hooks/useWhatsAppChats';
export type { WhatsAppMessage } from '@/hooks/useWhatsAppMessages';

interface WhatsAppChatsPanelProps {
  sessionId: string;
}

export function WhatsAppChatsPanel({ sessionId }: WhatsAppChatsPanelProps) {
  const { chats, isLoading: chatsLoading, markAsRead } = useWhatsAppChats(sessionId);
  const [selectedChat, setSelectedChat] = useState<WhatsAppChat | null>(null);
  
  const { 
    messages, 
    isLoading: messagesLoading, 
    sendMessage,
    isSending,
  } = useWhatsAppMessages(selectedChat?.id);

  // Auto-select first chat when chats load
  useEffect(() => {
    if (chats.length > 0 && !selectedChat) {
      setSelectedChat(chats[0]);
    }
  }, [chats, selectedChat]);

  const handleSelectChat = (chat: WhatsAppChat) => {
    setSelectedChat(chat);
    // Mark chat as read when selected
    if (chat.unreadCount > 0) {
      markAsRead(chat.id);
    }
  };

  const handleSendMessage = async (content: string) => {
    await sendMessage(content);
  };

  // Format messages for the thread component
  const formattedMessages = messages.map((msg) => ({
    id: msg.id,
    content: msg.content,
    timestamp: new Date(msg.timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    }),
    direction: msg.direction,
    status: msg.status,
  }));

  // Format chat for the thread component
  const formattedSelectedChat = selectedChat ? {
    id: selectedChat.id,
    name: selectedChat.name,
    phone: selectedChat.phone,
    avatar: selectedChat.avatar,
    lastMessage: selectedChat.lastMessage,
    timestamp: selectedChat.lastMessageAt 
      ? formatTimeAgo(selectedChat.lastMessageAt)
      : '',
    unreadCount: selectedChat.unreadCount,
    isOnline: false, // Would need real presence data
  } : null;

  if (chatsLoading) {
    return (
      <div className="h-full flex overflow-hidden border-t border-border">
        {/* Chat List Skeleton */}
        <div className="w-80 border-r border-border flex-shrink-0 p-4 space-y-4">
          <Skeleton className="h-9 w-full" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
          ))}
        </div>
        {/* Message Thread Skeleton */}
        <div className="flex-1 flex items-center justify-center">
          <Skeleton className="h-8 w-48" />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex overflow-hidden border-t border-border">
      {/* Chat List */}
      <div className="w-80 border-r border-border flex-shrink-0 overflow-hidden">
        <WhatsAppChatList 
          chats={chats.map(c => ({
            id: c.id,
            name: c.name,
            phone: c.phone,
            avatar: c.avatar || '',
            lastMessage: c.lastMessage,
            timestamp: c.lastMessageAt ? formatTimeAgo(c.lastMessageAt) : '',
            unreadCount: c.unreadCount,
            isOnline: false,
          } as WhatsAppChatListItem))}
          selectedChatId={selectedChat?.id}
          onSelectChat={(chat: WhatsAppChatListItem) => {
            const fullChat = chats.find(c => c.id === chat.id);
            if (fullChat) handleSelectChat(fullChat);
          }}
        />
      </div>

      {/* Message Thread */}
      <div className="flex-1 overflow-hidden">
        {formattedSelectedChat ? (
          <WhatsAppMessageThread 
            chat={formattedSelectedChat}
            messages={formattedMessages}
            onSendMessage={handleSendMessage}
            isLoading={messagesLoading}
            isSending={isSending}
          />
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground bg-muted/20">
            <MessageSquare className="h-16 w-16 mb-4 opacity-50" />
            <p className="text-lg font-medium">No chats yet</p>
            <p className="text-sm">Messages will appear here when you receive them</p>
          </div>
        )}
      </div>
    </div>
  );
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  
  return date.toLocaleDateString();
}
