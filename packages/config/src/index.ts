/**
 * 应用配置：从 process.env 读取后以 Zod 校验。
 * 任一必填项缺失/非法时立即抛错，避免运行时神秘错误。
 */

import { z } from 'zod';

const ConfigSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  DATABASE_URL: z.string().min(1).default('pglite:./.data/pg'),
  REDIS_URL: z.string().min(1).default('mock://local'),
  JWT_SECRET: z.string().min(16).default('dev-only-replace-in-prod-change-me-now'),
  ENCRYPTION_KEY: z
    .string()
    .regex(/^[0-9a-fA-F]{64}$/, 'ENCRYPTION_KEY 必须为 64 位十六进制（32 字节）')
    .default('0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef'),
  PAYMENT_PROVIDER: z.enum(['mock', 'wechat_v3', 'alipay']).default('mock'),
  EDU_PROVIDER: z.enum(['mock', 'rest_api', 'file_import']).default('mock'),
  STU_PROVIDER: z.enum(['mock', 'real']).default('mock'),
  ACL_PROVIDER: z.enum(['mock', 'wiegand_http']).default('mock'),
  CHAOXING_PROVIDER: z.enum(['mock', 'oauth2']).default('mock'),
  ESIGN_PROVIDER: z.enum(['mock', 'fadada', 'esign_cn']).default('mock'),
  PORT_BFF: z.coerce.number().int().positive().default(3000),
  PORT_SERVER: z.coerce.number().int().positive().default(3001),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
});

export type AppConfig = z.infer<typeof ConfigSchema>;

export function loadConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  const parsed = ConfigSchema.safeParse(env);
  if (!parsed.success) {
    const msg = parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
    throw new Error(`[config] 环境变量校验失败：${msg}`);
  }
  return parsed.data;
}
