import { useEffect, useState } from 'react';
import api from '@/api/client';
import { Plus, Trash2, Save, HelpCircle, X, GripVertical } from 'lucide-react';

interface FaqSection {
  id: string;
  section_key: string;
  locale: string;
  short_title: string;
  title: string;
  items: Array<{ q: string; a: string }>;
  sort_order: number;
}

const LOCALES = [
  { key: 'en', label: 'English' },
  { key: 'fr', label: 'Français' },
  { key: 'vi', label: 'Tiếng Việt' },
];

export default function FaqPage() {
  const [sections, setSections] = useState<FaqSection[]>([]);
  const [locale, setLocale] = useState('en');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<FaqSection | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [newData, setNewData] = useState({
    section_key: '',
    short_title: '',
    title: '',
    items: [{ q: '', a: '' }],
  });

  const fetchSections = async () => {
    const { data } = await api.get('/faq', { params: { locale } });
    if (data.success) setSections(data.data);
  };

  useEffect(() => { fetchSections(); }, [locale]);

  const startEdit = (section: FaqSection) => {
    setEditingId(section.id);
    setEditData(JSON.parse(JSON.stringify(section)));
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData(null);
  };

  const saveEdit = async () => {
    if (!editData) return;
    setSavingId(editData.id);
    await api.put(`/faq/${editData.id}`, editData);
    setSavingId(null);
    setEditingId(null);
    setEditData(null);
    fetchSections();
  };

  const addItem = () => {
    if (!editData) return;
    setEditData({ ...editData, items: [...editData.items, { q: '', a: '' }] });
  };

  const removeItem = (idx: number) => {
    if (!editData) return;
    setEditData({ ...editData, items: editData.items.filter((_, i) => i !== idx) });
  };

  const updateItem = (idx: number, field: 'q' | 'a', value: string) => {
    if (!editData) return;
    const items = [...editData.items];
    items[idx] = { ...items[idx], [field]: value };
    setEditData({ ...editData, items });
  };

  const createSection = async () => {
    await api.post('/faq', { ...newData, locale });
    setShowNew(false);
    setNewData({ section_key: '', short_title: '', title: '', items: [{ q: '', a: '' }] });
    fetchSections();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">FAQ 管理</h1>
          <p className="text-sm text-muted-foreground mt-1">{sections.length} 个分区</p>
        </div>
        <button
          onClick={() => setShowNew(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90"
        >
          <Plus className="h-4 w-4" /> 新建分区
        </button>
      </div>

      <div className="flex gap-1 bg-slate-100 p-1 rounded-lg w-fit">
        {LOCALES.map((l) => (
          <button
            key={l.key}
            onClick={() => setLocale(l.key)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              locale === l.key ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {l.label}
          </button>
        ))}
      </div>

      {/* New section form */}
      {showNew && (
        <div className="bg-white rounded-xl border border-primary/30 p-5 space-y-3">
          <h3 className="font-semibold text-slate-900">新建 FAQ 分区</h3>
          <div className="grid gap-3 sm:grid-cols-3">
            <input value={newData.section_key} onChange={(e) => setNewData({ ...newData, section_key: e.target.value })} placeholder="Key (e.g. shipping)" className="px-3 py-2 rounded-lg border text-sm" />
            <input value={newData.short_title} onChange={(e) => setNewData({ ...newData, short_title: e.target.value })} placeholder="短标题" className="px-3 py-2 rounded-lg border text-sm" />
            <input value={newData.title} onChange={(e) => setNewData({ ...newData, title: e.target.value })} placeholder="完整标题" className="px-3 py-2 rounded-lg border text-sm" />
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setShowNew(false)} className="px-4 py-2 rounded-lg text-sm border text-slate-600">取消</button>
            <button onClick={createSection} className="px-4 py-2 rounded-lg text-sm bg-primary text-primary-foreground">创建</button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {sections.length === 0 && !showNew && (
          <div className="py-12 text-center text-muted-foreground text-sm">暂无 {locale.toUpperCase()} FAQ 内容</div>
        )}
        {sections.map((section) => (
          <div key={section.id} className="bg-white rounded-xl border overflow-hidden">
            {editingId === section.id && editData ? (
              <div className="p-5 space-y-4">
                <div className="grid gap-3 sm:grid-cols-3">
                  <input value={editData.section_key} onChange={(e) => setEditData({ ...editData, section_key: e.target.value })} className="px-3 py-2 rounded-lg border text-sm" />
                  <input value={editData.short_title} onChange={(e) => setEditData({ ...editData, short_title: e.target.value })} className="px-3 py-2 rounded-lg border text-sm" />
                  <input value={editData.title} onChange={(e) => setEditData({ ...editData, title: e.target.value })} className="px-3 py-2 rounded-lg border text-sm" />
                </div>

                <div className="space-y-3">
                  {editData.items.map((item, idx) => (
                    <div key={idx} className="flex gap-2 items-start">
                      <span className="text-xs text-muted-foreground mt-2.5 w-4">{idx + 1}</span>
                      <div className="flex-1 space-y-2">
                        <input value={item.q} onChange={(e) => updateItem(idx, 'q', e.target.value)} placeholder="问题" className="w-full px-3 py-2 rounded-lg border text-sm" />
                        <textarea value={item.a} onChange={(e) => updateItem(idx, 'a', e.target.value)} placeholder="回答" rows={2} className="w-full px-3 py-2 rounded-lg border text-sm" />
                      </div>
                      <button onClick={() => removeItem(idx)} className="p-2 text-slate-400 hover:text-red-500 shrink-0">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <button onClick={addItem} className="inline-flex items-center gap-1 px-3 py-1.5 text-xs text-primary border border-primary/30 rounded-lg hover:bg-primary/5">
                    <Plus className="h-3 w-3" /> 添加问答
                  </button>
                  <div className="flex-1" />
                  <button onClick={cancelEdit} className="px-4 py-2 rounded-lg text-sm border text-slate-600">取消</button>
                  <button onClick={saveEdit} disabled={savingId === section.id} className="px-4 py-2 rounded-lg text-sm bg-primary text-primary-foreground disabled:opacity-50">
                    {savingId === section.id ? '保存中...' : '保存'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-5 cursor-pointer hover:bg-slate-50" onClick={() => startEdit(section)}>
                <div className="flex items-center gap-3">
                  <HelpCircle className="h-5 w-5 text-primary shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-slate-900">{section.title}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      key: {section.section_key} · {section.items.length} 个问答
                    </div>
                  </div>
                  <span className="text-xs text-slate-400">点击编辑</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
