// tests/integration/student-activities.test.js
const { loadPage, seed, auth } = require('./_helper');

describe('page: student-activities', () => {
  beforeEach(() => {
    seed();
    auth().setAuth('alumni', { id: 'u001' }, 'tok');
  });

  it('onShow → list 加载全部 5 条', async () => {
    const page = loadPage('student-activities');
    page.onShow();
    await page.load();
    expect(page.data.list).toHaveLength(5);
  });

  it('filterTap 切换 filter', () => {
    const page = loadPage('student-activities');
    page.filterTap({ currentTarget: { dataset: { cat: '学术沙龙' } } });
    expect(page.data.filter).toBe('学术沙龙');
  });

  it('open 跳详情页', () => {
    const page = loadPage('student-activities');
    page.open({ currentTarget: { dataset: { id: 'a2' } } });
    expect(wx.navigateTo).toHaveBeenCalledWith({ url: '/pages/student-activity-detail/index?id=a2' });
  });
});
