/**
 * Server 聚合根模块。
 * - 注入 8 个领域模块（identity / portal / etl / activity / donation / workflow / organization / notification）
 * - 全局 Pino 日志（nestjs-pino）
 * - 全局 Problem Details 过滤器
 * - /metrics Prometheus 端点
 * - /internal/health 健康检查
 */

import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { LoggerModule } from 'nestjs-pino';
import { ActivityModule } from './modules/activity/activity.module.js';
import { DonationModule } from './modules/donation/donation.module.js';
import { EtlModule } from './modules/etl/etl.module.js';
import { IdentityModule } from './modules/identity/identity.module.js';
import { NotificationModule } from './modules/notification/notification.module.js';
import { OrganizationModule } from './modules/organization/organization.module.js';
import { PortalModule } from './modules/portal/portal.module.js';
import { WorkflowModule } from './modules/workflow/workflow.module.js';
import { HealthController } from './health/health.controller.js';
import { ProblemDetailsFilter } from './filters/problem-details.filter.js';
import { PromModule } from './metrics/prom.module.js';
import { buildPinoOptions } from './logging/pino.config.js';

@Module({
  imports: [
    LoggerModule.forRoot(buildPinoOptions()),
    NotificationModule.register(),
    IdentityModule.register(),
    PortalModule,
    EtlModule,
    ActivityModule,
    DonationModule,
    WorkflowModule,
    OrganizationModule,
    PromModule,
  ],
  controllers: [HealthController],
  providers: [{ provide: APP_FILTER, useClass: ProblemDetailsFilter }],
})
export class AppModule {}
