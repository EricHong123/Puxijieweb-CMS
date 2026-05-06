import { useEffect, useState } from 'react';
import api from '@/api/client';
import {
  TrendingUp, Users, MousePointer, Share2,
  Globe, Package, FileText, Newspaper, Rocket,
  Image, HelpCircle, Clock, Activity, Languages,
  Monitor, Smartphone, Tablet, ExternalLink,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar,
} from 'recharts';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';
import { Card, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const COLORS = ['#0078D4', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#ec4899', '#84cc16'];

const DEVICE_COLORS: Record<string, string> = {
  desktop: '#0078D4',
  mobile: '#10b981',
  tablet: '#f59e0b',
};

const DEVICE_ICONS: Record<string, typeof Monitor> = {
  desktop: Monitor,
  mobile: Smartphone,
  tablet: Tablet,
};

const DEVICE_LABELS: Record<string, string> = {
  desktop: '桌面端',
  mobile: '移动端',
  tablet: '平板',
};

// GA country name → ISO 3166-1 numeric code (used by world-110m.json topology)
const COUNTRY_NAME_TO_NUMERIC: Record<string, string> = {
  'Afghanistan': '004', 'Albania': '008', 'Algeria': '012', 'Angola': '024',
  'Argentina': '032', 'Armenia': '051', 'Australia': '036', 'Austria': '040',
  'Azerbaijan': '031', 'Bangladesh': '050', 'Belarus': '112', 'Belgium': '056',
  'Benin': '204', 'Bolivia': '068', 'Bosnia & Herzegovina': '070', 'Brazil': '076',
  'Bulgaria': '100', 'Burkina Faso': '854', 'Cambodia': '116', 'Cameroon': '120',
  'Canada': '124', 'Chad': '148', 'Chile': '152', 'China': '156', 'Colombia': '170',
  'Costa Rica': '188', "Côte d'Ivoire": '384', 'Croatia': '191', 'Cuba': '192',
  'Czechia': '203', 'DR Congo': '180', 'Denmark': '208', 'Dominican Republic': '214',
  'Ecuador': '218', 'Egypt': '818', 'El Salvador': '222', 'Estonia': '233',
  'Ethiopia': '231', 'Finland': '246', 'France': '250', 'Georgia': '268',
  'Germany': '276', 'Ghana': '288', 'Greece': '300', 'Guatemala': '320',
  'Guinea': '324', 'Haiti': '332', 'Honduras': '340', 'Hong Kong': '344',
  'Hungary': '348', 'India': '356', 'Indonesia': '360', 'Iran': '364', 'Iraq': '368',
  'Ireland': '372', 'Israel': '376', 'Italy': '380', 'Japan': '392', 'Jordan': '400',
  'Kazakhstan': '398', 'Kenya': '404', 'Kuwait': '414', 'Kyrgyzstan': '417',
  'Laos': '418', 'Latvia': '428', 'Lebanon': '422', 'Libya': '434',
  'Lithuania': '440', 'Madagascar': '450', 'Malaysia': '458', 'Mali': '466',
  'Mexico': '484', 'Mongolia': '496', 'Morocco': '504', 'Mozambique': '508',
  'Myanmar (Burma)': '104', 'Nepal': '524', 'Netherlands': '528', 'New Zealand': '554',
  'Nicaragua': '558', 'Niger': '562', 'Nigeria': '566', 'North Macedonia': '807',
  'Norway': '578', 'Oman': '512', 'Pakistan': '586', 'Panama': '591', 'Paraguay': '600',
  'Peru': '604', 'Philippines': '608', 'Poland': '616', 'Portugal': '620',
  'Puerto Rico': '630', 'Qatar': '634', 'Romania': '642', 'Russia': '643',
  'Rwanda': '646', 'Saudi Arabia': '682', 'Senegal': '686', 'Serbia': '688',
  'Singapore': '702', 'Slovakia': '703', 'Slovenia': '705', 'Somalia': '706',
  'South Africa': '710', 'South Korea': '410', 'Spain': '724', 'Sri Lanka': '144',
  'Sudan': '729', 'Sweden': '752', 'Switzerland': '756', 'Syria': '760',
  'Taiwan': '158', 'Tajikistan': '762', 'Tanzania': '834', 'Thailand': '764',
  'Togo': '768', 'Tunisia': '788', 'Turkey': '792', 'Turkmenistan': '795',
  'Uganda': '800', 'Ukraine': '804', 'United Arab Emirates': '784',
  'United Kingdom': '826', 'United States': '840', 'Uruguay': '858',
  'Uzbekistan': '860', 'Venezuela': '862', 'Vietnam': '704', 'Yemen': '887',
  'Zambia': '894', 'Zimbabwe': '716',
};

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

interface ContentStats {
  products: { total: number; published: number };
  pages: { total: number; published: number };
  news: { total: number; published: number; thisMonth: number };
  media: { total: number };
  faq: { total: number };
}

interface LocaleCoverage {
  pages: { total: number; en: number; fr: number; vi: number };
  news: { en: number; fr: number; vi: number };
}

interface ScheduledItem {
  id: string;
  title?: string;
  slug: string;
  scheduled_publish_at: string;
  type: 'news' | 'page';
}

interface ActivityItem {
  user_email: string;
  action: string;
  entity_type: string;
  entity_id: string;
  created_at: string;
}

interface ContentType {
  name: string;
  value: number;
}

interface CountryData {
  country: string;
  users: number;
}

interface DeviceData {
  device: string;
  users: number;
}

interface TrafficSource {
  source: string;
  users: number;
}

const ACTION_LABELS: Record<string, string> = {
  create: '创建了', update: '更新了', delete: '删除了', publish: '发布了',
};
const ENTITY_LABELS: Record<string, string> = {
  product: '产品', news: '新闻', page: '页面', faq: 'FAQ', legal: '法律页', media: '媒体', site_setting: '网站设置',
};

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}秒`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins < 60) return secs > 0 ? `${mins}分${secs}秒` : `${mins}分钟`;
  const hours = Math.floor(mins / 60);
  const remainMin = mins % 60;
  return remainMin > 0 ? `${hours}时${remainMin}分` : `${hours}小时`;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return '刚刚';
  if (mins < 60) return `${mins}分钟前`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}小时前`;
  const days = Math.floor(hours / 24);
  return `${days}天前`;
}

