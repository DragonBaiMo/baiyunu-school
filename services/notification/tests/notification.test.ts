import { describe, it, expect } from 'vitest';
import { NotificationService } from '../src/index.js';

describe('@bynu/service-notification', () => {
  it('ping 返回就绪标识', () => {
    expect(new NotificationService().ping()).toContain('notification');
  });
});
