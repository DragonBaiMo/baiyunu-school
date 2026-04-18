import { useLocation, Outlet, Link } from 'react-router-dom';
import { GraduationCap, Phone, Mail, MapPin } from 'lucide-react';
import { isAuthenticated, getUser } from '../lib/auth.js';

const navLinks = [
  { to: '/home', label: '首页' },
  { to: '/activity', label: '活动中心' },
  { to: '/services', label: '办事大厅' },
  { to: '/login', label: '校友认证' },
  { to: '/mine', label: '我的' },
] as const;

export default function Layout(): JSX.Element {
  const { pathname } = useLocation();
  const authed = isAuthenticated();
  const user = getUser();

  return (
    <div className="flex flex-col" style={{ minHeight: '100vh', background: '#FFFFFF' }}>
      {/* ── Header ── */}
      <header className="site-header">
        <div className="container flex items-center justify-between" style={{ height: 64 }}>
          {/* Logo */}
          <Link to="/home" className="flex items-center gap-2 shrink-0" style={{ textDecoration: 'none' }}>
            <GraduationCap size={28} style={{ color: '#2563EB' }} />
            <span style={{ fontSize: 18, fontWeight: 700, color: '#0F172A', fontFamily: '"DM Sans", sans-serif' }}>
              白云学院智慧校友平台
            </span>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-1">
            {navLinks.map((link) => {
              const active = pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`nav-link relative${active ? ' active' : ''}`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Auth */}
          <div className="shrink-0">
            {authed ? (
              <Link
                to="/mine"
                className="flex items-center gap-2"
                style={{ textDecoration: 'none', color: '#0F172A', fontSize: 14, fontWeight: 500 }}
              >
                <div
                  className="flex items-center justify-center rounded-full"
                  style={{ width: 32, height: 32, background: '#2563EB', color: '#FFF', fontSize: 14, fontWeight: 600 }}
                >
                  {(user?.name ?? '校').charAt(0)}
                </div>
                <span>{user?.name ?? '校友用户'}</span>
              </Link>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center justify-center"
                style={{
                  background: '#2563EB',
                  color: '#FFFFFF',
                  fontSize: 14,
                  fontWeight: 600,
                  padding: '8px 20px',
                  borderRadius: 8,
                  textDecoration: 'none',
                  transition: 'background 0.2s',
                }}
              >
                登录
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* ── Footer ── */}
      <footer className="site-footer">
        <div className="container" style={{ paddingTop: 48, paddingBottom: 24 }}>
          <div className="grid grid-cols-3 gap-12">
            {/* 关于我们 */}
            <div>
              <h3 style={{ color: '#FFFFFF', fontSize: 16, fontWeight: 600, marginBottom: 16 }}>关于我们</h3>
              <p style={{ fontSize: 14, lineHeight: 1.8 }}>
                白云学院校友事务办公室致力于服务广大校友，搭建校友与母校之间的桥梁，促进校友之间的交流与合作。
              </p>
            </div>
            {/* 快速链接 */}
            <div>
              <h3 style={{ color: '#FFFFFF', fontSize: 16, fontWeight: 600, marginBottom: 16 }}>快速链接</h3>
              <ul className="flex flex-col gap-2" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                <li><Link to="/home">学校主页</Link></li>
                <li><Link to="/activity">活动中心</Link></li>
                <li><Link to="/services">办事大厅</Link></li>
                <li><Link to="/login">校友认证</Link></li>
              </ul>
            </div>
            {/* 联系方式 */}
            <div>
              <h3 style={{ color: '#FFFFFF', fontSize: 16, fontWeight: 600, marginBottom: 16 }}>联系方式</h3>
              <ul className="flex flex-col gap-3" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                <li className="flex items-center gap-2">
                  <Phone size={14} />
                  <span style={{ fontSize: 14 }}>020-36093333</span>
                </li>
                <li className="flex items-center gap-2">
                  <Mail size={14} />
                  <span style={{ fontSize: 14 }}>alumni@baiyunu.edu.cn</span>
                </li>
                <li className="flex items-start gap-2">
                  <MapPin size={14} className="shrink-0" style={{ marginTop: 3 }} />
                  <span style={{ fontSize: 14 }}>广东省广州市白云区江高镇学苑路1号</span>
                </li>
              </ul>
            </div>
          </div>
          {/* 版权 */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: 32, paddingTop: 20 }}>
            <p className="text-center" style={{ fontSize: 13 }}>
              © {new Date().getFullYear()} 白云学院校友事务办公室 版权所有
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
