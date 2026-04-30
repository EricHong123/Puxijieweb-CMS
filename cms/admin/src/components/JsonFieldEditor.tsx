import { useState } from 'react';

interface FieldDef {
  key: string;
  label: string;
  placeholder?: string;
}

// Known schemas for site settings JSON fields
const SCHEMAS: Record<string, FieldDef[]> = {
  contact_info: [
    { key: 'email', label: 'Email', placeholder: 'info@example.com' },
    { key: 'phone', label: '电话', placeholder: '+86-755-xxxx' },
    { key: 'address', label: '地址', placeholder: '深圳市...' },
    { key: 'whatsapp', label: 'WhatsApp', placeholder: '+86-...' },
  ],
  social_links: [
    { key: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/...' },
    { key: 'facebook', label: 'Facebook', placeholder: 'https://facebook.com/...' },
    { key: 'linkedin', label: 'LinkedIn', placeholder: 'https://linkedin.com/...' },
    { key: 'youtube', label: 'YouTube', placeholder: 'https://youtube.com/...' },
    { key: 'wechat_qr', label: '微信二维码 URL', placeholder: 'https://...' },
  ],
  seo_defaults: [
    { key: 'default_title', label: '默认标题', placeholder: 'Puxijie — ...' },
    { key: 'default_description', label: '默认描述', placeholder: '...' },
    { key: 'default_keywords', label: '默认关键词 (逗号分隔)', placeholder: 'bluetooth speaker, oem, ...' },
    { key: 'og_image', label: 'OG 图片 URL', placeholder: 'https://...' },
  ],
  theme: [
    { key: 'primary_color', label: '主色', placeholder: '#0078D4' },
    { key: 'font_family', label: '字体', placeholder: 'Inter, sans-serif' },
  ],
};

interface Props {
  settingKey: string;
  value: Record<string, any>;
  onChange: (value: Record<string, any>) => void;
}

export default function JsonFieldEditor({ settingKey, value, onChange }: Props) {
  const [rawMode, setRawMode] = useState(false);
  const [rawText, setRawText] = useState(JSON.stringify(value || {}, null, 2));
  const [parseError, setParseError] = useState('');

  const fields = SCHEMAS[settingKey];

  if (!fields) {
    // Unknown JSON key — fallback to raw textarea
    return (
      <div>
        <textarea
          value={typeof value === 'string' ? value : JSON.stringify(value || {}, null, 2)}
          onChange={(e) => {
            try { onChange(JSON.parse(e.target.value)); setParseError(''); } catch { setParseError('JSON 格式错误'); }
          }}
          rows={6}
          className="w-full px-3 py-2 rounded-lg border text-sm font-mono bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]/30 focus:border-[hsl(var(--ring))] transition-colors resize-y"
        />
        {parseError && <p className="text-xs text-red-500 mt-1">{parseError}</p>}
      </div>
    );
  }

  if (rawMode) {
    return (
      <div className="space-y-2">
        <textarea
          value={rawText}
          onChange={(e) => {
            setRawText(e.target.value);
            try { onChange(JSON.parse(e.target.value)); setParseError(''); } catch { setParseError('JSON 格式错误'); }
          }}
          rows={8}
          className="w-full px-3 py-2 rounded-lg border text-sm font-mono bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]/30 focus:border-[hsl(var(--ring))] transition-colors resize-y"
        />
        {parseError && <p className="text-xs text-red-500">{parseError}</p>}
        <button type="button" onClick={() => { setRawMode(false); setRawText(JSON.stringify(value || {}, null, 2)); }} className="text-xs text-primary hover:underline">
          切换到结构化编辑
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        {fields.map((f) => (
          <div key={f.key}>
            <label className="block text-xs font-medium text-slate-600 mb-1">{f.label}</label>
            <input
              type="text"
              value={value?.[f.key] || ''}
              onChange={(e) => {
                const next = { ...value, [f.key]: e.target.value };
                if (!e.target.value) delete next[f.key];
                onChange(next);
              }}
              placeholder={f.placeholder}
              className="w-full px-3 py-2 rounded-lg border text-sm bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]/30 focus:border-[hsl(var(--ring))] transition-colors"
            />
          </div>
        ))}
      </div>
      <button type="button" onClick={() => { setRawText(JSON.stringify(value || {}, null, 2)); setRawMode(true); }} className="text-xs text-slate-400 hover:text-slate-600">
        切换到 JSON 编辑
      </button>
    </div>
  );
}
