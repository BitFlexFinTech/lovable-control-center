import { DragEvent } from 'react';
import { 
  Inbox, 
  Send, 
  FileText, 
  Archive, 
  Trash2, 
  AlertCircle,
  Plus,
  ChevronDown,
  RefreshCw
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
  // Drag and drop
  onDragOver?: (folderId: string) => (e: DragEvent) => void;
  onDragLeave?: () => void;
  onDrop?: (folderId: string) => (e: DragEvent) => void;
  dragOverTarget?: string | null;
}

const folders: { id: MailFolder; label: string; icon: typeof Inbox }[] = [
  { id: 'inbox', label: 'Inbox', icon: Inbox },
  { id: 'sent', label: 'Sent', icon: Send },
  { id: 'drafts', label: 'Drafts', icon: FileText },
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
  onDragOver,
  onDragLeave,
  onDrop,
  dragOverTarget,
}: MailSidebarProps) {
  const [accountsOpen, setAccountsOpen] = useState(true);

  return (
    <div className="w-56 flex-shrink-0 border-r border-border bg-sidebar flex flex-col h-full">
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

      {/* Accounts */}
      <Collapsible open={accountsOpen} onOpenChange={setAccountsOpen} className="px-2">
        <CollapsibleTrigger className="flex items-center justify-between w-full px-2 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider hover:text-foreground">
          Accounts
          <ChevronDown className={cn(
            "h-3 w-3 transition-transform",
            accountsOpen && "rotate-180"
          )} />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-0.5 pb-2">
          <button
            onClick={() => onAccountChange(null)}
            className={cn(
              "w-full text-left px-2 py-1.5 text-sm rounded-md transition-colors",
              selectedAccount === null
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            )}
          >
            All Accounts
          </button>
          {accounts.map((account) => (
            <button
              key={account.id}
              onClick={() => onAccountChange(account)}
              className={cn(
                "w-full text-left px-2 py-1.5 text-sm rounded-md transition-colors truncate",
                selectedAccount?.id === account.id
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              {account.name}
            </button>
          ))}
          <button
            onClick={onCreateAccount}
            className="w-full text-left px-2 py-1.5 text-sm rounded-md text-primary hover:bg-primary/10 flex items-center gap-1"
          >
            <Plus className="h-3 w-3" />
            Add Account
          </button>
        </CollapsibleContent>
      </Collapsible>

      {/* Folders */}
      <div className="flex-1 overflow-y-auto px-2 py-2">
        <p className="px-2 mb-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Folders
        </p>
        <div className="space-y-0.5">
          {folders.map((folder) => {
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
                  "w-full flex items-center justify-between px-2 py-1.5 rounded-md text-sm transition-all",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                  isDragOver && "ring-2 ring-primary ring-offset-2 ring-offset-background bg-primary/20 scale-[1.02]"
                )}
              >
                <span className="flex items-center gap-2">
                  <folder.icon className="h-4 w-4" />
                  {folder.label}
                </span>
                {count > 0 && (
                  <span className={cn(
                    "text-xs px-1.5 py-0.5 rounded-full",
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

      {/* Drag hint */}
      {dragOverTarget && (
        <div className="px-3 py-2 text-xs text-muted-foreground text-center border-t border-border animate-pulse">
          Drop to move email
        </div>
      )}
    </div>
  );
}
