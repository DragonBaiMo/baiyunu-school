import { useNavigate } from 'react-router-dom';
import { FileText, Search, CheckCircle } from 'lucide-react';
import { Button } from '../components/Button.js';

const STORAGE_KEY = 'bynu_auth_application';

interface StoredApplication {
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
}

function getStoredApplication(): StoredApplication | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredApplication;
  } catch {
    return null;
  }
}

type StepStatus = 'done' | 'active' | 'upcoming';

interface StepDef {
  label: string;
  icon: typeof FileText;
}

const steps: StepDef[] = [
  { label: '提交申请', icon: FileText },
  { label: '资料审核', icon: Search },
  { label: '认证完成', icon: CheckCircle },
];

function getStepIndex(status: StoredApplication['status']): number {
  if (status === 'approved') return 2;
  if (status === 'pending') return 1;
  return 0;
}

function stepStatus(stepIdx: number, currentIdx: number): StepStatus {
  if (stepIdx < currentIdx) return 'done';
  if (stepIdx === currentIdx) return 'active';
  return 'upcoming';
}

export default function AuthVerifyPage(): JSX.Element {
  const navigate = useNavigate();
  const stored = getStoredApplication();
  const currentStepIndex = stored ? getStepIndex(stored.status) : 0;

  return (
    <main className="min-h-screen bg-color-bg-primary max-w-[100vw] overflow-x-hidden px-space-4 pt-space-8 pb-space-12">
      <h1 className="text-text-xl font-bold text-color-text-primary text-center mb-space-8">
        审核进度
      </h1>

      {/* 步骤条 */}
      <div className="flex items-start justify-between gap-space-2 mb-space-8">
        {steps.map((step, idx) => {
          const s = stepStatus(idx, currentStepIndex);
          const Icon = step.icon;
          return (
            <div key={step.label} className="flex flex-1 flex-col items-center gap-space-2 relative">
              {/* 连线 */}
              {idx > 0 && (
                <div
                  className="absolute top-5 right-1/2 w-full h-0.5"
                  style={{
                    background: s === 'upcoming' ? 'var(--color-border-default)' : 'var(--color-interactive)',
                  }}
                />
              )}
              {/* 图标圆 */}
              <div
                className="relative z-10 w-10 h-10 rounded-radius-full flex items-center justify-center"
                style={{
                  background:
                    s === 'active'
                      ? 'var(--color-interactive)'
                      : s === 'done'
                        ? 'var(--color-success)'
                        : 'var(--color-bg-secondary)',
                }}
              >
                <Icon
                  size={18}
                  className={s === 'upcoming' ? 'text-color-text-secondary' : 'text-white'}
                />
              </div>
              <span
                className="text-text-xs text-center font-medium"
                style={{
                  color:
                    s === 'active'
                      ? 'var(--color-interactive)'
                      : s === 'done'
                        ? 'var(--color-success)'
                        : 'var(--color-text-secondary)',
                }}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* 信息区 */}
      <div className="rounded-radius-lg border border-color-border-default bg-color-bg-elevated p-space-4 text-center">
        {!stored && (
          <>
            <p className="text-text-sm text-color-text-secondary">您尚未提交认证申请</p>
            <Button className="mt-space-4" onClick={() => navigate('/login')}>
              去认证
            </Button>
          </>
        )}

        {stored?.status === 'pending' && (
          <>
            <p className="text-text-base font-semibold text-color-text-primary">您的认证申请正在审核中</p>
            <p className="mt-space-2 text-text-xs text-color-text-secondary">
              申请时间：{stored.submittedAt}
            </p>
            <div className="mt-space-4 h-2 rounded-radius-full bg-color-bg-secondary overflow-hidden">
              <div
                className="h-full rounded-radius-full animate-pulse"
                style={{ width: '50%', background: 'var(--color-interactive)' }}
              />
            </div>
            <Button
              variant="ghost"
              className="mt-space-4"
              onClick={() => window.alert('查看详细进度功能开发中')}
            >
              查看进度
            </Button>
          </>
        )}

        {stored?.status === 'approved' && (
          <>
            <p className="text-text-base font-semibold text-color-success">认证已完成！</p>
            <Button className="mt-space-4" onClick={() => navigate('/card')}>
              查看校友卡
            </Button>
          </>
        )}

        {stored?.status === 'rejected' && (
          <>
            <p className="text-text-base font-semibold text-color-danger">认证未通过</p>
            <Button className="mt-space-4" onClick={() => navigate('/login')}>
              重新申请
            </Button>
          </>
        )}
      </div>

      <div className="mt-space-6 text-center">
        <Button variant="ghost" onClick={() => navigate('/home')}>
          返回首页
        </Button>
      </div>
    </main>
  );
}
