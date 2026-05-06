import { useEffect, useState } from 'react';
import api from '@/api/client';
import { X, Clock, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';

interface Version {
  id: string;
  version: number;
  created_at: string;
  entity_type: string;
  entity_id: string;
}

interface VersionDetail extends Version {
  snapshot: Record<string, unknown>;
}

interface Props {
  entityType: string;
  entityId: string;
  currentData?: Record<string, unknown>;
  onClose: () => void;
  onRollback?: (versionId: string) => void;
}

function diffJson(a: unknown, b: unknown): { added: string[]; removed: string[]; changed: { key: string; from: string; to: string }[] } {
  const added: string[] = [];
  const removed: string[] = [];
  const changed: { key: string; from: string; to: string }[] = [];

  const objA = (typeof a === 'object' && a !== null) ? a as Record<string, unknown> : {};
  const objB = (typeof b === 'object' && b !== null) ? b as Record<string, unknown> : {};

  const allKeys = new Set([...Object.keys(objA), ...Object.keys(objB)]);

  for (const key of allKeys) {
    if (key === 'id' || key === 'created_at' || key === 'updated_at') continue;
    if (!(key in objA)) {
      added.push(key);
    } else if (!(key in objB)) {
      removed.push(key);
    } else {
      const va = JSON.stringify(objA[key]);
      const vb = JSON.stringify(objB[key]);
      if (va !== vb) {
        changed.push({ key, from: String(objA[key]).substring(0, 200), to: String(objB[key]).substring(0, 200) });
      }
    }
  }

  return { added, removed, changed };
}

export default function VersionDiff({ entityType, entityId, currentData, onClose, onRollback }: Props) {
  const [versions, setVersions] = useState<Version[]>([]);
  const [loading, setLoading] = useState(true);
  const [leftVersion, setLeftVersion] = useState<VersionDetail | null>(null);
  const [rightVersion, setRightVersion] = useState<VersionDetail | null>(null);
  const [leftIdx, setLeftIdx] = useState(0);
  const [rightIdx, setRightIdx] = useState(-1); // -1 = current
  const [rollingBack, setRollingBack] = useState(false);

  useEffect(() => {
    const fetchVersions = async () => {
      const { data } = await api.get(`/versions/${entityType}/${entityId}`);
      if (data.success) {
        setVersions(data.data.items);
        // Load latest version as left
        if (data.data.items.length > 0) {
          const { data: detail } = await api.get(`/versions/${data.data.items[0].id}/detail`);
          if (detail.success) setLeftVersion(detail.data);
        }
      }
      setLoading(false);
    };
    fetchVersions();
  }, [entityType, entityId]);

  const selectLeft = async (idx: number) => {
    setLeftIdx(idx);
    const v = versions[idx];
    const { data } = await api.get(`/versions/${v.id}/detail`);
    if (data.success) setLeftVersion(data.data);
  };

  const selectRight = async (idx: number) => {
    setRightIdx(idx);
    if (idx === -1) {
      setRightVersion(null); // current data
    } else {
      const v = versions[idx];
      const { data } = await api.get(`/versions/${v.id}/detail`);
      if (data.success) setRightVersion(data.data);
    }
  };

  const rightData = rightVersion?.snapshot || currentData || {};
  const leftData = leftVersion?.snapshot || {};

  const diff = diffJson(leftData, rightData);

  const handleRollback = async () => {
    if (!leftVersion) return;
    if (!confirm(`确定回滚到版本 ${leftVersion.version}？当前更改将先被保存为一个新版本。`)) return;
    setRollingBack(true);
    try {
      const { data } = await api.post(`/versions/${leftVersion.id}/rollback`);
      if (data.success) {
        onRollback?.(leftVersion.id);
        onClose();
      }
    } finally {
      setRollingBack(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-warm-charcoal/20 backdrop-blur-sm">
      <div className="bg-[hsl(var(--card))] rounded-xl border shadow-xl w-[90vw] max-w-5xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-warm-charcoal-muted" />
            <h2 className="font-semibold text-lg text-warm-charcoal">版本对比</h2>
            {versions.length > 0 && (
              <span className="text-sm text-muted-foreground">{versions.length} 个历史版本</span>
            )}
          </div>
          <button onClick={onClose} className="p-1.5 text-warm-charcoal-muted hover:text-warm-charcoal rounded-lg hover:bg-[hsl(var(--secondary))]">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Version selectors */}
        <div className="flex items-stretch border-b">
          <div className="flex-1 px-4 py-3 border-r">
            <label className="text-xs font-medium text-warm-charcoal mb-1.5 block">版本 A (旧)</label>
            <select
              value={leftIdx}
              onChange={(e) => selectLeft(parseInt(e.target.value))}
              className="w-full px-3 py-2 rounded-lg border text-sm bg-white"
            >
              {versions.map((v, i) => (
                <option key={v.id} value={i}>
                  v{v.version} — {new Date(v.created_at).toLocaleString('zh-CN')}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center px-2 text-warm-charcoal-muted">
            <ChevronRight className="h-5 w-5" />
          </div>
          <div className="flex-1 px-4 py-3">
            <label className="text-xs font-medium text-warm-charcoal mb-1.5 block">版本 B (新)</label>
            <select
              value={rightIdx}
              onChange={(e) => selectRight(parseInt(e.target.value))}
              className="w-full px-3 py-2 rounded-lg border text-sm bg-white"
            >
              <option value={-1}>当前版本 (未保存)</option>
              {versions.map((v, i) => (
                <option key={v.id} value={i}>
                  v{v.version} — {new Date(v.created_at).toLocaleString('zh-CN')}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Diff content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="py-8 text-center text-muted-foreground text-sm">加载中...</div>
          ) : versions.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground text-sm">暂无历史版本</div>
          ) : (
            <div className="space-y-4">
              {diff.changed.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-pastel-amber">已修改 ({diff.changed.length})</h3>
                  {diff.changed.map((c) => (
                    <div key={c.key} className="border rounded-lg overflow-hidden">
                      <div className="px-3 py-1.5 bg-[hsl(var(--secondary))] text-xs font-medium text-warm-charcoal">
                        {c.key}
                      </div>
                      <div className="grid grid-cols-2 divide-x">
                        <div className="px-3 py-2 bg-pastel-rose/5">
                          <div className="text-[10px] text-warm-charcoal-muted mb-0.5">旧值</div>
                          <div className="text-xs text-warm-charcoal font-mono whitespace-pre-wrap break-all">{c.from || '(空)'}</div>
                        </div>
                        <div className="px-3 py-2 bg-pastel-green/5">
                          <div className="text-[10px] text-warm-charcoal-muted mb-0.5">新值</div>
                          <div className="text-xs text-warm-charcoal font-mono whitespace-pre-wrap break-all">{c.to || '(空)'}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {diff.added.length > 0 && (
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold text-pastel-green">新增字段 ({diff.added.length})</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {diff.added.map((k) => (
                      <span key={k} className="px-2 py-0.5 bg-pastel-green/8 text-pastel-green rounded text-xs font-mono">{k}</span>
                    ))}
                  </div>
                </div>
              )}

              {diff.removed.length > 0 && (
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold text-pastel-rose">删除字段 ({diff.removed.length})</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {diff.removed.map((k) => (
                      <span key={k} className="px-2 py-0.5 bg-pastel-rose/8 text-pastel-rose rounded text-xs font-mono">{k}</span>
                    ))}
                  </div>
                </div>
              )}

              {diff.changed.length === 0 && diff.added.length === 0 && diff.removed.length === 0 && (
                <div className="py-8 text-center text-muted-foreground text-sm">两个版本之间没有差异</div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t bg-[hsl(var(--secondary))]">
          <p className="text-xs text-muted-foreground">
            选择版本 A 并点击"回滚到此版本"可恢复历史数据
          </p>
          <button
            onClick={handleRollback}
            disabled={!leftVersion || rollingBack}
            className="inline-flex items-center gap-2 px-4 py-2 bg-pastel-amber/90 text-amber-900 rounded-lg text-sm font-medium hover:bg-pastel-amber disabled:opacity-50"
          >
            <RotateCcw className="h-4 w-4" />
            {rollingBack ? '回滚中...' : `回滚到版本 ${leftVersion?.version || ''}`}
          </button>
        </div>
      </div>
    </div>
  );
}
