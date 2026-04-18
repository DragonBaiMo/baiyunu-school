import { describe, it, expect } from 'vitest';
import { DonationService } from '../src/index.js';

describe('@bynu/service-donation', () => {
  it('ping 返回就绪标识', () => {
    expect(new DonationService().ping()).toContain('donation');
  });
});
