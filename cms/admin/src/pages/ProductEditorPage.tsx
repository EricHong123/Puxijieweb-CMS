import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import api from '@/api/client';
import I18nTabs, { type Locale, LOCALES } from '@/components/I18nTabs';
import MediaPicker from '@/components/MediaPicker';
import { ArrowLeft, Plus, Trash2, Save, GripVertical, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const CATEGORIES = [
  { value: 'waterproof_bt', label: '防水蓝牙音箱' },
  { value: 'normal_bt', label: '普通蓝牙音箱' },
  { value: 'specialty', label: '特色音箱' },
  { value: 'earbuds', label: '蓝牙耳机' },
];

const SPEC_FIELDS = [
  ['ipx_rating', 'IPX 等级'],
  ['battery_life', '续航时间'],
  ['chipset', '芯片'],
  ['bluetooth_version', '蓝牙版本'],
  ['transmission_distance', '传输距离'],
  ['speaker_spec', '喇叭参数'],
  ['battery_spec', '电池参数'],
  ['function_set', '功能集合'],
  ['color_options', '颜色选项'],
  ['moq', 'MOQ'],
  ['package_size', '包装尺寸'],
  ['carton_size', '箱规尺寸'],
  ['carton_quantity', '装箱数量'],
  ['carton_weight', '箱重'],
  ['accessory_content', '配件'],
] as const;

function buildEmptyTranslations() {
  return LOCALES.map(({ key }) => ({
    locale: key as Locale,
    name: '',
    subtitle: '',
    material: '',
    weight: '',
    dimensions: '',
    waterproof_depth: '',
    frequency_range: '',
    features: [] as string[],
    benefits: [] as string[],
    procurement_notes: [] as string[],
    description_html: '',
  }));
}

function buildEmptySpecs() {
  const s: Record<string, string> = {};
  for (const [key] of SPEC_FIELDS) s[key] = '';
  return s;
}

export default function ProductEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = !id;
  const [saving, setSaving] = useState(false);
  const [activeLocale, setActiveLocale] = useState<Locale>('en');
  const [selectedImageIds, setSelectedImageIds] = useState<string[]>([]);
  const [downloads, setDownloads] = useState<Array<{ title: string; url: string }>>([]);
  const [relatedIds, setRelatedIds] = useState<string[]>([]);
  const [relatedSearch, setRelatedSearch] = useState('');
  const [productList, setProductList] = useState<Array<{ id: string; slug: string; name: string }>>([]);

  const { register, handleSubmit, reset, watch, setValue, getValues, formState: { errors } } = useForm({
    defaultValues: {
      slug: '',
      category: 'waterproof_bt',
      sort_order: 0,
      translations: buildEmptyTranslations(),
      specs: buildEmptySpecs(),
    },
  });

  const translations = watch('translations');
  const activeIdx = LOCALES.findIndex((l) => l.key === activeLocale);

  // Fetch existing product data
  useEffect(() => {
    if (id) {
      api.get(`/products/${id}`).then(({ data }) => {
        if (!data.success) return;
        const p = data.data;
        setValue('slug', p.slug);
        setValue('category', p.category);
        setValue('sort_order', p.sort_order || 0);

        // Translations
        const trs = buildEmptyTranslations();
        for (let i = 0; i < LOCALES.length; i++) {
          const t = p.product_translations?.find((t: any) => t.locale === LOCALES[i].key);
          if (t) {
            trs[i] = {
              locale: LOCALES[i].key as Locale,
              name: t.name || '',
              subtitle: t.subtitle || '',
              material: t.material || '',
              weight: t.weight || '',
              dimensions: t.dimensions || '',
              waterproof_depth: t.waterproof_depth || '',
              frequency_range: t.frequency_range || '',
              features: t.features || [],
              benefits: t.benefits || [],
              procurement_notes: t.procurement_notes || [],
              description_html: t.description_html || '',
            };
          }
        }
        setValue('translations', trs);

        // Specs
        if (p.product_specs) {
          const specs = buildEmptySpecs();
          for (const [key] of SPEC_FIELDS) {
            if (p.product_specs[key] != null) specs[key] = p.product_specs[key];
          }
          setValue('specs', specs);
        }

        // Images
        if (p.product_images) {
          setSelectedImageIds(p.product_images.map((pi: any) => pi.media_id));
        }

        // Downloads
        if (p.downloads && Array.isArray(p.downloads)) {
          setDownloads(p.downloads);
        }
      });
    }
  }, [id, setValue]);

  // Fetch product list for related products
  useEffect(() => {
    api.get('/products', { params: { locale: 'en', limit: '100' } }).then(({ data }) => {
      if (data.success) {
        setProductList(data.data.items.map((p: any) => ({
          id: p.id,
          slug: p.slug,
          name: p.product_translations?.[0]?.name || p.slug,
        })));
      }
    });
  }, []);

  // Array item helpers for translations
  const addArrayItem = useCallback((field: 'features' | 'benefits' | 'procurement_notes') => {
    const trs = [...getValues('translations')];
    trs[activeIdx] = { ...trs[activeIdx], [field]: [...(trs[activeIdx][field] || []), ''] };
    setValue('translations', trs);
  }, [activeIdx, getValues, setValue]);

  const removeArrayItem = useCallback((field: 'features' | 'benefits' | 'procurement_notes', idx: number) => {
    const trs = [...getValues('translations')];
    const arr = [...(trs[activeIdx][field] || [])];
    arr.splice(idx, 1);
    trs[activeIdx] = { ...trs[activeIdx], [field]: arr };
    setValue('translations', trs);
  }, [activeIdx, getValues, setValue]);

  const updateArrayItem = useCallback((field: 'features' | 'benefits' | 'procurement_notes', idx: number, value: string) => {
    const trs = [...getValues('translations')];
    const arr = [...(trs[activeIdx][field] || [])];
    arr[idx] = value;
    trs[activeIdx] = { ...trs[activeIdx], [field]: arr };
    setValue('translations', trs);
  }, [activeIdx, getValues, setValue]);

  const onSubmit = async (formData: any) => {
    setSaving(true);
    try {
      const payload = {
        ...formData,
        image_ids: selectedImageIds,
        downloads,
        related_ids: relatedIds,
      };

      if (isNew) {
        const { data } = await api.post('/products', payload);
        if (data.success) {
          // Attach images
          for (let i = 0; i < selectedImageIds.length; i++) {
            await api.post(`/products/${data.data.id}/images`, {
              media_id: selectedImageIds[i],
              sort_order: i,
              is_primary: i === 0,
            }).catch(() => {});
          }
          navigate(`/products/${data.data.id}`);
        }
      } else {
        await api.put(`/products/${id}`, payload);
        // Sync images: delete all, re-add
        // In production, use a dedicated reorder endpoint
      }
    } catch (err: any) {
      alert(err.response?.data?.error || '保存失败');
    } finally {
      setSaving(false);
    }
  };

  const ArrayEditor = ({ field, label }: { field: 'features' | 'benefits' | 'procurement_notes'; label: string }) => {
    const items = translations?.[activeIdx]?.[field] || [];
    return (
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-slate-700">{label}</label>
          <button
            type="button"
            onClick={() => addArrayItem(field)}
            className="inline-flex items-center gap-1 px-2 py-1 text-xs text-primary hover:bg-primary/5 rounded"
          >
            <Plus className="h-3 w-3" /> 添加
          </button>
        </div>
        <div className="space-y-2">
          {items.map((item: string, idx: number) => (
            <div key={idx} className="flex gap-2">
              <input
                value={item}
                onChange={(e) => updateArrayItem(field, idx, e.target.value)}
                placeholder={label}
                className="flex-1 px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <button
                type="button"
                onClick={() => removeArrayItem(field, idx)}
                className="p-2 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 shrink-0"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
          {items.length === 0 && (
            <div className="text-xs text-muted-foreground py-2">暂无内容，点击"添加"按钮</div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/products')} className="p-2 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-900">{isNew ? '添加产品' : `编辑 ${watch('slug')}`}</h1>
          <p className="text-sm text-muted-foreground mt-1">{isNew ? '创建新产品' : '修改产品内容后点击保存'}</p>
        </div>
        <button
          type="button"
          onClick={handleSubmit(onSubmit)}
          disabled={saving}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 shadow-sm"
        >
          <Save className="h-4 w-4" />
          {saving ? '保存中...' : '保存'}
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic info */}
        <section className="bg-white rounded-xl border p-6 space-y-4">
          <h2 className="font-semibold text-slate-900 text-lg">基本信息</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Slug *</label>
              <input
                {...register('slug', { required: true, pattern: /^[a-z0-9-]+$/ })}
                placeholder="qw-g34"
                className="w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">分类 *</label>
              <select {...register('category')} className="w-full px-3 py-2.5 rounded-lg border text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30">
                {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">排序</label>
              <input
                type="number"
                {...register('sort_order', { valueAsNumber: true })}
                className="w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>
        </section>

        {/* Product Images */}
        <section className="bg-white rounded-xl border p-6 space-y-4">
          <h2 className="font-semibold text-slate-900 text-lg">产品图片</h2>
          <MediaPicker
            selected={selectedImageIds}
            onSelect={setSelectedImageIds}
            multiple
          />
        </section>

        {/* Downloads */}
        <section className="bg-white rounded-xl border p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-slate-900 text-lg">下载文件</h2>
            <button
              type="button"
              onClick={() => setDownloads([...downloads, { title: '', url: '' }])}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs text-primary hover:bg-primary/5 rounded-lg border border-dashed border-primary/30"
            >
              <Plus className="h-3 w-3" /> 添加下载
            </button>
          </div>
          {downloads.length === 0 ? (
            <p className="text-sm text-muted-foreground py-2">暂无下载文件。点击"添加下载"关联产品文档（如规格书 PDF、色卡 PDF 等）。</p>
          ) : (
            <div className="space-y-3">
              {downloads.map((d, idx) => (
                <div key={idx} className="flex gap-3 items-start p-3 bg-slate-50 rounded-lg border">
                  <span className="shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-slate-200 text-xs font-medium text-slate-600 mt-2">
                    {idx + 1}
                  </span>
                  <div className="flex-1 grid gap-2 sm:grid-cols-2">
                    <input
                      value={d.title}
                      onChange={(e) => {
                        const next = [...downloads];
                        next[idx] = { ...next[idx], title: e.target.value };
                        setDownloads(next);
                      }}
                      placeholder="文件名（如：产品规格书 PDF）"
                      className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                    <input
                      value={d.url}
                      onChange={(e) => {
                        const next = [...downloads];
                        next[idx] = { ...next[idx], url: e.target.value };
                        setDownloads(next);
                      }}
                      placeholder="文件 URL（如：/specs/qw-g34.pdf）"
                      className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const next = [...downloads];
                      next.splice(idx, 1);
                      setDownloads(next);
                    }}
                    className="p-2 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 shrink-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Translations */}
        <section className="bg-white rounded-xl border p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-slate-900 text-lg">多语言内容</h2>
            <I18nTabs active={activeLocale} onChange={setActiveLocale} />
          </div>

          {activeIdx >= 0 && (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    产品名 ({activeLocale.toUpperCase()}) *
                  </label>
                  <input
                    {...register(`translations.${activeIdx}.name`, { required: true })}
                    className="w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">副标题 ({activeLocale.toUpperCase()})</label>
                  <input
                    {...register(`translations.${activeIdx}.subtitle`)}
                    className="w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">材质</label>
                  <input {...register(`translations.${activeIdx}.material`)} className="w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">重量</label>
                  <input {...register(`translations.${activeIdx}.weight`)} className="w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">尺寸</label>
                  <input {...register(`translations.${activeIdx}.dimensions`)} className="w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">防水深度</label>
                  <input {...register(`translations.${activeIdx}.waterproof_depth`)} className="w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">频率范围</label>
                  <input {...register(`translations.${activeIdx}.frequency_range`)} className="w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
              </div>

              {/* Features */}
              <ArrayEditor field="features" label="产品特性" />

              {/* Benefits */}
              <ArrayEditor field="benefits" label="卖点/优势" />

              {/* Procurement notes */}
              <ArrayEditor field="procurement_notes" label="采购备注" />

              {/* Description HTML */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">描述 (HTML)</label>
                <textarea
                  {...register(`translations.${activeIdx}.description_html`)}
                  rows={5}
                  className="w-full px-3 py-2.5 rounded-lg border text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="<p>产品描述...</p>"
                />
              </div>
            </div>
          )}
        </section>

        {/* Technical Specs */}
        <section className="bg-white rounded-xl border p-6 space-y-4">
          <h2 className="font-semibold text-slate-900 text-lg">技术规格</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {SPEC_FIELDS.map(([key, label]) => (
              <div key={key}>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
                <input
                  {...register(`specs.${key}`)}
                  className="w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            ))}
          </div>
        </section>

        {/* Related Products */}
        <section className="bg-white rounded-xl border p-6 space-y-4">
          <h2 className="font-semibold text-slate-900 text-lg">关联产品</h2>
          <div className="flex flex-wrap gap-2 mb-3">
            {relatedIds.map((rid) => {
              const p = productList.find((x) => x.id === rid);
              return (
                <span key={rid} className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary/5 text-primary rounded-lg text-sm">
                  {p?.name || rid}
                  <button type="button" onClick={() => setRelatedIds(relatedIds.filter((r) => r !== rid))} className="hover:text-red-500">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              );
            })}
          </div>
          <select
            value=""
            onChange={(e) => {
              if (e.target.value && !relatedIds.includes(e.target.value)) {
                setRelatedIds([...relatedIds, e.target.value]);
              }
            }}
            className="w-full max-w-xs px-3 py-2.5 rounded-lg border text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="">选择关联产品...</option>
            {productList.filter((p) => p.id !== id && !relatedIds.includes(p.id)).map((p) => (
              <option key={p.id} value={p.id}>{p.name} ({p.slug})</option>
            ))}
          </select>
        </section>
      </form>
    </div>
  );
}
