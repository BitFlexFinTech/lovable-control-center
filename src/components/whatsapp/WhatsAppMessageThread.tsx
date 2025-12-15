import { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Smile, Mic, MoreVertical, Phone, Video, Check, CheckCheck, Loader2, AlertCircle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface WhatsAppChat {
  id: string;
  name: string;
  phone: string;
  avatar?: string;
  isOnline?: boolean;
}

interface WhatsAppMessage {
  id: string;
  content: string;
  timestamp: string;
  direction: 'inbound' | 'outbound';
  status: 'sent' | 'delivered' | 'read' | 'failed';
}

interface WhatsAppMessageThreadProps {
  chat: WhatsAppChat;
  messages: WhatsAppMessage[];
  onSendMessage: (content: string) => void;
  isLoading?: boolean;
  isSending?: boolean;
}

export function WhatsAppMessageThread({ 
  chat, 
  messages, 
  onSendMessage,
  isLoading = false,
  isSending = false,
}: WhatsAppMessageThreadProps) {
  const [inputValue, setInputValue] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (inputValue.trim() && !isSending) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getStatusIcon = (status: WhatsAppMessage['status']) => {
    switch (status) {
      case 'sent':
        return <Check className="h-3.5 w-3.5 text-muted-foreground" />;
      case 'delivered':
        return <CheckCheck className="h-3.5 w-3.5 text-muted-foreground" />;
      case 'read':
        return <CheckCheck className="h-3.5 w-3.5 text-blue-500" />;
      case 'failed':
        return <AlertCircle className="h-3.5 w-3.5 text-destructive" />;
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#ece5dd] dark:bg-muted/30">
      {/* Chat Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-card border-b border-border flex-shrink-0">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={chat.avatar} />
            <AvatarFallback className="bg-green-500/10 text-green-600 font-medium">
              {chat.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium text-foreground">{chat.name}</h3>
            <p className="text-xs text-muted-foreground">
              {chat.isOnline ? 'Online' : chat.phone}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-full">
            <Video className="h-5 w-5 text-muted-foreground" />
          </Button>
          <Button variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-full">
            <Phone className="h-5 w-5 text-muted-foreground" />
          </Button>
          <Button variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-full">
            <MoreVertical className="h-5 w-5 text-muted-foreground" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        {isLoading ? (
          <div className="space-y-4 max-w-3xl mx-auto">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className={cn("flex", i % 2 === 0 ? "justify-start" : "justify-end")}>
                <Skeleton className={cn("h-12 rounded-lg", i % 2 === 0 ? "w-48" : "w-56")} />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2 max-w-3xl mx-auto">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
                No messages yet. Start the conversation!
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex",
                    message.direction === 'outbound' ? 'justify-end' : 'justify-start'
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[75%] rounded-lg px-3 py-2 shadow-sm",
                      message.direction === 'outbound'
                        ? 'bg-[#dcf8c6] dark:bg-green-900/50 rounded-tr-none'
                        : 'bg-card rounded-tl-none',
                      message.status === 'failed' && 'ring-1 ring-destructive'
                    )}
                  >
                    <p className="text-sm text-foreground whitespace-pre-wrap">{message.content}</p>
                    <div className={cn(
                      "flex items-center gap-1 mt-1",
                      message.direction === 'outbound' ? 'justify-end' : 'justify-start'
                    )}>
                      <span className="text-[10px] text-muted-foreground">{message.timestamp}</span>
                      {message.direction === 'outbound' && getStatusIcon(message.status)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </ScrollArea>

      {/* Message Input */}
      <div className="p-3 bg-card border-t border-border flex-shrink-0">
        <div className="flex items-center gap-2 max-w-3xl mx-auto">
          <Button variant="ghost" size="sm" className="h-10 w-10 p-0 rounded-full flex-shrink-0">
            <Smile className="h-6 w-6 text-muted-foreground" />
          </Button>
          <Button variant="ghost" size="sm" className="h-10 w-10 p-0 rounded-full flex-shrink-0">
            <Paperclip className="h-6 w-6 text-muted-foreground" />
          </Button>
          
          <Input
            placeholder="Type a message"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 h-10 bg-muted/50 border-0"
            disabled={isSending}
          />
          
          {inputValue.trim() ? (
            <Button 
              size="sm" 
              className="h-10 w-10 p-0 rounded-full bg-green-600 hover:bg-green-700"
              onClick={handleSend}
              disabled={isSending}
            >
              {isSending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          ) : (
            <Button variant="ghost" size="sm" className="h-10 w-10 p-0 rounded-full flex-shrink-0">
              <Mic className="h-6 w-6 text-muted-foreground" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
