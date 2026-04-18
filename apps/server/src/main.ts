/**
 * Server 入口（NestJS · 默认 3001 端口）。
 * - Pino 全局 Logger（nestjs-pino）
 * - 全局 Problem Details Filter（在 AppModule 中注入）
 * - /metrics Prometheus 端点
 */

import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { Logger as PinoLogger } from 'nestjs-pino';
import { loadConfig } from '@bynu/config';
import { AppModule } from './app.module.js';

async function bootstrap(): Promise<void> {
  const cfg = loadConfig();
  const port = Number(process.env['PORT'] ?? cfg.PORT_SERVER);
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(PinoLogger));
  await app.listen(port, '0.0.0.0');
  // eslint-disable-next-line no-console
  console.log(`[server] listening on http://0.0.0.0:${port}`);
}

bootstrap().catch((err: unknown) => {
  // eslint-disable-next-line no-console
  console.error('[server] 启动失败：', err);
  process.exit(1);
});
