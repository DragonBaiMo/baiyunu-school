// tests/unit/auth.test.js
const path = require('path');

const AUTH_PATH = path.resolve(__dirname, '../../miniprogram/utils/auth.js');

function load() {
  delete require.cache[AUTH_PATH];
  return require(AUTH_PATH);
}

describe('utils/auth', () => {
  it('setAuth 后 getUser/getRole/getToken/isAuthenticated 一致', () => {
    const auth = load();
    auth.setAuth('alumni', { id: 'u001', name: '张三' }, 'tok-1');
    expect(auth.getRole()).toBe('alumni');
    expect(auth.getUser()).toEqual({ id: 'u001', name: '张三' });
    expect(auth.getToken()).toBe('tok-1');
    expect(auth.isAuthenticated()).toBe(true);
  });

  it('clearAuth 清空三个 key', () => {
    const auth = load();
    auth.setAuth('admin', { id: 'a1' }, 'tok');
    auth.clearAuth();
    expect(auth.getUser()).toBeNull();
    expect(auth.getRole()).toBeNull();
    expect(auth.getToken()).toBe('');
    expect(auth.isAuthenticated()).toBe(false);
  });

  it('requireAlumni：未登录跳登录页返回 false', () => {
    const auth = load();
    const ok = auth.requireAlumni();
    expect(ok).toBe(false);
    expect(wx.reLaunch).toHaveBeenCalledWith({ url: '/pages/student-login/index' });
  });

  it('requireAlumni：登录但 role=admin 仍然跳 alumni 登录页', () => {
    const auth = load();
    auth.setAuth('admin', { id: 'a' }, 'tok');
    const ok = auth.requireAlumni();
    expect(ok).toBe(false);
    expect(wx.reLaunch).toHaveBeenCalledWith({ url: '/pages/student-login/index' });
  });

  it('requireAlumni：alumni 登录后返回 true 不跳转', () => {
    const auth = load();
    auth.setAuth('alumni', { id: 'u1' }, 'tok');
    const ok = auth.requireAlumni();
    expect(ok).toBe(true);
    expect(wx.reLaunch).not.toHaveBeenCalled();
  });

  it('requireAdmin：未登录跳管理员登录页', () => {
    const auth = load();
    const ok = auth.requireAdmin();
    expect(ok).toBe(false);
    expect(wx.reLaunch).toHaveBeenCalledWith({ url: '/pages/admin-login/index' });
  });

  it('requireAdmin：admin 登录后返回 true', () => {
    const auth = load();
    auth.setAuth('admin', { id: 'a1' }, 'tok');
    expect(auth.requireAdmin()).toBe(true);
    expect(wx.reLaunch).not.toHaveBeenCalled();
  });
});
