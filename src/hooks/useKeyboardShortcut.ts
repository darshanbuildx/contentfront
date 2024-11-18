import { useEffect } from 'react';

interface ShortcutConfig {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  handler: () => void;
}

export function useKeyboardShortcut(shortcuts: ShortcutConfig[]) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      shortcuts.forEach(({ key, ctrlKey, metaKey, handler }) => {
        if (
          event.key.toLowerCase() === key.toLowerCase() &&
          (!ctrlKey || event.ctrlKey) &&
          (!metaKey || event.metaKey)
        ) {
          event.preventDefault();
          handler();
        }
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
}