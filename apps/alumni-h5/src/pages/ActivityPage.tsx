import { useEffect, useState } from 'react';
import { ImageIcon, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api, ApiError } from '../lib/api.js';

interface Activity {
  id: string;
  title: string;
  coverUrl?: string;
  startTime: string;
  endTime: string;
  location: string;
  enrolled: number;
  capacity: number;
  status: 'open' | 'full' | 'closed' | 'cancelled';
}

const TABS = ['全部', '校庆', '讲座', '社交', '文体'] as const;

const tabColors: Record<Activity['status'], string> = {
  open: '#22C55E',
  full: '#EF4444',
  closed: '#94A3B8',
  cancelled: '#94A3B8',
};

function statusBadge(status: Activity['status']): { label: string; cls: string } {
  switch (status) {
    case 'open':
      return { label: '报名中', cls: 'badge-success' };
    case 'full':
      return { label: '已满', cls: 'badge-danger' };
    case 'closed':
    case 'cancelled':
      return { label: '已结束', cls: 'badge-warning' };
  }
}

export default function ActivityPage(): JSX.Element {
  const [tab, setTab] = useState<string>('全部');
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api
      .get<Activity[]>('/api/v1/public/activities?limit=20')
      .then((data) => {
        if (!cancelled) setActivities(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof ApiError ? `加载失败 (${String(err.status)})` : '网络异常');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div style={{ background: '#F8FAFC', minHeight: '60vh' }}>
      <div className="container" style={{ paddingTop: 40, paddingBottom: 64 }}>
        {/* 标题行 + 搜索框 */}
        <div className="flex items-center justify-between mb-6">
          <h1 style={{ fontSize: 28, fontWeight: 700, color: '#0F172A' }}>活动中心</h1>
          <div
            className="flex items-center gap-2 px-4 py-2"
            style={{
              background: '#FFFFFF',
              borderRadius: 8,
              border: '1px solid #E2E8F0',
              width: 280,
            }}
          >
            <Search size={16} style={{ color: '#94A3B8', flexShrink: 0 }} aria-hidden="true" />
            <input
              type="text"
              placeholder="搜索活动"
              readOnly
              className="flex-1 bg-transparent outline-none"
              style={{ fontSize: 14, color: '#0F172A' }}
            />
          </div>
        </div>

        {/* Tab 筛选栏 */}
        <nav className="flex gap-2 mb-8" aria-label="活动分类">
          {TABS.map((t) => {
            const active = tab === t;
            return (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className="cursor-pointer"
                style={{
                  fontSize: 14,
                  fontWeight: active ? 600 : 400,
                  color: active ? '#FFFFFF' : '#64748B',
                  background: active ? '#2563EB' : '#FFFFFF',
                  border: active ? 'none' : '1px solid #E2E8F0',
                  padding: '6px 20px',
                  borderRadius: 9999,
                  transition: 'all 0.2s',
                }}
              >
                {t}
              </button>
            );
          })}
        </nav>

        {/* 活动列表 */}
        {loading && (
          <div className="grid grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="portal-card overflow-hidden" style={{ borderRadius: 12 }}>
                <div className="skeleton" style={{ height: 200 }} />
                <div className="p-4">
                  <div className="skeleton" style={{ height: 16, width: '80%' }} />
                  <div className="skeleton" style={{ height: 12, width: '60%', marginTop: 8 }} />
                  <div className="skeleton" style={{ height: 12, width: '40%', marginTop: 8 }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && (error || activities.length === 0) && (
          <div className="flex flex-col items-center py-20">
            <svg width="80" height="80" viewBox="0 0 64 64" fill="none">
              <rect x="8" y="12" width="48" height="44" rx="6" stroke="#CBD5E1" strokeWidth="2" fill="none" />
              <line x1="8" y1="24" x2="56" y2="24" stroke="#CBD5E1" strokeWidth="2" />
              <line x1="20" y1="8" x2="20" y2="16" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />
              <line x1="44" y1="8" x2="44" y2="16" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />
              <rect x="18" y="32" width="8" height="6" rx="1" fill="#CBD5E1" />
              <rect x="28" y="32" width="8" height="6" rx="1" fill="#CBD5E1" />
              <rect x="38" y="32" width="8" height="6" rx="1" fill="#CBD5E1" />
              <rect x="18" y="42" width="8" height="6" rx="1" fill="#CBD5E1" />
              <rect x="28" y="42" width="8" height="6" rx="1" fill="#CBD5E1" />
            </svg>
            <p className="mt-4" style={{ fontSize: 16, fontWeight: 500, color: '#64748B' }}>
              {error ? '暂无活动，请检查网络连接后重试' : '暂无活动，敬请期待'}
            </p>
          </div>
        )}

        {!loading && !error && activities.length > 0 && (
          <div className="grid grid-cols-3 gap-6">
            {activities.map((a) => {
              const badge = statusBadge(a.status);
              const barColor = tabColors[a.status];
              return (
                <Link
                  key={a.id}
                  to={`/activity/${a.id}`}
                  className="portal-card block overflow-hidden"
                  style={{ borderRadius: 12, textDecoration: 'none' }}
                >
                  {/* 封面 */}
                  {a.coverUrl ? (
                    <img src={a.coverUrl} alt="" style={{ width: '100%', height: 200, objectFit: 'cover' }} />
                  ) : (
                    <div className="img-placeholder" style={{ height: 200 }}>
                      <ImageIcon size={28} />
                    </div>
                  )}
                  <div className="flex">
                    <div style={{ width: 4, flexShrink: 0, background: barColor }} />
                    <div className="flex-1 p-4">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="line-clamp-2 flex-1" style={{ fontSize: 15, fontWeight: 600, color: '#0F172A', lineHeight: 1.4 }}>
                          {a.title}
                        </h3>
                        <span className={`shrink-0 ${badge.cls}`}>{badge.label}</span>
                      </div>
                      <p style={{ fontSize: 13, color: '#64748B', marginTop: 8 }}>{a.startTime}</p>
                      <p style={{ fontSize: 13, color: '#64748B', marginTop: 2 }}>{a.location}</p>
                      <p style={{ fontSize: 13, color: '#94A3B8', marginTop: 8 }}>
                        {a.enrolled}/{a.capacity} 人已报名
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
