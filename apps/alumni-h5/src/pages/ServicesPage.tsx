import { MapPin, FileCheck, FolderSearch, Award, Pen, MoreHorizontal } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ServiceItem {
  key: string;
  label: string;
  desc: string;
  icon: typeof MapPin;
  iconBg: string;
  iconColor: string;
  to?: string;
}

const SERVICES: ServiceItem[] = [
  { key: 'booking', label: '返校预约', desc: '预约参观校园，重温美好时光', icon: MapPin, iconBg: '#FFF7ED', iconColor: '#F97316', to: '/booking' },
  { key: 'cert-check', label: '电子证明', desc: '在线开具各类证明文件', icon: FileCheck, iconBg: '#ECFDF5', iconColor: '#059669' },
  { key: 'archive', label: '档案查询', desc: '查询个人学籍与档案信息', icon: FolderSearch, iconBg: '#F5F3FF', iconColor: '#7C3AED' },
  { key: 'cert-reissue', label: '证书补办', desc: '补办毕业证书及学位证书', icon: Award, iconBg: '#FFFBEB', iconColor: '#F59E0B' },
  { key: 'recommend', label: '校友推荐信', desc: '申请由母校出具的推荐信', icon: Pen, iconBg: '#FEF2F2', iconColor: '#EF4444' },
  { key: 'more', label: '更多服务', desc: '更多校友服务即将开放', icon: MoreHorizontal, iconBg: '#F1F5F9', iconColor: '#64748B' },
];

export default function ServicesPage(): JSX.Element {
  return (
    <div>
      {/* Banner */}
      <div className="gradient-primary relative" style={{ height: 120 }}>
        <div className="container relative z-10 flex flex-col justify-center h-full">
          <h1 style={{ fontSize: 28, fontWeight: 700, color: '#FFFFFF' }}>办事大厅</h1>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.8)', marginTop: 4 }}>一站式校友服务，让办事更便捷</p>
        </div>
      </div>

      {/* 服务网格 */}
      <div className="container" style={{ paddingTop: 40, paddingBottom: 64 }}>
        <div className="grid grid-cols-3 gap-6">
          {SERVICES.map((s) => {
            const Icon = s.icon;
            const inner = (
              <div className="portal-card p-6 h-full flex flex-col">
                <div
                  className="flex items-center justify-center rounded-full"
                  style={{ width: 52, height: 52, background: s.iconBg }}
                >
                  <Icon size={24} style={{ color: s.iconColor }} aria-hidden="true" />
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: '#0F172A', marginTop: 16 }}>
                  {s.label}
                </h3>
                <p style={{ fontSize: 14, color: '#64748B', marginTop: 4, flex: 1 }}>
                  {s.desc}
                </p>
                <span style={{ fontSize: 13, color: '#2563EB', fontWeight: 500, marginTop: 16 }}>
                  了解更多 →
                </span>
              </div>
            );

            if (s.to) {
              return (
                <Link key={s.key} to={s.to} className="block" style={{ textDecoration: 'none' }}>
                  {inner}
                </Link>
              );
            }

            return (
              <div
                key={s.key}
                role="button"
                tabIndex={0}
                className="cursor-pointer"
                onClick={() => window.alert(`「${s.label}」功能即将开放，敬请期待`)}
                onKeyDown={(e) => { if (e.key === 'Enter') window.alert(`「${s.label}」功能即将开放，敬请期待`); }}
              >
                {inner}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
