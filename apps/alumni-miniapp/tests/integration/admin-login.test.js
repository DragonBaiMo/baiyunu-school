// tests/integration/admin-login.test.js
const { loadPage, seed, auth } = require('./_helper');

describe('page: admin-login', () => {
  beforeEach(() => seed());

  it('错误密码不登录 + 显示 toast', () => {
    const page = loadPage('admin-login');
    page.onU({ detail: { value: 'admin' } });
    page.onP({ detail: { value: 'wrong' } });
    page.login();
    expect(wx.showToast).toHaveBeenCalledWith(expect.objectContaining({ title: '账号或密码错误' }));
    expect(auth().isAuthenticated()).toBe(false);
  });

  it('正确账号登录后 role=admin + reLaunch 到 dashboard', () => {
    const page = loadPage('admin-login');
    page.fillDemo();
    expect(page.data.username).toBe('admin');
    expect(page.data.password).toBe('admin123');
    page.login();
    expect(auth().getRole()).toBe('admin');
    expect(wx.reLaunch).toHaveBeenCalledWith({ url: '/pages/admin-dashboard/index' });
  });
});
