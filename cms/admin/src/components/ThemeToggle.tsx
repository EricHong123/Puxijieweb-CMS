import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

function getStoredTheme(): 'light' | 'dark' {
  try {
    const stored = localStorage.getItem('theme');
    if (stored === 'dark' || stored === 'light') return stored;
  } catch {}
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(theme: 'light' | 'dark') {
  document.documentElement.setAttribute('data-theme', theme);
  try { localStorage.setItem('theme', theme); } catch {}
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const current = getStoredTheme();
    setTheme(current);
    applyTheme(current);
  }, []);

  const toggle = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    applyTheme(next);
  };

  return (
    <button
      onClick={toggle}
      className="p-2 rounded-lg text-warm-charcoal-muted hover:text-warm-charcoal hover:bg-[hsl(var(--accent))] transition-all duration-paper"
      title={theme === 'light' ? '切换暗色模式' : '切换亮色模式'}
    >
      {theme === 'light' ? <Moon className="h-4 w-4" strokeWidth={1.5} /> : <Sun className="h-4 w-4" strokeWidth={1.5} />}
    </button>
  );
}
