import { DragEvent } from 'react';
import { Mail, VipSender } from '@/types/mail';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SwipeableMailItem } from './SwipeableMailItem';

interface MailListProps {
  mails: Mail[];
  selectedMail: Mail | null;
  onSelectMail: (mail: Mail) => void;
  onToggleStar: (mailId: string) => void;
  onArchive?: (mailId: string) => void;
  onDelete?: (mailId: string) => void;
  onFlag?: (mailId: string) => void;
  onDragStart?: (mail: Mail) => (e: DragEvent) => void;
  onDragEnd?: (e: DragEvent) => void;
  draggedMail?: Mail | null;
  vipSenders?: VipSender[];
}

export function MailList({ 
  mails, 
  selectedMail, 
  onSelectMail, 
  onToggleStar,
  onArchive,
  onDelete,
  onFlag,
  onDragStart,
  onDragEnd,
  draggedMail,
  vipSenders = [],
}: MailListProps) {
  if (mails.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        <p>No messages in this folder</p>
      </div>
    );
  }

  const isVipSender = (email: string) => {
    return vipSenders.some(vip => vip.email.toLowerCase() === email.toLowerCase());
  };

  return (
    <ScrollArea className="flex-1">
      <div className="divide-y divide-border">
        {mails.map((mail, index) => (
          <SwipeableMailItem
            key={mail.id}
            mail={mail}
            isSelected={selectedMail?.id === mail.id}
            isVip={isVipSender(mail.sender.email)}
            onSelect={() => onSelectMail(mail)}
            onToggleStar={() => onToggleStar(mail.id)}
            onArchive={() => onArchive?.(mail.id)}
            onDelete={() => onDelete?.(mail.id)}
            onFlag={() => onFlag?.(mail.id)}
            onDragStart={onDragStart?.(mail)}
            onDragEnd={onDragEnd}
            isDragging={draggedMail?.id === mail.id}
            isDraggedOver={false}
            index={index}
          />
        ))}
      </div>
    </ScrollArea>
  );
}
