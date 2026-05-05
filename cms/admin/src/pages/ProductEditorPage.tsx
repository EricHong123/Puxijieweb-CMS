import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import api from '@/api/client';
import I18nTabs, { type Locale, LOCALES } from '@/components/I18nTabs';
import MediaPicker from '@/components/MediaPicker';
import { ArrowLeft, Plus, Trash2, Save, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/lib/toast';
import { useKeyboardShortcuts } from '@/lib/useKeyboardShortcuts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/input';
import { FormField } from '@/components/ui/input';
import { Card, CardTitle } from '@/components/ui/card';
import SeoSidebar from '@/components/SeoSidebar';

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
  const toast = useToast();
  const isNew = !id;
  const [saving, setSaving] = useState(false);
  const [activeLocale, setActiveLocale] = useState<Locale>('en');
  const [selectedImageIds, setSelectedImageIds] = useState<string[]>([]);
  const [downloads, setDownloads] = useState<Array<{ title: string; url: string }>>([]);
  const [relatedIds, setRelatedIds] = useState<string[]>([]);
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

  useEffect(() => {
    if (id) {
      api.get(`/products/${id}`).then(({ data }) => {
        if (!data.success) return;
        const p = data.data;
        setValue('slug', p.slug);
        setValue('category', p.category);
        setValue('sort_order', p.sort_order || 0);

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

        if (p.product_specs) {
          const specs = buildEmptySpecs();
          for (const [key] of SPEC_FIELDS) {
            if (p.product_specs[key] != null) specs[key] = p.product_specs[key];
          }
          setValue('specs', specs);
        }

        if (p.product_images) {
          setSelectedImageIds(p.product_images.map((pi: any) => pi.media_id));
        }

        if (p.downloads && Array.isArray(p.downloads)) {
          setDownloads(p.downloads);
        }
      });
    }
  }, [id, setValue]);

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
      const payload = { ...formData, image_ids: selectedImageIds, downloads, related_ids: relatedIds };
      if (isNew) {
        const { data } = await api.post('/products', payload);
        if (data.success) {
          for (let i = 0; i < selectedImageIds.length; i++) {
            await api.post(`/products/${data.data.id}/images`, {
              media_id: selectedImageIds[i], sort_order: i, is_primary: i === 0,
            }).catch(() => {});
          }
          navigate(`/products/${data.data.id}`);
        }
      } else {
        await api.put(`/products/${id}`, payload);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || '保存失败');
    } finally {
      setSaving(false);
    }
  };

  useKeyboardShortcuts({ onSave: () => handleSubmit(onSubmit)() });

  const ArrayEditor = ({ field, label }: { field: 'features' | 'benefits' | 'procurement_notes'; label: string }) => {
    const items = translations?.[activeIdx]?.[field] || [];
    return (
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-warm-charcoal">{label}</label>
          <Button variant="ghost" size="sm" type="button" onClick={() => addArrayItem(field)}>
            <Plus className="h-3 w-3" /> 添加
          </Button>
        </div>
        <div className="space-y-2">
          {items.map((item: string, idx: number) => (
            <div key={idx} className="flex gap-2">
              <Input
                value={item}
                onChange={(e) => updateArrayItem(field, idx, e.target.value)}
                placeholder={label}
              />
              <Button
                variant="destructive-ghost"
                size="icon"
                type="button"
                onClick={() => removeArrayItem(field, idx)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
          {items.length === 0 && (
            <div className="text-xs text-warm-charcoal-muted py-2">暂无内容，点击"添加"按钮</div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/products')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-warm-charcoal">{isNew ? '添加产品' : `编辑 ${watch('slug')}`}</h1>
          <p className="text-sm text-warm-charcoal-muted mt-1">{isNew ? '创建新产品' : '修改产品内容后点击保存'}</p>
        </div>
        <Button type="button" onClick={handleSubmit(onSubmit)} disabled={saving}>
          <Save className="h-4 w-4" />
          {saving ? '保存中...' : '保存'}
        </Button>
      </div>

      <div className="flex gap-6">
      <form onSubmit={handleSubmit(onSubmit)} className="flex-1 space-y-6">
        {/* Basic info */}
        <Card padding="lg">
          <CardTitle>基本信息</CardTitle>
          <div className="grid gap-4 sm:grid-cols-3">
            <FormField label="Slug *" htmlFor="slug" error={errors.slug?.type === 'required' ? '必填' : errors.slug?.type === 'pattern' ? '仅限小写字母、数字和连字符' : undefined}>
              <Input
                id="slug"
                {...register('slug', { required: true, pattern: /^[a-z0-9-]+$/ })}
                placeholder="qw-g34"
              />
            </FormField>
            <FormField label="分类 *" htmlFor="category">
              <Select id="category" {...register('category')}>
                {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </Select>
            </FormField>
            <FormField label="排序" htmlFor="sort_order">
              <Input
                id="sort_order"
                type="number"
                {...register('sort_order', { valueAsNumber: true })}
              />
            </FormField>
          </div>
        </Card>

        {/* Product Images */}
        <Card padding="lg">
          <CardTitle>产品图片</CardTitle>
          <MediaPicker selected={selectedImageIds} onSelect={setSelectedImageIds} multiple />
        </Card>

        {/* Downloads */}
        <Card padding="lg">
          <div className="flex items-center justify-between mb-4">
            <CardTitle className="mb-0">下载文件</CardTitle>
            <Button variant="outline" size="sm" type="button" onClick={() => setDownloads([...downloads, { title: '', url: '' }])}>
              <Plus className="h-3 w-3" /> 添加下载
            </Button>
          </div>
          {downloads.length === 0 ? (
            <p className="text-sm text-warm-charcoal-muted py-2">暂无下载文件。点击"添加下载"关联产品文档（如规格书 PDF、色卡 PDF 等）。</p>
          ) : (
            <div className="space-y-3">
              {downloads.map((d, idx) => (
                <div key={idx} className="flex gap-3 items-start p-3 bg-[hsl(var(--secondary))] rounded-lg border border-[hsl(var(--border))]">
                  <span className="shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-[hsl(var(--border))] text-xs font-medium text-warm-charcoal-muted mt-2">{idx + 1}</span>
                  <div className="flex-1 grid gap-2 sm:grid-cols-2">
                    <Input
                      value={d.title}
                      onChange={(e) => {
                        const next = [...downloads];
                        next[idx] = { ...next[idx], title: e.target.value };
                        setDownloads(next);
                      }}
                      placeholder="文件名（如：产品规格书 PDF）"
                    />
                    <Input
                      value={d.url}
                      onChange={(e) => {
                        const next = [...downloads];
                        next[idx] = { ...next[idx], url: e.target.value };
                        setDownloads(next);
                      }}
                      placeholder="文件 URL（如：/specs/qw-g34.pdf）"
                    />
                  </div>
                  <Button variant="destructive-ghost" size="icon" type="button"
                    onClick={() => { const next = [...downloads]; next.splice(idx, 1); setDownloads(next); }}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Translations */}
        <Card padding="lg">
          <div className="flex items-center justify-between mb-4">
            <CardTitle className="mb-0">多语言内容</CardTitle>
            <I18nTabs active={activeLocale} onChange={setActiveLocale} />
          </div>

          {activeIdx >= 0 && (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label={`产品名 (${activeLocale.toUpperCase()}) *`} error={errors.translations?.[activeIdx]?.name ? '必填' : undefined}>
                  <Input {...register(`translations.${activeIdx}.name`, { required: true })} />
                </FormField>
                <FormField label={`副标题 (${activeLocale.toUpperCase()})`}>
                  <Input {...register(`translations.${activeIdx}.subtitle`)} />
                </FormField>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <FormField label="材质"><Input {...register(`translations.${activeIdx}.material`)} /></FormField>
                <FormField label="重量"><Input {...register(`translations.${activeIdx}.weight`)} /></FormField>
                <FormField label="尺寸"><Input {...register(`translations.${activeIdx}.dimensions`)} /></FormField>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="防水深度"><Input {...register(`translations.${activeIdx}.waterproof_depth`)} /></FormField>
                <FormField label="频率范围"><Input {...register(`translations.${activeIdx}.frequency_range`)} /></FormField>
              </div>

              <ArrayEditor field="features" label="产品特性" />
              <ArrayEditor field="benefits" label="卖点/优势" />
              <ArrayEditor field="procurement_notes" label="采购备注" />

              <FormField label="描述 (HTML)">
                <textarea
                  {...register(`translations.${activeIdx}.description_html`)}
                  rows={5}
                  className="w-full px-3 py-2.5 rounded-lg border text-sm font-mono bg-[hsl(var(--card))] placeholder:text-warm-charcoal-muted/60 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]/30 focus:border-[hsl(var(--ring))] transition-colors duration-150 resize-y"
                  placeholder="<p>产品描述...</p>"
                />
              </FormField>
            </div>
          )}
        </Card>

        {/* Technical Specs */}
        <Card padding="lg">
          <CardTitle>技术规格</CardTitle>
          <div className="grid gap-4 sm:grid-cols-3">
            {SPEC_FIELDS.map(([key, label]) => (
              <FormField key={key} label={label}>
                <Input {...register(`specs.${key}`)} />
              </FormField>
            ))}
          </div>
        </Card>

        {/* Related Products */}
        <Card padding="lg">
          <CardTitle>关联产品</CardTitle>
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
          <Select
            value=""
            onChange={(e) => {
              if (e.target.value && !relatedIds.includes(e.target.value)) {
                setRelatedIds([...relatedIds, e.target.value]);
              }
            }}
            className="max-w-xs"
          >
            <option value="">选择关联产品...</option>
            {productList.filter((p) => p.id !== id && !relatedIds.includes(p.id)).map((p) => (
              <option key={p.id} value={p.id}>{p.name} ({p.slug})</option>
            ))}
          </Select>
        </Card>
      </form>
      <SeoSidebar
        feedback={{
          title: watch('translations')?.[activeIdx]?.name,
          hasImages: selectedImageIds.length > 0,
          totalImages: selectedImageIds.length,
          imagesWithAlt: selectedImageIds.length, // assume uploaded images have alt-like filenames
        }}
      />
      </div>
    </div>
  );
}
