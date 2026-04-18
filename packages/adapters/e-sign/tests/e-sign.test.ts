import { describe, it, expect } from 'vitest';
import { createESignAdapter, MockESignAdapter } from '../src/index.js';

describe('@bynu/adapter-e-sign · Mock', () => {
  it('createSignTask 生成 sha256 与水印字节', async () => {
    const a = new MockESignAdapter();
    const task = await a.createSignTask(Buffer.from('hello-pdf'), '王昭然');
    expect(task.status).toBe('signed');
    expect(task.sha256).toHaveLength(64);
    const signed = await a.downloadSigned(task.taskId);
    expect(signed.toString('utf8')).toContain('signed-by=王昭然');
  });

  it('factory 切换', () => {
    expect(createESignAdapter('mock')).toBeInstanceOf(MockESignAdapter);
    expect(() => createESignAdapter('fadada')).toThrow();
    expect(() => createESignAdapter('unknown')).toThrow();
  });
});
