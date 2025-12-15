import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useSites } from '@/hooks/useSupabaseSites';
import { supabase } from '@/integrations/supabase/client';
import { Bot, Send, X, Sparkles, MessageSquare, Loader2, User } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export function AIChatPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedSiteId, setSelectedSiteId] = useState<string>('');
  const [mode, setMode] = useState<'chat' | 'modify'>('chat');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: sites = [] } = useSites();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await supabase.functions.invoke('ai-chat', {
        body: {
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content,
          })),
          siteId: selectedSiteId || null,
          mode,
        },
      });

      if (response.error) throw response.error;

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.data?.response || 'Sorry, I could not process your request.',
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('AI chat error:', error);
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'Sorry, there was an error processing your request. Please try again.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const selectedSite = sites.find(s => s.id === selectedSiteId);

  return (
    <>
      {/* Floating button */}
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50 bg-primary hover:bg-primary/90"
        size="icon"
      >
        <Bot className="h-6 w-6" />
      </Button>

      {/* Chat panel */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent className="w-[400px] sm:w-[450px] p-0 flex flex-col">
          <SheetHeader className="p-4 border-b">
            <div className="flex items-center justify-between">
              <SheetTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                AI Assistant
              </SheetTitle>
            </div>
            <SheetDescription>
              Ask questions about your sites or get help managing Control Center
            </SheetDescription>
          </SheetHeader>

          {/* Mode toggle */}
          <div className="p-3 border-b bg-muted/30">
            <div className="flex items-center gap-2 mb-3">
              <Button
                variant={mode === 'chat' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setMode('chat')}
                className="flex-1 gap-1.5"
              >
                <MessageSquare className="h-3.5 w-3.5" />
                Chat
                <Badge variant="secondary" className="ml-1 text-[10px] px-1">Free</Badge>
              </Button>
              <Button
                variant={mode === 'modify' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setMode('modify')}
                className="flex-1 gap-1.5"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Modify
              </Button>
            </div>

            {/* Site selector */}
            <Select value={selectedSiteId} onValueChange={setSelectedSiteId}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Select a site for context (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No site selected</SelectItem>
                {sites.map(site => (
                  <SelectItem key={site.id} value={site.id}>
                    <div className="flex items-center gap-2">
                      {site.app_color && (
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: site.app_color }}
                        />
                      )}
                      {site.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedSite && (
              <p className="text-xs text-muted-foreground mt-2">
                Context: {selectedSite.name} ({selectedSite.domain || selectedSite.lovable_url || 'No URL'})
              </p>
            )}
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            <div className="space-y-4">
              {messages.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Bot className="h-10 w-10 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">Start a conversation with your AI assistant</p>
                  <p className="text-xs mt-1">Ask about your sites, integrations, or get help with tasks</p>
                </div>
              )}

              {messages.map(message => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}
                >
                  {message.role === 'assistant' && (
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        <Bot className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={`rounded-lg px-3 py-2 max-w-[80%] text-sm ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    {message.content}
                  </div>
                  {message.role === 'user' && (
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarFallback>
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-3">
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-muted rounded-lg px-3 py-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="p-4 border-t bg-background">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ask me anything..."
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                disabled={isLoading}
              />
              <Button onClick={handleSend} disabled={!input.trim() || isLoading} size="icon">
                <Send className="h-4 w-4" />
              </Button>
            </div>
            {mode === 'modify' && (
              <p className="text-xs text-muted-foreground mt-2">
                Modify mode uses credits to make changes to your sites
              </p>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
