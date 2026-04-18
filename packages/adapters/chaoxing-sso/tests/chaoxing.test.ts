import { describe, it, expect } from 'vitest';
import { createChaoxingSsoAdapter, MockChaoxingSsoAdapter } from '../src/index.js';

describe('@bynu/adapter-chaoxing-sso · Mock', () => {
  it('buildAuthUrl 携带 state', () => {
    const a = new MockChaoxingSsoAdapter();
    expect(a.buildAuthUrl('abc 123')).toContain('state=abc%20123');
  });

  it('exchangeToken 返回带前缀的 mock token', async () => {
    const a = new MockChaoxingSsoAdapter();
    const t = await a.exchangeToken('CODE');
    expect(t.accessToken).toBe('mock-at-CODE');
    expect(t.expiresIn).toBe(3600);
  });

  it('factory 切换', () => {
    expect(createChaoxingSsoAdapter('mock')).toBeInstanceOf(MockChaoxingSsoAdapter);
    expect(() => createChaoxingSsoAdapter('unknown')).toThrow();
  });
});
