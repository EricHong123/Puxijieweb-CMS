import { useEffect, useState } from 'react';
import api from '@/api/client';
import { Settings, Save } from 'lucide-react';

const SETTINGS_KEYS = [
  { key: 'site_name', label: '网站名称', type: 'text' },
  { key: 'site_origin', label: '网站域名', type: 'text' },
  { key: 'contact_info', label: '联系方式', type: 'json' },
  { key: 'social_links', label: '社交媒体链接', type: 'json' },
  { key: 'seo_defaults', label: 'SEO 默认设置', type: 'json' },
  { key: 'theme', label: '主题设置', type: 'json' },
  { key: 'google_analytics_id', label: 'GA 追踪 ID', type: 'text' },
];

export default function SiteSettingsPage() {
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});

  useEffect(() => {
    api.get('/site-settings').then(({ data }) => {
      if (data.success) {
        const map: Record<string, any> = {};
        data.data.forEach((s: any) => { map[s.key] = s.value; });
        setSettings(map);
      }
    });
  }, []);

  const handleSave = async (key: string) => {
    setSaving((prev) => ({ ...prev, [key]: true }));
    try {
      await api.put(`/site-settings/${key}`, { value: settings[key] });
    } catch (err: any) {
      alert('保存失败');
    } finally {
      setSaving((prev) => ({ ...prev, [key]: false }));
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">网站设置</h1>
        <p className="text-sm text-muted-foreground mt-1">管理全局网站配置</p>
      </div>

      <div className="space-y-4">
        {SETTINGS_KEYS.map((sk) => (
          <div key={sk.key} className="bg-white rounded-xl border p-5">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-semibold text-slate-900">{sk.label}</label>
              <button
                onClick={() => handleSave(sk.key)}
                disabled={saving[sk.key]}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-medium hover:opacity-90 disabled:opacity-50"
              >
                <Save className="h-3 w-3" />
                {saving[sk.key] ? '保存中...' : '保存'}
              </button>
            </div>
            {sk.type === 'json' ? (
              <textarea
                value={typeof settings[sk.key] === 'string' ? settings[sk.key] : JSON.stringify(settings[sk.key] || {}, null, 2)}
                onChange={(e) => {
                  try { setSettings({ ...settings, [sk.key]: JSON.parse(e.target.value) }); } catch {}
                }}
                rows={6}
                className="w-full px-3 py-2 rounded-lg border text-sm font-mono"
                placeholder="{}"
              />
            ) : (
              <input
                type="text"
                value={settings[sk.key] || ''}
                onChange={(e) => setSettings({ ...settings, [sk.key]: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border text-sm"
              />
            )}
            <div className="text-xs text-muted-foreground mt-1">key: {sk.key}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
