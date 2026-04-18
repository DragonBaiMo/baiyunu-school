import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  IdCard,
  CalendarCheck,
  MapPin,
  Heart,
  FileText,
  Settings,
  LogOut,
} from 'lucide-react';
import { getUser, clearAuth, isAuthenticated } from '../lib/auth.js';

interface MenuItem {
  key: string;
  label: string;
  icon: typeof IdCard;
  iconBg: string;
  iconColor: string;
}

const menuItems: MenuItem[] = [
  { key: 'card', label: '我的校友卡', icon: IdCard, iconBg: '#EFF6FF', iconColor: '#2563EB' },
  { key: 'activity', label: '我的活动', icon: CalendarCheck, iconBg: '#ECFDF5', iconColor: '#059669' },
  { key: 'booking', label: '我的预约', icon: MapPin, iconBg: '#FFF7ED', iconColor: '#F97316' },
  { key: 'donation', label: '捐赠记录', icon: Heart, iconBg: '#FEF2F2', iconColor: '#EF4444' },
  { key: 'certificate', label: '电子证明', icon: FileText, iconBg: '#F5F3FF', iconColor: '#7C3AED' },
  { key: 'settings', label: '设置', icon: Settings, iconBg: '#F1F5F9', iconColor: '#64748B' },
];

export default function MinePage(): JSX.Element {
  const navigate = useNavigate();
  const user = getUser();
  const authed = isAuthenticated();
  const [activeMenu, setActiveMenu] = useState('card');

  const displayName = user?.name ?? '校友用户';
  const initial = displayName.charAt(0);

  function handleLogout(): void {
    clearAuth();
    navigate('/home');
  }

  return (
    <div>
      {/* 用户信息横幅 */}
      <div className="gradient-primary" style={{ padding: '32px 0' }}>
        <div className="container flex items-center gap-5">
          {/* 头像 */}
          <div
            className="shrink-0 rounded-full flex items-center justify-center"
            style={{ width: 72, height: 72, border: '3px solid rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.15)' }}
          >
            <span style={{ fontSize: 28, fontWeight: 700, color: '#FFFFFF' }}>{initial}</span>
          </div>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: '#FFFFFF' }}>{displayName}</h1>
            <span
              className="inline-block mt-2"
              style={{
                fontSize: 13,
                fontWeight: 500,
                background: 'rgba(255,255,255,0.2)',
                color: '#FFFFFF',
                padding: '3px 12px',
                borderRadius: 9999,
              }}
            >
              {authed ? '✓ 已认证校友' : '未认证'}
            </span>
          </div>
        </div>
      </div>

      {/* 主体区域 */}
      <div className="container" style={{ paddingTop: 32, paddingBottom: 64 }}>
        <div className="flex gap-8">
          {/* 左侧菜单 (33%) */}
          <div style={{ width: '33%', flexShrink: 0 }}>
            <div className="portal-card overflow-hidden">
              {menuItems.map((item, idx) => {
                const Icon = item.icon;
                const active = activeMenu === item.key;
                return (
                  <button
                    key={item.key}
                    type="button"
                    className="flex items-center gap-3 w-full px-5 py-4 cursor-pointer text-left transition-colors"
                    style={{
                      borderBottom: idx < menuItems.length - 1 ? '1px solid #F1F5F9' : 'none',
                      background: active ? '#F8FAFC' : '#FFFFFF',
                      borderLeft: active ? '3px solid #2563EB' : '3px solid transparent',
                    }}
                    onClick={() => setActiveMenu(item.key)}
                  >
                    <div
                      className="flex items-center justify-center rounded-full shrink-0"
                      style={{ width: 36, height: 36, background: item.iconBg }}
                    >
                      <Icon size={18} style={{ color: item.iconColor }} />
                    </div>
                    <span style={{ fontSize: 14, fontWeight: active ? 600 : 400, color: active ? '#0F172A' : '#475569' }}>
                      {item.label}
                    </span>
                  </button>
                );
              })}
              {/* 退出登录 */}
              {authed && (
                <button
                  type="button"
                  className="flex items-center gap-3 w-full px-5 py-4 cursor-pointer text-left transition-colors"
                  style={{ borderTop: '1px solid #F1F5F9' }}
                  onClick={handleLogout}
                >
                  <div
                    className="flex items-center justify-center rounded-full shrink-0"
                    style={{ width: 36, height: 36, background: '#FEF2F2' }}
                  >
                    <LogOut size={18} style={{ color: '#EF4444' }} />
                  </div>
                  <span style={{ fontSize: 14, color: '#EF4444' }}>退出登录</span>
                </button>
              )}
            </div>
          </div>

          {/* 右侧内容区 (67%) */}
          <div style={{ flex: 1 }}>
            <div className="portal-card p-8">
              <h2 style={{ fontSize: 20, fontWeight: 600, color: '#0F172A' }}>
                欢迎回来，{displayName}
              </h2>
              <p style={{ fontSize: 14, color: '#64748B', marginTop: 8 }}>
                您可以在左侧菜单中选择需要的服务
              </p>

              {/* 仪表盘概览 */}
              <div className="grid grid-cols-3 gap-4 mt-8">
                <div className="portal-card p-5 text-center">
                  <p className="stat-number" style={{ fontSize: 28 }}>3</p>
                  <p style={{ fontSize: 13, color: '#64748B', marginTop: 4 }}>已报名活动</p>
                </div>
                <div className="portal-card p-5 text-center">
                  <p className="stat-number" style={{ fontSize: 28 }}>1</p>
                  <p style={{ fontSize: 13, color: '#64748B', marginTop: 4 }}>待处理预约</p>
                </div>
                <div className="portal-card p-5 text-center">
                  <p className="stat-number" style={{ fontSize: 28 }}>¥500</p>
                  <p style={{ fontSize: 13, color: '#64748B', marginTop: 4 }}>累计捐赠</p>
                </div>
              </div>

              {/* 快捷操作 */}
              <div style={{ marginTop: 32 }}>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: '#0F172A', marginBottom: 12 }}>快捷操作</h3>
                <div className="flex gap-3">
                  <button
                    type="button"
                    className="cursor-pointer"
                    style={{
                      padding: '10px 24px',
                      background: '#EFF6FF',
                      color: '#2563EB',
                      fontSize: 14,
                      fontWeight: 500,
                      borderRadius: 8,
                      border: 'none',
                    }}
                    onClick={() => navigate('/activity')}
                  >
                    浏览活动
                  </button>
                  <button
                    type="button"
                    className="cursor-pointer"
                    style={{
                      padding: '10px 24px',
                      background: '#ECFDF5',
                      color: '#059669',
                      fontSize: 14,
                      fontWeight: 500,
                      borderRadius: 8,
                      border: 'none',
                    }}
                    onClick={() => navigate('/services')}
                  >
                    办事大厅
                  </button>
                  <button
                    type="button"
                    className="cursor-pointer"
                    style={{
                      padding: '10px 24px',
                      background: '#FFFBEB',
                      color: '#D97706',
                      fontSize: 14,
                      fontWeight: 500,
                      borderRadius: 8,
                      border: 'none',
                    }}
                    onClick={() => navigate('/donation')}
                  >
                    爱心捐赠
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
