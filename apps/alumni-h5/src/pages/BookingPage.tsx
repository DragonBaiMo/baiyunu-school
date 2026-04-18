import { useEffect, useState } from 'react';
import { ArrowLeft, MapPin, FileText, Award, MoreHorizontal, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/Card.js';
import { Button } from '../components/Button.js';
import { api, ApiError } from '../lib/api.js';

type ServiceType = 'visit' | 'archive' | 'cert' | 'more';

interface Companion {
  name: string;
  idNumber: string;
}

interface Reservation {
  id: string;
  date: string;
  status: string;
}

interface BookingResult {
  reservationNo: string;
  date: string;
}

const SERVICE_ITEMS: { key: ServiceType; label: string; icon: typeof MapPin; color: string }[] = [
  { key: 'visit', label: '返校参观', icon: MapPin, color: 'var(--color-interactive)' },
  { key: 'archive', label: '档案查询', icon: FileText, color: 'var(--color-success)' },
  { key: 'cert', label: '证书补办', icon: Award, color: 'var(--color-honor-gold)' },
  { key: 'more', label: '更多服务', icon: MoreHorizontal, color: 'var(--color-text-secondary)' },
];

export default function BookingPage(): JSX.Element {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);

  /* 表单 */
  const [date, setDate] = useState('');
  const [timeslot, setTimeslot] = useState<'am' | 'pm'>('am');
  const [companionCount, setCompanionCount] = useState(0);
  const [companions, setCompanions] = useState<Companion[]>([]);
  const [reason, setReason] = useState('');
  const [plate, setPlate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [bookingResult, setBookingResult] = useState<BookingResult | null>(null);

  /* 我的预约 */
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [resLoading, setResLoading] = useState(true);
  const [resError, setResError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setResLoading(true);
    api
      .get<Reservation[]>('/api/v1/alumni/workflow/reservations')
      .then((data) => {
        if (!cancelled) setReservations(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setResError(err instanceof ApiError ? `加载失败 (${String(err.status)})` : '网络异常');
        }
      })
      .finally(() => {
        if (!cancelled) setResLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [bookingResult]);

  /* 随行人数变化 */
  useEffect(() => {
    setCompanions((prev) => {
      const next = [...prev];
      while (next.length < companionCount) next.push({ name: '', idNumber: '' });
      return next.slice(0, companionCount);
    });
  }, [companionCount]);

  function updateCompanion(idx: number, field: keyof Companion, value: string): void {
    setCompanions((prev) => prev.map((c, i) => (i === idx ? { ...c, [field]: value } : c)));
  }

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setFormError('');
    try {
      const res = await api.post<BookingResult>('/api/v1/alumni/workflow/reservations', {
        date,
        timeslot,
        companions,
        reason,
        plate: plate || undefined,
      });
      setBookingResult(res);
    } catch (err: unknown) {
      setFormError(err instanceof ApiError ? `提交失败 (${String(err.status)})` : '网络异常，请稍后重试');
    } finally {
      setSubmitting(false);
    }
  }

  function handleServiceClick(key: ServiceType): void {
    if (key === 'visit') {
      setExpanded(true);
      setBookingResult(null);
    } else {
      window.alert('该功能即将开放，敬请期待');
    }
  }

  /* 提交成功 */
  if (bookingResult) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-space-4">
        <CheckCircle size={48} className="text-color-success" />
        <h1 className="mt-space-4 text-text-xl font-bold text-color-text-primary">预约提交成功</h1>
        <Card className="mt-space-4 w-full text-center">
          <p className="text-text-sm text-color-text-secondary">预约编号</p>
          <p className="mt-space-1 text-text-lg font-bold text-color-accent">{bookingResult.reservationNo}</p>
          <p className="mt-space-2 text-text-sm text-color-text-primary">日期：{bookingResult.date}</p>
          <p className="mt-space-1 text-text-xs text-color-text-secondary">状态：等待审批</p>
        </Card>
        <Button variant="ghost" className="mt-space-4" onClick={() => navigate(-1)}>返回</Button>
      </main>
    );
  }

  return (
    <main className="min-h-screen pb-space-8">
      {/* 顶部栏 */}
      <header className="flex items-center gap-space-2 px-space-4 pt-space-4 pb-space-2">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex h-8 w-8 items-center justify-center rounded-radius-full bg-color-bg-elevated border border-color-border-default cursor-pointer"
          aria-label="返回"
        >
          <ArrowLeft size={18} className="text-color-text-primary" />
        </button>
        <h1 className="text-text-lg font-semibold text-color-text-primary">返校预约</h1>
      </header>

      {/* 办事类型 */}
      <section className="px-space-4 mt-space-4" aria-label="办事类型">
        <ul className="grid grid-cols-2 gap-space-3">
          {SERVICE_ITEMS.map((s) => {
            const Icon = s.icon;
            return (
              <li key={s.key}>
                <Card
                  className={`flex flex-col items-center gap-space-2 py-space-4 cursor-pointer active:opacity-80 ${
                    expanded && s.key === 'visit' ? 'ring-2 ring-color-interactive' : ''
                  }`}
                  onClick={() => handleServiceClick(s.key)}
                >
                  <Icon size={24} style={{ color: s.color }} aria-hidden="true" />
                  <span className="text-text-sm font-medium text-color-text-primary">{s.label}</span>
                </Card>
              </li>
            );
          })}
        </ul>
      </section>

      {/* 预约表单 */}
      {expanded && (
        <form onSubmit={handleSubmit} className="px-space-4 mt-space-4 flex flex-col gap-space-4">
          <h2 className="text-text-base font-semibold text-color-text-primary">返校参观预约</h2>

          <label className="flex flex-col gap-space-1">
            <span className="text-text-sm font-medium text-color-text-primary">选择日期 <span className="text-color-danger">*</span></span>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="rounded-radius-md border border-color-border-default bg-color-bg-elevated px-space-3 py-space-2 text-text-sm text-color-text-primary outline-none focus:border-color-interactive"
            />
          </label>

          <fieldset className="flex flex-col gap-space-1">
            <legend className="text-text-sm font-medium text-color-text-primary">选择时间段 <span className="text-color-danger">*</span></legend>
            <div className="flex gap-space-4 mt-space-1">
              <label className="flex items-center gap-space-1 cursor-pointer">
                <input type="radio" name="timeslot" value="am" checked={timeslot === 'am'} onChange={() => setTimeslot('am')} className="accent-color-accent" />
                <span className="text-text-sm text-color-text-primary">上午</span>
              </label>
              <label className="flex items-center gap-space-1 cursor-pointer">
                <input type="radio" name="timeslot" value="pm" checked={timeslot === 'pm'} onChange={() => setTimeslot('pm')} className="accent-color-accent" />
                <span className="text-text-sm text-color-text-primary">下午</span>
              </label>
            </div>
          </fieldset>

          <label className="flex flex-col gap-space-1">
            <span className="text-text-sm font-medium text-color-text-primary">随行人数</span>
            <input
              type="number"
              min={0}
              max={5}
              value={companionCount}
              onChange={(e) => setCompanionCount(Math.min(5, Math.max(0, Number(e.target.value))))}
              className="rounded-radius-md border border-color-border-default bg-color-bg-elevated px-space-3 py-space-2 text-text-sm text-color-text-primary outline-none focus:border-color-interactive w-24"
            />
          </label>

          {companions.map((c, idx) => (
            <Card key={idx} className="flex flex-col gap-space-2">
              <span className="text-text-xs font-medium text-color-text-secondary">随行人 {idx + 1}</span>
              <input
                type="text"
                placeholder="姓名"
                required
                value={c.name}
                onChange={(e) => updateCompanion(idx, 'name', e.target.value)}
                className="rounded-radius-md border border-color-border-default bg-color-bg-elevated px-space-3 py-space-2 text-text-sm text-color-text-primary outline-none focus:border-color-interactive"
              />
              <input
                type="text"
                placeholder="身份证号"
                required
                value={c.idNumber}
                onChange={(e) => updateCompanion(idx, 'idNumber', e.target.value)}
                className="rounded-radius-md border border-color-border-default bg-color-bg-elevated px-space-3 py-space-2 text-text-sm text-color-text-primary outline-none focus:border-color-interactive"
              />
            </Card>
          ))}

          <label className="flex flex-col gap-space-1">
            <span className="text-text-sm font-medium text-color-text-primary">来访事由 <span className="text-color-danger">*</span></span>
            <textarea
              required
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="请简要说明来访事由"
              className="rounded-radius-md border border-color-border-default bg-color-bg-elevated px-space-3 py-space-2 text-text-sm text-color-text-primary outline-none focus:border-color-interactive resize-none"
            />
          </label>

          <label className="flex flex-col gap-space-1">
            <span className="text-text-sm font-medium text-color-text-primary">车牌号 <span className="text-text-xs text-color-text-secondary">（选填）</span></span>
            <input
              type="text"
              value={plate}
              onChange={(e) => setPlate(e.target.value)}
              placeholder="如需停车请填写"
              className="rounded-radius-md border border-color-border-default bg-color-bg-elevated px-space-3 py-space-2 text-text-sm text-color-text-primary outline-none focus:border-color-interactive"
            />
          </label>

          {formError && <p className="text-text-sm text-color-danger">{formError}</p>}

          <Button type="submit" disabled={submitting} className="w-full">
            {submitting ? '提交中...' : '提交预约'}
          </Button>
        </form>
      )}

      {/* 我的预约 */}
      <section className="px-space-4 mt-space-6" aria-label="我的预约">
        <h2 className="text-text-base font-semibold text-color-text-primary mb-space-3">我的预约</h2>

        {resLoading && (
          <ul className="flex flex-col gap-space-2">
            {[1, 2].map((i) => (
              <li key={i} className="animate-pulse">
                <div className="rounded-radius-lg border border-color-border-default bg-color-bg-elevated p-space-3">
                  <div className="h-4 rounded bg-color-bg-secondary w-1/2" />
                  <div className="mt-space-2 h-3 rounded bg-color-bg-secondary w-1/3" />
                </div>
              </li>
            ))}
          </ul>
        )}

        {!resLoading && resError && (
          <Card className="text-center py-space-4">
            <p className="text-text-sm text-color-danger">{resError}</p>
          </Card>
        )}

        {!resLoading && !resError && reservations.length === 0 && (
          <Card className="text-center py-space-4">
            <p className="text-text-sm text-color-text-secondary">暂无预约记录</p>
          </Card>
        )}

        {!resLoading && !resError && reservations.length > 0 && (
          <ul className="flex flex-col gap-space-2">
            {reservations.map((r) => (
              <li key={r.id}>
                <Card className="flex items-center justify-between">
                  <div>
                    <p className="text-text-sm font-medium text-color-text-primary">{r.date}</p>
                    <p className="text-text-xs text-color-text-secondary">预约编号：{r.id}</p>
                  </div>
                  <span className="text-text-xs font-medium text-color-interactive">{r.status}</span>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
