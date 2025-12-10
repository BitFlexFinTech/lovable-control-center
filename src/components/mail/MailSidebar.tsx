import { DragEvent } from 'react';
import { 
  Inbox, 
  Send, 
  FileText, 
  Archive, 
  Trash2, 
  AlertCircle,
  Plus,
  ChevronRight,
  RefreshCw,
  Star,
  Flag,
  FolderOpen,
  Check,
  X,
  Loader2,
  Mail
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { MailFolder, EmailAccount } from '@/types/mail';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useState } from 'react';

interface EmailProvider {
  id: string;
  name: string;
  connected: boolean;
  syncing?: boolean;
  lastSync?: string;
  unreadCount?: number;
}

interface MailSidebarProps {
  selectedFolder: MailFolder;
  onFolderChange: (folder: MailFolder) => void;
  folderCounts: Record<MailFolder, number>;
  accounts: EmailAccount[];
  selectedAccount: EmailAccount | null;
  onAccountChange: (account: EmailAccount | null) => void;
  onCompose: () => void;
  onCreateAccount: () => void;
  onEmailSync?: () => void;
  // Connected providers
  connectedProviders?: EmailProvider[];
  // Counts
  vipCount?: number;
  flaggedCount?: number;
  // Drag and drop
  onDragOver?: (folderId: string) => (e: DragEvent) => void;
  onDragLeave?: () => void;
  onDrop?: (folderId: string) => (e: DragEvent) => void;
  dragOverTarget?: string | null;
}

const smartMailboxes = [
  { id: 'vips', label: 'VIPs', icon: Star, color: 'text-yellow-500' },
  { id: 'flagged', label: 'Flagged', icon: Flag, color: 'text-orange-500' },
  { id: 'drafts', label: 'All Drafts', icon: FileText, color: '' },
  { id: 'sent', label: 'All Sent', icon: Send, color: '' },
];

const mainFolders: { id: MailFolder; label: string; icon: typeof Inbox }[] = [
  { id: 'inbox', label: 'Inbox', icon: Inbox },
  { id: 'archive', label: 'Archive', icon: Archive },
  { id: 'trash', label: 'Trash', icon: Trash2 },
  { id: 'spam', label: 'Spam', icon: AlertCircle },
];

