import { useEffect, useState } from 'react';
import api from '@/api/client';
import { Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardTitle } from '@/components/ui/card';

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
        <h1 className="text-2xl font-bold text-slate-800">网站设置</h1>
        <p className="text-sm text-slate-500 mt-1">管理全局网站配置</p>
      </div>

      <div className="space-y-4">
        {SETTINGS_KEYS.map((sk) => (
          <Card key={sk.key} padding="lg">
            <div className="flex items-center justify-between mb-3">
              <CardTitle className="mb-0">{sk.label}</CardTitle>
              <Button size="sm" onClick={() => handleSave(sk.key)} disabled={saving[sk.key]}>
                <Save className="h-3 w-3" />
                {saving[sk.key] ? '保存中...' : '保存'}
              </Button>
            </div>
            {sk.type === 'json' ? (
              <textarea
                value={typeof settings[sk.key] === 'string' ? settings[sk.key] : JSON.stringify(settings[sk.key] || {}, null, 2)}
                onChange={(e) => {
                  try { setSettings({ ...settings, [sk.key]: JSON.parse(e.target.value) }); } catch {}
                }}
                rows={6}
                className="w-full px-3 py-2 rounded-lg border text-sm font-mono bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]/30 focus:border-[hsl(var(--ring))] transition-colors resize-y"
                placeholder="{}"
              />
            ) : (
              <Input
                type="text"
                value={settings[sk.key] || ''}
                onChange={(e) => setSettings({ ...settings, [sk.key]: e.target.value })}
              />
            )}
            <div className="text-xs text-slate-400 mt-1.5">key: {sk.key}</div>
          </Card>
        ))}
      </div>
    </div>
  );
}
