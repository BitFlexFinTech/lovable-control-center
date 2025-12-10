import { 
  Inbox, 
  Send, 
  FileText, 
  Archive, 
  Trash2, 
  AlertCircle,
  Plus,
  ChevronDown
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
}: MailSidebarProps) {
  const [accountsOpen, setAccountsOpen] = useState(true);

  return (
    <div className="w-56 flex-shrink-0 border-r border-border bg-sidebar flex flex-col h-full">
      {/* Compose Button */}
      <div className="p-3">
        <Button 
          onClick={onCompose}
          className="w-full gap-2"
          size="sm"
        >
          <Plus className="h-4 w-4" />
          Compose
        </Button>
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
            
            return (
              <button
                key={folder.id}
                onClick={() => onFolderChange(folder.id)}
                className={cn(
                  "w-full flex items-center justify-between px-2 py-1.5 rounded-md text-sm transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
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
    </div>
  );
}
