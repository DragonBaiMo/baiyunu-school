import { describe, it, expect } from 'vitest';
import { EtlService } from '../src/index.js';

describe('@bynu/service-etl', () => {
  it('ping 返回就绪标识', () => {
    expect(new EtlService().ping()).toContain('etl');
  });
});
