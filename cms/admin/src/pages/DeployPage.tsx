import { useEffect, useState } from 'react';
import api from '@/api/client';
import { Rocket, RefreshCw, CheckCircle, XCircle, Clock, Loader2 } from 'lucide-react';

interface DeployLog {
  id: string;
  status: string;
  started_at: string;
  finished_at: string;
  error_message: string | null;
}

const statusConfig: Record<string, { icon: any; color: string; label: string }> = {
  pending: { icon: Clock, color: 'text-amber-500', label: '等待中' },
  building: { icon: Loader2, color: 'text-blue-500 animate-spin', label: '构建中' },
  uploading: { icon: Loader2, color: 'text-purple-500 animate-spin', label: '上传中' },
  success: { icon: CheckCircle, color: 'text-emerald-500', label: '成功' },
  failed: { icon: XCircle, color: 'text-red-500', label: '失败' },
};

export default function DeployPage() {
  const [logs, setLogs] = useState<DeployLog[]>([]);
  const [latest, setLatest] = useState<DeployLog | null>(null);
  const [deploying, setDeploying] = useState(false);

  const fetchStatus = async () => {
    const [statusRes, historyRes] = await Promise.all([
      api.get('/deploy/status'),
      api.get('/deploy/history', { params: { limit: '10' } }),
    ]);
    if (statusRes.data.success) setLatest(statusRes.data.data);
    if (historyRes.data.success) setLogs(historyRes.data.data.items);
  };

  useEffect(() => { fetchStatus(); }, []);

  const handleDeploy = async () => {
    setDeploying(true);
    try {
      const { data } = await api.post('/deploy/trigger');
      if (data.success) {
        fetchStatus();
      } else {
        alert('部署触发失败: ' + data.error);
      }
    } catch (err: any) {
      alert('部署触发失败');
    } finally {
      setDeploying(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">部署管理</h1>
          <p className="text-sm text-muted-foreground mt-1">触发网站构建和发布</p>
        </div>
        <button
          onClick={handleDeploy}
          disabled={deploying || latest?.status === 'building' || latest?.status === 'uploading'}
          className="inline-flex items-center gap-2 px-5 py-3 bg-primary text-primary-foreground rounded-lg text-sm font-bold hover:opacity-90 disabled:opacity-50 shadow-lg shadow-primary/20"
        >
          <Rocket className="h-5 w-5" />
          {deploying ? '触发中...' : '一键部署'}
        </button>
      </div>

      {/* Latest deploy status */}
      {latest && (
        <div className={`bg-white rounded-xl border p-6 ${latest.status === 'failed' ? 'border-red-200' : latest.status === 'success' ? 'border-emerald-200' : ''}`}>
          <div className="flex items-center gap-3">
            {(() => {
              const cfg = statusConfig[latest.status] || statusConfig.pending;
              const Icon = cfg.icon;
              return <Icon className={`h-8 w-8 ${cfg.color}`} />;
            })()}
            <div>
              <div className="text-lg font-semibold text-slate-900">
                {statusConfig[latest.status]?.label || latest.status}
              </div>
              <div className="text-sm text-muted-foreground">
                {latest.started_at ? new Date(latest.started_at).toLocaleString('zh-CN') : '-'}
              </div>
            </div>
          </div>
          {latest.error_message && (
            <div className="mt-3 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{latest.error_message}</div>
          )}
        </div>
      )}

      {/* History */}
      <div className="bg-white rounded-xl border">
        <div className="px-5 py-4 border-b">
          <h2 className="font-semibold text-slate-900">部署历史</h2>
        </div>
        <div className="divide-y">
          {logs.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm">暂无部署记录</div>
          ) : (
            logs.map((log) => {
              const cfg = statusConfig[log.status] || statusConfig.pending;
              const Icon = cfg.icon;
              return (
                <div key={log.id} className="px-5 py-3 flex items-center gap-3 hover:bg-slate-50">
                  <Icon className={`h-4 w-4 ${cfg.color}`} />
                  <div className="flex-1">
                    <span className="text-sm font-medium text-slate-700">{cfg.label}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {log.started_at ? new Date(log.started_at).toLocaleString('zh-CN') : '-'}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
