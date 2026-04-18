/**
 * BFF Gateway 入口（NestJS · 默认 3000 端口）。
 * 启动后暴露：
 *   GET /api/v1/public/ping
 *   GET /api/v1/public/health
 *   GET /api/v1/admin/ping     (需 JWT + admin 角色)
 *   GET /api/v1/alumni/ping    (需 JWT)
 */

import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { Logger as PinoLogger } from 'nestjs-pino';
import { loadConfig } from '@bynu/config';
import { AppModule } from './app.module.js';

async function bootstrap(): Promise<void> {
  const cfg = loadConfig();
  const port = Number(process.env['PORT'] ?? cfg.PORT_BFF);
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(PinoLogger));
  await app.listen(port, '0.0.0.0');
  // eslint-disable-next-line no-console
  console.log(`[bff-gateway] listening on http://0.0.0.0:${port}`);
}

bootstrap().catch((err: unknown) => {
  // eslint-disable-next-line no-console
  console.error('[bff-gateway] 启动失败：', err);
  process.exit(1);
});
