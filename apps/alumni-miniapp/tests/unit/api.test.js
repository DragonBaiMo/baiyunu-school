// tests/unit/api.test.js
const path = require('path');

const API_PATH = path.resolve(__dirname, '../../miniprogram/utils/api.js');
const MOCK_PATH = path.resolve(__dirname, '../../miniprogram/utils/mock.js');

function load() {
  delete require.cache[API_PATH];
  delete require.cache[MOCK_PATH];
  const api = require(API_PATH);
  const { ensureMockSeed, KEY } = require(MOCK_PATH);
  ensureMockSeed();
  return { api, KEY };
}

describe('utils/api - 公共门户', () => {
  it('getNews(limit) 返回长度 ≤ limit', async () => {
    const { api } = load();
    const list = await api.getNews(3);
    expect(list.length).toBe(3);
  });

  it('getActivities 默认返回全量 5 条', async () => {
    const { api } = load();
    const list = await api.getActivities();
    expect(list).toHaveLength(5);
  });

  it('getActivityById(不存在) 返回 null', async () => {
    const { api } = load();
    const act = await api.getActivityById('not-exist');
    expect(act).toBeNull();
  });

  it('getActivityById 找到目标活动', async () => {
    const { api } = load();
    const act = await api.getActivityById('a1');
    expect(act).toBeTruthy();
    expect(act.id).toBe('a1');
  });

  it('getDonationStats 返回非空', async () => {
    const { api } = load();
    const s = await api.getDonationStats();
    expect(s).toBeTruthy();
    expect(s.totalAmount).toBeGreaterThan(0);
  });
});

describe('utils/api - 校友行为', () => {
  it('enrollActivity 首次成功：enrolled+1 并写入 enrollments', async () => {
    const { api, KEY } = load();
    const before = (await api.getActivityById('a2')).enrolled;
    const res = await api.enrollActivity('a2', 'u001');
    expect(res.success).toBe(true);
    const after = (await api.getActivityById('a2')).enrolled;
    expect(after).toBe(before + 1);
    const enrolls = wx.getStorageSync(KEY.ENROLLMENTS);
    expect(enrolls).toHaveLength(1);
    expect(enrolls[0]).toMatchObject({ activityId: 'a2', userId: 'u001' });
  });

  it('enrollActivity 重复报名抛 "你已报名此活动"', async () => {
    const { api } = load();
    await api.enrollActivity('a2', 'u001');
    await expect(api.enrollActivity('a2', 'u001')).rejects.toThrow('你已报名此活动');
  });

  it('enrollActivity 活动不存在抛错', async () => {
    const { api } = load();
    await expect(api.enrollActivity('no-such', 'u001')).rejects.toThrow('活动不存在');
  });

  it('enrollActivity 名额已满抛错', async () => {
    const { api, KEY } = load();
    const acts = wx.getStorageSync(KEY.ACTIVITIES);
    const target = acts.find((a) => a.id === 'a1');
    target.enrolled = target.capacity;
    wx.setStorageSync(KEY.ACTIVITIES, acts);
    await expect(api.enrollActivity('a1', 'u001')).rejects.toThrow('名额已满');
  });

  it('getMyEnrollments 只返回当前用户', async () => {
    const { api } = load();
    await api.enrollActivity('a1', 'u001');
    await api.enrollActivity('a2', 'u002');
    const mine = await api.getMyEnrollments('u001');
    expect(mine).toHaveLength(1);
    expect(mine[0].activity.id).toBe('a1');
  });

  it('createDonation amount<=0 抛错', async () => {
    const { api } = load();
    await expect(api.createDonation({ userId: 'u', projectName: 'p', amount: 0 })).rejects.toThrow('捐赠金额无效');
    await expect(api.createDonation({ userId: 'u', projectName: 'p', amount: -5 })).rejects.toThrow('捐赠金额无效');
  });

  it('createDonation 成功后 order 进 orders 头部 + stats 累加', async () => {
    const { api, KEY } = load();
    const statsBefore = wx.getStorageSync(KEY.DONATION_STATS);
    const orig = { amount: statsBefore.totalAmount, donors: statsBefore.totalDonors };
    const order = await api.createDonation({ userId: 'u001', projectName: '白云之光奖学金', amount: 200 });
    expect(order.amount).toBe(200);
    expect(order.id).toMatch(/^d_/);
    const orders = wx.getStorageSync(KEY.DONATION_ORDERS);
    expect(orders[0].id).toBe(order.id);
    const statsAfter = wx.getStorageSync(KEY.DONATION_STATS);
    expect(statsAfter.totalAmount).toBe(orig.amount + 200);
    expect(statsAfter.totalDonors).toBe(orig.donors + 1);
  });

  it('getMyDonations 过滤用户', async () => {
    const { api } = load();
    await api.createDonation({ userId: 'u001', projectName: 'x', amount: 100 });
    await api.createDonation({ userId: 'u002', projectName: 'y', amount: 50 });
    const mine = await api.getMyDonations('u001');
    expect(mine).toHaveLength(1);
    expect(mine[0].amount).toBe(100);
  });
});

