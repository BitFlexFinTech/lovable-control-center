import { useState } from 'react';
import { WhatsAppChatList } from './WhatsAppChatList';
import { WhatsAppMessageThread } from './WhatsAppMessageThread';

export interface WhatsAppChat {
  id: string;
  name: string;
  phone: string;
  avatar?: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  isOnline?: boolean;
}

export interface WhatsAppMessage {
  id: string;
  content: string;
  timestamp: string;
  direction: 'inbound' | 'outbound';
  status: 'sent' | 'delivered' | 'read' | 'failed';
}

const mockChats: WhatsAppChat[] = [
  {
    id: '1',
    name: 'John Smith',
    phone: '+1 (555) 234-5678',
    lastMessage: 'Thanks for the quick response! I\'ll check it out.',
    timestamp: '2 min ago',
    unreadCount: 2,
    isOnline: true,
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    phone: '+1 (555) 345-6789',
    lastMessage: 'When will my order arrive?',
    timestamp: '15 min ago',
    unreadCount: 1,
    isOnline: true,
  },
  {
    id: '3',
    name: 'Mike Williams',
    phone: '+1 (555) 456-7890',
    lastMessage: 'Perfect, thank you!',
    timestamp: '1 hour ago',
    unreadCount: 0,
    isOnline: false,
  },
  {
    id: '4',
    name: 'Emma Davis',
    phone: '+1 (555) 567-8901',
    lastMessage: 'Can I get a refund for my purchase?',
    timestamp: '3 hours ago',
    unreadCount: 0,
    isOnline: false,
  },
  {
    id: '5',
    name: 'Alex Brown',
    phone: '+1 (555) 678-9012',
    lastMessage: 'Great service! Will recommend to friends.',
    timestamp: 'Yesterday',
    unreadCount: 0,
    isOnline: false,
  },
];

const mockMessages: Record<string, WhatsAppMessage[]> = {
  '1': [
    { id: '1', content: 'Hi! I have a question about your product.', timestamp: '10:30 AM', direction: 'inbound', status: 'read' },
    { id: '2', content: 'Hello John! Of course, I\'d be happy to help. What would you like to know?', timestamp: '10:31 AM', direction: 'outbound', status: 'read' },
    { id: '3', content: 'Do you offer international shipping?', timestamp: '10:32 AM', direction: 'inbound', status: 'read' },
    { id: '4', content: 'Yes, we ship to over 50 countries! Shipping rates depend on your location. You can check the exact cost at checkout.', timestamp: '10:33 AM', direction: 'outbound', status: 'read' },
    { id: '5', content: 'Thanks for the quick response! I\'ll check it out.', timestamp: '10:35 AM', direction: 'inbound', status: 'read' },
  ],
  '2': [
    { id: '1', content: 'Hello, I placed an order yesterday', timestamp: '9:00 AM', direction: 'inbound', status: 'read' },
    { id: '2', content: 'Hi Sarah! Let me check that for you. What\'s your order number?', timestamp: '9:05 AM', direction: 'outbound', status: 'read' },
    { id: '3', content: 'It\'s #ORD-12345', timestamp: '9:06 AM', direction: 'inbound', status: 'read' },
    { id: '4', content: 'When will my order arrive?', timestamp: '9:15 AM', direction: 'inbound', status: 'read' },
  ],
};

export function WhatsAppChatsPanel() {
  const [selectedChat, setSelectedChat] = useState<WhatsAppChat | null>(mockChats[0]);
  const [messages, setMessages] = useState<WhatsAppMessage[]>(mockMessages['1'] || []);

  const handleSelectChat = (chat: WhatsAppChat) => {
    setSelectedChat(chat);
    setMessages(mockMessages[chat.id] || []);
  };

  const handleSendMessage = (content: string) => {
    const newMessage: WhatsAppMessage = {
      id: Date.now().toString(),
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      direction: 'outbound',
      status: 'sent',
    };
    setMessages(prev => [...prev, newMessage]);

    // Simulate delivery
    setTimeout(() => {
      setMessages(prev => 
        prev.map(m => m.id === newMessage.id ? { ...m, status: 'delivered' } : m)
      );
    }, 1000);

    // Simulate read
    setTimeout(() => {
      setMessages(prev => 
        prev.map(m => m.id === newMessage.id ? { ...m, status: 'read' } : m)
      );
    }, 2000);
  };

  return (
    <div className="h-full flex overflow-hidden border-t border-border">
      {/* Chat List */}
      <div className="w-80 border-r border-border flex-shrink-0 overflow-hidden">
        <WhatsAppChatList 
          chats={mockChats}
          selectedChatId={selectedChat?.id}
          onSelectChat={handleSelectChat}
        />
      </div>

      {/* Message Thread */}
      <div className="flex-1 overflow-hidden">
        {selectedChat ? (
          <WhatsAppMessageThread 
            chat={selectedChat}
            messages={messages}
            onSendMessage={handleSendMessage}
          />
        ) : (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            <p>Select a chat to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
}
