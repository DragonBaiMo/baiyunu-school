import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { Card } from '../components/Card.js';
import { Button } from '../components/Button.js';
import { api, ApiError } from '../lib/api.js';
import { getUser } from '../lib/auth.js';

interface DonationProject {
  id: string;
  title: string;
  description: string;
  raised: number;
  goal: number;
}

const PROJECTS: Record<string, DonationProject> = {
  'edu-fund': { id: 'edu-fund', title: '校友教育基金', description: '资助优秀学子完成学业，点亮未来希望。该基金设立于建校初期，旨在帮助家庭经济困难的学生顺利完成学业，同时奖励学业优异的学子。', raised: 128000, goal: 500000 },
  'green-campus': { id: 'green-campus', title: '校园绿化项目', description: '为美丽校园增添一抹绿色，共建生态校园。项目将用于校园内绿化带改造、花园建设及环保设施升级。', raised: 65000, goal: 200000 },
  'digital-lib': { id: 'digital-lib', title: '图书馆数字化', description: '推进图书馆数字化建设，让知识触手可及。包括电子书库扩充、智能检索系统升级、数字阅览室建设。', raised: 230000, goal: 800000 },
};

const QUICK_AMOUNTS = [50, 100, 200, 500, 1000] as const;

interface DonationResult {
  orderId: string;
  certificateNo: string;
}

function formatAmount(n: number): string {
  if (n >= 10000) return `${(n / 10000).toFixed(1)}万`;
  return n.toLocaleString('zh-CN');
}

