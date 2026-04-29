import { useEffect, useState } from 'react';
import api from '@/api/client';
import { Scale, Save, ChevronDown, Plus, Trash2, X } from 'lucide-react';

const PAGE_TYPES = [
  { key: 'terms', label: '服务条款 (Terms of Use)' },
  { key: 'privacy', label: '隐私政策 (Privacy Policy)' },
  { key: 'warranty', label: '保修政策 (Warranty Policy)' },
  { key: 'do-not-sell', label: '不出售数据 (Do Not Sell)' },
];

const LOCALES = ['en', 'fr', 'vi'] as const;

interface Section {
  title: string;
  paragraphs: string[];
}

interface TranslationData {
  locale: string;
  title: string;
  description: string;
  eyebrow: string;
  h1: string;
  lead: string;
  intro: string[];
  sections: [string, string[]][];
}

export default function LegalPagesPage() {
  const [pages, setPages] = useState<Record<string, TranslationData[]>>({});
  const [locale, setLocale] = useState<string>('en');
  const [expandedType, setExpandedType] = useState<string | null>(null);
  const [editData, setEditData] = useState<TranslationData | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchPages = async () => {
    const { data } = await api.get('/legal', { params: { locale } });
    if (data.success) {
      // Group by page_type
      const map: Record<string, TranslationData[]> = {};
      for (const item of data.data) {
        if (!map[item.page_type]) map[item.page_type] = [];
        map[item.page_type].push(item);
      }
      setPages(map);
    }
  };

  useEffect(() => { fetchPages(); }, [locale]);

  const startEdit = (pageType: string) => {
    const existing = pages[pageType]?.find((p) => p.locale === locale);
    if (existing) {
      setEditData(JSON.parse(JSON.stringify(existing)));
    } else {
      setEditData({
        locale,
        title: '',
        description: '',
        eyebrow: '',
        h1: '',
        lead: '',
        intro: [],
        sections: [['', ['']]],
      });
    }
    setExpandedType(pageType);
  };

  const saveEdit = async () => {
    if (!editData || !expandedType) return;
    setSaving(true);
    try {
      await api.put(`/legal/${expandedType}`, {
        page_type: expandedType,
        translations: [editData],
      });
      fetchPages();
      setExpandedType(null);
      setEditData(null);
    } catch (err: any) {
      alert('保存失败');
    } finally {
      setSaving(false);
    }
  };

  const addSection = () => {
    if (!editData) return;
    setEditData({
      ...editData,
      sections: [...editData.sections, ['', ['']]],
    });
  };

  const removeSection = (idx: number) => {
    if (!editData) return;
    setEditData({
      ...editData,
      sections: editData.sections.filter((_, i) => i !== idx),
    });
  };

  const updateSectionTitle = (idx: number, title: string) => {
    if (!editData) return;
    const sections = [...editData.sections];
    sections[idx] = [title, sections[idx][1]];
    setEditData({ ...editData, sections });
  };

  const addParagraph = (sectionIdx: number) => {
    if (!editData) return;
    const sections = [...editData.sections];
    sections[sectionIdx] = [sections[sectionIdx][0], [...sections[sectionIdx][1], '']];
    setEditData({ ...editData, sections });
  };

  const updateParagraph = (sectionIdx: number, paraIdx: number, value: string) => {
    if (!editData) return;
    const sections = [...editData.sections];
    const paragraphs = [...sections[sectionIdx][1]];
    paragraphs[paraIdx] = value;
    sections[sectionIdx] = [sections[sectionIdx][0], paragraphs];
    setEditData({ ...editData, sections });
  };

  const removeParagraph = (sectionIdx: number, paraIdx: number) => {
    if (!editData) return;
    const sections = [...editData.sections];
    sections[sectionIdx] = [sections[sectionIdx][0], sections[sectionIdx][1].filter((_, i) => i !== paraIdx)];
    setEditData({ ...editData, sections });
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">法律页面</h1>
          <p className="text-sm text-muted-foreground mt-1">隐私政策、服务条款等</p>
        </div>
      </div>

      <div className="flex gap-1 bg-slate-100 p-1 rounded-lg w-fit">
        {LOCALES.map((l) => (
          <button
            key={l}
            onClick={() => setLocale(l)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              locale === l ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {l.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {PAGE_TYPES.map((pt) => {
          const isExpanded = expandedType === pt.key;
          const page = pages[pt.key]?.find((p) => p.locale === locale);

          return (
            <div key={pt.key} className="bg-white rounded-xl border overflow-hidden">
              {isExpanded && editData ? (
                <div className="p-5 space-y-4">
                  <h3 className="font-semibold text-slate-900">{pt.label} — 编辑 ({locale.toUpperCase()})</h3>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <input value={editData.title} onChange={(e) => setEditData({ ...editData, title: e.target.value })} placeholder="页面标题" className="px-3 py-2 rounded-lg border text-sm" />
                    <input value={editData.description} onChange={(e) => setEditData({ ...editData, description: e.target.value })} placeholder="描述" className="px-3 py-2 rounded-lg border text-sm" />
                    <input value={editData.eyebrow} onChange={(e) => setEditData({ ...editData, eyebrow: e.target.value })} placeholder="Eyebrow" className="px-3 py-2 rounded-lg border text-sm" />
                    <input value={editData.h1} onChange={(e) => setEditData({ ...editData, h1: e.target.value })} placeholder="H1 标题" className="px-3 py-2 rounded-lg border text-sm" />
                  </div>
                  <textarea value={editData.lead} onChange={(e) => setEditData({ ...editData, lead: e.target.value })} placeholder="Lead 段落" rows={2} className="w-full px-3 py-2 rounded-lg border text-sm" />

                  {/* Sections */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-slate-700">章节内容</h4>
                      <button onClick={addSection} className="text-xs text-primary hover:underline inline-flex items-center gap-1">
                        <Plus className="h-3 w-3" /> 添加章节
                      </button>
                    </div>
                    {editData.sections.map(([title, paragraphs], si) => (
                      <div key={si} className="border rounded-lg p-3 space-y-2">
                        <div className="flex items-center gap-2">
                          <input value={title} onChange={(e) => updateSectionTitle(si, e.target.value)} placeholder="章节标题" className="flex-1 px-3 py-2 rounded-lg border text-sm font-medium" />
                          <button onClick={() => removeSection(si)} className="p-1 text-slate-400 hover:text-red-500"><X className="h-4 w-4" /></button>
                        </div>
                        {paragraphs.map((p, pi) => (
                          <div key={pi} className="flex gap-2">
                            <textarea value={p} onChange={(e) => updateParagraph(si, pi, e.target.value)} rows={2} className="flex-1 px-3 py-2 rounded-lg border text-sm" placeholder={`段落 ${pi + 1}`} />
                            <button onClick={() => removeParagraph(si, pi)} className="p-1 text-slate-400 hover:text-red-500 shrink-0"><X className="h-3.5 w-3.5" /></button>
                          </div>
                        ))}
                        <button onClick={() => addParagraph(si)} className="text-xs text-primary hover:underline">+ 添加段落</button>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2 justify-end">
                    <button onClick={() => { setExpandedType(null); setEditData(null); }} className="px-4 py-2 rounded-lg text-sm border">取消</button>
                    <button onClick={saveEdit} disabled={saving} className="px-4 py-2 rounded-lg text-sm bg-primary text-primary-foreground disabled:opacity-50">
                      {saving ? '保存中...' : '保存'}
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => startEdit(pt.key)}
                  className="w-full p-5 flex items-center gap-4 hover:bg-slate-50 text-left transition-colors"
                >
                  <Scale className="h-5 w-5 text-primary shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-slate-900">{page?.title || pt.label}</div>
                    {page?.description && (
                      <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{page.description}</div>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground shrink-0">
                    {page ? '点击编辑' : '点击创建'}
                  </div>
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
