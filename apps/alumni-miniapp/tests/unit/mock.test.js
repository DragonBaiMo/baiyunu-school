// tests/unit/mock.test.js
const path = require('path');

const MOCK_PATH = path.resolve(__dirname, '../../miniprogram/utils/mock.js');

function load() {
  delete require.cache[MOCK_PATH];
  return require(MOCK_PATH);
}

describe('utils/mock.ensureMockSeed', () => {
  it('首次调用注入 5 条新闻 / 5 场活动 / 6 成员', () => {
    const { ensureMockSeed, KEY } = load();
    expect(wx.getStorageSync(KEY.SEED_VERSION)).toBe('');
    ensureMockSeed();
    expect(wx.getStorageSync(KEY.NEWS)).toHaveLength(5);
    expect(wx.getStorageSync(KEY.ACTIVITIES)).toHaveLength(5);
    expect(wx.getStorageSync(KEY.MEMBERS)).toHaveLength(6);
    expect(wx.getStorageSync(KEY.DONATION_STATS)).toBeTruthy();
    expect(wx.getStorageSync(KEY.DONATION_ORDERS)).toEqual([]);
    expect(wx.getStorageSync(KEY.ENROLLMENTS)).toEqual([]);
  });

  it('相同 SEED_VERSION 下二次调用是幂等的 — 不覆盖已变更的业务数据', () => {
    const { ensureMockSeed, KEY } = load();
    ensureMockSeed();
    // 模拟业务操作
    const acts = wx.getStorageSync(KEY.ACTIVITIES);
    acts[0].enrolled = 999;
    wx.setStorageSync(KEY.ACTIVITIES, acts);
    // 再调用
    ensureMockSeed();
    const again = wx.getStorageSync(KEY.ACTIVITIES);
    expect(again[0].enrolled).toBe(999);
  });

  it('SEED_VERSION 未写入时会重新注入（模拟首启）', () => {
    const { ensureMockSeed, KEY } = load();
    ensureMockSeed();
    wx.removeStorageSync(KEY.SEED_VERSION);
    // 把新闻清空
    wx.setStorageSync(KEY.NEWS, []);
    ensureMockSeed();
    expect(wx.getStorageSync(KEY.NEWS)).toHaveLength(5);
  });
});
