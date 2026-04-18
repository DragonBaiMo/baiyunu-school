import { useEffect, useState } from 'react';
import { ArrowLeft, Heart, ChevronRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Card } from '../components/Card.js';
import { api, ApiError } from '../lib/api.js';

interface DonationStats {
  totalAmount: number;
  totalCount: number;
}

interface DonationProject {
  id: string;
  title: string;
  description: string;
  raised: number;
  goal: number;
}

const PROJECTS: DonationProject[] = [
  { id: 'edu-fund', title: '校友教育基金', description: '资助优秀学子完成学业，点亮未来希望', raised: 128000, goal: 500000 },
  { id: 'green-campus', title: '校园绿化项目', description: '为美丽校园增添一抹绿色，共建生态校园', raised: 65000, goal: 200000 },
  { id: 'digital-lib', title: '图书馆数字化', description: '推进图书馆数字化建设，让知识触手可及', raised: 230000, goal: 800000 },
];

function formatAmount(n: number): string {
  if (n >= 10000) return `${(n / 10000).toFixed(1)}万`;
  return n.toLocaleString('zh-CN');
}

export default function DonationPage(): JSX.Element {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DonationStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setStatsLoading(true);
    api
      .get<DonationStats>('/api/v1/public/donation/wall/stats')
      .then((data) => {
        if (!cancelled) setStats(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setStatsError(err instanceof ApiError ? `加载失败 (${String(err.status)})` : '网络异常');
        }
      })
      .finally(() => {
        if (!cancelled) setStatsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="min-h-screen pb-space-8">
      {/* 返回按钮 */}
      <header className="flex items-center gap-space-2 px-space-4 pt-space-4 pb-space-2">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex h-8 w-8 items-center justify-center rounded-radius-full bg-color-bg-elevated border border-color-border-default cursor-pointer"
          aria-label="返回"
        >
          <ArrowLeft size={18} className="text-color-text-primary" />
        </button>
        <h1 className="text-text-lg font-semibold text-color-text-primary">爱心捐赠</h1>
      </header>

      {/* Banner */}
      <section
        className="mx-space-4 mt-space-2 rounded-radius-lg px-space-4 py-space-6 text-white"
        style={{ background: 'linear-gradient(135deg, var(--color-honor-gold), var(--color-emotion-red))' }}
        aria-label="捐赠 Banner"
      >
        <Heart size={32} className="opacity-80" aria-hidden="true" />
        <h2 className="mt-space-2 text-text-2xl font-bold">爱心捐赠</h2>
        <p className="mt-space-1 text-text-sm opacity-90">让爱回归母校</p>
      </section>

      {/* 荣誉墙入口 */}
      <div className="px-space-4 mt-space-4">
        <Link to="/donation/wall">
          <Card className="flex items-center justify-between cursor-pointer active:opacity-80">
            <span className="text-text-sm font-medium text-color-text-primary">🏆 查看荣誉墙</span>
            <ChevronRight size={16} className="text-color-text-secondary" />
          </Card>
        </Link>
      </div>

      {/* 累计统计 */}
      <section className="px-space-4 mt-space-4" aria-label="捐赠统计">
        {statsLoading && (
          <Card className="animate-pulse">
            <div className="flex justify-around">
              <div className="text-center">
                <div className="h-6 w-20 rounded bg-color-bg-secondary mx-auto" />
                <div className="mt-space-1 h-3 w-12 rounded bg-color-bg-secondary mx-auto" />
              </div>
              <div className="text-center">
                <div className="h-6 w-16 rounded bg-color-bg-secondary mx-auto" />
                <div className="mt-space-1 h-3 w-12 rounded bg-color-bg-secondary mx-auto" />
              </div>
            </div>
          </Card>
        )}

        {!statsLoading && statsError && (
          <Card className="text-center py-space-4">
            <p className="text-text-sm text-color-danger">{statsError}</p>
          </Card>
        )}

        {!statsLoading && !statsError && stats && (
          <Card className="flex justify-around py-space-4">
            <div className="text-center">
              <p className="text-text-xl font-bold" style={{ color: 'var(--color-honor-gold)' }}>
                ¥{formatAmount(stats.totalAmount)}
              </p>
              <p className="mt-space-1 text-text-xs text-color-text-secondary">捐赠总额</p>
            </div>
            <div className="w-px bg-color-border-default" />
            <div className="text-center">
              <p className="text-text-xl font-bold" style={{ color: 'var(--color-honor-gold)' }}>
                {stats.totalCount.toLocaleString('zh-CN')}
              </p>
              <p className="mt-space-1 text-text-xs text-color-text-secondary">捐赠人次</p>
            </div>
          </Card>
        )}
      </section>

      {/* 捐赠项目 */}
      <section className="px-space-4 mt-space-6" aria-label="捐赠项目">
        <h2 className="text-text-base font-semibold text-color-text-primary mb-space-3">捐赠项目</h2>
        <ul className="flex flex-col gap-space-3">
          {PROJECTS.map((p) => {
            const pct = Math.min(100, Math.round((p.raised / p.goal) * 100));
            return (
              <li key={p.id}>
                <Link to={`/donation/${p.id}`} className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-color-interactive rounded-radius-lg">
                  <Card className="cursor-pointer active:opacity-80">
                    <h3 className="text-text-base font-medium text-color-text-primary">{p.title}</h3>
                    <p className="mt-space-1 text-text-xs text-color-text-secondary">{p.description}</p>
                    {/* 进度条 */}
                    <div className="mt-space-3 h-2 rounded-radius-full bg-color-bg-secondary overflow-hidden">
                      <div
                        className="h-full rounded-radius-full transition-all"
                        style={{ width: `${String(pct)}%`, background: 'var(--color-honor-gold)' }}
                      />
                    </div>
                    <div className="mt-space-1 flex justify-between text-text-xs text-color-text-secondary">
                      <span>已筹 ¥{formatAmount(p.raised)}</span>
                      <span>目标 ¥{formatAmount(p.goal)}</span>
                    </div>
                  </Card>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </main>
  );
}
