import { format, isToday, isYesterday } from 'date-fns';
import { Star, Paperclip, GripVertical, Flag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Mail } from '@/types/mail';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DragEvent, useState } from 'react';

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
  const [hoveredMail, setHoveredMail] = useState<string | null>(null);

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
        {mails.map((mail, index) => {
          const isDragging = draggedMail?.id === mail.id;
          const isHovered = hoveredMail === mail.id;
          
          return (
            <div
              key={mail.id}
              draggable={!!onDragStart}
              onDragStart={onDragStart?.(mail)}
              onDragEnd={onDragEnd}
              onClick={() => onSelectMail(mail)}
              onMouseEnter={() => setHoveredMail(mail.id)}
              onMouseLeave={() => setHoveredMail(null)}
              style={{
                animationDelay: `${index * 30}ms`,
              }}
              className={cn(
                "w-full text-left p-3 transition-all duration-200 cursor-pointer",
                "group relative animate-fade-in",
                // Base states
                selectedMail?.id === mail.id && "bg-primary/10 hover:bg-primary/15",
                mail.status === 'unread' && selectedMail?.id !== mail.id && "bg-primary/5",
                // Hover state
                !isDragging && "hover:bg-secondary/50",
                // Drag states with enhanced animations
                isDragging && [
                  "opacity-40 scale-95 rotate-1",
                  "shadow-xl ring-2 ring-primary/50",
                  "bg-primary/10",
                  "transition-all duration-300 ease-out"
                ],
                // Nearby items animation when dragging
                draggedMail && !isDragging && "hover:translate-x-1"
              )}
            >
              {/* Unread indicator bar */}
              {mail.status === 'unread' && (
                <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary animate-scale-in" />
              )}

              <div className="flex items-start gap-3">
                {/* Drag Handle with animation */}
                {onDragStart && (
                  <div className={cn(
                    "transition-all duration-200 cursor-grab active:cursor-grabbing mt-1",
                    isHovered ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2"
                  )}>
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}

                {/* Star with bounce animation */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleStar(mail.id);
                  }}
                  className={cn(
                    "mt-1 transition-all duration-200 flex-shrink-0",
                    "hover:scale-125 active:scale-90",
                    mail.isStarred ? "text-yellow-500" : "text-muted-foreground hover:text-yellow-500"
                  )}
                >
                  <Star className={cn(
                    "h-4 w-4 transition-transform duration-200",
                    mail.isStarred && "fill-current animate-scale-in"
                  )} />
                </button>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className={cn(
                      "text-sm truncate transition-colors duration-200",
                      mail.status === 'unread' ? "font-semibold text-foreground" : "text-muted-foreground"
                    )}>
                      {mail.sender.name}
                    </span>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground flex-shrink-0">
                      {mail.hasAttachments && (
                        <Paperclip className="h-3 w-3 animate-fade-in" />
                      )}
                      <span>{formatMailDate(mail.timestamp)}</span>
                    </div>
                  </div>
                  <p className={cn(
                    "text-sm truncate mb-1 transition-colors duration-200",
                    mail.status === 'unread' ? "font-medium text-foreground" : "text-foreground"
                  )}>
                    {mail.subject}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {mail.bodyPreview}
                  </p>
                </div>

                {/* Flag indicator (for flagged emails) */}
                {mail.isStarred && (
                  <Flag className="h-3 w-3 text-orange-500 flex-shrink-0 mt-1 animate-fade-in" />
                )}
              </div>

              {/* Swipe hint overlay - appears on hover */}
              <div className={cn(
                "absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-destructive/20 to-transparent",
                "opacity-0 transition-opacity duration-200",
                "flex items-center justify-end pr-3",
                isHovered && !isDragging && "opacity-0 group-hover:opacity-0"
              )}>
                {/* Hidden swipe actions - could be implemented later */}
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}
