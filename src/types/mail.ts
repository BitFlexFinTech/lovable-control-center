export type MailFolder = 'inbox' | 'sent' | 'drafts' | 'archive' | 'trash' | 'spam';
export type MailStatus = 'read' | 'unread';
export type EmailAccountType = 'admin' | 'accounts' | 'social' | 'marketing' | 'custom';

export interface EmailAccount {
  id: string;
  tenantId: string;
  name: string;
  email: string;
  type: EmailAccountType;
  createdAt: string;
}

export interface Mail {
  id: string;
  tenantId: string;
  accountId: string;
  sender: {
    name: string;
    email: string;
  };
  recipients: {
    to: string[];
    cc?: string[];
    bcc?: string[];
  };
  subject: string;
  body: string;
  bodyPreview: string;
  timestamp: string;
  folder: MailFolder;
  status: MailStatus;
  isStarred: boolean;
  hasAttachments: boolean;
  attachments?: {
    name: string;
    size: number;
    type: string;
  }[];
  threadId?: string;
  replyTo?: string;
}

export interface MailThread {
  id: string;
  subject: string;
  messages: Mail[];
  participants: string[];
  lastMessageAt: string;
}
