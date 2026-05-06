import { useEffect, useState } from 'react';
import api from '@/api/client';
import { Plus, Edit3, Trash2, ChevronRight, ArrowUp, ArrowDown, GripVertical, X } from 'lucide-react';
import { SkeletonList } from '@/components/SkeletonCard';

interface MenuItem {
  id: string;
  parent_id: string | null;
  label: string;
  url: string;
  sort_order: number;
  children?: MenuItem[];
}

interface Menu {
  id: string;
  slug: string;
  name: string;
}

const LOCALES = [
  { key: 'en', label: 'English' },
  { key: 'fr', label: 'Français' },
  { key: 'vi', label: 'Tiếng Việt' },
];

function flattenTree(items: MenuItem[], depth = 0): (MenuItem & { depth: number })[] {
  const flat: (MenuItem & { depth: number })[] = [];
  for (const item of items) {
    flat.push({ ...item, depth });
    if (item.children && item.children.length > 0) {
      flat.push(...flattenTree(item.children, depth + 1));
    }
  }
  return flat;
}

export default function MenusPage() {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [locale, setLocale] = useState('en');
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [newMenuSlug, setNewMenuSlug] = useState('');
  const [newMenuName, setNewMenuName] = useState('');

  // Item editor
  const [editing, setEditing] = useState<{ parentId?: string | null; item?: MenuItem } | null>(null);
  const [editLabel, setEditLabel] = useState('');
  const [editUrl, setEditUrl] = useState('');

  const fetchMenus = async () => {
    const { data } = await api.get('/menus');
    if (data.success) {
      setMenus(data.data);
      if (!selectedMenu && data.data.length > 0) setSelectedMenu(data.data[0]);
    }
    setLoading(false);
  };

  const fetchItems = async () => {
    if (!selectedMenu) return;
    const { data } = await api.get(`/menus/${selectedMenu.id}`, { params: { locale } });
    if (data.success) setItems(data.data.items);
  };

  useEffect(() => { fetchMenus(); }, []);
  useEffect(() => { fetchItems(); }, [selectedMenu, locale]);

  const createMenu = async () => {
    if (!newMenuSlug || !newMenuName) return;
    await api.post('/menus', { slug: newMenuSlug, name: newMenuName });
    setShowCreateMenu(false);
    setNewMenuSlug('');
    setNewMenuName('');
    fetchMenus();
  };

  const deleteMenu = async (id: string, name: string) => {
    if (!confirm(`确定删除菜单 "${name}"？`)) return;
    await api.delete(`/menus/${id}`);
    if (selectedMenu?.id === id) setSelectedMenu(null);
    fetchMenus();
  };

  const addItem = async () => {
    if (!selectedMenu || !editLabel || !editUrl) return;
    const parentId = editing?.parentId ?? null;
    await api.post(`/menus/${selectedMenu.id}/items`, {
      label: editLabel,
      url: editUrl,
      locale,
      parent_id: parentId,
    });
    setEditing(null);
    setEditLabel('');
    setEditUrl('');
    fetchItems();
  };

  const updateItem = async () => {
    if (!editing?.item) return;
    await api.put(`/menus/items/${editing.item.id}`, {
      label: editLabel,
      url: editUrl,
    });
    setEditing(null);
    fetchItems();
  };

  const deleteItem = async (id: string, label: string) => {
    if (!confirm(`确定删除 "${label}"？此操作会同时删除其子项。`)) return;
    await api.delete(`/menus/items/${id}`);
    fetchItems();
  };

  const moveItem = async (item: MenuItem, direction: 'up' | 'down') => {
    const flat = flattenTree(items);
    const idx = flat.findIndex((i) => i.id === item.id);
    if (idx < 0) return;
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= flat.length) return;

    const target = flat[targetIdx];
    if (target.depth !== flat[idx].depth) return;

    // Swap sort_order
    const updates = [
      { id: item.id, sort_order: target.sort_order, parent_id: item.parent_id },
      { id: target.id, sort_order: item.sort_order, parent_id: target.parent_id },
    ];

    await api.put(`/menus/${selectedMenu!.id}/reorder`, { items: updates });
    fetchItems();
  };

  const openEdit = (item: MenuItem) => {
    setEditing({ item });
    setEditLabel(item.label);
    setEditUrl(item.url);
  };

  const openAdd = (parentId?: string | null) => {
    setEditing({ parentId });
    setEditLabel('');
    setEditUrl('');
  };

  const flatItems = flattenTree(items);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-warm-charcoal">菜单管理</h1>
        <p className="text-sm text-muted-foreground mt-1">管理网站导航菜单</p>
      </div>

      {loading ? (
        <SkeletonList count={3} />
      ) : (
        <div className="flex gap-6">
          {/* Menu list sidebar */}
          <div className="w-56 shrink-0 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-sm text-warm-charcoal">菜单</h2>
              <button
                onClick={() => setShowCreateMenu(true)}
                className="p-1.5 text-warm-charcoal-muted hover:text-pastel-blue rounded-lg hover:bg-pastel-blue/5"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            {showCreateMenu && (
              <div className="bg-[hsl(var(--card))] border rounded-lg p-3 space-y-2">
                <input
                  value={newMenuSlug}
                  onChange={(e) => setNewMenuSlug(e.target.value)}
                  className="w-full px-2 py-1.5 rounded border text-xs focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="slug (e.g. main-nav)"
                />
                <input
                  value={newMenuName}
                  onChange={(e) => setNewMenuName(e.target.value)}
                  className="w-full px-2 py-1.5 rounded border text-xs focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="名称 (e.g. 主导航)"
                />
                <div className="flex gap-2">
                  <button onClick={createMenu} className="flex-1 px-2 py-1.5 bg-primary text-primary-foreground rounded text-xs font-medium">创建</button>
                  <button onClick={() => setShowCreateMenu(false)} className="px-2 py-1.5 text-xs text-warm-charcoal-muted hover:text-warm-charcoal">取消</button>
                </div>
              </div>
            )}

            <div className="space-y-0.5">
              {menus.map((m) => (
                <div
                  key={m.id}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm cursor-pointer group transition-colors ${
                    selectedMenu?.id === m.id
                      ? 'bg-pastel-blue/10 text-pastel-blue font-medium'
                      : 'text-warm-charcoal-muted hover:bg-[hsl(var(--secondary))] hover:text-warm-charcoal'
                  }`}
                >
                  <button className="flex-1 text-left truncate" onClick={() => setSelectedMenu(m)}>
                    {m.name} <span className="text-[10px] opacity-50">({m.slug})</span>
                  </button>
                  <button
                    onClick={() => deleteMenu(m.id, m.name)}
                    className="opacity-0 group-hover:opacity-100 p-0.5 text-warm-charcoal-muted hover:text-red-500 transition-opacity"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
              {menus.length === 0 && (
                <p className="text-xs text-muted-foreground py-4 text-center">暂无菜单，点击 + 创建</p>
              )}
            </div>
          </div>

          {/* Menu items */}
          <div className="flex-1 space-y-4">
            {selectedMenu ? (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex gap-1 bg-[hsl(var(--secondary))] p-1 rounded-lg w-fit">
                    {LOCALES.map((l) => (
                      <button
                        key={l.key}
                        onClick={() => setLocale(l.key)}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                          locale === l.key ? 'bg-[hsl(var(--card))] text-warm-charcoal shadow-sm' : 'text-warm-charcoal-muted hover:text-warm-charcoal'
                        }`}
                      >
                        {l.label}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => openAdd(null)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90"
                  >
                    <Plus className="h-4 w-4" />
                    添加菜单项
                  </button>
                </div>

                {/* Add/edit inline form */}
                {editing && !editing.item && (
                  <div className="bg-[hsl(var(--card))] border rounded-lg p-4 space-y-3">
                    <h3 className="text-sm font-semibold text-warm-charcoal">
                      添加{editing.parentId ? '子' : ''}菜单项 ({locale.toUpperCase()})
                    </h3>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="block text-xs font-medium text-warm-charcoal mb-1">标签 *</label>
                        <input value={editLabel} onChange={(e) => setEditLabel(e.target.value)} className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="首页" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-warm-charcoal mb-1">URL *</label>
                        <input value={editUrl} onChange={(e) => setEditUrl(e.target.value)} className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="/about" />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={addItem} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium">添加</button>
                      <button onClick={() => setEditing(null)} className="px-4 py-2 text-sm text-warm-charcoal-muted hover:text-warm-charcoal">取消</button>
                    </div>
                  </div>
                )}

                {editing && editing.item && (
                  <div className="bg-[hsl(var(--card))] border rounded-lg p-4 space-y-3">
                    <h3 className="text-sm font-semibold text-warm-charcoal">编辑菜单项</h3>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="block text-xs font-medium text-warm-charcoal mb-1">标签</label>
                        <input value={editLabel} onChange={(e) => setEditLabel(e.target.value)} className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-warm-charcoal mb-1">URL</label>
                        <input value={editUrl} onChange={(e) => setEditUrl(e.target.value)} className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={updateItem} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium">保存</button>
                      <button onClick={() => setEditing(null)} className="px-4 py-2 text-sm text-warm-charcoal-muted hover:text-warm-charcoal">取消</button>
                    </div>
                  </div>
                )}

                {/* Items tree */}
                <div className="space-y-0.5">
                  {flatItems.length === 0 ? (
                    <div className="py-12 text-center text-muted-foreground text-sm">
                      暂无{locale.toUpperCase()}菜单项，点击"添加菜单项"开始
                    </div>
                  ) : (
                    flatItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-[hsl(var(--card))] border group hover:border-pastel-blue/30 transition-colors"
                        style={{ marginLeft: item.depth * 28 }}
                      >
                        {item.depth > 0 && (
                          <ChevronRight className="h-3.5 w-3.5 text-warm-charcoal-muted/40 shrink-0" />
                        )}
                        <span className="flex-1 text-sm text-warm-charcoal truncate">
                          {item.label}
                          <span className="ml-2 text-xs text-warm-charcoal-muted/50">{item.url}</span>
                        </span>

                        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                          <button
                            onClick={() => moveItem(item, 'up')}
                            className="p-1 text-warm-charcoal-muted/60 hover:text-warm-charcoal rounded"
                            title="上移"
                          >
                            <ArrowUp className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => moveItem(item, 'down')}
                            className="p-1 text-warm-charcoal-muted/60 hover:text-warm-charcoal rounded"
                            title="下移"
                          >
                            <ArrowDown className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => openAdd(item.id)}
                            className="p-1 text-warm-charcoal-muted/60 hover:text-pastel-blue rounded"
                            title="添加子项"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => openEdit(item)}
                            className="p-1 text-warm-charcoal-muted/60 hover:text-pastel-blue rounded"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => deleteItem(item.id, item.label)}
                            className="p-1 text-warm-charcoal-muted/60 hover:text-red-500 rounded"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            ) : (
              <div className="py-12 text-center text-muted-foreground">选择一个菜单或创建新菜单</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
