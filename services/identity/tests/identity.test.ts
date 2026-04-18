import { describe, it, expect } from 'vitest';
import { IdentityService } from '../src/index.js';

describe('@bynu/service-identity', () => {
  it('ping 返回就绪标识', () => {
    expect(new IdentityService().ping()).toContain('identity');
  });
});
