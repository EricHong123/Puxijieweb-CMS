import { useEffect, useState } from 'react';
import api from '@/api/client';
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardTitle } from '@/components/ui/card';
import { History } from 'lucide-react';

interface AuditEntry {
  id: string;
  user_email: string;
  action: string;
  entity_type: string;
  entity_id: string;
  changes: Record<string, any>;
  created_at: string;
}

const ACTION_BADGES: Record<string, { label: string; variant: 'success' | 'warning' | 'danger' | 'blue' | 'secondary' }> = {
  create: { label: '创建', variant: 'success' },
  update: { label: '更新', variant: 'blue' },
  delete: { label: '删除', variant: 'danger' },
  publish: { label: '发布', variant: 'warning' },
};

const ENTITY_LABELS: Record<string, string> = {
  product: '产品', news: '新闻', page: '页面', faq: 'FAQ',
  legal: '法律页', media: '媒体', site_setting: '网站设置',
};

export default function AuditLogPage() {
  const [items, setItems] = useState<AuditEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    const { data } = await api.get('/audit-logs', { params: { limit: 100 } });
    if (data.success) { setItems(data.data.items); setTotal(data.data.total); }
    setLoading(false);
  };

  useEffect(() => { fetchLogs(); }, []);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">操作日志</h1>
        <p className="text-sm text-slate-500 mt-1">记录所有内容变更操作 — 共 {total} 条</p>
      </div>

      <Card padding="none">
        <div className="px-5 py-4 border-b border-[#EBEBEB]">
          <CardTitle>最近操作</CardTitle>
        </div>
        {loading ? (
          <div className="p-8 text-center text-slate-500">加载中...</div>
        ) : items.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            <History className="h-10 w-10 mx-auto mb-2 text-slate-300" />
            暂无操作记录
          </div>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableHeader>时间</TableHeader>
                <TableHeader>用户</TableHeader>
                <TableHeader>操作</TableHeader>
                <TableHeader>类型</TableHeader>
                <TableHeader>对象 ID</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((entry) => {
                const badge = ACTION_BADGES[entry.action] || { label: entry.action, variant: 'secondary' as const };
                return (
                  <TableRow key={entry.id}>
                    <TableCell className="text-xs text-slate-500 whitespace-nowrap">
                      {new Date(entry.created_at).toLocaleString('zh-CN')}
                    </TableCell>
                    <TableCell className="text-sm">{entry.user_email}</TableCell>
                    <TableCell>
                      <Badge variant={badge.variant}>{badge.label}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-slate-600">
                      {ENTITY_LABELS[entry.entity_type] || entry.entity_type}
                    </TableCell>
                    <TableCell className="text-xs font-mono text-slate-500">{entry.entity_id}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
