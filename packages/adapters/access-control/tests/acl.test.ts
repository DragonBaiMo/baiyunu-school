import { describe, it, expect } from 'vitest';
import { createAccessControlAdapter, MockAccessControlAdapter } from '../src/index.js';

describe('@bynu/adapter-access-control · Mock', () => {
  it('push + verify + revoke 生命周期', async () => {
    const a = new MockAccessControlAdapter();
    const ticket = await a.pushWhitelist('alumni-1', '2026-04-20');
    expect(await a.verifyTicket(ticket)).toBe(true);
    await a.revokeWhitelist(ticket);
    expect(await a.verifyTicket(ticket)).toBe(false);
  });

  it('factory 切换', () => {
    expect(createAccessControlAdapter('mock')).toBeInstanceOf(MockAccessControlAdapter);
    expect(() => createAccessControlAdapter('unknown')).toThrow();
  });
});
