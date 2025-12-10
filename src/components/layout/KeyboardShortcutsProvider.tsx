import { ReactNode } from 'react';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { KeyboardShortcutsModal } from './KeyboardShortcutsModal';

interface KeyboardShortcutsProviderProps {
  children: ReactNode;
}

export const KeyboardShortcutsProvider: React.FC<KeyboardShortcutsProviderProps> = ({
  children,
}) => {
  const { isHelpOpen, setIsHelpOpen, pendingKey } = useKeyboardShortcuts();

  return (
    <>
      {children}
      
      {/* Pending key indicator */}
      {pendingKey && (
        <div className="fixed bottom-4 right-4 z-50 animate-fade-in">
          <div className="bg-primary text-primary-foreground px-3 py-2 rounded-lg shadow-lg flex items-center gap-2">
            <kbd className="px-2 py-0.5 bg-primary-foreground/20 rounded text-sm font-mono">
              {pendingKey}
            </kbd>
            <span className="text-sm">waiting for next key...</span>
          </div>
        </div>
      )}
      
      <KeyboardShortcutsModal open={isHelpOpen} onOpenChange={setIsHelpOpen} />
    </>
  );
};
