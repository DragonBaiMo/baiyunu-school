import { describe, it, expect } from 'vitest';
import { ActivityService } from '../src/index.js';

describe('@bynu/service-activity', () => {
  it('ping 返回就绪标识', () => {
    expect(new ActivityService().ping()).toContain('activity');
  });
});
