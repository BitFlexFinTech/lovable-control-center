import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTour } from '@/contexts/TourContext';
import { cn } from '@/lib/utils';

export function TourChat() {
  const { chatMessages, sendChatMessage, startCustomTour } = useTour();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendChatMessage(input.trim());
    setInput('');
  };

  const quickQuestions = [
    'How do I create a new site?',
    'How do I go live?',
    'How do I connect integrations?',
    'Where are my passwords?',
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chatMessages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex",
              message.role === 'user' ? 'justify-end' : 'justify-start'
            )}
          >
            <div
              className={cn(
                "max-w-[85%] rounded-xl px-4 py-3",
                message.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted'
              )}
            >
              <p className="text-sm whitespace-pre-line">{message.content}</p>
              
              {message.suggestedTour && (
                <Button
                  variant="secondary"
                  size="sm"
                  className="mt-3 gap-2 w-full"
                  onClick={() => startCustomTour(message.suggestedTour!)}
                >
                  <Play className="h-3.5 w-3.5" />
                  Start Guided Tour
                </Button>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Questions */}
      {chatMessages.length === 1 && (
        <div className="px-4 pb-2">
          <p className="text-xs text-muted-foreground mb-2">Quick questions:</p>
          <div className="flex flex-wrap gap-2">
            {quickQuestions.map((q) => (
              <button
                key={q}
                onClick={() => sendChatMessage(q)}
                className="text-xs px-3 py-1.5 rounded-full bg-muted hover:bg-muted/80 text-foreground transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-border">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything about Control Center..."
              className="w-full h-10 pl-10 pr-4 bg-muted border border-transparent rounded-lg text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
            />
          </div>
          <Button type="submit" size="icon" disabled={!input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}
