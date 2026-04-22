// tests/integration/student-me.test.js
const { loadPage, seed, auth, api } = require('./_helper');

describe('page: student-me', () => {
  beforeEach(() => {
    seed();
    auth().setAuth('alumni', { id: 'u001', name: '张三' }, 'tok');
  });

  it('onShow 加载我的报名 + 捐赠', async () => {
    await api().enrollActivity('a1', 'u001');
    await api().createDonation({ userId: 'u001', projectName: 'p', amount: 100 });
    const page = loadPage('student-me');
    page.onShow();
    await page.load();
    expect(page.data.user.id).toBe('u001');
    expect(page.data.enrollments).toHaveLength(1);
    expect(page.data.donations).toHaveLength(1);
  });

  it('logout 确认后 clearAuth + reLaunch', () => {
    const page = loadPage('student-me');
    page.logout();
    expect(auth().isAuthenticated()).toBe(false);
    expect(wx.reLaunch).toHaveBeenCalledWith({ url: '/pages/launch/index' });
  });
});