export function MailSidebar({
  selectedFolder,
  onFolderChange,
  folderCounts,
  accounts,
  selectedAccount,
  onAccountChange,
  onCompose,
  onCreateAccount,
  onEmailSync,
  connectedProviders = [
    { id: 'google', name: 'Google', connected: true, unreadCount: 126 },
    { id: 'outlook', name: 'Tadii | Bitflex®', connected: true, unreadCount: 98 },
  ],
  vipCount = 0,
  flaggedCount = 58,
  onDragOver,
  onDragLeave,
  onDrop,
  dragOverTarget,
}: MailSidebarProps) {
  const [inboxesOpen, setInboxesOpen] = useState(true);
  const [smartOpen, setSmartOpen] = useState(true);
  const [accountsOpen, setAccountsOpen] = useState(true);
  const [onMyMacOpen, setOnMyMacOpen] = useState(true);

  const getProviderIcon = (provider: EmailProvider) => {
    if (provider.syncing) {
      return <Loader2 className="h-3 w-3 animate-spin text-primary" />;
    }
    if (provider.connected) {
      return <Check className="h-3 w-3 text-green-500" />;
    }
    return <X className="h-3 w-3 text-destructive" />;
  };

  return (
    <div className="w-60 flex-shrink-0 border-r border-border bg-sidebar flex flex-col h-full">
      {/* Compose Button */}
      <div className="p-3 space-y-2">
        <Button 
          onClick={onCompose}
          className="w-full gap-2"
          size="sm"
        >
          <Plus className="h-4 w-4" />
          Compose
        </Button>
        {onEmailSync && (
          <Button 
            variant="outline"
            onClick={onEmailSync}
            className="w-full gap-2"
            size="sm"
          >
            <RefreshCw className="h-4 w-4" />
            Sync Email
          </Button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-1">
        {/* All Inboxes - Apple Style */}
        <Collapsible open={inboxesOpen} onOpenChange={setInboxesOpen}>
          <CollapsibleTrigger className="flex items-center gap-2 w-full px-2 py-1.5 text-sm font-medium hover:bg-secondary/50 rounded-md transition-colors group">
            <ChevronRight className={cn(
              "h-3.5 w-3.5 text-muted-foreground transition-transform duration-200",
              inboxesOpen && "rotate-90"
            )} />
            <Mail className="h-4 w-4 text-primary" />
            <span>All Inboxes</span>
          </CollapsibleTrigger>
          <CollapsibleContent className="ml-5 space-y-0.5 animate-accordion-down">
            {connectedProviders.map((provider) => (
              <button
                key={provider.id}
                onClick={() => onAccountChange(null)}
                className={cn(
                  "w-full flex items-center justify-between px-2 py-1.5 text-sm rounded-md transition-all duration-200",
                  "text-muted-foreground hover:bg-secondary/50 hover:text-foreground",
                  "group/item"
                )}
              >
                <div className="flex items-center gap-2">
                  <Inbox className="h-4 w-4 opacity-60" />
                  <span className="truncate">{provider.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  {provider.unreadCount && provider.unreadCount > 0 && (
                    <span className="text-xs text-muted-foreground">
                      {provider.unreadCount}
                    </span>
                  )}
                  <span className="opacity-0 group-hover/item:opacity-100 transition-opacity">
                    {getProviderIcon(provider)}
                  </span>
                </div>
              </button>
            ))}
          </CollapsibleContent>
        </Collapsible>

        {/* Smart Mailboxes - VIPs, Flagged, Drafts, Sent */}
        <div className="mt-2 space-y-0.5">
          {smartMailboxes.map((mailbox) => {
            const count = mailbox.id === 'flagged' ? flaggedCount :
                          mailbox.id === 'drafts' ? folderCounts.drafts :
                          mailbox.id === 'vips' ? vipCount : 0;
            const isFolder = mailbox.id === 'drafts' || mailbox.id === 'sent';
            const folderId = isFolder ? mailbox.id as MailFolder : null;
            const isActive = folderId && selectedFolder === folderId;
            
            return (
              <button
                key={mailbox.id}
                onClick={() => folderId && onFolderChange(folderId)}
                className={cn(
                  "w-full flex items-center justify-between px-2 py-1.5 text-sm rounded-md transition-all duration-200",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                )}
              >
                <div className="flex items-center gap-2">
                  <ChevronRight className="h-3.5 w-3.5 opacity-0" />
                  <mailbox.icon className={cn("h-4 w-4", mailbox.color)} />
                  <span>{mailbox.label}</span>
                </div>
                {count > 0 && (
                  <span className="text-xs text-muted-foreground">{count}</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Smart Mailboxes Section Header */}
        <p className="px-2 mt-4 mb-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Smart Mailboxes
        </p>

        {/* On My Mac Section */}
        <Collapsible open={onMyMacOpen} onOpenChange={setOnMyMacOpen} className="mt-2">
          <p className="px-2 mb-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            On My Mac
          </p>
          <CollapsibleTrigger className="flex items-center gap-2 w-full px-2 py-1.5 text-sm hover:bg-secondary/50 rounded-md transition-colors text-muted-foreground hover:text-foreground">
            <ChevronRight className={cn(
              "h-3.5 w-3.5 transition-transform duration-200",
              onMyMacOpen && "rotate-90"
            )} />
            <FolderOpen className="h-4 w-4" />
            <span>Recovered Messages (Google)</span>
          </CollapsibleTrigger>
        </Collapsible>

        {/* Folders with Drag/Drop */}
        <div className="mt-4">
          <p className="px-2 mb-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Folders
          </p>
          <div className="space-y-0.5">
            {mainFolders.map((folder) => {
              const count = folderCounts[folder.id];
              const isActive = selectedFolder === folder.id;
              const isDragOver = dragOverTarget === folder.id;
              
              return (
                <button
                  key={folder.id}
                  onClick={() => onFolderChange(folder.id)}
                  onDragOver={onDragOver?.(folder.id)}
                  onDragLeave={onDragLeave}
                  onDrop={onDrop?.(folder.id)}
                  className={cn(
                    "w-full flex items-center justify-between px-2 py-1.5 rounded-md text-sm transition-all duration-200",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground",
                    isDragOver && "ring-2 ring-primary bg-primary/20 scale-[1.02] shadow-lg"
                  )}
                >
                  <span className="flex items-center gap-2">
                    <folder.icon className="h-4 w-4" />
                    {folder.label}
                  </span>
                  {count > 0 && (
                    <span className={cn(
                      "text-xs px-1.5 py-0.5 rounded-full transition-colors",
                      isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    )}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Connected Providers Section */}
        <div className="mt-4">
          <p className="px-2 mb-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Connected Accounts
          </p>
          <div className="space-y-0.5">
            {connectedProviders.map((provider) => (
              <div
                key={provider.id}
                className="flex items-center justify-between px-2 py-1.5 text-sm rounded-md text-muted-foreground"
              >
                <div className="flex items-center gap-2">
                  {getProviderIcon(provider)}
                  <span>{provider.name}</span>
                </div>
                {provider.unreadCount && provider.unreadCount > 0 && (
                  <span className="text-xs">{provider.unreadCount.toLocaleString()}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Email Accounts */}
        <Collapsible open={accountsOpen} onOpenChange={setAccountsOpen} className="mt-4">
          <CollapsibleTrigger className="flex items-center justify-between w-full px-2 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider hover:text-foreground">
            <span>Email Accounts</span>
            <ChevronRight className={cn(
              "h-3 w-3 transition-transform duration-200",
              accountsOpen && "rotate-90"
            )} />
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-0.5 mt-1 animate-accordion-down">
            <button
              onClick={() => onAccountChange(null)}
              className={cn(
                "w-full text-left px-2 py-1.5 text-sm rounded-md transition-all duration-200",
                selectedAccount === null
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
              )}
            >
              All Accounts
            </button>
            {accounts.map((account) => (
              <button
                key={account.id}
                onClick={() => onAccountChange(account)}
                className={cn(
                  "w-full text-left px-2 py-1.5 text-sm rounded-md transition-all duration-200 truncate",
                  selectedAccount?.id === account.id
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                )}
              >
                {account.name}
              </button>
            ))}
            <button
              onClick={onCreateAccount}
              className="w-full text-left px-2 py-1.5 text-sm rounded-md text-primary hover:bg-primary/10 flex items-center gap-1 transition-all duration-200"
            >
              <Plus className="h-3 w-3" />
              Add Account
            </button>
          </CollapsibleContent>
        </Collapsible>
      </div>

      {/* Drag hint with animation */}
      {dragOverTarget && (
        <div className="px-3 py-2 text-xs text-primary text-center border-t border-border bg-primary/5 animate-pulse">
          Drop to move email
        </div>
      )}
    </div>
  );
}
