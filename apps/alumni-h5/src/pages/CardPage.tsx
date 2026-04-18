import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, User } from 'lucide-react';
import { Button } from '../components/Button.js';
import { getUser, type AuthUser } from '../lib/auth.js';

function generateCardNo(): string {
  const year = new Date().getFullYear();
  const rand = String(Math.floor(10000 + Math.random() * 90000));
  return `ALU-${String(year)}-${rand}`;
}

export default function CardPage(): JSX.Element {
  const navigate = useNavigate();
  const user: AuthUser | null = getUser();
  const [qrText, setQrText] = useState('二维码加载中...');
  const [cardNo] = useState(() => generateCardNo());
  const [refreshCount, setRefreshCount] = useState(0);

  const refreshQr = useCallback(() => {
    setQrText('二维码刷新中...');
    const timer = setTimeout(() => {
      setRefreshCount((c) => c + 1);
      setQrText(`动态码 #${String(refreshCount + 1)} · ${new Date().toLocaleTimeString('zh-CN')}`);
    }, 600);
    return () => clearTimeout(timer);
  }, [refreshCount]);

  /* 首次加载 + 每 30 秒自动刷新 */
  useEffect(() => {
    const timer = setTimeout(() => {
      setRefreshCount(1);
      setQrText(`动态码 #1 · ${new Date().toLocaleTimeString('zh-CN')}`);
    }, 800);

    const interval = setInterval(() => {
      setRefreshCount((c) => {
        const next = c + 1;
        setQrText(`动态码 #${String(next)} · ${new Date().toLocaleTimeString('zh-CN')}`);
        return next;
      });
    }, 30000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  /* 占位用户信息 */
  const displayName = user?.name ?? '校友';
  const department = '计算机科学与技术学院';
  const major = '软件工程';
  const graduationYear = '2020';

  return (
    <main className="min-h-screen bg-color-bg-primary max-w-[100vw] overflow-x-hidden flex flex-col items-center px-space-4 py-space-6">
      {/* 卡片正面 */}
      <div
        className="w-full max-w-sm rounded-radius-lg overflow-hidden shadow-shadow-md"
        style={{ background: 'linear-gradient(145deg, var(--color-accent), #0a5a8a)' }}
      >
        {/* 顶部学校 Logo 区域 */}
        <div className="px-space-6 pt-space-6 pb-space-3">
          <p className="text-text-sm text-white opacity-70 tracking-wider">广州白云学院</p>
          <p className="text-text-xs text-white opacity-50 mt-space-1">BAIYUN UNIVERSITY</p>
        </div>

        {/* 校友信息 */}
        <div className="px-space-6 pb-space-4">
          <h1 className="text-text-2xl font-bold text-white">{displayName}</h1>
          <p className="mt-space-2 text-text-sm text-white opacity-80">
            {department} · {major}
          </p>
          <p className="mt-space-1 text-text-xs text-white opacity-60">
            {graduationYear} 届 | {cardNo}
          </p>
        </div>

        {/* 二维码区域 */}
        <div className="mx-space-6 mb-space-4 rounded-radius-md bg-white p-space-4 flex flex-col items-center justify-center min-h-[180px]">
          <div className="w-32 h-32 rounded-radius-md border-2 border-dashed border-color-border-default flex items-center justify-center">
            <p className="text-text-xs text-color-text-secondary text-center px-space-2">{qrText}</p>
          </div>
          <p className="mt-space-3 text-text-xs text-color-text-secondary text-center">
            请向安保人员出示此码
          </p>
        </div>

        {/* 安全提示 */}
        <div className="px-space-6 pb-space-4">
          <p className="text-text-xs text-white opacity-50 text-center">
            此码每 30 秒自动刷新，截屏无效
          </p>
        </div>
      </div>

      {/* 底部操作区 */}
      <div className="mt-space-6 w-full max-w-sm flex flex-col gap-space-3">
        <Button className="w-full flex items-center justify-center gap-space-2" onClick={refreshQr}>
          <RefreshCw size={16} />
          刷新二维码
        </Button>
        <Button
          variant="ghost"
          className="w-full flex items-center justify-center gap-space-2"
          onClick={() => navigate('/mine')}
        >
          <User size={16} />
          个人信息
        </Button>
      </div>
    </main>
  );
}
