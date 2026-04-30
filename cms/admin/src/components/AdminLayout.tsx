import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/useAuth';
import {
  LayoutDashboard, Package, Image, FileText, Newspaper,
  HelpCircle, Scale, Settings, Rocket, LogOut,
  Menu, X, Globe,
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
    <div className="flex h-screen overflow-hidden">
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Acrylic Sidebar */}
      <aside className={cn(
        'fixed inset-y-0 left-0 z-50 w-64 flex flex-col transition-transform lg:translate-x-0 lg:static lg:z-auto',
        'acrylic-strong border-r border-white/20',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        {/* Brand */}
        <div className="h-16 flex items-center gap-3 px-6 border-b border-[#EBEBEB]/50">
          <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
            <Globe className="h-5 w-5 text-primary" />
          </div>
          <div>
            <div className="font-semibold text-sm text-slate-800">Puxijie CMS</div>
            <div className="text-xs text-slate-500">内容管理后台</div>
          </div>
          <button className="ml-auto lg:hidden text-slate-500 hover:text-slate-800" onClick={() => setSidebarOpen(false)}>
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-fluent',
                  isActive
                    ? 'bg-primary/10 text-primary shadow-sm'
                    : 'text-slate-600 hover:bg-[#FAFAFA]/80 hover:text-slate-800'
                )
              }
            >
              <item.icon className="h-4.5 w-4.5" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div className="border-t border-[#EBEBEB]/50 p-3">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
              {user?.email?.[0]?.toUpperCase() || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate text-slate-700">{user?.email}</div>
              <div className="text-xs text-slate-500">{user?.role === 'admin' ? '管理员' : '编辑'}</div>
            </div>
            <button onClick={handleLogout} className="text-slate-400 hover:text-red-500 transition-colors" title="退出登录">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 border-b border-[#EBEBEB]/50 bg-white/50 backdrop-blur-md flex items-center px-4 lg:px-6">
          <button className="lg:hidden mr-3 text-slate-600" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex-1" />
          <a
            href="https://puxijietech.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-slate-500 hover:text-primary flex items-center gap-1.5 transition-colors"
          >
            <Globe className="h-3.5 w-3.5" />
            查看网站
          </a>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
