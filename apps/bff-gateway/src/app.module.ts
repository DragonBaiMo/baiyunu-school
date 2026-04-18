/**
 * BFF Gateway 聚合根模块。
 * - JWT 鉴权（Passport）
 * - RBAC 装饰器 + Guard（仅在 admin / alumni 路由生效）
 * - 全局速率限制（@nestjs/throttler）
 * - 全局 Problem Details Filter
 * - Upstream HttpModule（指向 server 3001，stub）
 * - 公共 / 管理 / 校友三层 controller
 */

import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { LoggerModule } from 'nestjs-pino';
import { AuthJwtModule } from './auth/jwt.module.js';
import { AdminController } from './controllers/admin.controller.js';
import { AlumniController } from './controllers/alumni.controller.js';
import { PublicController, WebhookController } from './controllers/public.controller.js';
import { ProblemDetailsFilter } from './filters/problem-details.filter.js';
import { UpstreamModule } from './proxy/upstream.module.js';
import { ThrottlerModule } from './rate-limit/throttler.module.js';

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        name: 'bff-gateway',
        level: process.env['LOG_LEVEL'] ?? 'info',
        ...(process.env['NODE_ENV'] === 'production'
          ? {}
          : {
              transport: {
                target: 'pino-pretty',
                options: { colorize: true, singleLine: true, translateTime: 'SYS:HH:MM:ss.l' },
              },
            }),
      },
    }),
    ThrottlerModule,
    AuthJwtModule,
    UpstreamModule,
  ],
  controllers: [PublicController, WebhookController, AdminController, AlumniController],
  providers: [
    { provide: APP_FILTER, useClass: ProblemDetailsFilter },
  ],
})
export class AppModule {}
