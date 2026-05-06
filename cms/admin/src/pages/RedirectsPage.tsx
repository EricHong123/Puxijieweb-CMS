import { useEffect, useState } from 'react';
import api from '@/api/client';
import { Plus, Edit3, Trash2, ToggleLeft, ToggleRight, ArrowRight } from 'lucide-react';
import { SkeletonList } from '@/components/SkeletonCard';

interface Redirect {
  id: string;
  source_path: string;
  target_path: string;
  status_code: number;
  is_active: boolean;
  created_at: string;
}

export default function RedirectsPage() {
  const [redirects, setRedirects] = useState<Redirect[]>([]);
  const [loading, setLoading] = useState(true);

  // Inline form
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Redirect | null>(null);
  const [sourcePath, setSourcePath] = useState('');
  const [targetPath, setTargetPath] = useState('');
  const [statusCode, setStatusCode] = useState(301);
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const { data } = await api.get('/redirects', { params: { limit: '100' } });
    if (data.success) setRedirects(data.data.items);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const resetForm = () => {
    setEditing(null);
    setShowForm(false);
    setSourcePath('');
    setTargetPath('');
    setStatusCode(301);
  };

  const openEdit = (r: Redirect) => {
    setEditing(r);
    setShowForm(true);
    setSourcePath(r.source_path);
    setTargetPath(r.target_path);
    setStatusCode(r.status_code);
  };

  const handleSave = async () => {
    if (!sourcePath || !targetPath) return;
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/redirects/${editing.id}`, {
          source_path: sourcePath,
          target_path: targetPath,
          status_code: statusCode,
        });
      } else {
        await api.post('/redirects', {
          source_path: sourcePath,
          target_path: targetPath,
          status_code: statusCode,
        });
      }
      resetForm();
      fetchData();
    } catch (err: any) {
      // error handled silently
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (r: Redirect) => {
    await api.put(`/redirects/${r.id}`, { is_active: !r.is_active });
    setRedirects((prev) => prev.map((rd) => rd.id === r.id ? { ...rd, is_active: !rd.is_active } : rd));
  };

  const handleDelete = async (id: string, source: string) => {
    if (!confirm(`确定删除跳转 "${source}"？`)) return;
    await api.delete(`/redirects/${id}`);
    setRedirects((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-warm-charcoal">301 跳转管理</h1>
          <p className="text-sm text-muted-foreground mt-1">{redirects.length} 条跳转规则</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          添加跳转
        </button>
      </div>

      {/* Inline form */}
      {showForm && (
        <div className="bg-[hsl(var(--card))] rounded-xl border p-5 space-y-4">
          <h3 className="font-semibold text-sm text-warm-charcoal">
            {editing ? '编辑跳转' : '新建跳转'}
          </h3>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-medium text-warm-charcoal mb-1">来源路径 *</label>
              <input
                value={sourcePath}
                onChange={(e) => setSourcePath(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="/old-page"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-warm-charcoal mb-1">目标路径 *</label>
              <input
                value={targetPath}
                onChange={(e) => setTargetPath(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="/new-page"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-warm-charcoal mb-1">状态码</label>
              <select
                value={statusCode}
                onChange={(e) => setStatusCode(parseInt(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border text-sm bg-white"
              >
                <option value={301}>301 (永久)</option>
                <option value={302}>302 (临时)</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50"
            >
              {saving ? '保存中...' : editing ? '更新' : '创建'}
            </button>
            <button onClick={resetForm} className="px-4 py-2 text-sm text-warm-charcoal-muted hover:text-warm-charcoal">
              取消
            </button>
          </div>
        </div>
      )}

      {/* List */}
      <div className="space-y-2">
        {loading ? (
          <SkeletonList count={4} />
        ) : redirects.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            暂无跳转规则，点击"添加跳转"创建第一条
          </div>
        ) : (
          redirects.map((r) => (
            <div key={r.id} className="flex items-center gap-4 px-4 py-3 bg-[hsl(var(--card))] rounded-lg border group hover:border-pastel-blue/30 transition-colors">
              <button
                onClick={() => toggleActive(r)}
                className={`shrink-0 ${r.is_active ? 'text-pastel-green' : 'text-warm-charcoal-muted/40'}`}
                title={r.is_active ? '启用中' : '已禁用'}
              >
                {r.is_active ? <ToggleRight className="h-5 w-5" /> : <ToggleLeft className="h-5 w-5" />}
              </button>

              <div className="flex-1 min-w-0 flex items-center gap-3">
                <code className="text-sm text-warm-charcoal font-mono truncate">{r.source_path}</code>
                <ArrowRight className="h-4 w-4 text-warm-charcoal-muted/40 shrink-0" />
                <code className="text-sm text-warm-charcoal font-mono truncate">{r.target_path}</code>
                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded shrink-0 ${
                  r.status_code === 301 ? 'bg-pastel-blue/10 text-pastel-blue' : 'bg-pastel-amber/10 text-pastel-amber'
                }`}>
                  {r.status_code}
                </span>
              </div>

              {!r.is_active && (
                <span className="text-[10px] text-warm-charcoal-muted/50 shrink-0">已禁用</span>
              )}

              <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                <button
                  onClick={() => openEdit(r)}
                  className="p-1.5 text-warm-charcoal-muted/60 hover:text-pastel-blue rounded"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(r.id, r.source_path)}
                  className="p-1.5 text-warm-charcoal-muted/60 hover:text-red-500 rounded"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
