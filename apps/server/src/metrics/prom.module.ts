/**
 * Prometheus 指标模块：暴露 GET /metrics（默认 Node.js 进程指标）。
 * 直接基于 prom-client 实现，避免 @willsoto/nestjs-prometheus 与 NestJS 10 的小版本对齐成本。
 */

import { Controller, Get, Header, Module } from '@nestjs/common';
import { collectDefaultMetrics, register } from 'prom-client';

let initialized = false;
function ensureInit(): void {
  if (initialized) return;
  initialized = true;
  collectDefaultMetrics({ register, prefix: 'bynu_server_' });
}

@Controller()
export class MetricsController {
  constructor() {
    ensureInit();
  }

  @Get('metrics')
  @Header('content-type', 'text/plain; version=0.0.4; charset=utf-8')
  async metrics(): Promise<string> {
    return register.metrics();
  }
}

@Module({ controllers: [MetricsController] })
export class PromModule {}
