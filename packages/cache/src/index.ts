/**
 * 缓存统一封装：
 * - `mock://local` → ioredis-mock（dev 默认）
 * - `redis://host:port` → ioredis 真实连接（生产）
 *
 * 返回的 CacheClient 实现了 ioredis 的子集，业务只需依赖本接口。
 */

import Redis, { type Redis as RedisType } from 'ioredis';
import RedisMock from 'ioredis-mock';

export interface CacheClient {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, mode?: 'EX', seconds?: number): Promise<'OK' | null>;
  del(key: string): Promise<number>;
  ping(): Promise<string>;
  quit(): Promise<'OK'>;
}

export function createCacheClient(url: string): CacheClient {
  if (url.startsWith('mock://')) {
    return new RedisMock() as unknown as CacheClient;
  }
  const client: RedisType = new Redis(url, { lazyConnect: false, maxRetriesPerRequest: 3 });
  return client as unknown as CacheClient;
}

export async function cacheHealth(client: CacheClient): Promise<'ok' | 'fail'> {
  try {
    const r = await client.ping();
    return r === 'PONG' ? 'ok' : 'fail';
  } catch {
    return 'fail';
  }
}
