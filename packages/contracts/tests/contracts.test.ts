import { describe, it, expect } from 'vitest';
import { HealthResponseSchema, ProblemDetailsSchema } from '../src/index.js';

describe('@bynu/contracts', () => {
  it('HealthResponseSchema 校验合规响应', () => {
    const ok = HealthResponseSchema.safeParse({
      status: 'ok',
      deps: { db: 'ok', cache: 'ok' },
      version: '0.1.0-alpha',
    });
    expect(ok.success).toBe(true);
  });

  it('HealthResponseSchema 拒绝非法 status', () => {
    const bad = HealthResponseSchema.safeParse({
      status: 'magic',
      deps: { db: 'ok', cache: 'ok' },
      version: '0.1.0-alpha',
    });
    expect(bad.success).toBe(false);
  });

  it('ProblemDetails 符合 RFC 7807 最小结构', () => {
    const pd = ProblemDetailsSchema.safeParse({
      type: 'https://example.com/errors/x',
      title: 'Unauthorized',
      status: 401,
    });
    expect(pd.success).toBe(true);
  });
});