describe('utils/api - 管理员行为', () => {
  it('adminGetMembers 返回全量 6 个', async () => {
    const { api } = load();
    const list = await api.adminGetMembers();
    expect(list).toHaveLength(6);
  });

  it('adminUpdateMemberStatus 更新后可查得新状态', async () => {
    const { api } = load();
    await api.adminUpdateMemberStatus('u004', 'approved');
    const list = await api.adminGetMembers();
    expect(list.find((m) => m.id === 'u004').status).toBe('approved');
  });

  it('adminUpdateMemberStatus 不存在 id 抛错', async () => {
    const { api } = load();
    await expect(api.adminUpdateMemberStatus('nope', 'approved')).rejects.toThrow('成员不存在');
  });

  it('adminCreateActivity 新增到首位 + id 以 a_ 开头', async () => {
    const { api } = load();
    const before = (await api.adminGetActivities()).length;
    const act = await api.adminCreateActivity({
      title: 'T', date: '2026-06-01', location: '礼堂', category: '校友聚会', capacity: 50, description: ''
    });
    expect(act.id).toMatch(/^a_/);
    const after = await api.adminGetActivities();
    expect(after).toHaveLength(before + 1);
    expect(after[0].id).toBe(act.id);
  });

  it('adminDeleteActivity 删除后不再包含', async () => {
    const { api } = load();
    await api.adminDeleteActivity('a1');
    const list = await api.adminGetActivities();
    expect(list.find((a) => a.id === 'a1')).toBeUndefined();
  });

  it('adminCreateNews / adminDeleteNews', async () => {
    const { api } = load();
    const item = await api.adminCreateNews({ title: 'N', summary: 'S', category: '校友动态' });
    expect(item.id).toMatch(/^n_/);
    const list1 = await api.adminGetNews();
    expect(list1[0].id).toBe(item.id);
    await api.adminDeleteNews(item.id);
    const list2 = await api.adminGetNews();
    expect(list2.find((n) => n.id === item.id)).toBeUndefined();
  });

  it('adminStats 聚合值与 storage 状态一致', async () => {
    const { api } = load();
    const s = await api.adminStats();
    expect(s.memberTotal).toBe(6);
    expect(s.pendingMembers).toBe(2); // u004, u006
    expect(s.activityTotal).toBe(5);
    // enrollTotal = 187+95+142+58+231 = 713
    expect(s.enrollTotal).toBe(713);
    expect(s.newsTotal).toBe(5);
    expect(s.donationTotal).toBe(0);
  });

  it('adminStats 在业务操作后随状态变化', async () => {
    const { api } = load();
    await api.adminUpdateMemberStatus('u004', 'approved');
    await api.createDonation({ userId: 'u001', projectName: 'p', amount: 300 });
    const s = await api.adminStats();
    expect(s.pendingMembers).toBe(1);
    expect(s.donationTotal).toBe(300);
  });
});