export default function DonationDetailPage(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = getUser();

  const project = (id && PROJECTS[id]) || null;

  const [amount, setAmount] = useState(200);
  const [customAmount, setCustomAmount] = useState('');
  const [isCustom, setIsCustom] = useState(false);
  const [message, setMessage] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<DonationResult | null>(null);

  const effectiveAmount = isCustom ? Number(customAmount) || 0 : amount;

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    if (submitting || effectiveAmount <= 0 || !project) return;
    setSubmitting(true);
    setError('');
    try {
      const res = await api.post<DonationResult>('/api/v1/alumni/donation/orders', {
        projectId: project.id,
        amount: effectiveAmount,
        message: message || undefined,
        anonymous,
      });
      setResult(res);
    } catch (err: unknown) {
      setError(err instanceof ApiError ? `提交失败 (${String(err.status)})` : '网络异常，请稍后重试');
    } finally {
      setSubmitting(false);
    }
  }

  if (!project) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-space-4">
        <p className="text-text-sm text-color-danger">项目不存在</p>
        <Button variant="ghost" className="mt-space-4" onClick={() => navigate(-1)}>返回</Button>
      </main>
    );
  }

  /* 捐赠证书 */
  if (result) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-space-4 py-space-8">
        <Card
          className="w-full max-w-sm text-center py-space-6"
          style={{ border: '2px solid var(--color-honor-gold)' }}
        >
          <p className="text-text-xs text-color-text-secondary tracking-widest">CERTIFICATE</p>
          <h1 className="mt-space-2 text-text-xl font-bold" style={{ color: 'var(--color-honor-gold)' }}>
            爱心捐赠证书
          </h1>
          <div className="mt-space-4 mx-space-4 border-t border-color-border-default pt-space-4">
            <p className="text-text-sm text-color-text-secondary">捐赠人</p>
            <p className="text-text-lg font-semibold text-color-text-primary">
              {anonymous ? '匿名校友' : user?.name ?? '校友'}
            </p>
          </div>
          <div className="mt-space-3">
            <p className="text-text-sm text-color-text-secondary">捐赠金额</p>
            <p className="text-text-2xl font-bold" style={{ color: 'var(--color-honor-gold)' }}>
              ¥{effectiveAmount.toLocaleString('zh-CN')}
            </p>
          </div>
          <div className="mt-space-3">
            <p className="text-text-sm text-color-text-secondary">捐赠项目</p>
            <p className="text-text-base font-medium text-color-text-primary">{project.title}</p>
          </div>
          <div className="mt-space-3">
            <p className="text-text-sm text-color-text-secondary">日期</p>
            <p className="text-text-sm text-color-text-primary">{new Date().toLocaleDateString('zh-CN')}</p>
          </div>
          <p className="mt-space-4 text-text-xs text-color-text-disabled">证书编号：{result.certificateNo}</p>
        </Card>

        <div className="mt-space-4 flex gap-space-3">
          <Button variant="ghost" onClick={() => window.alert('保存功能即将开放')}>保存证书</Button>
          <Button variant="ghost" onClick={() => window.alert('分享功能即将开放')}>分享到微信</Button>
        </div>
        <Button variant="ghost" className="mt-space-2" onClick={() => navigate('/donation')}>返回捐赠大厅</Button>
      </main>
    );
  }

  const pct = Math.min(100, Math.round((project.raised / project.goal) * 100));

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
        <h1 className="text-text-lg font-semibold text-color-text-primary">{project.title}</h1>
      </header>

      {/* 项目信息 */}
      <section className="px-space-4 mt-space-4" aria-label="项目信息">
        <Card>
          <h2 className="text-text-base font-semibold text-color-text-primary">{project.title}</h2>
          <p className="mt-space-2 text-text-sm text-color-text-secondary leading-relaxed">{project.description}</p>
          <div className="mt-space-4 h-2 rounded-radius-full bg-color-bg-secondary overflow-hidden">
            <div
              className="h-full rounded-radius-full transition-all"
              style={{ width: `${String(pct)}%`, background: 'var(--color-honor-gold)' }}
            />
          </div>
          <div className="mt-space-1 flex justify-between text-text-xs text-color-text-secondary">
            <span>已筹 ¥{formatAmount(project.raised)}</span>
            <span>目标 ¥{formatAmount(project.goal)}</span>
          </div>
        </Card>
      </section>

      {/* 捐赠表单 */}
      <form onSubmit={handleSubmit} className="px-space-4 mt-space-4 flex flex-col gap-space-4">
        {/* 金额选择 */}
        <fieldset>
          <legend className="text-text-sm font-medium text-color-text-primary mb-space-2">选择捐赠金额</legend>
          <div className="grid grid-cols-3 gap-space-2">
            {QUICK_AMOUNTS.map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => { setAmount(a); setIsCustom(false); }}
                className={`rounded-radius-md border py-space-2 text-text-sm font-medium cursor-pointer transition-colors ${
                  !isCustom && amount === a
                    ? 'border-color-interactive bg-color-interactive/10 text-color-interactive'
                    : 'border-color-border-default bg-color-bg-elevated text-color-text-primary'
                }`}
              >
                ¥{a}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setIsCustom(true)}
              className={`rounded-radius-md border py-space-2 text-text-sm font-medium cursor-pointer transition-colors ${
                isCustom
                  ? 'border-color-interactive bg-color-interactive/10 text-color-interactive'
                  : 'border-color-border-default bg-color-bg-elevated text-color-text-primary'
              }`}
            >
              自定义
            </button>
          </div>
          {isCustom && (
            <input
              type="number"
              min={1}
              placeholder="请输入金额"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              className="mt-space-2 w-full rounded-radius-md border border-color-border-default bg-color-bg-elevated px-space-3 py-space-2 text-text-sm text-color-text-primary outline-none focus:border-color-interactive"
            />
          )}
        </fieldset>

        {/* 留言 */}
        <label className="flex flex-col gap-space-1">
          <span className="text-text-sm font-medium text-color-text-primary">留言 <span className="text-text-xs text-color-text-secondary">（选填）</span></span>
          <textarea
            rows={2}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="写下你对母校的寄语"
            className="rounded-radius-md border border-color-border-default bg-color-bg-elevated px-space-3 py-space-2 text-text-sm text-color-text-primary outline-none focus:border-color-interactive resize-none"
          />
        </label>

        {/* 匿名 */}
        <label className="flex items-center gap-space-2 cursor-pointer">
          <input
            type="checkbox"
            checked={anonymous}
            onChange={(e) => setAnonymous(e.target.checked)}
            className="accent-color-accent"
          />
          <span className="text-text-sm text-color-text-primary">匿名捐赠</span>
        </label>

        {error && <p className="text-text-sm text-color-danger">{error}</p>}

        <Button type="submit" disabled={submitting || effectiveAmount <= 0} className="w-full">
          {submitting ? '提交中...' : `献上爱心 ¥${effectiveAmount > 0 ? effectiveAmount.toLocaleString('zh-CN') : '0'}`}
        </Button>
      </form>
    </main>
  );
}
