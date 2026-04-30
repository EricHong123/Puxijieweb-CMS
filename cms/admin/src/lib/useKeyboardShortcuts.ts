import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface Shortcuts {
  onSave?: () => void;
}

export function useKeyboardShortcuts({ onSave }: Shortcuts = {}) {
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (!mod) return;

      // Cmd+S / Ctrl+S — save
      if (e.key === 's' && onSave) {
        e.preventDefault();
        onSave();
      }

      // Cmd+B / Ctrl+B — back
      if (e.key === 'b') {
        e.preventDefault();
        navigate(-1);
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onSave, navigate]);
}
