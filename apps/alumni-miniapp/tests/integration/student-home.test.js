// tests/integration/student-home.test.js
const { loadPage, seed, auth } = require('./_helper');

describe('page: student-home', () => {
  beforeEach(() => seed());

  it('未登录时 onShow 触发 reLaunch 到登录页', async () => {
    const page = loadPage('student-home');
    const ret = page.onShow();
    // onShow 本身不 await load；requireAlumni 失败即 return
    await Promise.resolve(ret);
    expect(wx.reLaunch).toHaveBeenCalledWith({ url: '/pages/student-login/index' });
  });

  it('登录后 onShow 拉全量数据', async () => {
    auth().setAuth('alumni', { id: 'u001', name: '张三' }, 'tok');
    const page = loadPage('student-home');
    page.onShow();
    await page.load(); // 确保完成
    expect(page.data.news.length).toBeGreaterThan(0);
    expect(page.data.news.length).toBeLessThanOrEqual(5);
    expect(page.data.hotActivities.length).toBeLessThanOrEqual(3);
    expect(page.data.donationStats).toBeTruthy();
    expect(page.data.user.id).toBe('u001');
    expect(page.data.loading).toBe(false);
  });

  it('openActivity 带 id 参数跳活动详情', () => {
    auth().setAuth('alumni', { id: 'u001' }, 'tok');
    const page = loadPage('student-home');
    page.openActivity({ currentTarget: { dataset: { id: 'a3' } } });
    expect(wx.navigateTo).toHaveBeenCalledWith({ url: '/pages/student-activity-detail/index?id=a3' });
  });
});
