import { cn } from '@/lib/utils';

const LOCALES = [
  { key: 'en', label: 'English', flag: 'EN' },
  { key: 'fr', label: 'Français', flag: 'FR' },
  { key: 'vi', label: 'Tiếng Việt', flag: 'VI' },
] as const;

type Locale = (typeof LOCALES)[number]['key'];

interface I18nTabsProps {
  active: Locale;
  onChange: (locale: Locale) => void;
  items?: Array<{ key: string; label: string; flag: string }>;
}

export default function I18nTabs({ active, onChange, items }: I18nTabsProps) {
  const tabs = items || LOCALES;

  return (
    <div className="flex gap-1 bg-[hsl(var(--secondary))] p-1 rounded-lg w-fit border border-[hsl(var(--border))] shadow-paper-xs">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          type="button"
          onClick={() => onChange(tab.key as Locale)}
          className={cn(
            'px-4 py-2 rounded-md text-sm font-medium transition-all duration-paper',
            active === tab.key
              ? 'bg-[hsl(var(--card))] text-warm-charcoal shadow-paper-xs'
              : 'text-warm-charcoal-muted hover:text-warm-charcoal'
          )}
        >
          <span className="hidden sm:inline">{tab.label}</span>
          <span className="sm:hidden">{tab.flag}</span>
        </button>
      ))}
    </div>
  );
}

export { LOCALES };
export type { Locale };
