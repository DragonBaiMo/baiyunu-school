// pages/admin-dashboard/index.js
const api = require('../../utils/api');
const { requireAdmin, getUser, clearAuth } = require('../../utils/auth');

Page({
  data: { stats: { memberTotal: 0, pendingMembers: 0, activityTotal: 0, enrollTotal: 0, newsTotal: 0, donationTotal: 0 }, user: null },
  onShow() {
    if (!requireAdmin()) return;
    this.load();
  },
  async load() {
    const stats = await api.adminStats();
    this.setData({ stats, user: getUser() });
  },
  goMembers() { wx.navigateTo({ url: '/pages/admin-members/index' }); },
  goActs() { wx.navigateTo({ url: '/pages/admin-activities/index' }); },
  goNews() { wx.navigateTo({ url: '/pages/admin-news/index' }); },
  logout() {
    wx.showModal({
      title: '退出登录', content: '确认退出管理后台？',
      success: (r) => { if (r.confirm) { clearAuth(); wx.reLaunch({ url: '/pages/launch/index' }); } }
    });
  }
});
