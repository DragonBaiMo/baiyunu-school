import { describe, it, expect } from 'vitest';
import { PortalCmsService } from '../src/index.js';

describe('@bynu/service-portal-cms', () => {
  it('ping 返回就绪标识', () => {
    expect(new PortalCmsService().ping()).toContain('portal-cms');
  });
});
