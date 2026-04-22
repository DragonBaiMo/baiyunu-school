// pages/admin-members/index.js
const api = require('../../utils/api');
const { requireAdmin } = require('../../utils/auth');

Page({
  data: { list: [], filter: 'all' },
  onShow() {
    if (!requireAdmin()) return;
    this.load();
  },
  async load() {
    const list = await api.adminGetMembers();
    this.setData({ list });
  },
  setFilter(e) { this.setData({ filter: e.currentTarget.dataset.f }); },
  async approve(e) {
    await api.adminUpdateMemberStatus(e.currentTarget.dataset.id, 'approved');
    wx.showToast({ title: '已通过', icon: 'success' });
    this.load();
  },
  async reject(e) {
    await api.adminUpdateMemberStatus(e.currentTarget.dataset.id, 'rejected');
    wx.showToast({ title: '已驳回', icon: 'success' });
    this.load();
  }
});
