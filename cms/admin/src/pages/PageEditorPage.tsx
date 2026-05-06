import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import api from '@/api/client';
import { useToast } from '@/lib/toast';
import { useKeyboardShortcuts } from '@/lib/useKeyboardShortcuts';
import I18nTabs, { type Locale, LOCALES } from '@/components/I18nTabs';
import { ArrowLeft, Save, Eye, ChevronDown, History } from 'lucide-react';
import SeoSidebar from '@/components/SeoSidebar';
import RichTextEditor from '@/components/RichTextEditor';
import VersionDiff from '@/components/VersionDiff';

const PAGE_TYPES = [
  { value: 'home', label: '首页' },
  { value: 'standard', label: '标准页' },
  { value: 'contact', label: '联系我们' },
];

function buildEmptyTranslations() {
  return LOCALES.map(({ key }) => ({
    locale: key,
    title: '',
    meta_description: '',
    hero_badge: '',
    headline_line1: '',
    headline_line2: '',
    headline_emphasis: '',
    subhead: '',
    body_json: '',
    og_title: '',
    og_description: '',
    og_image_url: '',
    canonical_url: '',
    noindex: false,
  }));
}

export default function PageEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const isNew = !id;
  const [saving, setSaving] = useState(false);
  const [activeLocale, setActiveLocale] = useState<Locale>('en');
  const [seoOpen, setSeoOpen] = useState(false);
  const [showVersionDiff, setShowVersionDiff] = useState(false);

  const { register, handleSubmit, reset, watch, setValue, getValues, formState: { errors } } = useForm({
    defaultValues: {
      slug: '',
      page_type: 'standard',
      translations: buildEmptyTranslations(),
    },
  });

  const activeIdx = LOCALES.findIndex((l) => l.key === activeLocale);

  useKeyboardShortcuts({ onSave: () => handleSubmit(onSubmit)() });

  useEffect(() => {
    if (id) {
      api.get(`/pages/${id}`).then(({ data }) => {
        if (!data.success) return;
        const p = data.data;
        setValue('slug', p.slug);
        setValue('page_type', p.page_type);

        const trs = buildEmptyTranslations();
        for (let i = 0; i < LOCALES.length; i++) {
          const t = p.page_translations?.find((t: any) => t.locale === LOCALES[i].key);
          if (t) {
            trs[i] = {
              locale: LOCALES[i].key,
              title: t.title || '',
              meta_description: t.meta_description || '',
              hero_badge: t.hero_badge || '',
              headline_line1: t.headline_line1 || '',
              headline_line2: t.headline_line2 || '',
              headline_emphasis: t.headline_emphasis || '',
              subhead: t.subhead || '',
              body_json: typeof t.body_json === 'string' ? t.body_json : JSON.stringify(t.body_json || {}, null, 2),
              og_title: t.og_title || '',
              og_description: t.og_description || '',
              og_image_url: t.og_image_url || '',
              canonical_url: t.canonical_url || '',
              noindex: t.noindex || false,
            };
          }
        }
        setValue('translations', trs);
      });
    }
  }, [id, setValue]);

  const onSubmit = async (formData: any) => {
    setSaving(true);
    try {
      // Parse body_json strings back to objects
      const payload = {
        ...formData,
        translations: formData.translations.map((t: any) => {
          let bodyJson = t.body_json;
          if (typeof bodyJson === 'string' && bodyJson.trim()) {
            try { bodyJson = JSON.parse(bodyJson); } catch { /* keep as string */ }
          }
          return { ...t, body_json: bodyJson };
        }),
      };

      if (isNew) {
        const { data } = await api.post('/pages', payload);
        if (data.success) navigate(`/pages/${data.data.id}`);
      } else {
        await api.put(`/pages/${id}`, payload);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || '保存失败');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/pages')} className="p-2 text-warm-charcoal-muted hover:text-warm-charcoal rounded-lg hover:bg-[hsl(var(--secondary))]">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-warm-charcoal">{isNew ? '新建页面' : `编辑: ${watch('slug')}`}</h1>
          <p className="text-sm text-muted-foreground mt-1">编辑页面内容和 SEO 信息</p>
        </div>
        {!isNew && (
          <button
            type="button"
            onClick={() => setShowVersionDiff(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[hsl(var(--card))] text-warm-charcoal-muted border border-[hsl(var(--border))] rounded-lg text-sm font-medium hover:bg-[hsl(var(--secondary))]"
          >
            <History className="h-4 w-4" />
            历史版本
          </button>
        )}
        <button
          onClick={handleSubmit(onSubmit)}
          disabled={saving}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {saving ? '保存中...' : '保存'}
        </button>
      </div>

      <div className="flex gap-6">
      <form className="flex-1 space-y-6">
        {/* Basic */}
        <section className="bg-[hsl(var(--card))] rounded-xl border p-6 space-y-4">
          <h2 className="font-semibold text-warm-charcoal text-lg">基本信息</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-warm-charcoal mb-1.5">Slug *</label>
              <input
                {...register('slug', { required: true })}
                className="w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="about-us"
              />
              {errors.slug && <p className="text-xs text-red-500 mt-1">必填</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-warm-charcoal mb-1.5">页面类型</label>
              <select {...register('page_type')} className="w-full px-3 py-2.5 rounded-lg border text-sm bg-white">
                {PAGE_TYPES.map((pt) => <option key={pt.value} value={pt.value}>{pt.label}</option>)}
              </select>
            </div>
          </div>
        </section>

        {/* Translations */}
        <section className="bg-[hsl(var(--card))] rounded-xl border p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-warm-charcoal text-lg">多语言内容</h2>
            <I18nTabs active={activeLocale} onChange={setActiveLocale} />
          </div>

          {activeIdx >= 0 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-warm-charcoal mb-1.5">
                  页面标题 ({activeLocale.toUpperCase()}) *
                </label>
                <input
                  {...register(`translations.${activeIdx}.title`, { required: true })}
                  className="w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                {errors.translations?.[activeIdx]?.title && <p className="text-xs text-red-500 mt-1">必填</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-warm-charcoal mb-1.5">Meta 描述</label>
                <textarea
                  {...register(`translations.${activeIdx}.meta_description`)}
                  rows={2}
                  className="w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              <div className="bg-pastel-amber/8 border border-amber-200 rounded-lg p-4 space-y-3">
                <h3 className="text-sm font-semibold text-amber-800">Hero 区域</h3>
                <div>
                  <label className="block text-xs font-medium text-amber-700 mb-1">Badge</label>
                  <input {...register(`translations.${activeIdx}.hero_badge`)} className="w-full px-3 py-2 rounded-lg border-amber-200 text-sm" />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-medium text-amber-700 mb-1">标题行 1</label>
                    <input {...register(`translations.${activeIdx}.headline_line1`)} className="w-full px-3 py-2 rounded-lg border-amber-200 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-amber-700 mb-1">标题行 2</label>
                    <input {...register(`translations.${activeIdx}.headline_line2`)} className="w-full px-3 py-2 rounded-lg border-amber-200 text-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-amber-700 mb-1">强调文字</label>
                  <input {...register(`translations.${activeIdx}.headline_emphasis`)} className="w-full px-3 py-2 rounded-lg border-amber-200 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-amber-700 mb-1">副标题</label>
                  <textarea {...register(`translations.${activeIdx}.subhead`)} rows={2} className="w-full px-3 py-2 rounded-lg border-amber-200 text-sm" />
                </div>
              </div>

              {/* SEO Settings */}
              <div className="border rounded-lg overflow-hidden">
                <button
                  type="button"
                  onClick={() => setSeoOpen(!seoOpen)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-[hsl(var(--secondary))] hover:bg-[hsl(var(--secondary))]/80 transition-colors"
                >
                  <span className="text-sm font-semibold text-warm-charcoal">SEO 设置</span>
                  <ChevronDown className={`h-4 w-4 text-warm-charcoal-muted transition-transform ${seoOpen ? 'rotate-180' : ''}`} />
                </button>
                {seoOpen && (
                  <div className="p-4 space-y-4 bg-[hsl(var(--card))]">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-xs font-medium text-warm-charcoal mb-1">OG 标题</label>
                        <input {...register(`translations.${activeIdx}.og_title`)} className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="社交分享标题，留空则使用页面标题" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-warm-charcoal mb-1">OG 图片 URL</label>
                        <input {...register(`translations.${activeIdx}.og_image_url`)} className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="https://..." />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-warm-charcoal mb-1">OG 描述</label>
                      <textarea {...register(`translations.${activeIdx}.og_description`)} rows={2} className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="社交分享描述，留空则使用 Meta 描述" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-warm-charcoal mb-1">Canonical URL</label>
                      <input {...register(`translations.${activeIdx}.canonical_url`)} className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="https://puxijietech.com/page" />
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" {...register(`translations.${activeIdx}.noindex`)} className="rounded border-[hsl(var(--border))] text-pastel-amber focus:ring-pastel-amber/30" />
                      <span className="text-sm text-warm-charcoal-muted">noindex — 告诉搜索引擎不要索引此页面</span>
                    </label>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-warm-charcoal mb-1.5">
                  正文内容
                </label>
                <RichTextEditor
                  content={watch(`translations.${activeIdx}.body_json`) || ''}
                  onChange={(json) => setValue(`translations.${activeIdx}.body_json`, json)}
                  placeholder="开始编辑页面内容..."
                />
              </div>
            </div>
          )}
        </section>
      </form>
      <SeoSidebar
        feedback={{
          title: watch('translations')?.[activeIdx]?.title,
          metaDescription: watch('translations')?.[activeIdx]?.meta_description,
          ogTitle: watch('translations')?.[activeIdx]?.og_title,
          ogDescription: watch('translations')?.[activeIdx]?.og_description,
          ogImageUrl: watch('translations')?.[activeIdx]?.og_image_url,
          canonicalUrl: watch('translations')?.[activeIdx]?.canonical_url,
          noindex: watch('translations')?.[activeIdx]?.noindex,
        }}
      />
      </div>

      {showVersionDiff && id && (
        <VersionDiff
          entityType="page"
          entityId={id}
          onClose={() => setShowVersionDiff(false)}
          onRollback={() => window.location.reload()}
        />
      )}
    </div>
  );
}
