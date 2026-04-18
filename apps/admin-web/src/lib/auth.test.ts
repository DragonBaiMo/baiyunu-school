import { afterEach, describe, expect, it } from 'vitest';
import { getToken, isAuthenticated, setToken } from './auth.js';

afterEach(() => {
  window.localStorage.clear();
});

describe('admin-web · auth', () => {
  it('初始无 token 时 getToken 返回 null，isAuthenticated 为 false', () => {
    expect(getToken()).toBeNull();
    expect(isAuthenticated()).toBe(false);
  });

  it('setToken 写入后可被 getToken 读取', () => {
    setToken('demo-token');
    expect(getToken()).toBe('demo-token');
    expect(isAuthenticated()).toBe(true);
  });

  it('setToken(null) 清除 token', () => {
    setToken('demo-token');
    setToken(null);
    expect(getToken()).toBeNull();
    expect(isAuthenticated()).toBe(false);
  });
});
