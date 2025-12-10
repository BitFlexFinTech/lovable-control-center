import { useState, useRef, DragEvent, TouchEvent } from 'react';
import { format, isToday, isYesterday } from 'date-fns';
import { Star, Paperclip, GripVertical, Flag, Archive, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Mail } from '@/types/mail';

interface SwipeableMailItemProps {
  mail: Mail;
  isSelected: boolean;
  isVip: boolean;
  onSelect: () => void;
  onToggleStar: () => void;
  onArchive: () => void;
  onDelete: () => void;
  onFlag: () => void;
  onDragStart?: (e: DragEvent) => void;
  onDragEnd?: (e: DragEvent) => void;
  isDragging?: boolean;
  isDraggedOver?: boolean;
  index: number;
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

export function SwipeableMailItem({
  mail,
  isSelected,
  isVip,
  onSelect,
  onToggleStar,
  onArchive,
  onDelete,
  onFlag,
  onDragStart,
  onDragEnd,
  isDragging,
  isDraggedOver,
  index,
}: SwipeableMailItemProps) {
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const isSwiping = useRef(false);

  const SWIPE_THRESHOLD = 80;
  const MAX_SWIPE = 120;

  const handleTouchStart = (e: TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    isSwiping.current = false;
  };

  const handleTouchMove = (e: TouchEvent) => {
    const deltaX = e.touches[0].clientX - touchStartX.current;
    const deltaY = e.touches[0].clientY - touchStartY.current;

    // Determine if horizontal swipe
    if (!isSwiping.current && Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10) {
      isSwiping.current = true;
    }

    if (isSwiping.current) {
      e.preventDefault();
      const clampedOffset = Math.max(-MAX_SWIPE, Math.min(MAX_SWIPE, deltaX));
      setSwipeOffset(clampedOffset);
    }
  };

  const handleTouchEnd = () => {
    if (swipeOffset > SWIPE_THRESHOLD) {
      // Swipe right - Archive
      onArchive();
    } else if (swipeOffset < -SWIPE_THRESHOLD) {
      // Swipe left - Delete
      onDelete();
    }
    setSwipeOffset(0);
    isSwiping.current = false;
  };

  const getSwipeBackground = () => {
    if (swipeOffset > 0) {
      return 'bg-primary'; // Archive
    }
    if (swipeOffset < 0) {
      return 'bg-destructive'; // Delete
    }
    return '';
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden",
        isDraggedOver && "bg-primary/5"
      )}
      style={{ animationDelay: `${index * 30}ms` }}
    >
      {/* Swipe action backgrounds */}
      <div className={cn(
        "absolute inset-0 flex items-center transition-opacity duration-200",
        swipeOffset > 0 ? "justify-start bg-primary" : "justify-end bg-destructive",
        Math.abs(swipeOffset) > 10 ? "opacity-100" : "opacity-0"
      )}>
        {swipeOffset > 0 ? (
          <div className="px-4 text-primary-foreground flex items-center gap-2">
            <Archive className="h-5 w-5" />
            <span className="text-sm font-medium">Archive</span>
          </div>
        ) : swipeOffset < 0 ? (
          <div className="px-4 text-destructive-foreground flex items-center gap-2">
            <span className="text-sm font-medium">Delete</span>
            <Trash2 className="h-5 w-5" />
          </div>
        ) : null}
      </div>

      {/* Mail content */}
      <div
        draggable={!!onDragStart}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onClick={onSelect}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          transform: `translateX(${swipeOffset}px)`,
        }}
        className={cn(
          "w-full text-left p-3 transition-all cursor-pointer bg-background",
          "group relative animate-fade-in",
          // Swipe transition
          swipeOffset === 0 && "transition-transform duration-300",
          // Base states
          isSelected && "bg-primary/10 hover:bg-primary/15",
          mail.status === 'unread' && !isSelected && "bg-primary/5",
          // Hover state
          !isDragging && swipeOffset === 0 && "hover:bg-secondary/50",
          // Drag states
          isDragging && [
            "opacity-40 scale-95 rotate-1",
            "shadow-xl ring-2 ring-primary/50",
            "bg-primary/10",
          ],
          // VIP highlight
          isVip && "border-l-2 border-l-yellow-500"
        )}
      >
        {/* Unread indicator bar */}
        {mail.status === 'unread' && (
          <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary animate-scale-in" />
        )}

        <div className="flex items-start gap-3">
          {/* Drag Handle */}
          {onDragStart && (
            <div className={cn(
              "transition-all duration-200 cursor-grab active:cursor-grabbing mt-1 hidden md:block",
              isHovered ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2"
            )}>
              <GripVertical className="h-4 w-4 text-muted-foreground" />
            </div>
          )}

          {/* Star */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleStar();
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
              <div className="flex items-center gap-2">
                {isVip && (
                  <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-yellow-500/20 text-yellow-600 rounded">
                    VIP
                  </span>
                )}
                <span className={cn(
                  "text-sm truncate transition-colors duration-200",
                  mail.status === 'unread' ? "font-semibold text-foreground" : "text-muted-foreground"
                )}>
                  {mail.sender.name}
                </span>
              </div>
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

          {/* Flag indicator */}
          {mail.isStarred && (
            <Flag className="h-3 w-3 text-orange-500 flex-shrink-0 mt-1 animate-fade-in" />
          )}
        </div>

        {/* Mobile swipe hint */}
        <div className={cn(
          "absolute inset-y-0 right-0 w-1 bg-destructive/50 md:hidden",
          "opacity-0 transition-opacity",
          isHovered && "opacity-30"
        )} />
        <div className={cn(
          "absolute inset-y-0 left-0 w-1 bg-primary/50 md:hidden",
          "opacity-0 transition-opacity",
          isHovered && "opacity-30"
        )} />
      </div>
    </div>
  );
}
