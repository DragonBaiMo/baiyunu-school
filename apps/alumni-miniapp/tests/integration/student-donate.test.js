// tests/integration/student-donate.test.js
const { loadPage, seed, auth, api } = require('./_helper');

describe('page: student-donate', () => {
  beforeEach(() => {
    seed();
    auth().setAuth('alumni', { id: 'u001', name: '张三' }, 'tok');
  });

  it('onShow → load 填充 stats 和空 myOrders', async () => {
    const page = loadPage('student-donate');
    page.onShow();
    await page.load();
    expect(page.data.stats).toBeTruthy();
    expect(page.data.myOrders).toEqual([]);
  });

  it('submit amount=0 → toast 不下单', async () => {
    const page = loadPage('student-donate');
    page.onShow();
    await page.load();
    page.setData({ amount: 0 });
    await page.submit();
    expect(wx.showToast).toHaveBeenCalledWith(expect.objectContaining({ title: '请输入有效金额' }));
    const list = await api().getMyDonations('u001');
    expect(list).toHaveLength(0);
  });

  it('submit amount>0 → 订单创建并刷新 myOrders', async () => {
    const page = loadPage('student-donate');
    page.onShow();
    await page.load();
    page.pickAmount({ currentTarget: { dataset: { v: 500 } } });
    expect(page.data.amount).toBe(500);
    await page.submit();
    expect(page.data.myOrders).toHaveLength(1);
    expect(page.data.myOrders[0].amount).toBe(500);
    expect(wx.showToast).toHaveBeenCalledWith(expect.objectContaining({ icon: 'success' }));
  });

  it('pickProject 切换项目名', () => {
    const page = loadPage('student-donate');
    page.pickProject({ currentTarget: { dataset: { name: '校史馆数字化升级' } } });
    expect(page.data.project).toBe('校史馆数字化升级');
  });
});
