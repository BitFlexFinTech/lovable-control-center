import { useState } from 'react';
import { Star, X, Plus, Search, User } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

export interface VipSender {
  email: string;
  name: string;
  addedAt: string;
}

interface VipManagerProps {
  isOpen: boolean;
  onClose: () => void;
  vipSenders: VipSender[];
  onAddVip: (email: string, name: string) => void;
  onRemoveVip: (email: string) => void;
  recentSenders: { email: string; name: string }[];
}

export function VipManager({
  isOpen,
  onClose,
  vipSenders,
  onAddVip,
  onRemoveVip,
  recentSenders,
}: VipManagerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');

  const filteredRecentSenders = recentSenders.filter(
    (sender) =>
      !vipSenders.some((vip) => vip.email === sender.email) &&
      (sender.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sender.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleAddManual = () => {
    if (newEmail) {
      onAddVip(newEmail, newName || newEmail.split('@')[0]);
      setNewEmail('');
      setNewName('');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
            VIP Senders
          </DialogTitle>
          <DialogDescription>
            Manage your VIP contacts. Emails from VIP senders will be highlighted.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Current VIPs */}
          {vipSenders.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Current VIPs</p>
              <div className="space-y-1">
                {vipSenders.map((vip) => (
                  <div
                    key={vip.email}
                    className="flex items-center justify-between p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20"
                  >
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      <div>
                        <p className="text-sm font-medium">{vip.name}</p>
                        <p className="text-xs text-muted-foreground">{vip.email}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onRemoveVip(vip.email)}
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add VIP manually */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Add VIP manually</p>
            <div className="flex gap-2">
              <Input
                placeholder="Email address"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="flex-1"
              />
              <Input
                placeholder="Name (optional)"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-32"
              />
              <Button onClick={handleAddManual} disabled={!newEmail} size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Recent senders */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Add from recent senders</p>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search recent senders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <ScrollArea className="h-48">
              <div className="space-y-1">
                {filteredRecentSenders.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No matching senders found
                  </p>
                ) : (
                  filteredRecentSenders.map((sender) => (
                    <button
                      key={sender.email}
                      onClick={() => onAddVip(sender.email, sender.name)}
                      className={cn(
                        "w-full flex items-center gap-3 p-2 rounded-lg transition-colors",
                        "hover:bg-secondary text-left"
                      )}
                    >
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                        <User className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{sender.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{sender.email}</p>
                      </div>
                      <Plus className="h-4 w-4 text-muted-foreground" />
                    </button>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
