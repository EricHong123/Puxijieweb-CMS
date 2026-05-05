import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '@/api/client';
import { Plus, FileText, Edit3, Trash2, Eye, EyeOff } from 'lucide-react';
import { SkeletonGrid } from '@/components/SkeletonCard';

interface Page {
  id: string;
  slug: string;
  page_type: string;
  is_published: boolean;
  page_translations: Array<{ title: string; locale: string }>;
}

const pageTypeLabels: Record<string, string> = {
  home: '首页', standard: '标准页', contact: '联系我们',
};

const pageTypeIcons: Record<string, string> = {
  home: '🏠', standard: '📄', contact: '✉️',
};

export default function PagesPage() {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPages = async () => {
    const { data } = await api.get('/pages', { params: { locale: 'en' } });
    if (data.success) setPages(data.data);
    setLoading(false);
  };

  useEffect(() => { fetchPages(); }, []);

  const togglePublish = async (id: string, current: boolean) => {
    await api.patch(`/pages/${id}/publish`, { is_published: !current });
    setPages((prev) => prev.map((p) => p.id === id ? { ...p, is_published: !current } : p));
  };

  const handleDelete = async (id: string, slug: string) => {
    if (!confirm(`确定删除页面 "/${slug}"？`)) return;
    await api.delete(`/pages/${id}`);
    setPages((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-warm-charcoal">页面管理</h1>
          <p className="text-sm text-muted-foreground mt-1">{pages.length} 个页面</p>
        </div>
        <Link
          to="/pages/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          新建页面
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <SkeletonGrid count={6} />
        ) : pages.length === 0 ? (
          <div className="col-span-full py-12 text-center text-muted-foreground">
            暂无页面，点击"新建页面"开始
          </div>
        ) : (
          pages.map((p) => (
            <div key={p.id} className="bg-[hsl(var(--card))] rounded-xl border hover:shadow-md transition-shadow group/card">
              <Link to={`/pages/${p.id}`} className="block p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="text-2xl">{pageTypeIcons[p.page_type] || '📄'}</div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    p.is_published ? 'bg-pastel-green/8 text-emerald-700' : 'bg-pastel-amber/8 text-amber-700'
                  }`}>
                    {p.is_published ? '已发布' : '草稿'}
                  </span>
                </div>
                <h3 className="font-semibold text-warm-charcoal mb-1">
                  {p.page_translations?.[0]?.title || p.slug}
                </h3>
                <p className="text-xs text-muted-foreground mb-2 font-mono">/{p.slug}</p>
                <span className="text-xs bg-[hsl(var(--secondary))] text-warm-charcoal-muted px-2 py-0.5 rounded">
                  {pageTypeLabels[p.page_type] || p.page_type}
                </span>
              </Link>
              <div className="border-t px-3 py-2 flex items-center gap-1 opacity-0 group-hover/card:opacity-100 transition-opacity">
                <button
                  onClick={() => togglePublish(p.id, p.is_published)}
                  className="p-1.5 text-warm-charcoal-muted/60 hover:text-warm-charcoal rounded hover:bg-[hsl(var(--secondary))]"
                  title={p.is_published ? '下架' : '发布'}
                >
                  {p.is_published ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
                <Link
                  to={`/pages/${p.id}`}
                  className="p-1.5 text-warm-charcoal-muted/60 hover:text-primary rounded hover:bg-primary/5"
                  title="编辑"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                </Link>
                <button
                  onClick={() => handleDelete(p.id, p.slug)}
                  className="p-1.5 text-warm-charcoal-muted/60 hover:text-red-500 rounded hover:bg-pastel-rose/8 ml-auto"
                  title="删除"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
