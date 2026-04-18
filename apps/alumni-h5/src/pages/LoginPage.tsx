import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, GraduationCap, Upload, ChevronLeft } from 'lucide-react';
import { Button } from '../components/Button.js';
import { api } from '../lib/api.js';
import { setToken, setUser } from '../lib/auth.js';

type AuthMode = 'choose' | 'form' | 'submitted';

interface ApplicationForm {
  name: string;
  idCard: string;
  graduationYear: string;
  department: string;
  major: string;
  studentId: string;
  phone: string;
}

const STORAGE_KEY = 'bynu_auth_application';

interface StoredApplication {
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  rejectReason?: string;
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

function currentYear(): number {
  return new Date().getFullYear();
}

function graduationYearOptions(): number[] {
  const year = currentYear();
  return Array.from({ length: 50 }, (_, i) => year - i);
}

function maskIdCard(value: string): string {
  if (value.length <= 6) return value;
  return value.slice(0, 3) + '*'.repeat(value.length - 6) + value.slice(-3);
}

function validatePhone(phone: string): boolean {
  return /^1[3-9]\d{9}$/.test(phone);
}

export default function LoginPage(): JSX.Element {
  const navigate = useNavigate();
  const stored = getStoredApplication();

  if (stored) {
    return <ApplicationStatus stored={stored} />;
  }

  return <AuthenticationFlow navigate={navigate} />;
}

/* ---------- 审核状态展示 ---------- */

function ApplicationStatus({ stored }: { stored: StoredApplication }): JSX.Element {
  const navigate = useNavigate();

  function handleReset(): void {
    localStorage.removeItem(STORAGE_KEY);
    window.location.reload();
  }

  return (
    <div style={{ background: '#F8FAFC', minHeight: '60vh' }}>
      <div className="container flex items-center justify-center" style={{ paddingTop: 80, paddingBottom: 80 }}>
        <div className="portal-card p-10 text-center" style={{ maxWidth: 600 }}>
          {stored.status === 'approved' && (
            <>
              <div
                className="mx-auto flex items-center justify-center rounded-full"
                style={{ width: 64, height: 64, background: '#ECFDF5' }}
              >
                <ShieldCheck size={32} style={{ color: '#059669' }} />
              </div>
              <h1 style={{ fontSize: 22, fontWeight: 700, color: '#059669', marginTop: 20 }}>认证已通过！</h1>
              <p style={{ fontSize: 14, color: '#64748B', marginTop: 8 }}>您的校友身份已验证</p>
              <Button className="mt-6 w-full max-w-xs mx-auto" onClick={() => navigate('/card')}>
                查看校友卡
              </Button>
            </>
          )}

          {stored.status === 'rejected' && (
            <>
              <div
                className="mx-auto flex items-center justify-center rounded-full"
                style={{ width: 64, height: 64, background: '#FEF2F2' }}
              >
                <ShieldCheck size={32} style={{ color: '#DC2626' }} />
              </div>
              <h1 style={{ fontSize: 22, fontWeight: 700, color: '#DC2626', marginTop: 20 }}>认证未通过</h1>
              {stored.rejectReason && (
                <p style={{ fontSize: 14, color: '#64748B', marginTop: 8 }}>原因：{stored.rejectReason}</p>
              )}
              <Button className="mt-6 w-full max-w-xs mx-auto" onClick={handleReset}>
                重新申请
              </Button>
            </>
          )}

          {stored.status === 'pending' && (
            <>
              <div
                className="mx-auto flex items-center justify-center rounded-full animate-pulse"
                style={{ width: 64, height: 64, background: '#EFF6FF' }}
              >
                <ShieldCheck size={32} style={{ color: '#2563EB' }} />
              </div>
              <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0F172A', marginTop: 20 }}>认证申请已提交</h1>
              <p style={{ fontSize: 14, color: '#64748B', marginTop: 8 }}>
                您的认证申请正在审核中，请耐心等待
              </p>
              <p style={{ fontSize: 13, color: '#94A3B8', marginTop: 4 }}>
                提交时间：{stored.submittedAt}
              </p>
              <div className="w-full max-w-xs mx-auto mt-6">
                <div style={{ height: 6, borderRadius: 3, background: '#F1F5F9', overflow: 'hidden' }}>
                  <div className="animate-pulse" style={{ width: '60%', height: '100%', borderRadius: 3, background: '#2563EB' }} />
                </div>
                <p style={{ fontSize: 13, color: '#94A3B8', marginTop: 8 }}>审核中...</p>
              </div>
              <Button variant="ghost" className="mt-6" onClick={() => navigate('/auth/verify')}>
                查看审核进度
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------- 认证流程主体 ---------- */

function AuthenticationFlow({ navigate }: { navigate: ReturnType<typeof useNavigate> }): JSX.Element {
  const [mode, setMode] = useState<AuthMode>('choose');
  const [form, setForm] = useState<ApplicationForm>({
    name: '',
    idCard: '',
    graduationYear: String(currentYear()),
    department: '',
    major: '',
    studentId: '',
    phone: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [showIdCard, setShowIdCard] = useState(false);

  function updateField(field: keyof ApplicationForm, value: string): void {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSsoLogin(): void {
    setToken('mock_alumni_sso_token');
    setUser({ sub: 'alumni_001', roles: ['alumni'], name: '张三（2016级计算机科学）' });
    navigate('/home');
  }

  async function handleSubmit(e: FormEvent): Promise<void> {
    e.preventDefault();
    setSubmitError('');

    if (!form.name.trim()) {
      setSubmitError('请输入姓名');
      return;
    }
    if (!form.idCard.trim() || form.idCard.length < 15) {
      setSubmitError('请输入有效的身份证号');
      return;
    }
    if (!form.department.trim()) {
      setSubmitError('请输入学院/系');
      return;
    }
    if (!form.major.trim()) {
      setSubmitError('请输入专业');
      return;
    }
    if (!validatePhone(form.phone)) {
      setSubmitError('请输入正确的 11 位手机号');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/api/v1/alumni/auth/apply', form);
    } catch {
      /* 后端未连通也继续走占位逻辑 */
    }

    setToken('mock_alumni_form_token');
    setUser({ sub: 'alumni_002', roles: ['alumni'], name: form.name || '校友用户' });
    const application: StoredApplication = {
      status: 'approved',
      submittedAt: new Date().toLocaleString('zh-CN'),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(application));
    setSubmitting(false);
    navigate('/home');
  }

  if (mode === 'submitted') {
    return (
      <div style={{ background: '#F8FAFC', minHeight: '60vh' }}>
        <div className="container flex items-center justify-center" style={{ paddingTop: 80, paddingBottom: 80 }}>
          <div className="portal-card p-10 text-center" style={{ maxWidth: 600 }}>
            <div
              className="mx-auto flex items-center justify-center rounded-full"
              style={{ width: 64, height: 64, background: '#ECFDF5' }}
            >
              <ShieldCheck size={32} style={{ color: '#059669' }} />
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0F172A', marginTop: 20 }}>认证申请已提交</h1>
            <p style={{ fontSize: 14, color: '#64748B', marginTop: 8 }}>
              请等待审核，我们将尽快处理您的申请
            </p>
            <div className="flex flex-col gap-2 mt-6 max-w-xs mx-auto">
              <Button className="w-full" onClick={() => navigate('/auth/verify')}>
                查看审核进度
              </Button>
              <Button variant="ghost" className="w-full" onClick={() => navigate('/home')}>
                返回首页
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const inputCls = 'w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500';

  return (
    <div style={{ background: '#F8FAFC', minHeight: '60vh' }}>
      <div className="container" style={{ paddingTop: 48, paddingBottom: 64 }}>
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 style={{ fontSize: 28, fontWeight: 700, color: '#0F172A' }}>校友身份认证</h1>
          <p style={{ fontSize: 15, color: '#64748B', marginTop: 8 }}>验证您的身份，解锁全部校友服务</p>
        </div>

        {/* 居中卡片 */}
        <div className="mx-auto" style={{ maxWidth: 600 }}>
          {mode === 'choose' && (
            <div className="flex flex-col gap-4">
              {/* 超星 SSO */}
              <div
                className="portal-card flex items-center gap-4 p-5 cursor-pointer"
                onClick={handleSsoLogin}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSsoLogin(); }}
              >
                <div
                  className="shrink-0 flex items-center justify-center rounded-full"
                  style={{ width: 48, height: 48, background: '#EFF6FF' }}
                >
                  <ShieldCheck size={24} style={{ color: '#2563EB' }} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span style={{ fontSize: 16, fontWeight: 600, color: '#0F172A' }}>超星统一认证登录</span>
                    <span className="badge-blue">推荐</span>
                  </div>
                  <p style={{ fontSize: 13, color: '#64748B', marginTop: 2 }}>使用超星账号快速验证身份</p>
                </div>
              </div>

              {/* 表单认证 */}
              <div
                className="portal-card flex items-center gap-4 p-5 cursor-pointer"
                onClick={() => setMode('form')}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter') setMode('form'); }}
              >
                <div
                  className="shrink-0 flex items-center justify-center rounded-full"
                  style={{ width: 48, height: 48, background: '#FFFBEB' }}
                >
                  <GraduationCap size={24} style={{ color: '#F59E0B' }} />
                </div>
                <div className="flex-1">
                  <span style={{ fontSize: 16, fontWeight: 600, color: '#0F172A' }}>表单自主认证</span>
                  <p style={{ fontSize: 13, color: '#64748B', marginTop: 2 }}>填写个人信息，提交审核</p>
                </div>
              </div>
            </div>
          )}

          {mode === 'form' && (
            <div className="portal-card p-8">
              <button
                type="button"
                className="flex items-center gap-1 mb-6 cursor-pointer"
                style={{ fontSize: 14, color: '#2563EB', background: 'none', border: 'none' }}
                onClick={() => setMode('choose')}
              >
                <ChevronLeft size={16} />
                返回选择
              </button>

              <form onSubmit={(e) => void handleSubmit(e)} className="flex flex-col gap-5">
                {/* 双列: 姓名 + 身份证号 */}
                <div className="grid grid-cols-2 gap-4">
                  <label className="flex flex-col gap-1">
                    <span style={{ fontSize: 14, fontWeight: 500, color: '#0F172A' }}>
                      姓名 <span style={{ color: '#DC2626' }}>*</span>
                    </span>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => updateField('name', e.target.value)}
                      placeholder="请输入真实姓名"
                      className={inputCls}
                    />
                  </label>
                  <label className="flex flex-col gap-1">
                    <span style={{ fontSize: 14, fontWeight: 500, color: '#0F172A' }}>
                      身份证号 <span style={{ color: '#DC2626' }}>*</span>
                    </span>
                    <div className="relative">
                      <input
                        type={showIdCard ? 'text' : 'password'}
                        required
                        value={showIdCard ? form.idCard : maskIdCard(form.idCard)}
                        onChange={(e) => updateField('idCard', e.target.value)}
                        placeholder="请输入身份证号"
                        className={inputCls}
                      />
                      <button
                        type="button"
                        className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer"
                        style={{ fontSize: 12, color: '#2563EB', background: 'none', border: 'none' }}
                        onClick={() => setShowIdCard((v) => !v)}
                      >
                        {showIdCard ? '隐藏' : '显示'}
                      </button>
                    </div>
                  </label>
                </div>

                {/* 双列: 毕业年份 + 学院/系 */}
                <div className="grid grid-cols-2 gap-4">
                  <label className="flex flex-col gap-1">
                    <span style={{ fontSize: 14, fontWeight: 500, color: '#0F172A' }}>
                      毕业年份 <span style={{ color: '#DC2626' }}>*</span>
                    </span>
                    <select
                      required
                      value={form.graduationYear}
                      onChange={(e) => updateField('graduationYear', e.target.value)}
                      className={inputCls}
                    >
                      {graduationYearOptions().map((y) => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </label>
                  <label className="flex flex-col gap-1">
                    <span style={{ fontSize: 14, fontWeight: 500, color: '#0F172A' }}>
                      学院/系 <span style={{ color: '#DC2626' }}>*</span>
                    </span>
                    <input
                      type="text"
                      required
                      value={form.department}
                      onChange={(e) => updateField('department', e.target.value)}
                      placeholder="如：计算机科学与技术学院"
                      className={inputCls}
                    />
                  </label>
                </div>

                {/* 双列: 专业 + 学号 */}
                <div className="grid grid-cols-2 gap-4">
                  <label className="flex flex-col gap-1">
                    <span style={{ fontSize: 14, fontWeight: 500, color: '#0F172A' }}>
                      专业 <span style={{ color: '#DC2626' }}>*</span>
                    </span>
                    <input
                      type="text"
                      required
                      value={form.major}
                      onChange={(e) => updateField('major', e.target.value)}
                      placeholder="如：软件工程"
                      className={inputCls}
                    />
                  </label>
                  <label className="flex flex-col gap-1">
                    <span style={{ fontSize: 14, fontWeight: 500, color: '#0F172A' }}>学号（选填）</span>
                    <input
                      type="text"
                      value={form.studentId}
                      onChange={(e) => updateField('studentId', e.target.value)}
                      placeholder="如记得请填写"
                      className={inputCls}
                    />
                  </label>
                </div>

                {/* 联系电话 */}
                <label className="flex flex-col gap-1">
                  <span style={{ fontSize: 14, fontWeight: 500, color: '#0F172A' }}>
                    联系电话 <span style={{ color: '#DC2626' }}>*</span>
                  </span>
                  <input
                    type="tel"
                    required
                    value={form.phone}
                    onChange={(e) => updateField('phone', e.target.value)}
                    placeholder="请输入 11 位手机号"
                    maxLength={11}
                    className={inputCls}
                    style={{ maxWidth: 280 }}
                  />
                </label>

                {/* 证件照片 */}
                <div className="flex flex-col gap-1">
                  <span style={{ fontSize: 14, fontWeight: 500, color: '#0F172A' }}>证件照片（选填）</span>
                  <button
                    type="button"
                    className="flex items-center justify-center gap-2 cursor-pointer"
                    style={{
                      padding: '24px 16px',
                      border: '2px dashed #E2E8F0',
                      borderRadius: 8,
                      background: '#FAFAFA',
                      color: '#64748B',
                      fontSize: 14,
                      transition: 'border-color 0.2s',
                    }}
                    onClick={() => window.alert('上传功能开发中')}
                  >
                    <Upload size={20} />
                    点击上传证件照片（身份证正面、毕业证等）
                  </button>
                </div>

                {submitError && (
                  <p style={{ fontSize: 14, color: '#DC2626' }}>{submitError}</p>
                )}

                <Button type="submit" disabled={submitting} className="btn-primary w-full mt-2 border-0">
                  {submitting ? '提交中...' : '提交认证申请'}
                </Button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
