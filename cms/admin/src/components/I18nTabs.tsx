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
    <div className="flex gap-1 bg-slate-100 p-1 rounded-lg w-fit">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          type="button"
          onClick={() => onChange(tab.key as Locale)}
          className={cn(
            'px-4 py-2 rounded-md text-sm font-medium transition-all',
            active === tab.key
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
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
