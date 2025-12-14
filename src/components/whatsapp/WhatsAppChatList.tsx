import { useState } from 'react';
import { Search, Filter, MoreVertical } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import type { WhatsAppChat } from './WhatsAppChatsPanel';

interface WhatsAppChatListProps {
  chats: WhatsAppChat[];
  selectedChatId?: string;
  onSelectChat: (chat: WhatsAppChat) => void;
}

export function WhatsAppChatList({ chats, selectedChatId, onSelectChat }: WhatsAppChatListProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredChats = chats.filter(chat => 
    chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.phone.includes(searchQuery)
  );

  return (
    <div className="h-full flex flex-col bg-card">
      {/* Header */}
      <div className="p-3 border-b border-border flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search chats..." 
              className="pl-9 h-9 bg-muted/50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Chat List */}
      <ScrollArea className="flex-1">
        <div className="divide-y divide-border">
          {filteredChats.map((chat) => (
            <button
              key={chat.id}
              onClick={() => onSelectChat(chat)}
              className={cn(
                "w-full p-3 flex items-center gap-3 hover:bg-muted/50 transition-colors text-left",
                selectedChatId === chat.id && "bg-muted"
              )}
            >
              <div className="relative">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={chat.avatar} />
                  <AvatarFallback className="bg-green-500/10 text-green-600 font-medium">
                    {chat.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                {chat.isOnline && (
                  <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-card" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-foreground truncate">{chat.name}</span>
                  <span className={cn(
                    "text-xs flex-shrink-0",
                    chat.unreadCount > 0 ? "text-green-500 font-medium" : "text-muted-foreground"
                  )}>
                    {chat.timestamp}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2 mt-0.5">
                  <p className="text-sm text-muted-foreground truncate">{chat.lastMessage}</p>
                  {chat.unreadCount > 0 && (
                    <Badge className="h-5 min-w-[20px] px-1.5 bg-green-500 hover:bg-green-500 text-white text-xs font-medium rounded-full">
                      {chat.unreadCount}
                    </Badge>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
