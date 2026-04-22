// tests/integration/student-login.test.js
const { loadPage, seed, auth } = require('./_helper');

describe('page: student-login', () => {
  beforeEach(() => seed());

  it('默认 loading=false', () => {
    const page = loadPage('student-login');
    expect(page.data.loading).toBe(false);
    expect(page.data.name).toBe('');
    expect(page.data.studentId).toBe('');
  });

  it('ssoLogin 后写入登录态 + reLaunch 到 student-home', () => {
    const page = loadPage('student-login');
    page.ssoLogin();
    const a = auth();
    expect(a.isAuthenticated()).toBe(true);
    expect(a.getRole()).toBe('alumni');
    expect(a.getUser().name).toBe('张三');
    expect(wx.reLaunch).toHaveBeenCalledWith({ url: '/pages/student-home/index' });
  });

  it('formLogin 空字段显示 toast', () => {
    const page = loadPage('student-login');
    page.formLogin();
    expect(wx.showToast).toHaveBeenCalled();
    const toastArg = wx.showToast.mock.calls[0][0];
    expect(toastArg.title).toContain('请填写');
    expect(auth().isAuthenticated()).toBe(false);
  });

  it('formLogin 填写后成功登录', () => {
    const page = loadPage('student-login');
    page.onName({ detail: { value: '小明' } });
    page.onSid({ detail: { value: '20180101' } });
    page.formLogin();
    const a = auth();
    expect(a.isAuthenticated()).toBe(true);
    expect(a.getUser().name).toBe('小明');
    expect(a.getUser().id).toBe('u_20180101');
    expect(wx.reLaunch).toHaveBeenCalledWith({ url: '/pages/student-home/index' });
  });
});
