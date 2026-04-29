import { useEffect, useState } from 'react';
import api from '@/api/client';
import {
  TrendingUp, Users, MousePointer, Share2,
  Globe, Package, FileText, Newspaper, Rocket,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell,
} from 'recharts';

interface Overview {
  total_visitors: number;
  total_pageviews: number;
  avg_time_on_site: number;
  bounce_rate: number;
  period: string;
  source: string;
}

interface PageViewPoint {
  date: string;
  count: number;
}

interface TopPage {
  path: string;
  views: number;
}

interface Referrer {
  source: string;
  count: number;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4'];

export default function DashboardPage() {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [pageviews, setPageviews] = useState<PageViewPoint[]>([]);
  const [topPages, setTopPages] = useState<TopPage[]>([]);
  const [referrers, setReferrers] = useState<Referrer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [ovRes, pvRes, tpRes, refRes] = await Promise.all([
          api.get('/analytics/overview'),
          api.get('/analytics/pageviews', { params: { days: '30' } }),
          api.get('/analytics/top-pages', { params: { limit: '10' } }),
          api.get('/analytics/referrers', { params: { limit: '10' } }),
        ]);
        if (ovRes.data.success) setOverview(ovRes.data.data);
        if (pvRes.data.success) setPageviews(pvRes.data.data);
        if (tpRes.data.success) setTopPages(tpRes.data.data);
        if (refRes.data.success) setReferrers(refRes.data.data);
      } catch {}
      setLoading(false);
    };
    fetchAll();
  }, []);

  const stats = [
    { label: '访客数', value: overview?.total_visitors?.toLocaleString() || '-', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
    { label: '页面浏览', value: overview?.total_pageviews?.toLocaleString() || '-', icon: MousePointer, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
    { label: '停留时间', value: overview ? `${Math.round((overview.avg_time_on_site || 0) / 60)}分` : '-', icon: TrendingUp, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
    { label: '跳出率', value: overview?.bounce_rate != null ? `${overview.bounce_rate}%` : '-', icon: Share2, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100' },
  ];

  const quickLinks = [
    { label: '添加产品', href: '/products/new', icon: Package, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: '媒体库', href: '/media', icon: ImageIcon, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: '编辑页面', href: '/pages', icon: FileText, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: '发布新闻', href: '/news/new', icon: Newspaper, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: '网站设置', href: '/settings', icon: Globe, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: '部署', href: '/deploy', icon: Rocket, color: 'text-rose-600', bg: 'bg-rose-50' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">数据看板</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {loading ? '加载中...' : overview?.source === 'self-hosted' ? '数据来源：自建追踪' : '网站流量概览'}
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className={`bg-white rounded-xl border ${s.border} p-5`}>
            <div className="flex items-center gap-3">
              <div className={`h-10 w-10 rounded-lg ${s.bg} flex items-center justify-center`}>
                <s.icon className={`h-5 w-5 ${s.color}`} />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">{s.value}</div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Pageview trend */}
        <div className="bg-white rounded-xl border p-6">
          <h2 className="font-semibold text-slate-900 mb-4">访问趋势 (30天)</h2>
          {pageviews.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={pageviews} margin={{ top: 0, right: 0, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(d) => d.slice(5)} stroke="#94a3b8" />
                  <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}
                    labelStyle={{ fontWeight: 600, fontSize: 12 }}
                  />
                  <Area type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} fill="url(#colorPv)" name="浏览" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">
              暂无数据。部署 tracking script 到网站以开始收集数据。
            </div>
          )}
        </div>

        {/* Top referrers */}
        <div className="bg-white rounded-xl border p-6">
          <h2 className="font-semibold text-slate-900 mb-4">流量来源</h2>
          {referrers.length > 0 ? (
            <div className="h-64 flex items-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={referrers}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="count"
                    nameKey="source"
                  >
                    {referrers.map((_, idx) => (
                      <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                    formatter={(value: number, name: string) => [value, name]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5">
                {referrers.slice(0, 6).map((r, idx) => (
                  <div key={r.source} className="flex items-center gap-2 text-xs">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                    <span className="text-slate-600 truncate max-w-[120px]">{r.source}</span>
                    <span className="text-slate-400 ml-auto">{r.count}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">
              暂无数据
            </div>
          )}
        </div>
      </div>

      {/* Top pages + Quick links */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Top pages */}
        <div className="bg-white rounded-xl border p-6">
          <h2 className="font-semibold text-slate-900 mb-4">热门页面</h2>
          {topPages.length > 0 ? (
            <div className="space-y-2">
              {topPages.map((p, idx) => (
                <div key={p.path} className="flex items-center gap-3 py-2">
                  <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-medium text-slate-500 shrink-0">
                    {idx + 1}
                  </span>
                  <span className="text-sm text-slate-700 truncate flex-1 font-mono text-xs">{p.path}</span>
                  <span className="text-sm text-slate-500 shrink-0">{p.views}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-muted-foreground text-sm">暂无数据</div>
          )}
        </div>

        {/* Quick links */}
        <div className="bg-white rounded-xl border p-6">
          <h2 className="font-semibold text-slate-900 mb-4">快捷操作</h2>
          <div className="grid grid-cols-2 gap-3">
            {quickLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="flex items-center gap-2.5 px-4 py-3 rounded-lg border hover:bg-slate-50 hover:border-primary/30 transition-colors group"
              >
                <div className={`h-8 w-8 rounded-lg ${link.bg} flex items-center justify-center`}>
                  <link.icon className={`h-4 w-4 ${link.color}`} />
                </div>
                <span className="text-sm font-medium text-slate-700 group-hover:text-primary transition-colors">
                  {link.label}
                </span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Inline SVG icon since lucide Image conflicts with HTML Image
function ImageIcon({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
      <circle cx="9" cy="9" r="2" />
      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
    </svg>
  );
}
