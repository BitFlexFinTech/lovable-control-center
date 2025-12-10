import { useState } from 'react';
import { ChevronDown, ChevronRight, Reply, Forward } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useTimeAgo } from '@/hooks/useTimeAgo';
import { Mail } from '@/types/mail';

interface EmailThreadProps {
  emails: Mail[];
  onReply?: (email: Mail) => void;
  onForward?: (email: Mail) => void;
}

interface ThreadMessageProps {
  email: Mail;
  isFirst: boolean;
  isLast: boolean;
  defaultExpanded: boolean;
  onReply?: (email: Mail) => void;
  onForward?: (email: Mail) => void;
}

const ThreadMessage = ({ 
  email, 
  isFirst, 
  isLast, 
  defaultExpanded,
  onReply,
  onForward 
}: ThreadMessageProps) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const timeAgo = useTimeAgo(email.timestamp);
  const isRead = email.status === 'read';

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className={cn(
      "border-l-2 pl-4 ml-4",
      isFirst && "border-t-0 pt-0 mt-0 ml-0 pl-0 border-l-0",
      isLast && "border-b-0",
      !isRead && "border-l-primary"
    )}>
      <div 
        className={cn(
          "flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors",
          isExpanded ? "bg-muted/50" : "hover:bg-muted/30"
        )}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarFallback className="text-xs bg-primary/10 text-primary">
            {getInitials(email.sender.name)}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className={cn(
                "font-medium truncate",
                !isRead && "text-foreground",
                isRead && "text-muted-foreground"
              )}>
                {email.sender.name}
              </span>
              {!isRead && (
                <Badge variant="default" className="h-4 px-1.5 text-[10px]">New</Badge>
              )}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-xs text-muted-foreground">{timeAgo}</span>
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          </div>

          {!isExpanded && (
            <p className="text-sm text-muted-foreground truncate mt-0.5">
              {email.bodyPreview}
            </p>
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="mt-2 ml-11 animate-fade-in">
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <p className="text-sm whitespace-pre-wrap">{email.bodyPreview}</p>
            {email.body && (
              <div className="mt-4 text-sm text-foreground" dangerouslySetInnerHTML={{ __html: email.body }} />
            )}
          </div>

          {email.attachments && email.attachments.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {email.attachments.map((attachment, idx) => (
                <Badge key={idx} variant="secondary" className="gap-1.5">
                  📎 {attachment.name}
                </Badge>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2 mt-4 pt-3 border-t">
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-1.5"
              onClick={(e) => {
                e.stopPropagation();
                onReply?.(email);
              }}
            >
              <Reply className="h-3.5 w-3.5" />
              Reply
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="gap-1.5"
              onClick={(e) => {
                e.stopPropagation();
                onForward?.(email);
              }}
            >
              <Forward className="h-3.5 w-3.5" />
              Forward
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export const EmailThread = ({ emails, onReply, onForward }: EmailThreadProps) => {
  if (emails.length === 0) return null;

  // Sort by timestamp ascending (oldest first)
  const sortedEmails = [...emails].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-4">
        <h3 className="font-semibold">{emails[0].subject}</h3>
        <Badge variant="secondary" className="text-xs">
          {emails.length} message{emails.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      <div className="space-y-1">
        {sortedEmails.map((email, index) => (
          <ThreadMessage
            key={email.id}
            email={email}
            isFirst={index === 0}
            isLast={index === sortedEmails.length - 1}
            defaultExpanded={index === sortedEmails.length - 1}
            onReply={onReply}
            onForward={onForward}
          />
        ))}
      </div>
    </div>
  );
};
