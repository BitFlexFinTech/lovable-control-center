import { format, isToday, isYesterday } from 'date-fns';
import { Star, Paperclip, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Mail } from '@/types/mail';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DragEvent } from 'react';

interface MailListProps {
  mails: Mail[];
  selectedMail: Mail | null;
  onSelectMail: (mail: Mail) => void;
  onToggleStar: (mailId: string) => void;
  onDragStart?: (mail: Mail) => (e: DragEvent) => void;
  onDragEnd?: (e: DragEvent) => void;
  draggedMail?: Mail | null;
}

function formatMailDate(dateString: string) {
  const date = new Date(dateString);
  if (isToday(date)) {
    return format(date, 'h:mm a');
  }
  if (isYesterday(date)) {
    return 'Yesterday';
  }
  return format(date, 'MMM d');
}

export function MailList({ 
  mails, 
  selectedMail, 
  onSelectMail, 
  onToggleStar,
  onDragStart,
  onDragEnd,
  draggedMail
}: MailListProps) {
  if (mails.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        <p>No messages in this folder</p>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1">
      <div className="divide-y divide-border">
        {mails.map((mail) => (
          <div
            key={mail.id}
            draggable={!!onDragStart}
            onDragStart={onDragStart?.(mail)}
            onDragEnd={onDragEnd}
            onClick={() => onSelectMail(mail)}
            className={cn(
              "w-full text-left p-3 hover:bg-secondary/50 transition-all cursor-pointer",
              "group relative",
              selectedMail?.id === mail.id && "bg-primary/5 hover:bg-primary/10",
              mail.status === 'unread' && "bg-primary/5",
              draggedMail?.id === mail.id && "opacity-50 scale-[0.98]"
            )}
          >
            <div className="flex items-start gap-3">
              {/* Drag Handle */}
              {onDragStart && (
                <div className="opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing mt-1">
                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                </div>
              )}

              {/* Star */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleStar(mail.id);
                }}
                className={cn(
                  "mt-1 transition-colors flex-shrink-0",
                  mail.isStarred ? "text-yellow-500" : "text-muted-foreground hover:text-yellow-500"
                )}
              >
                <Star className={cn("h-4 w-4", mail.isStarred && "fill-current")} />
              </button>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className={cn(
                    "text-sm truncate",
                    mail.status === 'unread' ? "font-semibold text-foreground" : "text-muted-foreground"
                  )}>
                    {mail.sender.name}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground flex-shrink-0">
                    {mail.hasAttachments && <Paperclip className="h-3 w-3" />}
                    <span>{formatMailDate(mail.timestamp)}</span>
                  </div>
                </div>
                <p className={cn(
                  "text-sm truncate mb-1",
                  mail.status === 'unread' ? "font-medium text-foreground" : "text-foreground"
                )}>
                  {mail.subject}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {mail.bodyPreview}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
