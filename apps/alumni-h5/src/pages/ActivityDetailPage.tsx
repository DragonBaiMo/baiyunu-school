import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, MapPin, Users, Building } from 'lucide-react';
import { Card } from '../components/Card.js';
import { Button } from '../components/Button.js';
import { api, ApiError } from '../lib/api.js';

interface ActivityDetail {
  id: string;
  title: string;
  coverUrl?: string;
  startTime: string;
  endTime: string;
  location: string;
  enrolled: number;
  capacity: number;
  status: 'open' | 'full' | 'closed' | 'cancelled';
  organizer?: string;
  descriptionHtml?: string;
  myEnrollment?: { ticketNo: string } | null;
}

function statusBadge(status: ActivityDetail['status']): { label: string; cls: string } {
  switch (status) {
    case 'open':
      return { label: '报名中', cls: 'bg-color-success text-white' };
    case 'full':
      return { label: '已满', cls: 'bg-color-danger text-white' };
    case 'closed':
    case 'cancelled':
      return { label: '已结束', cls: 'bg-color-bg-secondary text-color-text-secondary' };
  }
}

function sanitizeHtml(html: string): string {
  return html.replace(/<script[\s\S]*?<\/script\s*>/gi, '').replace(/<script[\s\S]*?\/?>/gi, '');
}

export default function ActivityDetailPage(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [detail, setDetail] = useState<ActivityDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    api
      .get<ActivityDetail>(`/api/v1/public/activities/${id}`)
      .then((data) => {
        if (!cancelled) setDetail(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof ApiError ? `加载失败 (${String(err.status)})` : '网络异常，请稍后重试');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <main className="min-h-screen animate-pulse">
        <div className="h-[200px] bg-color-bg-secondary" />
        <div className="p-space-4">
          <div className="h-6 rounded bg-color-bg-secondary w-3/4" />
          <div className="mt-space-3 h-4 rounded bg-color-bg-secondary w-1/2" />
          <div className="mt-space-3 h-4 rounded bg-color-bg-secondary w-2/3" />
        </div>
      </main>
    );
  }

  if (error || !detail) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-space-4">
        <p className="text-text-sm text-color-danger">{error || '活动不存在'}</p>
        <Button variant="ghost" className="mt-space-4" onClick={() => navigate(-1)}>返回</Button>
      </main>
    );
  }

  const badge = statusBadge(detail.status);
  const enrolled = detail.myEnrollment !== undefined && detail.myEnrollment !== null;

  return (
    <main className="min-h-screen pb-[80px]">
      {/* 返回按钮 */}
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="fixed top-space-3 left-space-3 z-10 flex h-8 w-8 items-center justify-center rounded-radius-full bg-color-bg-elevated/80 backdrop-blur shadow-shadow-sm cursor-pointer"
        aria-label="返回"
      >
        <ArrowLeft size={18} className="text-color-text-primary" />
      </button>

      {/* 封面 */}
      <div
        className="h-[200px]"
        style={{ background: 'linear-gradient(135deg, var(--color-bg-secondary), var(--color-border-default))' }}
      />

      {/* 标题 */}
      <div className="px-space-4 pt-space-4">
        <div className="flex items-start justify-between gap-space-2">
          <h1 className="text-text-xl font-bold text-color-text-primary flex-1">{detail.title}</h1>
          <span className={`shrink-0 rounded-radius-full px-space-2 py-[2px] text-text-xs font-medium ${badge.cls}`}>
            {badge.label}
          </span>
        </div>
      </div>

      {/* 信息卡片 */}
      <div className="px-space-4 mt-space-4">
        <Card className="flex flex-col gap-space-3">
          <div className="flex items-center gap-space-2">
            <Calendar size={16} className="text-color-interactive shrink-0" aria-hidden="true" />
            <span className="text-text-sm text-color-text-primary">{detail.startTime} ~ {detail.endTime}</span>
          </div>
          <div className="flex items-center gap-space-2">
            <MapPin size={16} className="text-color-interactive shrink-0" aria-hidden="true" />
            <span className="text-text-sm text-color-text-primary">{detail.location}</span>
          </div>
          <div className="flex items-center gap-space-2">
            <Users size={16} className="text-color-interactive shrink-0" aria-hidden="true" />
            <span className="text-text-sm text-color-text-primary">{detail.enrolled}/{detail.capacity} 人已报名</span>
          </div>
          {detail.organizer && (
            <div className="flex items-center gap-space-2">
              <Building size={16} className="text-color-interactive shrink-0" aria-hidden="true" />
              <span className="text-text-sm text-color-text-primary">{detail.organizer}</span>
            </div>
          )}
        </Card>
      </div>

      {/* 活动介绍 */}
      {detail.descriptionHtml && (
        <section className="px-space-4 mt-space-4" aria-label="活动介绍">
          <h2 className="text-text-lg font-semibold text-color-text-primary mb-space-2">活动介绍</h2>
          <div
            className="prose prose-sm text-text-sm text-color-text-primary leading-relaxed"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(detail.descriptionHtml) }}
          />
        </section>
      )}

      {/* 底部固定按钮 */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-color-border-default bg-color-bg-primary px-space-4 py-space-3 safe-area-bottom">
        {enrolled ? (
          <Button className="w-full">查看电子票</Button>
        ) : detail.status === 'open' ? (
          <Link to={`/activity/${detail.id}/enroll`} className="block">
            <Button className="w-full">立即报名</Button>
          </Link>
        ) : (
          <Button className="w-full" disabled>
            {detail.status === 'full' ? '已满员' : '已结束'}
          </Button>
        )}
      </div>
    </main>
  );
}
