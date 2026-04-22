// tests/integration/admin-dashboard.test.js
const { loadPage, seed, auth, api } = require('./_helper');

describe('page: admin-dashboard', () => {
  beforeEach(() => {
    seed();
    auth().setAuth('admin', { id: 'admin001', name: '系统管理员' }, 'tok');
  });

  it('未登录时 reLaunch 到 admin-login', () => {
    auth().clearAuth();
    const page = loadPage('admin-dashboard');
    page.onShow();
    expect(wx.reLaunch).toHaveBeenCalledWith({ url: '/pages/admin-login/index' });
  });

  it('登录后 onShow 填充 stats + user', async () => {
    const page = loadPage('admin-dashboard');
    page.onShow();
    await page.load();
    expect(page.data.stats).toBeTruthy();
    expect(page.data.stats.memberTotal).toBe(6);
    expect(page.data.user.id).toBe('admin001');
  });

  it('goMembers/goActs/goNews 调用 navigateTo', () => {
    const page = loadPage('admin-dashboard');
    page.goMembers();
    page.goActs();
    page.goNews();
    const urls = wx.navigateTo.mock.calls.map((c) => c[0].url);
    expect(urls).toContain('/pages/admin-members/index');
    expect(urls).toContain('/pages/admin-activities/index');
    expect(urls).toContain('/pages/admin-news/index');
  });

  it('logout 后 clearAuth + reLaunch', () => {
    const page = loadPage('admin-dashboard');
    page.logout();
    expect(auth().isAuthenticated()).toBe(false);
    expect(wx.reLaunch).toHaveBeenCalledWith({ url: '/pages/launch/index' });
  });
});
