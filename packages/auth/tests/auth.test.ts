import { describe, it, expect } from 'vitest';
import { hasRole, signAccessToken, verifyToken } from '../src/index.js';

const SECRET = 'test-secret-1234567890abcdef';

describe('@bynu/auth', () => {
  it('签发的 access token 可被校验并还原 roles', () => {
    const token = signAccessToken('user-1', ['portal-admin'], {
      secret: SECRET,
      expiresInSec: 60,
    });
    const payload = verifyToken(token, SECRET);
    expect(payload.type).toBe('access');
    if (payload.type === 'access') {
      expect(payload.sub).toBe('user-1');
      expect(hasRole(payload, 'portal-admin')).toBe(true);
      expect(hasRole(payload, 'super-admin')).toBe(false);
    }
  });

  it('错误密钥校验抛错', () => {
    const token = signAccessToken('u', ['readonly'], { secret: SECRET, expiresInSec: 60 });
    expect(() => verifyToken(token, 'wrong-secret')).toThrow();
  });
});
