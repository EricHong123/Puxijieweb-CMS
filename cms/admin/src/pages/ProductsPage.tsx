import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '@/api/client';
import { Plus, Edit3, Trash2, Eye, EyeOff, Search, Filter, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Product {
  id: string;
  slug: string;
  category: string;
  is_published: boolean;
  sort_order: number;
  product_translations: Array<{ name: string; locale: string }>;
  product_images: Array<{ media_id: string; media?: { variants?: { publicUrl?: string } } }>;
}

const categoryLabels: Record<string, string> = {
  waterproof_bt: '防水蓝牙音箱',
  normal_bt: '普通蓝牙音箱',
  specialty: '特色音箱',
  earbuds: '蓝牙耳机',
};

const categoryColors: Record<string, string> = {
  waterproof_bt: 'bg-blue-50 text-blue-700',
  normal_bt: 'bg-slate-100 text-slate-700',
  specialty: 'bg-amber-50 text-amber-700',
  earbuds: 'bg-purple-50 text-purple-700',
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkActioning, setBulkActioning] = useState(false);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const params: Record<string, string> = { locale: 'en', limit: '100' };
    if (category) params.category = category;
    try {
      const { data } = await api.get('/products', { params });
      if (data.success) setProducts(data.data.items);
    } catch {}
    setLoading(false);
  }, [category]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const togglePublish = async (id: string, current: boolean) => {
    await api.patch(`/products/${id}/publish`, { is_published: !current });
    setProducts((prev) => prev.map((p) => p.id === id ? { ...p, is_published: !current } : p));
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`确定删除产品 "${name}"？此操作不可撤销。`)) return;
    await api.delete(`/products/${id}`);
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((p) => p.id)));
    }
  };

  const bulkPublish = async (publish: boolean) => {
    setBulkActioning(true);
    const ids = Array.from(selected);
    for (const id of ids) {
      await api.patch(`/products/${id}/publish`, { is_published: publish }).catch(() => {});
    }
    setSelected(new Set());
    setBulkActioning(false);
    fetchProducts();
  };

  const filtered = products.filter((p) => {
    const name = p.product_translations?.[0]?.name || '';
    const matchesSearch = name.toLowerCase().includes(search.toLowerCase()) ||
      p.slug.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">产品管理</h1>
          <p className="text-sm text-muted-foreground mt-1">{products.length} 个产品</p>
        </div>
        <Link
          to="/products/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 shadow-sm"
        >
          <Plus className="h-4 w-4" />
          添加产品
        </Link>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索产品名或 slug..."
            className="w-full pl-9 pr-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </div>

        <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
          {Object.entries({ '': '全部', ...categoryLabels }).map(([k, v]) => (
            <button
              key={k}
              onClick={() => setCategory(k)}
              className={cn(
                'px-3 py-1.5 rounded-md text-xs font-medium transition-all',
                category === k ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              )}
            >
              {v}
            </button>
          ))}
        </div>

        {/* Bulk actions */}
        {selected.size > 0 && (
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-sm text-muted-foreground">{selected.size} 个已选</span>
            <button
              onClick={() => bulkPublish(true)}
              disabled={bulkActioning}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-medium hover:bg-emerald-100"
            >
              <Eye className="h-3 w-3" /> 批量发布
            </button>
            <button
              onClick={() => bulkPublish(false)}
              disabled={bulkActioning}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-lg text-xs font-medium hover:bg-amber-100"
            >
              <EyeOff className="h-3 w-3" /> 批量下架
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="w-10 px-4 py-3">
                  <button
                    onClick={selectAll}
                    className={cn(
                      'w-4 h-4 rounded border-2 flex items-center justify-center transition-colors',
                      selected.size === filtered.length && filtered.length > 0
                        ? 'bg-primary border-primary text-white'
                        : 'border-slate-300 hover:border-primary'
                    )}
                  >
                    {selected.size === filtered.length && filtered.length > 0 && <Check className="h-3 w-3" />}
                  </button>
                </th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">产品</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">分类</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">排序</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">状态</th>
                <th className="text-right px-4 py-3 font-medium text-slate-600">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-16 text-center text-muted-foreground">加载中...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-16 text-center text-muted-foreground">
                  {search || category ? '没有匹配的产品' : '暂无产品，点击"添加产品"开始'}
                </td></tr>
              ) : (
                filtered.map((p) => {
                  const isSel = selected.has(p.id);
                  const firstImg = p.product_images?.[0]?.media?.variants?.publicUrl;
                  return (
                    <tr key={p.id} className={cn('hover:bg-slate-50/50 transition-colors', isSel && 'bg-primary/[0.03]')}>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => toggleSelect(p.id)}
                          className={cn(
                            'w-4 h-4 rounded border-2 flex items-center justify-center transition-colors',
                            isSel ? 'bg-primary border-primary text-white' : 'border-slate-300 hover:border-primary'
                          )}
                        >
                          {isSel && <Check className="h-3 w-3" />}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <Link to={`/products/${p.id}`} className="flex items-center gap-3 hover:opacity-80">
                          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden shrink-0">
                            {firstImg ? (
                              <img src={firstImg} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-5 h-5 bg-slate-200 rounded" />
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-slate-900">
                              {p.product_translations?.[0]?.name || p.slug}
                            </div>
                            <div className="text-xs text-slate-400 font-mono">{p.slug}</div>
                          </div>
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', categoryColors[p.category] || 'bg-slate-100 text-slate-600')}>
                          {categoryLabels[p.category] || p.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500">{p.sort_order}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => togglePublish(p.id, p.is_published)}
                          className={cn(
                            'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium transition-colors',
                            p.is_published
                              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                              : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                          )}
                        >
                          {p.is_published ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                          {p.is_published ? '已发布' : '草稿'}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            to={`/products/${p.id}`}
                            className="p-2 text-slate-400 hover:text-primary rounded-lg hover:bg-primary/5 transition-colors"
                            title="编辑"
                          >
                            <Edit3 className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(p.id, p.product_translations?.[0]?.name || p.slug)}
                            className="p-2 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                            title="删除"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
