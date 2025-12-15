export type WhatsAppConnectionStatus = 
  | 'disconnected' 
  | 'connecting' 
  | 'qr-pending' 
  | 'qr-required' 
  | 'connected' 
  | 'reconnecting';

export interface WhatsAppSession {
  id: string;
  userId: string;
  phoneNumber: string | null;
  status: WhatsAppConnectionStatus;
  lastConnectedAt: string | null;
}

export interface WhatsAppChat {
  id: string;
  contactPhone: string;
  contactName: string | null;
  profilePictureUrl: string | null;
  lastMessagePreview: string | null;
  lastMessageAt: string | null;
  unreadCount: number;
  isPinned: boolean;
  isMuted: boolean;
}

export interface WhatsAppMessage {
  id: string;
  chatId: string;
  content: string | null;
  direction: 'inbound' | 'outbound';
  status: 'sent' | 'delivered' | 'read' | 'failed';
  mediaType: string | null;
  mediaUrl: string | null;
  createdAt: string;
}
