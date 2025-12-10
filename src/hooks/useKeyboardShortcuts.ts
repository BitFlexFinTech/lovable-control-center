import { useEffect, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface ShortcutConfig {
  key: string;
  ctrl?: boolean;
  meta?: boolean;
  shift?: boolean;
  alt?: boolean;
  action: () => void;
  description: string;
  category: string;
}

export const useKeyboardShortcuts = () => {
  const navigate = useNavigate();
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [pendingKey, setPendingKey] = useState<string | null>(null);

  const shortcuts: ShortcutConfig[] = [
    // Navigation shortcuts (g + key)
    { key: 'h', action: () => navigate('/'), description: 'Go to Home', category: 'Navigation' },
    { key: 's', action: () => navigate('/sites'), description: 'Go to Sites', category: 'Navigation' },
    { key: 'm', action: () => navigate('/mail'), description: 'Go to Mail', category: 'Navigation' },
    { key: 't', action: () => navigate('/tenants'), description: 'Go to Tenants', category: 'Navigation' },
    { key: 'u', action: () => navigate('/users'), description: 'Go to Users', category: 'Navigation' },
    { key: 'i', action: () => navigate('/integrations'), description: 'Go to Integrations', category: 'Navigation' },
    { key: 'p', action: () => navigate('/passwords'), description: 'Go to Passwords', category: 'Navigation' },
    { key: 'e', action: () => navigate('/settings'), description: 'Go to Settings', category: 'Navigation' },
  ];

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Ignore if typing in an input
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
      return;
    }

    // Help modal toggle
    if (event.key === '?' && event.shiftKey) {
      event.preventDefault();
      setIsHelpOpen(prev => !prev);
      return;
    }

    // Handle 'g' prefix for navigation
    if (event.key === 'g' && !event.ctrlKey && !event.metaKey) {
      event.preventDefault();
      setPendingKey('g');
      setTimeout(() => setPendingKey(null), 1500);
      return;
    }

    // If we have a pending 'g', check for navigation shortcut
    if (pendingKey === 'g') {
      const shortcut = shortcuts.find(s => s.key === event.key.toLowerCase());
      if (shortcut) {
        event.preventDefault();
        shortcut.action();
        setPendingKey(null);
      }
    }

    // Escape closes help modal
    if (event.key === 'Escape') {
      setIsHelpOpen(false);
      setPendingKey(null);
    }
  }, [pendingKey, navigate, shortcuts]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return {
    isHelpOpen,
    setIsHelpOpen,
    shortcuts,
    pendingKey,
  };
};

export const shortcutsList = [
  { keys: ['g', 'h'], description: 'Go to Home', category: 'Navigation' },
  { keys: ['g', 's'], description: 'Go to Sites', category: 'Navigation' },
  { keys: ['g', 'm'], description: 'Go to Mail', category: 'Navigation' },
  { keys: ['g', 't'], description: 'Go to Tenants', category: 'Navigation' },
  { keys: ['g', 'u'], description: 'Go to Users', category: 'Navigation' },
  { keys: ['g', 'i'], description: 'Go to Integrations', category: 'Navigation' },
  { keys: ['g', 'p'], description: 'Go to Passwords', category: 'Navigation' },
  { keys: ['g', 'e'], description: 'Go to Settings', category: 'Navigation' },
  { keys: ['⌘', 'k'], description: 'Open Command Palette', category: 'Actions' },
  { keys: ['?'], description: 'Show Keyboard Shortcuts', category: 'Help' },
  { keys: ['Esc'], description: 'Close Modal / Cancel', category: 'General' },
];
