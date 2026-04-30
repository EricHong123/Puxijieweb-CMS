import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import api from '@/api/client';
import { useToast } from '@/lib/toast';
import { useKeyboardShortcuts } from '@/lib/useKeyboardShortcuts';
import { ArrowLeft, Save, Eye, Globe } from 'lucide-react';
import SeoSidebar from '@/components/SeoSidebar';

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
    },
  });

  const bodyMd = watch('body_markdown');

  useKeyboardShortcuts({ onSave: () => handleSubmit(onSubmit)() });

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
      });
    }
  }, [id, setValue]);

  const onSubmit = async (formData: any) => {
    setSaving(true);
    try {
      const payload = {
        ...formData,
        keywords: formData.keywords.split(',').map((k: string) => k.trim()).filter(Boolean),
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
        <button onClick={() => navigate('/news')} className="p-2 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-900">{isNew ? '新建文章' : '编辑文章'}</h1>
        </div>
        <button
          onClick={() => setPreview(!preview)}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium border ${preview ? 'bg-primary text-primary-foreground border-primary' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
        >
          <Eye className="h-4 w-4" />
          {preview ? '编辑' : '预览'}
        </button>
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
        <section className="bg-white rounded-xl border p-6 space-y-4">
          <h2 className="font-semibold text-slate-900 text-lg">文章信息</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Slug *</label>
              <input {...register('slug', { required: true })} className="w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="my-article" />
              {errors.slug && <p className="text-xs text-red-500 mt-1">必填</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">语言 *</label>
              <select {...register('locale', { required: true })} className="w-full px-3 py-2.5 rounded-lg border text-sm bg-white">
                {LOCALES.map((l) => <option key={l.key} value={l.key}>{l.label} ({l.key})</option>)}
              </select>
              {errors.locale && <p className="text-xs text-red-500 mt-1">必填</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">标题 *</label>
              <input {...register('title', { required: true })} className="w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              {errors.title && <p className="text-xs text-red-500 mt-1">必填</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">发布日期</label>
              <input type="date" {...register('date')} className="w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">描述</label>
              <textarea {...register('description')} rows={2} className="w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">关键词 (逗号分隔)</label>
              <input {...register('keywords')} className="w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="speaker, bluetooth, oem" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">头图 URL</label>
              <input {...register('hero_image_url')} className="w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="https://..." />
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="bg-white rounded-xl border overflow-hidden">
          <div className="px-6 py-4 border-b bg-slate-50 flex items-center gap-3">
            <h2 className="font-semibold text-slate-900 text-lg">正文 (Markdown)</h2>
            <span className="text-xs text-muted-foreground">支持 Markdown 语法</span>
          </div>
          {preview ? (
            <div className="p-6 prose prose-sm max-w-none min-h-[400px] bg-white">
              <pre className="whitespace-pre-wrap font-sans text-sm text-slate-700">{bodyMd || '(无内容)'}</pre>
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
        }}
      />
      </div>
    </div>
  );
}
