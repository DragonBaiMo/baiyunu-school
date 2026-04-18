import { describe, it, expect } from 'vitest';
import { OrganizationService } from '../src/index.js';

describe('@bynu/service-organization', () => {
  it('ping 返回就绪标识', () => {
    expect(new OrganizationService().ping()).toContain('organization');
  });
});
