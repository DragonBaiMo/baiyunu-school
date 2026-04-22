// tests/integration/launch.test.js
const { loadPage, seed, auth } = require('./_helper');

describe('page: launch', () => {
  beforeEach(() => seed());

  it('onShow 未登录不跳转', () => {
    const page = loadPage('launch');
    page.onShow();
    expect(wx.reLaunch).not.toHaveBeenCalled();
  });

  it('onShow alumni 已登录直达 home', () => {
    auth().setAuth('alumni', { id: 'u001' }, 'tok');
    const page = loadPage('launch');
    page.onShow();
    expect(wx.reLaunch).toHaveBeenCalledWith({ url: '/pages/student-home/index' });
  });

  it('onShow admin 已登录直达 dashboard', () => {
    auth().setAuth('admin', { id: 'admin001' }, 'tok');
    const page = loadPage('launch');
    page.onShow();
    expect(wx.reLaunch).toHaveBeenCalledWith({ url: '/pages/admin-dashboard/index' });
  });

  it('goAlumni / goAdmin 调用 navigateTo', () => {
    const page = loadPage('launch');
    page.goAlumni();
    page.goAdmin();
    const urls = wx.navigateTo.mock.calls.map((c) => c[0].url);
    expect(urls).toContain('/pages/student-login/index');
    expect(urls).toContain('/pages/admin-login/index');
  });
});
