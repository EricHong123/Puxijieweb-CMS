import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/useAuth';
import CommandPalette from '@/components/CommandPalette';
import ChatPanel from '@/components/ChatPanel';
import ThemeToggle from '@/components/ThemeToggle';
import {
  LayoutDashboard, Package, Image, FileText, Newspaper,
  HelpCircle, Scale, Settings, Rocket, LogOut, History,
  Menu, X, Globe, PenLine,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: '数据看板' },
  { to: '/products', icon: Package, label: '产品管理' },
  { to: '/media', icon: Image, label: '媒体库' },
  { to: '/pages', icon: FileText, label: '页面管理' },
  { to: '/news', icon: Newspaper, label: '新闻管理' },
  { to: '/faq', icon: HelpCircle, label: 'FAQ' },
  { to: '/legal', icon: Scale, label: '法律页面' },
  { to: '/settings', icon: Settings, label: '网站设置' },
  { to: '/deploy', icon: Rocket, label: '部署' },
  { to: '/audit', icon: History, label: '操作日志' },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen overflow-hidden relative z-[1]">
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-warm-charcoal/20 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Notebook Sidebar */}
      <aside className={cn(
        'fixed inset-y-0 left-0 z-50 w-64 flex flex-col transition-transform lg:translate-x-0 lg:static lg:z-auto',
        'sidebar-paper',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        {/* Brand — handwritten style */}
        <div className="h-16 flex items-center gap-3 px-5 border-b border-[hsl(var(--border))]">
          <div className="h-9 w-9 rounded-lg bg-pastel-blue/10 flex items-center justify-center ring-1 ring-pastel-blue/20">
            <PenLine className="h-5 w-5 text-pastel-blue" strokeWidth={1.5} />
          </div>
          <div>
            <div className="font-semibold text-sm text-warm-charcoal leading-tight">Puxijie CMS</div>
            <div className="font-handwriting text-base text-warm-charcoal-muted leading-tight">notebook</div>
          </div>
          <button className="ml-auto lg:hidden text-warm-charcoal-muted hover:text-warm-charcoal" onClick={() => setSidebarOpen(false)}>
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav — paper-tab style */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-0.5">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-paper',
                  isActive
                    ? 'bg-pastel-blue/10 text-pastel-blue shadow-paper-xs border border-pastel-blue/15'
                    : 'text-warm-charcoal-muted hover:bg-[hsl(var(--accent))]/60 hover:text-warm-charcoal'
                )
              }
            >
              <item.icon className="h-[18px] w-[18px]" strokeWidth={1.5} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User — paper footer */}
        <div className="border-t border-[hsl(var(--border))] p-3">
          <div className="flex items-center gap-3 px-2 py-1.5">
            <div className="h-8 w-8 rounded-full bg-pastel-blue/10 flex items-center justify-center ring-1 ring-pastel-blue/20 text-pastel-blue font-semibold text-sm">
              {user?.email?.[0]?.toUpperCase() || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate text-warm-charcoal">{user?.email}</div>
              <div className="font-handwriting text-sm text-warm-charcoal-muted">{user?.role === 'admin' ? 'admin' : 'editor'}</div>
            </div>
            <button onClick={handleLogout} className="text-warm-charcoal-muted hover:text-pastel-rose transition-colors p-1" title="退出登录">
              <LogOut className="h-4 w-4" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden relative z-[1]">
        <header className="h-16 border-b border-[hsl(var(--border))] bg-[hsl(var(--card))]/70 backdrop-blur-md flex items-center px-4 lg:px-6 shadow-paper-xs">
          <button className="lg:hidden mr-3 text-warm-charcoal-muted hover:text-warm-charcoal" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-6 w-6" strokeWidth={1.5} />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <a
              href="https://puxijietech.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-warm-charcoal-muted hover:text-pastel-blue flex items-center gap-1.5 transition-colors font-medium"
            >
              <Globe className="h-3.5 w-3.5" strokeWidth={1.5} />
              <span className="hidden sm:inline">查看网站</span>
            </a>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="animate-paper-in">
            <Outlet />
          </div>
        </main>
      </div>
      <CommandPalette />
      <ChatPanel />
    </div>
  );
}
