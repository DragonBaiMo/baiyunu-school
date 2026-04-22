// tests/integration/student-activity-detail.test.js
const { loadPage, seed, auth, api } = require('./_helper');

describe('page: student-activity-detail', () => {
  beforeEach(() => {
    seed();
    auth().setAuth('alumni', { id: 'u001', name: '张三' }, 'tok');
  });

  it('onLoad(id=a1) 加载后 act.title 非空', async () => {
    const page = loadPage('student-activity-detail');
    page.onLoad({ id: 'a1' });
    await page.load();
    expect(page.data.act).toBeTruthy();
    expect(page.data.act.title).toBeTruthy();
    expect(page.data.loading).toBe(false);
  });

  it('onLoad 不存在的 id → act=null 显示空态', async () => {
    const page = loadPage('student-activity-detail');
    page.onLoad({ id: 'no-such' });
    await page.load();
    expect(page.data.act).toBeNull();
    expect(page.data.loading).toBe(false);
  });

  it('enroll 成功 → enrolled+1 + toast 成功', async () => {
    const page = loadPage('student-activity-detail');
    page.onLoad({ id: 'a1' });
    await page.load();
    const before = page.data.act.enrolled;
    await page.enroll();
    expect(page.data.act.enrolled).toBe(before + 1);
    expect(wx.showToast).toHaveBeenCalledWith(expect.objectContaining({ title: '报名成功' }));
  });

  it('enroll 重复报名 → toast "你已报名此活动"', async () => {
    const page = loadPage('student-activity-detail');
    page.onLoad({ id: 'a2' });
    await page.load();
    await page.enroll();
    wx.showToast.mockClear();
    await page.enroll();
    expect(wx.showToast).toHaveBeenCalledWith(expect.objectContaining({ title: '你已报名此活动' }));
  });
});
