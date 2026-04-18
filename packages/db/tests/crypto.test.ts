import { describe, it, expect } from 'vitest';
import { decryptAesGcm, encryptAesGcm, parseKey, sha256 } from '../src/crypto.js';

const HEX = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';

describe('@bynu/db · crypto', () => {
  it('AES-256-GCM 加解密往返一致', () => {
    const key = parseKey(HEX);
    const enc = encryptAesGcm(key, '张三-13800000000');
    expect(enc.length).toBeGreaterThan(28);
    const dec = decryptAesGcm(key, enc);
    expect(dec).toBe('张三-13800000000');
  });

  it('非法 key 抛错', () => {
    expect(() => parseKey('short')).toThrow();
  });

  it('sha256 输出 32 字节', () => {
    expect(sha256('foo').length).toBe(32);
  });
});
