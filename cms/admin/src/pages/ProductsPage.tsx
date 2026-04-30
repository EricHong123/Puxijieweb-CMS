import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '@/api/client';
import { Plus, Edit3, Trash2, Eye, EyeOff, Search, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from '@/components/ui/table';
import { SkeletonTable } from '@/components/SkeletonCard';

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

const categoryBadgeVariant: Record<string, 'blue' | 'secondary' | 'warning' | 'purple'> = {
  waterproof_bt: 'blue',
  normal_bt: 'secondary',
  specialty: 'warning',
  earbuds: 'purple',
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
          <h1 className="text-2xl font-bold text-slate-800">产品管理</h1>
          <p className="text-sm text-slate-500 mt-1">{products.length} 个产品</p>
        </div>
        <Link to="/products/new">
          <Button>
            <Plus className="h-4 w-4" />
            添加产品
          </Button>
        </Link>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索产品名或 slug..."
            className="pl-9"
          />
        </div>

        <div className="flex gap-1 bg-[#F5F5F5] p-1 rounded-lg">
          {Object.entries({ '': '全部', ...categoryLabels }).map(([k, v]) => (
            <button
              key={k}
              onClick={() => setCategory(k)}
              className={cn(
                'px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-fluent',
                category === k ? 'bg-white text-slate-800 shadow-elevation-1' : 'text-slate-500 hover:text-slate-700'
              )}
            >
              {v}
            </button>
          ))}
        </div>

        {/* Bulk actions */}
        {selected.size > 0 && (
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-sm text-slate-500">{selected.size} 个已选</span>
            <Button variant="outline" size="sm" onClick={() => bulkPublish(true)} disabled={bulkActioning}>
              <Eye className="h-3 w-3" /> 批量发布
            </Button>
            <Button variant="outline" size="sm" onClick={() => bulkPublish(false)} disabled={bulkActioning}>
              <EyeOff className="h-3 w-3" /> 批量下架
            </Button>
          </div>
        )}
      </div>

      {/* Table */}
      <Card padding="none" className="overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
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
                <TableHead>产品</TableHead>
                <TableHead>分类</TableHead>
                <TableHead>排序</TableHead>
                <TableHead>状态</TableHead>
                <th className="text-right px-4 py-3 font-medium text-slate-600 text-xs">操作</th>
              </tr>
            </TableHeader>
            <TableBody>
              {loading ? (
                <tr><td colSpan={6} className="p-0"><SkeletonTable rows={5} cols={4} /></td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-16 text-center text-slate-500">
                  {search || category ? '没有匹配的产品' : '暂无产品，点击"添加产品"开始'}
                </td></tr>
              ) : (
                filtered.map((p) => {
                  const isSel = selected.has(p.id);
                  const firstImg = p.product_images?.[0]?.media?.variants?.publicUrl;
                  return (
                    <TableRow key={p.id} isSelected={isSel}>
                      <TableCell>
                        <button
                          onClick={() => toggleSelect(p.id)}
                          className={cn(
                            'w-4 h-4 rounded border-2 flex items-center justify-center transition-colors',
                            isSel ? 'bg-primary border-primary text-white' : 'border-slate-300 hover:border-primary'
                          )}
                        >
                          {isSel && <Check className="h-3 w-3" />}
                        </button>
                      </TableCell>
                      <TableCell>
                        <Link to={`/products/${p.id}`} className="flex items-center gap-3 hover:opacity-80">
                          <div className="w-10 h-10 rounded-lg bg-[#FAFAFA] flex items-center justify-center overflow-hidden shrink-0 border border-[#EBEBEB]">
                            {firstImg ? (
                              <img src={firstImg} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-5 h-5 bg-[#EBEBEB] rounded" />
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-slate-800">
                              {p.product_translations?.[0]?.name || p.slug}
                            </div>
                            <div className="text-xs text-slate-400 font-mono">{p.slug}</div>
                          </div>
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Badge variant={categoryBadgeVariant[p.category] || 'secondary'}>
                          {categoryLabels[p.category] || p.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-500">{p.sort_order}</TableCell>
                      <TableCell>
                        <Badge
                          variant={p.is_published ? 'success' : 'warning'}
                          interactive
                          onClick={() => togglePublish(p.id, p.is_published)}
                        >
                          {p.is_published ? <><Eye className="h-3 w-3" /> 已发布</> : <><EyeOff className="h-3 w-3" /> 草稿</>}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          <Link to={`/products/${p.id}`}>
                            <Button variant="ghost" size="icon-sm" title="编辑">
                              <Edit3 className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="destructive-ghost"
                            size="icon-sm"
                            onClick={() => handleDelete(p.id, p.product_translations?.[0]?.name || p.slug)}
                            title="删除"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
