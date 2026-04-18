import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { Card } from '../components/Card.js';
import { Button } from '../components/Button.js';
import { api, ApiError } from '../lib/api.js';
import { getUser } from '../lib/auth.js';

interface EnrollResult {
  ticketNo: string;
}

export default function EnrollPage(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = getUser();

  const [name, setName] = useState(user?.name ?? '');
  const [phone, setPhone] = useState('');
  const [shirtSize, setShirtSize] = useState('');
  const [dietNote, setDietNote] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<EnrollResult | null>(null);

  /* 预填手机号（如果 user 有） */
  useEffect(() => {
    if (user?.name && !name) setName(user.name);
  }, [user?.name]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    if (!agreed || submitting) return;
    setSubmitting(true);
    setError('');
    try {
      const res = await api.post<EnrollResult>(`/api/v1/alumni/activities/${id}/enroll`, {
        name,
        phone,
        customFields: { shirtSize, dietNote },
      });
      setResult(res);
    } catch (err: unknown) {
      setError(err instanceof ApiError ? `报名失败 (${String(err.status)})` : '网络异常，请稍后重试');
    } finally {
      setSubmitting(false);
    }
  }

  /* 报名成功 — 电子票 */
  if (result) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-space-4">
        <CheckCircle size={48} className="text-color-success" />
        <h1 className="mt-space-4 text-text-xl font-bold text-color-text-primary">报名成功</h1>
        <Card className="mt-space-4 w-full text-center">
          <p className="text-text-sm text-color-text-secondary">电子票号</p>
          <p className="mt-space-1 text-text-lg font-bold text-color-accent">{result.ticketNo}</p>
          <div
            className="mt-space-4 mx-auto h-[120px] w-[120px] rounded-radius-md"
            style={{ background: 'linear-gradient(135deg, var(--color-bg-secondary), var(--color-border-default))' }}
            aria-label="二维码占位"
          />
          <p className="mt-space-3 text-text-xs text-color-text-secondary">请截图保存，入场时出示</p>
        </Card>
        <Button variant="ghost" className="mt-space-4" onClick={() => navigate(`/activity/${id}`)}>
          返回活动
        </Button>
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
        <h1 className="text-text-lg font-semibold text-color-text-primary">活动报名</h1>
      </header>

      <form onSubmit={handleSubmit} className="px-space-4 mt-space-4 flex flex-col gap-space-4">
        {/* 姓名 */}
        <label className="flex flex-col gap-space-1">
          <span className="text-text-sm font-medium text-color-text-primary">姓名 <span className="text-color-danger">*</span></span>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-radius-md border border-color-border-default bg-color-bg-elevated px-space-3 py-space-2 text-text-sm text-color-text-primary outline-none focus:border-color-interactive"
          />
        </label>

        {/* 手机号 */}
        <label className="flex flex-col gap-space-1">
          <span className="text-text-sm font-medium text-color-text-primary">手机号 <span className="text-color-danger">*</span></span>
          <input
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="rounded-radius-md border border-color-border-default bg-color-bg-elevated px-space-3 py-space-2 text-text-sm text-color-text-primary outline-none focus:border-color-interactive"
          />
        </label>

        {/* 自定义字段 */}
        <label className="flex flex-col gap-space-1">
          <span className="text-text-sm font-medium text-color-text-primary">衣服尺码</span>
          <select
            value={shirtSize}
            onChange={(e) => setShirtSize(e.target.value)}
            className="rounded-radius-md border border-color-border-default bg-color-bg-elevated px-space-3 py-space-2 text-text-sm text-color-text-primary outline-none focus:border-color-interactive"
          >
            <option value="">请选择</option>
            <option value="S">S</option>
            <option value="M">M</option>
            <option value="L">L</option>
            <option value="XL">XL</option>
            <option value="XXL">XXL</option>
          </select>
        </label>

        <label className="flex flex-col gap-space-1">
          <span className="text-text-sm font-medium text-color-text-primary">饮食忌口</span>
          <textarea
            rows={2}
            value={dietNote}
            onChange={(e) => setDietNote(e.target.value)}
            placeholder="如有忌口请填写"
            className="rounded-radius-md border border-color-border-default bg-color-bg-elevated px-space-3 py-space-2 text-text-sm text-color-text-primary outline-none focus:border-color-interactive resize-none"
          />
        </label>

        {/* 免责声明 */}
        <label className="flex items-start gap-space-2 cursor-pointer">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-[3px] accent-color-accent"
          />
          <span className="text-text-xs text-color-text-secondary leading-relaxed">
            我已阅读并同意活动免责声明，确认所填信息真实有效
          </span>
        </label>

        {error && <p className="text-text-sm text-color-danger">{error}</p>}

        <Button type="submit" disabled={!agreed || submitting} className="w-full">
          {submitting ? '提交中...' : '确认报名'}
        </Button>
      </form>
    </main>
  );
}
