import { describe, it, expect } from 'vitest';
import { cacheHealth, createCacheClient } from '../src/index.js';

describe('@bynu/cache', () => {
  it('mock:// URL 返回可用的 CacheClient', async () => {
    const client = createCacheClient('mock://local');
    await client.set('foo', 'bar');
    const v = await client.get('foo');
    expect(v).toBe('bar');
    await client.quit();
  });

  it('cacheHealth 对 mock 客户端返回 ok', async () => {
    const client = createCacheClient('mock://local');
    const status = await cacheHealth(client);
    expect(status).toBe('ok');
    await client.quit();
  });
});