export default function DashboardPage() {
  // Analytics state
  const [overview, setOverview] = useState<Overview | null>(null);
  const [pageviews, setPageviews] = useState<PageViewPoint[]>([]);
  const [topPages, setTopPages] = useState<TopPage[]>([]);

  // CMS content state
  const [content, setContent] = useState<ContentStats | null>(null);
  const [localeCoverage, setLocaleCoverage] = useState<LocaleCoverage | null>(null);
  const [scheduledNews, setScheduledNews] = useState<ScheduledItem[]>([]);
  const [scheduledPages, setScheduledPages] = useState<ScheduledItem[]>([]);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [contentTypes, setContentTypes] = useState<ContentType[]>([]);

  // GA extra data
  const [countryData, setCountryData] = useState<CountryData[]>([]);
  const [deviceData, setDeviceData] = useState<DeviceData[]>([]);
  const [trafficSources, setTrafficSources] = useState<TrafficSource[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [ovRes, pvRes, tpRes, dbRes] = await Promise.all([
          api.get('/analytics/overview'),
          api.get('/analytics/pageviews', { params: { days: '30' } }),
          api.get('/analytics/top-pages', { params: { limit: '10' } }),
          api.get('/analytics/dashboard'),
        ]);
        if (ovRes.data.success) setOverview(ovRes.data.data);
        if (pvRes.data.success) setPageviews(pvRes.data.data);
        if (tpRes.data.success) setTopPages(tpRes.data.data);
        if (dbRes.data.success) {
          const d = dbRes.data.data;
          setContent(d.content);
          setLocaleCoverage(d.locale_coverage);
          setScheduledNews(d.scheduled?.news || []);
          setScheduledPages(d.scheduled?.pages || []);
          setRecentActivity(d.recent_activity || []);
          setContentTypes(d.content_types || []);
          setCountryData(d.country_data || []);
          setDeviceData(d.device_data || []);
          setTrafficSources(d.traffic_sources || []);
        }
      } catch {}
      setLoading(false);
    };
    fetchAll();
  }, []);

  const hasAnalytics = overview && overview.source !== 'none' && overview.total_pageviews > 0;

  const analStats = [
    { label: '访客数', value: overview?.total_visitors?.toLocaleString() || '-', sub: '30天独立访问', icon: Users, color: 'text-pastel-blue', bg: 'bg-pastel-blue/6' },
    { label: '页面浏览', value: overview?.total_pageviews?.toLocaleString() || '-', sub: '30天总 PV', icon: MousePointer, color: 'text-pastel-green', bg: 'bg-pastel-green/8' },
    { label: '平均停留', value: overview?.avg_time_on_site ? formatDuration(overview.avg_time_on_site) : '-', sub: '每次访问时长', icon: Clock, color: 'text-pastel-amber', bg: 'bg-pastel-amber/8' },
    { label: '跳出率', value: overview?.bounce_rate != null ? `${overview.bounce_rate}%` : '-', sub: overview?.bounce_rate != null ? (overview.bounce_rate < 40 ? '健康' : overview.bounce_rate < 70 ? '一般' : '偏高') : '', icon: Share2, color: 'text-purple-600', bg: 'bg-pastel-lavender/8' },
  ];

  const contentStats = [
    { label: '产品', value: (content?.products.total || 0).toLocaleString(), sub: `${content?.products.published || 0} 已发布`, icon: Package, color: 'text-pastel-blue', bg: 'bg-pastel-blue/6' },
    { label: '页面', value: (content?.pages.total || 0).toLocaleString(), sub: `${content?.pages.published || 0} 已发布`, icon: FileText, color: 'text-pastel-green', bg: 'bg-pastel-green/8' },
    { label: '新闻', value: (content?.news.total || 0).toLocaleString(), sub: content?.news.thisMonth ? `本月新增 ${content.news.thisMonth}` : `${content?.news.published || 0} 已发布`, icon: Newspaper, color: 'text-pastel-amber', bg: 'bg-pastel-amber/8' },
    { label: '媒体', value: (content?.media.total || 0).toLocaleString(), sub: '个文件', icon: Image, color: 'text-purple-600', bg: 'bg-pastel-lavender/8' },
    { label: 'FAQ', value: (content?.faq.total || 0).toLocaleString(), sub: '个章节', icon: HelpCircle, color: 'text-pastel-rose', bg: 'bg-pastel-rose/8' },
  ];

  const scheduledTotal = scheduledNews.length + scheduledPages.length;

  const quickLinks = [
    { label: '添加产品', href: '/products/new', icon: Package, color: 'text-pastel-blue', bg: 'bg-pastel-blue/6' },
    { label: '媒体库', href: '/media', icon: Image, color: 'text-pastel-green', bg: 'bg-pastel-green/8' },
    { label: '页面管理', href: '/pages', icon: FileText, color: 'text-pastel-amber', bg: 'bg-pastel-amber/8' },
    { label: '新闻文章', href: '/news/new', icon: Newspaper, color: 'text-purple-600', bg: 'bg-pastel-lavender/8' },
    { label: '网站设置', href: '/settings', icon: Globe, color: 'text-pastel-lavender', bg: 'bg-pastel-lavender/8' },
    { label: '部署', href: '/deploy', icon: Rocket, color: 'text-pastel-rose', bg: 'bg-pastel-rose/8' },
  ];

  // Build country map data: max users for color scale
  const maxCountryUsers = Math.max(...countryData.map((c) => c.users), 1);
  const countryMap = new Map<string, number>();
  for (const c of countryData) {
    const code = COUNTRY_NAME_TO_NUMERIC[c.country];
    if (code) countryMap.set(code, c.users);
  }
  const hasCountryData = countryData.length > 0;
  const hasDeviceData = deviceData.length > 0;
  const hasTrafficData = trafficSources.length > 0;

  // Device data for chart
  const deviceChartData = deviceData.map((d) => ({
    name: DEVICE_LABELS[d.device] || d.device,
    value: d.users,
    device: d.device,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-warm-charcoal">数据看板</h1>
          <p className="text-sm text-warm-charcoal-muted mt-1">
            {loading ? '加载中...' : `网站内容概览 · ${new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}`}
          </p>
        </div>
        {overview?.source && (
          <div className={`text-xs px-3 py-1.5 rounded-full font-medium ${
            overview.source === 'google-analytics'
              ? 'bg-pastel-green/8 text-pastel-green border border-pastel-green/20'
              : 'bg-pastel-amber/8 text-pastel-amber border border-pastel-amber/20'
          }`}>
            {overview.source === 'google-analytics' ? 'Google Analytics' : overview.source === 'self-hosted' ? '自建追踪' : '无数据'}
          </div>
        )}
      </div>

      {/* Row 1: Analytics stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {analStats.map((s) => (
          <Card key={s.label} variant="paper" padding="lg" hover>
            <div className="flex items-center gap-3">
              <div className={`h-10 w-10 rounded-xl ${s.bg} flex items-center justify-center`}>
                <s.icon className={`h-5 w-5 ${s.color}`} />
              </div>
              <div>
                <div className="text-2xl font-bold text-warm-charcoal">{s.value}</div>
                <div className="text-xs text-warm-charcoal-muted">{s.label}</div>
                {'sub' in s && (s as any).sub && (
                  <div className="text-[10px] text-warm-charcoal-muted/50">{(s as any).sub}</div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Row 2: Content stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {contentStats.map((s) => (
          <Card key={s.label} variant="paper" padding="lg" hover>
            <div className="flex items-center gap-3">
              <div className={`h-10 w-10 rounded-xl ${s.bg} flex items-center justify-center`}>
                <s.icon className={`h-5 w-5 ${s.color}`} />
              </div>
              <div>
                <div className="text-2xl font-bold text-warm-charcoal">{s.value}</div>
                <div className="text-xs text-warm-charcoal-muted">{s.label}</div>
                <div className="text-[10px] text-warm-charcoal-muted/60">{s.sub}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Row 3: Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Pageview trend */}
        <Card padding="lg">
          <CardTitle>访问趋势 (30天)</CardTitle>
          {pageviews.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={pageviews} margin={{ top: 0, right: 0, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0078D4" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#0078D4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(d) => d.slice(5)} stroke="#94a3b8" />
                  <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}
                    labelStyle={{ fontWeight: 600, fontSize: 12 }}
                  />
                  <Area type="monotone" dataKey="count" stroke="#0078D4" strokeWidth={2} fill="url(#colorPv)" name="浏览" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-warm-charcoal-muted text-sm">
              暂无数据。部署 tracking script 以开始收集数据。
            </div>
          )}
        </Card>

        {/* Content type distribution */}
        <Card padding="lg">
          <CardTitle>内容类型分布</CardTitle>
          {contentTypes.length > 0 ? (
            <div className="h-64 flex items-center">
              <ResponsiveContainer width="55%" height="100%">
                <PieChart>
                  <Pie
                    data={contentTypes}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                    nameKey="name"
                  >
                    {contentTypes.map((_, idx) => (
                      <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                    formatter={(value: number, name: string) => [value, name]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 flex-1">
                {contentTypes.map((ct, idx) => (
                  <div key={ct.name} className="flex items-center gap-2 text-xs">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                    <span className="text-warm-charcoal-muted">{ct.name}</span>
                    <span className="text-warm-charcoal-muted/60 ml-auto">{ct.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-warm-charcoal-muted text-sm">暂无数据</div>
          )}
        </Card>
      </div>

      {/* Row 4: World Map + Device breakdown */}
      {(hasCountryData || hasDeviceData) && (
        <div className="grid gap-4 lg:grid-cols-2">
          {/* World Map */}
          {hasCountryData && (
            <Card padding="lg">
              <CardTitle>
                <Globe className="h-4 w-4 inline mr-1.5" />
                访客地理分布
              </CardTitle>
              <div className="h-[340px]">
                <ComposableMap
                  projection="geoMercator"
                  projectionConfig={{ scale: 140, center: [15, 25] }}
                  style={{ width: '100%', height: '100%' }}
                >
                  <ZoomableGroup zoom={1}>
                    <Geographies geography="https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json">
                      {({ geographies }) =>
                        geographies.map((geo) => {
                          const users = countryMap.get(geo.id);
                          const opacity = users ? 0.15 + (users / maxCountryUsers) * 0.75 : 0.04;
                          return (
                            <Geography
                              key={geo.rsmKey}
                              geography={geo}
                              fill={users ? '#0078D4' : '#e2e8f0'}
                              fillOpacity={opacity}
                              stroke="#ffffff"
                              strokeWidth={0.5}
                              style={{
                                default: { outline: 'none' },
                                hover: { fill: '#0078D4', fillOpacity: 0.85, outline: 'none' },
                                pressed: { outline: 'none' },
                              }}
                            />
                          );
                        })
                      }
                    </Geographies>
                  </ZoomableGroup>
                </ComposableMap>
              </div>
              {/* Top countries legend */}
              <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
                {countryData.slice(0, 8).map((c) => (
                  <span key={c.country} className="text-[10px] text-warm-charcoal-muted">
                    <span className="inline-block w-2 h-2 rounded-full bg-[#0078D4] mr-1 align-middle" />
                    {c.country} <span className="font-medium text-warm-charcoal">{c.users}</span>
                  </span>
                ))}
                {countryData.length > 8 && (
                  <span className="text-[10px] text-warm-charcoal-muted/60">+{countryData.length - 8} 更多</span>
                )}
              </div>
            </Card>
          )}

          {/* Device Breakdown */}
          {hasDeviceData && (
            <Card padding="lg">
              <CardTitle>设备类型</CardTitle>
              <div className="h-[340px] flex items-center">
                <ResponsiveContainer width="50%" height="80%">
                  <PieChart>
                    <Pie
                      data={deviceChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {deviceChartData.map((entry) => (
                        <Cell key={entry.device} fill={DEVICE_COLORS[entry.device] || COLORS[2]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                      formatter={(value: number, name: string) => [value, name]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-4 flex-1">
                  {deviceData.map((d) => {
                    const Icon = DEVICE_ICONS[d.device] || Monitor;
                    const total = deviceData.reduce((s, x) => s + x.users, 0);
                    const pct = total > 0 ? Math.round((d.users / total) * 100) : 0;
                    return (
                      <div key={d.device} className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg bg-[hsl(var(--secondary))] flex items-center justify-center">
                          <Icon className="h-4 w-4 text-warm-charcoal-muted" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="text-sm font-medium text-warm-charcoal">{DEVICE_LABELS[d.device] || d.device}</span>
                            <span className="text-xs text-warm-charcoal-muted">{d.users.toLocaleString()}</span>
                          </div>
                          <div className="h-1.5 bg-[hsl(var(--secondary))] rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: `${Math.max(pct, 5)}%`,
                                backgroundColor: DEVICE_COLORS[d.device] || COLORS[2],
                              }}
                            />
                          </div>
                          <span className="text-[10px] text-warm-charcoal-muted/60">{pct}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>
          )}

          {/* If no device data but has country map, fill the gap */}
          {hasCountryData && !hasDeviceData && <div />}
        </div>
      )}

      {/* Row 5: Traffic sources — full width when standalone */}
      {hasTrafficData && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card padding="lg" className="lg:col-span-2">
            <CardTitle>
              <ExternalLink className="h-4 w-4 inline mr-1.5" />
              流量来源
            </CardTitle>
            <div className="h-[260px] mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trafficSources} layout="vertical" margin={{ top: 0, right: 20, left: 100, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                  <YAxis
                    type="category"
                    dataKey="source"
                    tick={{ fontSize: 11 }}
                    stroke="#94a3b8"
                    width={100}
                  />
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                    formatter={(value: number) => [value.toLocaleString(), '访客']}
                  />
                  <Bar dataKey="users" radius={[0, 4, 4, 0]} fill="#0078D4" barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      )}

      {/* Row 6: Locale coverage + Scheduled */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Locale coverage */}
        <Card padding="lg">
          <CardTitle>
            <Languages className="h-4 w-4 inline mr-1.5" />
            多语言覆盖度
          </CardTitle>
          {localeCoverage ? (
            <div className="space-y-4">
              {/* Pages */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-warm-charcoal">页面翻译</span>
                  <span className="text-[10px] text-warm-charcoal-muted">{localeCoverage.pages.total} 个页面</span>
                </div>
                {(['en', 'fr', 'vi'] as const).map((locale) => {
                  const count = localeCoverage.pages[locale];
                  const pct = localeCoverage.pages.total > 0 ? Math.round((count / localeCoverage.pages.total) * 100) : 0;
                  const labels = { en: 'English', fr: 'Français', vi: 'Tiếng Việt' };
                  return (
                    <div key={locale} className="flex items-center gap-2 mb-1.5">
                      <span className="text-xs text-warm-charcoal-muted w-20 shrink-0">{labels[locale]}</span>
                      <div className="flex-1 h-2 bg-[hsl(var(--secondary))] rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${pct === 100 ? 'bg-pastel-green' : pct >= 70 ? 'bg-pastel-amber' : 'bg-pastel-rose'}`}
                          style={{ width: `${Math.max(pct, 5)}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-warm-charcoal-muted w-12 text-right">{count}/{localeCoverage.pages.total}</span>
                    </div>
                  );
                })}
              </div>
              {/* News */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-warm-charcoal">新闻语言分布</span>
                </div>
                <div className="flex gap-3">
                  {(['en', 'fr', 'vi'] as const).map((locale) => {
                    const count = localeCoverage.news[locale];
                    const labels = { en: 'EN', fr: 'FR', vi: 'VI' };
                    return (
                      <div key={locale} className="flex-1 bg-[hsl(var(--secondary))] rounded-lg p-2.5 text-center">
                        <div className="text-lg font-bold text-warm-charcoal">{count}</div>
                        <div className="text-[10px] text-warm-charcoal-muted">{labels[locale]}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-sm text-warm-charcoal-muted">加载中...</div>
          )}
        </Card>

        {/* Scheduled + Hot pages */}
        <Card padding="lg">
          <div className="flex items-center justify-between">
            <CardTitle>
              <Clock className="h-4 w-4 inline mr-1.5" />
              定时发布
            </CardTitle>
            {scheduledTotal > 0 && (
              <Badge variant="secondary">{scheduledTotal} 条待发布</Badge>
            )}
          </div>
          {scheduledTotal > 0 ? (
            <div className="space-y-2 mt-3">
              {[...scheduledNews.map((n) => ({ ...n, title: n.title || n.slug })), ...scheduledPages.map((p) => ({ ...p, title: p.slug }))]
                .sort((a, b) => new Date(a.scheduled_publish_at).getTime() - new Date(b.scheduled_publish_at).getTime())
                .slice(0, 5)
                .map((item) => (
                  <div key={item.id} className="flex items-center gap-3 py-2">
                    <Badge variant={item.type === 'news' ? 'default' : 'secondary'} className="text-[10px] shrink-0">
                      {item.type === 'news' ? '新闻' : '页面'}
                    </Badge>
                    <span className="text-sm text-warm-charcoal truncate flex-1">{item.title}</span>
                    <span className="text-xs text-warm-charcoal-muted shrink-0">
                      {new Date(item.scheduled_publish_at).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                ))}
            </div>
          ) : (
            <div className="py-8 text-center text-sm text-warm-charcoal-muted">
              暂无定时发布内容
            </div>
          )}

          {/* Top pages - condensed */}
          {topPages.length > 0 && (
            <>
              <CardTitle className="mt-4">热门页面</CardTitle>
              <div className="space-y-1 mt-2">
                {topPages.slice(0, 5).map((p, idx) => (
                  <div key={p.path} className="flex items-center gap-2 py-1.5">
                    <span className="w-5 h-5 rounded-full bg-[hsl(var(--secondary))] flex items-center justify-center text-[10px] font-medium text-warm-charcoal-muted shrink-0">
                      {idx + 1}
                    </span>
                    <span className="text-xs text-warm-charcoal truncate flex-1 font-mono">{p.path}</span>
                    <span className="text-[10px] text-warm-charcoal-muted">{p.views}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </Card>
      </div>

      {/* Row 7: Recent activity + Quick links */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Recent activity */}
        <Card padding="lg">
          <CardTitle>
            <Activity className="h-4 w-4 inline mr-1.5" />
            最近动态
          </CardTitle>
          {recentActivity.length > 0 ? (
            <div className="space-y-1 mt-3">
              {recentActivity.slice(0, 8).map((a, i) => (
                <div key={i} className="flex items-center gap-3 py-2">
                  <div className="h-7 w-7 rounded-full bg-pastel-blue/10 flex items-center justify-center text-[10px] font-medium text-pastel-blue shrink-0">
                    {a.user_email?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs text-warm-charcoal">
                      <span className="font-medium">{a.user_email}</span>{' '}
                      {ACTION_LABELS[a.action] || a.action}{' '}
                      {ENTITY_LABELS[a.entity_type] || a.entity_type}
                    </span>
                  </div>
                  <span className="text-[10px] text-warm-charcoal-muted/60 shrink-0">{timeAgo(a.created_at)}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-sm text-warm-charcoal-muted">
              暂无操作记录。进行内容编辑后将在这里显示。
            </div>
          )}
        </Card>

        {/* Quick links */}
        <Card padding="lg">
          <CardTitle>快捷操作</CardTitle>
          <div className="grid grid-cols-2 gap-3 mt-3">
            {quickLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="flex items-center gap-2.5 px-4 py-3 rounded-lg border border-[hsl(var(--border))] hover:bg-[hsl(var(--accent))] hover:border-primary/30 transition-all duration-paper hover:-translate-y-px group"
              >
                <div className={`h-8 w-8 rounded-lg ${link.bg} flex items-center justify-center`}>
                  <link.icon className={`h-4 w-4 ${link.color}`} />
                </div>
                <span className="text-sm font-medium text-warm-charcoal group-hover:text-primary transition-colors">
                  {link.label}
                </span>
              </a>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
