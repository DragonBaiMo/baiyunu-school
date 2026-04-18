import { describe, it, expect } from 'vitest';
import { WorkflowService } from '../src/index.js';

describe('@bynu/service-workflow', () => {
  it('ping 返回就绪标识', () => {
    expect(new WorkflowService().ping()).toContain('workflow');
  });
});
