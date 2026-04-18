import { describe, it, expect } from 'vitest';
import { loadConfig } from '../src/index.js';

describe('@bynu/config', () => {
  it('默认值覆盖所有必填项', () => {
    const cfg = loadConfig({} as NodeJS.ProcessEnv);
    expect(cfg.NODE_ENV).toBe('development');
    expect(cfg.DATABASE_URL).toMatch(/^pglite:/);
    expect(cfg.REDIS_URL).toBe('mock://local');
    expect(cfg.PORT_BFF).toBe(3000);
  });

  it('非法 ENCRYPTION_KEY 抛错', () => {
    expect(() =>
      loadConfig({ ENCRYPTION_KEY: 'short' } as unknown as NodeJS.ProcessEnv),
    ).toThrow(/ENCRYPTION_KEY/);
  });

  it('PORT_BFF 可被字符串覆盖', () => {
    const cfg = loadConfig({ PORT_BFF: '4000' } as unknown as NodeJS.ProcessEnv);
    expect(cfg.PORT_BFF).toBe(4000);
  });
});
