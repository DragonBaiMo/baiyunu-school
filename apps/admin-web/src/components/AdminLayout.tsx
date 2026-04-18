import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ClipboardCheck,
  Calendar,
  Newspaper,
  Heart,
  Network,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react';
import { setToken } from '../lib/auth.js';
import { cn } from '../lib/utils.js';

type NavItem = {
  label: string;
  path: string;
  icon: typeof LayoutDashboard;
};

const NAV_ITEMS: ReadonlyArray<NavItem> = [
  { label: '概览', path: '/dashboard', icon: LayoutDashboard },
  { label: '审批管理', path: '/approval', icon: ClipboardCheck },
  { label: '活动管理', path: '/activities', icon: Calendar },
  { label: '新闻管理', path: '/portal/news', icon: Newspaper },
  { label: '捐赠管理', path: '/donation', icon: Heart },
  { label: '组织架构', path: '/org', icon: Network },
  { label: '系统设置', path: '/settings', icon: Settings },
];

function getBreadcrumb(pathname: string): string {
  const item = NAV_ITEMS.find((n) => pathname.startsWith(n.path));
  if (!item) return '管理后台';

  const sub = pathname.slice(item.path.length);
  if (sub === '/new') return `${item.label} / 新建`;
  if (sub.endsWith('/edit')) return `${item.label} / 编辑`;
  if (sub.length > 1) return `${item.label} / 详情`;
  return item.label;
}

export default function AdminLayout(): JSX.Element {
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = (): void => {
    setToken(null);
    navigate('/login', { replace: true });
  };

  const breadcrumb = getBreadcrumb(location.pathname);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* --- Sidebar --- */}
      <aside
        className={cn(
          'flex flex-col shrink-0 transition-all duration-200',
          collapsed ? 'w-0 lg:w-16' : 'w-60',
        )}
        style={{ backgroundColor: '#0F172A' }}
      >
        {/* Logo */}
        <div
          className={cn(
            'flex items-center h-16 px-4 shrink-0',
            collapsed && 'lg:justify-center lg:px-0',
          )}
        >
          {!collapsed && (
            <span className="text-white font-semibold text-lg whitespace-nowrap" style={{ fontFamily: "'Outfit', system-ui, sans-serif" }}>
              白云学院 · 管理后台
            </span>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-2">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'relative flex items-center gap-3 px-4 py-2.5 text-sm text-white/60 hover:text-white hover:bg-white/10 transition-colors',
                  active && 'text-white bg-[rgba(59,130,246,0.2)]',
                  collapsed && 'lg:justify-center lg:px-0',
                )}
              >
                {active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-[#3B82F6] rounded-r" />
                )}
                <Icon size={20} aria-hidden="true" className="shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User area */}
        {!collapsed && (
          <div className="shrink-0 border-t border-white/20 p-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/20 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">管理员</p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="text-white/70 hover:text-red-400 transition-colors cursor-pointer"
              aria-label="退出登录"
            >
              <LogOut size={18} />
            </button>
          </div>
        )}
      </aside>

      {/* --- Main --- */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header bar */}
        <header className="flex items-center h-16 shrink-0 px-6 bg-color-bg-elevated border-b border-color-border-default">
          <button
            type="button"
            className="lg:hidden mr-3 text-color-text-secondary hover:text-color-text-primary cursor-pointer"
            onClick={() => setCollapsed((c) => !c)}
            aria-label={collapsed ? '展开侧边栏' : '收起侧边栏'}
          >
            {collapsed ? <Menu size={20} /> : <X size={20} />}
          </button>
          <button
            type="button"
            className="hidden lg:block mr-3 text-color-text-secondary hover:text-color-text-primary cursor-pointer"
            onClick={() => setCollapsed((c) => !c)}
            aria-label={collapsed ? '展开侧边栏' : '收起侧边栏'}
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-1 text-text-sm text-color-text-secondary">
            <span>管理后台</span>
            <ChevronRight size={14} />
            <span className="text-color-text-primary font-medium">{breadcrumb}</span>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-color-bg-secondary">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
