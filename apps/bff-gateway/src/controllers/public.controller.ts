/**
 * 公共路由：无需 JWT。
 * - GET /api/v1/public/ping  → { ok: true }
 * - GET /api/v1/public/health → 复用 BFF 自身健康端点
 * - 其他 /api/v1/public/** → 透传到 server
 * - /api/v1/webhook/** → 透传到 server
 */

import { All, Controller, Get, Inject, Req, Res } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { cacheHealth, createCacheClient, type CacheClient } from '@bynu/cache';
import { createDbClient, dbHealth, type DbClient } from '@bynu/db';
import { loadConfig } from '@bynu/config';
import type { HealthResponse } from '@bynu/contracts';
import type { Request, Response } from 'express';
import { ForwardService } from '../proxy/forward.service.js';

const VERSION = '0.1.0-alpha';
let cachedDb: DbClient | undefined;
let cachedCache: CacheClient | undefined;
function getDb(): DbClient {
  if (!cachedDb) cachedDb = createDbClient(loadConfig().DATABASE_URL);
  return cachedDb;
}
function getCache(): CacheClient {
  if (!cachedCache) cachedCache = createCacheClient(loadConfig().REDIS_URL);
  return cachedCache;
}

@Controller('api/v1/public')
export class PublicController {
  constructor(@Inject(ForwardService) private readonly fwd: ForwardService) {}

  @Get('ping')
  ping(): { ok: true } {
    return { ok: true };
  }

  @Get('health')
  async health(): Promise<HealthResponse> {
    const [db, cache] = await Promise.all([dbHealth(getDb()), cacheHealth(getCache())]);
    const status = db === 'ok' && cache === 'ok' ? 'ok' : 'degraded';
    return { status, deps: { db, cache }, version: VERSION };
  }

  @SkipThrottle()
  @All('*')
  async catchAll(@Req() req: Request, @Res() res: Response): Promise<void> {
    await this.fwd.forward(req, res);
  }
}

@Controller('api/v1/webhook')
export class WebhookController {
  constructor(@Inject(ForwardService) private readonly fwd: ForwardService) {}

  @SkipThrottle()
  @All('*')
  async catchAll(@Req() req: Request, @Res() res: Response): Promise<void> {
    await this.fwd.forward(req, res);
  }
}
