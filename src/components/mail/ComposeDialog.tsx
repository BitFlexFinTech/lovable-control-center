import { useState } from 'react';
import { X, Minus, Maximize2, Paperclip, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface ComposeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (email: {
    to: string;
    cc?: string;
    bcc?: string;
    subject: string;
    body: string;
  }) => void;
  initialTo?: string;
  initialSubject?: string;
  initialBody?: string;
  mode?: 'compose' | 'reply' | 'forward';
}

export function ComposeDialog({
  isOpen,
  onClose,
  onSend,
  initialTo = '',
  initialSubject = '',
  initialBody = '',
  mode = 'compose',
}: ComposeDialogProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);
  
  const [to, setTo] = useState(initialTo);
  const [cc, setCc] = useState('');
  const [bcc, setBcc] = useState('');
  const [subject, setSubject] = useState(initialSubject);
  const [body, setBody] = useState(initialBody);

  if (!isOpen) return null;

  const handleSend = () => {
    onSend({ to, cc: showCc ? cc : undefined, bcc: showBcc ? bcc : undefined, subject, body });
    onClose();
  };

  const title = mode === 'reply' ? 'Reply' : mode === 'forward' ? 'Forward' : 'New Message';

  return (
    <div
      className={cn(
        "fixed z-50 bg-card border border-border rounded-t-lg shadow-2xl flex flex-col transition-all duration-200",
        isMinimized ? "h-12" : isMaximized ? "inset-4" : "bottom-0 right-6 w-[560px] h-[480px]"
      )}
    >
      {/* Header */}
      <div 
        className="flex items-center justify-between px-4 py-2 bg-muted/50 rounded-t-lg cursor-pointer"
        onClick={() => isMinimized && setIsMinimized(false)}
      >
        <span className="text-sm font-medium">{title}</span>
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7"
            onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7"
            onClick={(e) => { e.stopPropagation(); setIsMaximized(!isMaximized); }}
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7"
            onClick={(e) => { e.stopPropagation(); onClose(); }}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Fields */}
          <div className="px-4 py-2 space-y-2 border-b border-border">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground w-12">To</span>
              <Input 
                value={to}
                onChange={(e) => setTo(e.target.value)}
                placeholder="Recipients"
                className="flex-1 h-8 border-0 bg-transparent focus-visible:ring-0 px-0"
              />
              <div className="flex gap-1 text-sm text-primary">
                {!showCc && (
                  <button onClick={() => setShowCc(true)} className="hover:underline">Cc</button>
                )}
                {!showBcc && (
                  <button onClick={() => setShowBcc(true)} className="hover:underline">Bcc</button>
                )}
              </div>
            </div>
            {showCc && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground w-12">Cc</span>
                <Input 
                  value={cc}
                  onChange={(e) => setCc(e.target.value)}
                  placeholder="Cc recipients"
                  className="flex-1 h-8 border-0 bg-transparent focus-visible:ring-0 px-0"
                />
              </div>
            )}
            {showBcc && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground w-12">Bcc</span>
                <Input 
                  value={bcc}
                  onChange={(e) => setBcc(e.target.value)}
                  placeholder="Bcc recipients"
                  className="flex-1 h-8 border-0 bg-transparent focus-visible:ring-0 px-0"
                />
              </div>
            )}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground w-12">Subject</span>
              <Input 
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Subject"
                className="flex-1 h-8 border-0 bg-transparent focus-visible:ring-0 px-0"
              />
            </div>
          </div>

          {/* Body */}
          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write your message..."
            className="flex-1 border-0 resize-none focus-visible:ring-0 rounded-none"
          />

          {/* Footer */}
          <div className="flex items-center justify-between px-4 py-2 border-t border-border">
            <div className="flex items-center gap-2">
              <Button onClick={handleSend} size="sm" className="gap-2">
                <Send className="h-4 w-4" />
                Send
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Paperclip className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
