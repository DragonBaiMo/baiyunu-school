import { zodResolver } from '@hookform/resolvers/zod';
import { ImageIcon, LogIn } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '../components/ui/button.js';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../components/ui/form.js';
import { Input } from '../components/ui/input.js';

const loginSchema = z.object({
  username: z.string().min(2, { message: '用户名至少 2 个字符' }),
  password: z.string().min(6, { message: '密码至少 6 个字符' }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const brandFont = "'Outfit', system-ui, sans-serif";

export default function LoginPage(): JSX.Element {
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: '', password: '' },
  });

  const onSubmit = (values: LoginFormValues): void => {
    // eslint-disable-next-line no-console
    console.log('[admin-web] 登录表单提交（占位）', { username: values.username });
  };

  return (
    <main className="min-h-screen flex">
      {/* ── 左侧品牌面板 ── */}
      <div
        className="hidden lg:flex lg:flex-col lg:justify-between relative overflow-hidden"
        style={{
          width: '45%',
          background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
        }}
      >
        <div className="flex-1 flex flex-col items-center justify-between py-12 px-10 relative z-10">
          {/* 标题区 ~40% */}
          <div className="flex flex-col items-center pt-8">
            <h1
              className="text-white text-4xl font-bold tracking-wide"
              style={{ fontFamily: brandFont }}
            >
              白云学院
            </h1>
            <p className="text-white/80 text-base mt-3 tracking-widest">
              智慧校友服务平台 · 管理端
            </p>
          </div>

          {/* 图片占位框 ~35% */}
          <div
            className="flex flex-col items-center justify-center"
            style={{
              width: 320,
              height: 200,
              borderRadius: 12,
              border: '1px solid rgba(255,255,255,0.3)',
              background: 'rgba(255,255,255,0.05)',
            }}
          >
            <ImageIcon size={36} className="text-white/30" aria-hidden="true" />
            <span className="text-white/40 text-sm mt-2">校园风光</span>
          </div>

          {/* 占位以保持底部文字在面板内 */}
          <div />
        </div>

        {/* 校园建筑剪影装饰 */}
        <svg
          className="absolute bottom-0 left-0 w-full pointer-events-none"
          style={{ height: '45%', zIndex: 1, opacity: 0.1 }}
          viewBox="0 0 800 300"
          preserveAspectRatio="xMidYMax slice"
          fill="white"
          aria-hidden="true"
        >
          <rect x="60" y="120" width="80" height="180" />
          <rect x="70" y="100" width="60" height="20" />
          <rect x="90" y="60" width="20" height="40" />
          <rect x="180" y="160" width="120" height="140" />
          <polygon points="180,160 240,100 300,160" />
          <rect x="220" y="220" width="40" height="80" />
          <rect x="340" y="140" width="100" height="160" />
          <rect x="350" y="130" width="80" height="10" />
          <rect x="370" y="80" width="10" height="50" />
          <rect x="380" y="70" width="30" height="10" />
          <rect x="480" y="180" width="140" height="120" />
          <rect x="490" y="190" width="25" height="25" fill="rgba(0,0,0,0.15)" />
          <rect x="525" y="190" width="25" height="25" fill="rgba(0,0,0,0.15)" />
          <rect x="560" y="190" width="25" height="25" fill="rgba(0,0,0,0.15)" />
          <rect x="490" y="225" width="25" height="25" fill="rgba(0,0,0,0.15)" />
          <rect x="525" y="225" width="25" height="25" fill="rgba(0,0,0,0.15)" />
          <rect x="560" y="225" width="25" height="25" fill="rgba(0,0,0,0.15)" />
          <rect x="660" y="200" width="80" height="100" />
          <polygon points="660,200 700,150 740,200" />
          <rect x="30" y="260" width="50" height="40" />
          <rect x="740" y="240" width="60" height="60" />
          <rect x="0" y="295" width="800" height="5" />
        </svg>

        {/* 装饰性网络点线图案 */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          aria-hidden="true"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <pattern id="dots" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
              <circle cx="30" cy="30" r="1.5" fill="rgba(255,255,255,0.15)" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dots)" />
          {/* 连线装饰 */}
          <g stroke="rgba(255,255,255,0.08)" strokeWidth="1" fill="none">
            <line x1="10%" y1="75%" x2="30%" y2="60%" />
            <line x1="30%" y1="60%" x2="50%" y2="70%" />
            <line x1="50%" y1="70%" x2="70%" y2="55%" />
            <line x1="70%" y1="55%" x2="90%" y2="65%" />
            <line x1="20%" y1="85%" x2="40%" y2="78%" />
            <line x1="40%" y1="78%" x2="60%" y2="82%" />
            <line x1="60%" y1="82%" x2="80%" y2="75%" />
            <line x1="15%" y1="90%" x2="35%" y2="85%" />
            <line x1="55%" y1="88%" x2="75%" y2="80%" />
          </g>
          <g fill="rgba(255,255,255,0.12)">
            <circle cx="10%" cy="75%" r="3" />
            <circle cx="30%" cy="60%" r="4" />
            <circle cx="50%" cy="70%" r="3" />
            <circle cx="70%" cy="55%" r="4" />
            <circle cx="90%" cy="65%" r="3" />
            <circle cx="20%" cy="85%" r="3" />
            <circle cx="40%" cy="78%" r="4" />
            <circle cx="60%" cy="82%" r="3" />
            <circle cx="80%" cy="75%" r="4" />
            <circle cx="15%" cy="90%" r="3" />
            <circle cx="35%" cy="85%" r="3" />
            <circle cx="55%" cy="88%" r="3" />
            <circle cx="75%" cy="80%" r="4" />
          </g>
        </svg>

        <p className="text-white/30 text-xs text-center pb-6 relative z-10">
          白云学院校友事务办公室
        </p>
      </div>

      {/* ── 右侧登录表单 ── */}
      <div className="flex-1 flex flex-col items-center justify-center bg-white px-6">
        <div className="w-full max-w-[380px]">
          <h2
            className="text-2xl font-bold text-color-text-primary mb-1"
            style={{ fontFamily: brandFont }}
          >
            管理后台登录
          </h2>
          <p className="text-color-text-secondary text-sm mb-8">请输入管理员账号</p>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-col gap-space-4"
              aria-label="管理端登录表单"
            >
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>用户名</FormLabel>
                    <FormControl>
                      <Input
                        autoComplete="username"
                        placeholder="请输入用户名"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>密码</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        autoComplete="current-password"
                        placeholder="请输入密码"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                size="lg"
                className="w-full mt-2 cursor-pointer"
                style={{
                  background: 'linear-gradient(135deg, #3B82F6, #2563EB)',
                  borderRadius: '12px',
                  boxShadow: '0 4px 14px rgba(59,130,246,0.3)',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#1D4ED8'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'linear-gradient(135deg, #3B82F6, #2563EB)'; }}
              >
                <LogIn size={16} aria-hidden="true" />
                登录
              </Button>
            </form>
          </Form>

          <p className="text-center text-xs text-color-text-secondary mt-10">
            © 2026 广州白云学院 校友事务办公室
          </p>
        </div>
      </div>
    </main>
  );
}
