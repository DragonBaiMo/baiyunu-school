import { describe, it, expect } from 'vitest';
import { createLogger } from '../src/index.js';

describe('@bynu/logger', () => {
  it('创建 logger 实例含 info 方法', () => {
    const log = createLogger({ name: 'test', level: 'warn' });
    expect(typeof log.info).toBe('function');
    expect(typeof log.error).toBe('function');
    expect(log.level).toBe('warn');
  });
});
