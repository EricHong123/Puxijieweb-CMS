import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/api/client';
import { Search } from 'lucide-react';

interface Result {
  id: string;
  type: 'product' | 'news' | 'page';
  title?: string;
  name?: string;
  slug: string;
  category?: string;
  locale?: string;
}

const TYPE_ICONS: Record<string, string> = { product: 'P', news: 'N', page: 'P ' };
const TYPE_LABELS: Record<string, string> = { product: '产品', news: '新闻', page: '页面' };
const TYPE_LINKS: Record<string, (r: Result) => string> = {
  product: (r) => `/products/${r.id}`,
  news: (r) => `/news/${r.id}`,
  page: (r) => `/pages/${r.id}`,
};

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{ products: Result[]; news: Result[]; pages: Result[] }>({ products: [], news: [], pages: [] });
  const [selectedIdx, setSelectedIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const allResults = [...results.products, ...results.news, ...results.pages];

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  useEffect(() => {
    if (!open) { setQuery(''); setResults({ products: [], news: [], pages: [] }); setSelectedIdx(0); return; }
    inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (query.length < 1) { setResults({ products: [], news: [], pages: [] }); return; }
    const timer = setTimeout(async () => {
      try {
        const { data } = await api.get('/search', { params: { q: query } });
        if (data.success) setResults(data.data);
      } catch {}
    }, 200);
    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (r: Result) => {
    const link = TYPE_LINKS[r.type]?.(r);
    if (link) { navigate(link); setOpen(false); }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIdx((i) => Math.min(i + 1, allResults.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIdx((i) => Math.max(i - 1, 0)); }
    else if (e.key === 'Enter' && allResults[selectedIdx]) { handleSelect(allResults[selectedIdx]); }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-[15vh]" onClick={() => setOpen(false)}>
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-lg bg-white rounded-xl shadow-elevation-3 border border-[#EBEBEB] overflow-hidden animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[#EBEBEB]">
          <Search className="h-4 w-4 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelectedIdx(0); }}
            onKeyDown={handleKeyDown}
            placeholder="搜索产品、新闻、页面..."
            className="flex-1 text-sm outline-none bg-transparent placeholder:text-slate-400"
          />
          <kbd className="text-[10px] text-slate-400 bg-[#F5F5F5] px-1.5 py-0.5 rounded font-mono">ESC</kbd>
        </div>

        <div className="max-h-80 overflow-y-auto py-2">
          {allResults.length === 0 && query.length > 0 && (
            <div className="px-4 py-6 text-center text-sm text-slate-400">无结果</div>
          )}
          {allResults.map((r, idx) => (
            <button
              key={`${r.type}-${r.id}`}
              onClick={() => handleSelect(r)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${idx === selectedIdx ? 'bg-primary/5' : 'hover:bg-[#FAFAFA]'}`}
            >
              <span className="shrink-0 w-8 h-8 rounded-lg bg-[#F5F5F5] flex items-center justify-center text-xs font-medium text-slate-500">
                {TYPE_ICONS[r.type]}
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-slate-800 truncate">{r.name || r.title || r.slug}</div>
                <div className="text-xs text-slate-400">{r.slug}</div>
              </div>
              <span className="shrink-0 text-[10px] text-slate-400 bg-[#F5F5F5] px-1.5 py-0.5 rounded">{TYPE_LABELS[r.type]}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
