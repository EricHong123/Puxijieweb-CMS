import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '@/api/client';
import { Plus, Edit3, Trash2, Eye, EyeOff, Globe, Tag } from 'lucide-react';
import { SkeletonList } from '@/components/SkeletonCard';

interface Article {
  id: string;
  slug: string;
  locale: string;
  title: string;
  description: string;
  date: string;
  is_published: boolean;
}

export default function NewsPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [locale, setLocale] = useState('en');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState<{ id: string; slug: string; name: string }[]>([]);

  const fetchNews = async () => {
    setLoading(true);
    const params: Record<string, string> = { locale, limit: '50' };
    if (category) params.category = category;
    const { data } = await api.get('/news', { params });
    if (data.success) setArticles(data.data.items);
    setLoading(false);
  };

  useEffect(() => {
    api.get('/news-categories', { params: { locale } }).then(({ data }) => {
      if (data.success) setCategories(data.data);
    });
  }, [locale]);

  useEffect(() => { fetchNews(); }, [locale, category]);

  const togglePublish = async (id: string, current: boolean) => {
    await api.patch(`/news/${id}/publish`, { is_published: !current });
    setArticles((prev) => prev.map((a) => a.id === id ? { ...a, is_published: !current } : a));
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`确定删除 "${title}"？`)) return;
    await api.delete(`/news/${id}`);
    setArticles((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-warm-charcoal">新闻管理</h1>
          <p className="text-sm text-muted-foreground mt-1">{articles.length} 篇文章</p>
        </div>
        <Link
          to="/news/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          新建文章
        </Link>
      </div>

      <div className="flex gap-1 bg-[hsl(var(--secondary))] p-1 rounded-lg w-fit">
        {[{ key: 'en', label: 'English' }, { key: 'fr', label: 'Français' }, { key: 'vi', label: 'Tiếng Việt' }].map((l) => (
          <button
            key={l.key}
            onClick={() => setLocale(l.key)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              locale === l.key ? 'bg-[hsl(var(--card))] text-warm-charcoal shadow-sm' : 'text-warm-charcoal-muted hover:text-warm-charcoal'
            }`}
          >
            {l.label}
          </button>
        ))}
      </div>

      {categories.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <Tag className="h-3.5 w-3.5 text-warm-charcoal-muted" />
          <button
            onClick={() => setCategory('')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
              !category
                ? 'bg-pastel-blue/10 text-pastel-blue border-pastel-blue/30'
                : 'bg-[hsl(var(--card))] text-warm-charcoal-muted border-[hsl(var(--border))] hover:border-pastel-blue/30'
            }`}
          >
            全部
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategory(category === cat.slug ? '' : cat.slug)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                category === cat.slug
                  ? 'bg-pastel-blue/10 text-pastel-blue border-pastel-blue/30'
                  : 'bg-[hsl(var(--card))] text-warm-charcoal-muted border-[hsl(var(--border))] hover:border-pastel-blue/30'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}

      <div className="space-y-3">
        {loading ? (
          <SkeletonList count={4} />
        ) : articles.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            暂无{locale.toUpperCase()}文章，点击"新建文章"添加
          </div>
        ) : (
          articles.map((a) => (
            <div key={a.id} className="bg-[hsl(var(--card))] rounded-xl border p-5 hover:shadow-sm transition-shadow group flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <Link to={`/news/${a.id}`} className="font-semibold text-warm-charcoal hover:text-primary transition-colors">
                  {a.title}
                </Link>
                {a.description && (
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{a.description}</p>
                )}
                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Globe className="h-3 w-3" />{a.locale.toUpperCase()}
                  </span>
                  {a.date && <span>{a.date}</span>}
                </div>
              </div>

              <button
                onClick={() => togglePublish(a.id, a.is_published)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium shrink-0 ${
                  a.is_published ? 'bg-pastel-green/8 text-emerald-700' : 'bg-pastel-amber/8 text-amber-700'
                }`}
              >
                {a.is_published ? '已发布' : '草稿'}
              </button>

              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                <Link to={`/news/${a.id}`} className="p-2 text-warm-charcoal-muted/60 hover:text-primary rounded-lg hover:bg-[hsl(var(--secondary))]">
                  <Edit3 className="h-4 w-4" />
                </Link>
                <button onClick={() => handleDelete(a.id, a.title)} className="p-2 text-warm-charcoal-muted/60 hover:text-red-500 rounded-lg hover:bg-pastel-rose/8">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
