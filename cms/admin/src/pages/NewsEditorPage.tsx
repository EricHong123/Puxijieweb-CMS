import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import api from '@/api/client';
import { useToast } from '@/lib/toast';
import { useKeyboardShortcuts } from '@/lib/useKeyboardShortcuts';
import { ArrowLeft, Save, Eye, Globe, Tag, ChevronDown, History } from 'lucide-react';
import SeoSidebar from '@/components/SeoSidebar';
import VersionDiff from '@/components/VersionDiff';

const LOCALES = [
  { key: 'en', label: 'English' },
  { key: 'fr', label: 'Français' },
  { key: 'vi', label: 'Tiếng Việt' },
];

export default function NewsEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const isNew = !id;
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(false);
  const [categories, setCategories] = useState<{ id: string; slug: string; name: string }[]>([]);
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [seoOpen, setSeoOpen] = useState(false);
  const [showVersionDiff, setShowVersionDiff] = useState(false);

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm({
    defaultValues: {
      slug: '',
      locale: 'en' as string,
      title: '',
      description: '',
      body_markdown: '',
      date: new Date().toISOString().split('T')[0],
      keywords: '',
      hero_image_url: '',
      og_title: '',
      og_description: '',
      og_image_url: '',
      canonical_url: '',
      noindex: false,
    },
  });

  const bodyMd = watch('body_markdown');

  useKeyboardShortcuts({ onSave: () => handleSubmit(onSubmit)() });

  useEffect(() => {
    api.get('/news-categories', { params: { locale: 'en' } }).then(({ data }) => {
      if (data.success) setCategories(data.data);
    });
  }, []);

  useEffect(() => {
    if (id) {
      api.get(`/news/${id}`).then(({ data }) => {
        if (!data.success) return;
        const a = data.data;
        setValue('slug', a.slug);
        setValue('locale', a.locale);
        setValue('title', a.title);
        setValue('description', a.description || '');
        setValue('body_markdown', a.body_markdown || '');
        setValue('date', a.date || '');
        setValue('keywords', (a.keywords || []).join(', '));
        setValue('hero_image_url', a.hero_image_url || '');
        setValue('og_title', a.og_title || '');
        setValue('og_description', a.og_description || '');
        setValue('og_image_url', a.og_image_url || '');
        setValue('canonical_url', a.canonical_url || '');
        setValue('noindex', a.noindex || false);
        setCategoryIds(a.category_ids || []);
      });
    }
  }, [id, setValue]);

  const onSubmit = async (formData: any) => {
    setSaving(true);
    try {
      const payload = {
        ...formData,
        keywords: formData.keywords.split(',').map((k: string) => k.trim()).filter(Boolean),
        category_ids: categoryIds,
      };

      if (isNew) {
        const { data } = await api.post('/news', payload);
        if (data.success) navigate(`/news`);
      } else {
        await api.put(`/news/${id}`, payload);
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
        <button onClick={() => navigate('/news')} className="p-2 text-warm-charcoal-muted hover:text-warm-charcoal rounded-lg hover:bg-[hsl(var(--secondary))]">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-warm-charcoal">{isNew ? '新建文章' : '编辑文章'}</h1>
        </div>
        <button
          onClick={() => setPreview(!preview)}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium border ${preview ? 'bg-primary text-primary-foreground border-primary' : 'bg-[hsl(var(--card))] text-warm-charcoal-muted border-[hsl(var(--border))] hover:bg-[hsl(var(--secondary))]'}`}
        >
          <Eye className="h-4 w-4" />
          {preview ? '编辑' : '预览'}
        </button>
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
        {/* Meta fields */}
        <section className="bg-[hsl(var(--card))] rounded-xl border p-6 space-y-4">
          <h2 className="font-semibold text-warm-charcoal text-lg">文章信息</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-warm-charcoal mb-1.5">Slug *</label>
              <input {...register('slug', { required: true })} className="w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="my-article" />
              {errors.slug && <p className="text-xs text-red-500 mt-1">必填</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-warm-charcoal mb-1.5">语言 *</label>
              <select {...register('locale', { required: true })} className="w-full px-3 py-2.5 rounded-lg border text-sm bg-white">
                {LOCALES.map((l) => <option key={l.key} value={l.key}>{l.label} ({l.key})</option>)}
              </select>
              {errors.locale && <p className="text-xs text-red-500 mt-1">必填</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-warm-charcoal mb-1.5">标题 *</label>
              <input {...register('title', { required: true })} className="w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              {errors.title && <p className="text-xs text-red-500 mt-1">必填</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-warm-charcoal mb-1.5">发布日期</label>
              <input type="date" {...register('date')} className="w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-warm-charcoal mb-1.5">描述</label>
              <textarea {...register('description')} rows={2} className="w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div>
              <label className="block text-sm font-medium text-warm-charcoal mb-1.5">关键词 (逗号分隔)</label>
              <input {...register('keywords')} className="w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="speaker, bluetooth, oem" />
            </div>
            <div>
              <label className="block text-sm font-medium text-warm-charcoal mb-1.5">头图 URL</label>
              <input {...register('hero_image_url')} className="w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="https://..." />
            </div>
          </div>
          {categories.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-warm-charcoal mb-2 flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5" />分类
              </label>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => {
                  const selected = categoryIds.includes(cat.id);
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategoryIds((prev) =>
                        selected ? prev.filter((id) => id !== cat.id) : [...prev, cat.id]
                      )}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                        selected
                          ? 'bg-pastel-blue/10 text-pastel-blue border-pastel-blue/30'
                          : 'bg-[hsl(var(--card))] text-warm-charcoal-muted border-[hsl(var(--border))] hover:border-pastel-blue/30'
                      }`}
                    >
                      {cat.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </section>

        {/* SEO Settings */}
        <section className="bg-[hsl(var(--card))] rounded-xl border overflow-hidden">
          <button
            type="button"
            onClick={() => setSeoOpen(!seoOpen)}
            className="w-full flex items-center justify-between px-6 py-4 bg-[hsl(var(--secondary))] hover:bg-[hsl(var(--secondary))]/80 transition-colors"
          >
            <h2 className="font-semibold text-warm-charcoal text-lg">SEO 设置</h2>
            <ChevronDown className={`h-4 w-4 text-warm-charcoal-muted transition-transform ${seoOpen ? 'rotate-180' : ''}`} />
          </button>
          {seoOpen && (
            <div className="p-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-warm-charcoal mb-1">OG 标题</label>
                  <input {...register('og_title')} className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="社交分享标题，留空则使用文章标题" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-warm-charcoal mb-1">OG 图片 URL</label>
                  <input {...register('og_image_url')} className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="https://..." />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-warm-charcoal mb-1">OG 描述</label>
                <textarea {...register('og_description')} rows={2} className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="社交分享描述，留空则使用文章描述" />
              </div>
              <div>
                <label className="block text-xs font-medium text-warm-charcoal mb-1">Canonical URL</label>
                <input {...register('canonical_url')} className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="https://puxijietech.com/news/article" />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" {...register('noindex')} className="rounded border-[hsl(var(--border))] text-pastel-amber focus:ring-pastel-amber/30" />
                <span className="text-sm text-warm-charcoal-muted">noindex — 告诉搜索引擎不要索引此文章</span>
              </label>
            </div>
          )}
        </section>

        {/* Content */}
        <section className="bg-[hsl(var(--card))] rounded-xl border overflow-hidden">
          <div className="px-6 py-4 border-b bg-[hsl(var(--secondary))] flex items-center gap-3">
            <h2 className="font-semibold text-warm-charcoal text-lg">正文 (Markdown)</h2>
            <span className="text-xs text-muted-foreground">支持 Markdown 语法</span>
          </div>
          {preview ? (
            <div className="p-6 prose prose-sm max-w-none min-h-[400px] bg-white">
              <pre className="whitespace-pre-wrap font-sans text-sm text-warm-charcoal">{bodyMd || '(无内容)'}</pre>
            </div>
          ) : (
            <textarea
              {...register('body_markdown')}
              rows={20}
              className="w-full px-6 py-4 text-sm font-mono border-0 focus:outline-none focus:ring-0 resize-y min-h-[400px]"
              placeholder={`# 文章标题\n\n文章正文内容...\n\n## 二级标题\n\n- 列表项 1\n- 列表项 2`}
            />
          )}
        </section>
      </form>
      <SeoSidebar
        feedback={{
          title: watch('title'),
          metaDescription: watch('description'),
          ogTitle: watch('og_title'),
          ogDescription: watch('og_description'),
          ogImageUrl: watch('og_image_url'),
          canonicalUrl: watch('canonical_url'),
          noindex: watch('noindex'),
        }}
      />
      </div>

      {showVersionDiff && id && (
        <VersionDiff
          entityType="news"
          entityId={id}
          onClose={() => setShowVersionDiff(false)}
          onRollback={() => window.location.reload()}
        />
      )}
    </div>
  );
}
