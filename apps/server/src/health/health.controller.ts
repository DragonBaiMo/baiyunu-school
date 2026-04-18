/**
 * 健康检查控制器：GET /internal/health
 * 检查 db (pglite/pg) + cache (mock/redis) + version。
 * 依赖客户端在首次访问时懒加载，避免冷启动失败。
 */

import { Controller, Get } from '@nestjs/common';
import { cacheHealth, createCacheClient, type CacheClient } from '@bynu/cache';
import { dbHealth, getDbSingleton, type DbClient } from '@bynu/db';
import { loadConfig } from '@bynu/config';
import type { HealthResponse } from '@bynu/contracts';

const VERSION = '0.1.0-alpha';

let cachedCache: CacheClient | undefined;

function getDb(): DbClient {
  // 复用全局 DB 单例，避免与 identity / notification 模块产生多个 PGlite 实例
  return getDbSingleton(loadConfig().DATABASE_URL);
}

function getCache(): CacheClient {
  if (!cachedCache) cachedCache = createCacheClient(loadConfig().REDIS_URL);
  return cachedCache;
}

@Controller()
export class HealthController {
  @Get('internal/health')
  async health(): Promise<HealthResponse> {
    const [db, cache] = await Promise.all([dbHealth(getDb()), cacheHealth(getCache())]);
    const status = db === 'ok' && cache === 'ok' ? 'ok' : 'degraded';
    return { status, deps: { db, cache }, version: VERSION };
  }
}
