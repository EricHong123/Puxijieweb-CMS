import { cn } from '@/lib/utils';

interface SeoFeedback {
  metaDescription?: string;
  hasImages?: boolean;
  imagesWithAlt?: number;
  totalImages?: number;
  title?: string;
}

interface Props {
  feedback: SeoFeedback;
}

function SeoLine({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className={cn('inline-block w-2 h-2 rounded-full shrink-0', ok ? 'bg-emerald-500' : 'bg-amber-500')} />
      <span className={ok ? 'text-emerald-700' : 'text-amber-700'}>{label}</span>
    </div>
  );
}

function CharGauge({ current, min, max, label }: { current: number; min: number; max: number; label: string }) {
  const ok = current >= min && current <= max;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-slate-500">{label}</span>
        <span className={cn('font-medium', ok ? 'text-emerald-600' : current > max ? 'text-red-500' : 'text-amber-600')}>
          {current} 字
        </span>
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all', ok ? 'bg-emerald-500' : current > max ? 'bg-red-400' : 'bg-amber-400')}
          style={{ width: `${Math.min(100, (current / max) * 100)}%` }}
        />
      </div>
      <div className="text-[10px] text-slate-400">
        {current < min ? `建议至少 ${min} 字` : current > max ? `建议不超过 ${max} 字` : `${min}-${max} 字范围内 ✓`}
      </div>
    </div>
  );
}

export default function SeoSidebar({ feedback }: Props) {
  const checks = [
    { ok: !!feedback.title && feedback.title.length >= 3, label: '有标题 (≥3字)' },
    { ok: !!feedback.metaDescription && feedback.metaDescription.length >= 50, label: 'Meta 描述 ≥50字' },
    { ok: !feedback.hasImages || (feedback.totalImages === feedback.imagesWithAlt), label: '图片有 alt 文本' },
    { ok: !!feedback.metaDescription, label: '有 Meta 描述' },
  ];

  return (
    <aside className="w-56 shrink-0 space-y-4">
      <div className="bg-white rounded-xl border p-4 space-y-3">
        <h3 className="font-semibold text-sm text-slate-800">SEO 检查</h3>
        <div className="space-y-2">
          {checks.map((c, i) => (
            <SeoLine key={i} ok={c.ok} label={c.label} />
          ))}
        </div>
      </div>

      {feedback.metaDescription !== undefined && (
        <div className="bg-white rounded-xl border p-4">
          <CharGauge
            current={feedback.metaDescription?.length || 0}
            min={120}
            max={160}
            label="Meta 描述长度"
          />
        </div>
      )}

      {feedback.hasImages && (
        <div className="bg-white rounded-xl border p-4 space-y-2">
          <h3 className="font-semibold text-sm text-slate-800">图片 SEO</h3>
          <div className="text-xs text-slate-500">
            {feedback.totalImages} 张图片，{feedback.imagesWithAlt} 张有 alt
          </div>
        </div>
      )}

      <div className="bg-blue-50 rounded-xl border border-blue-200 p-4">
        <h3 className="font-semibold text-sm text-blue-800 mb-1">SEO 提示</h3>
        <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
          <li>标题 30-60 字效果最佳</li>
          <li>描述 120-160 字适合摘要</li>
          <li>每张图片应有 alt 文本</li>
          <li>URL 简短且有描述性更佳</li>
        </ul>
      </div>
    </aside>
  );
}
