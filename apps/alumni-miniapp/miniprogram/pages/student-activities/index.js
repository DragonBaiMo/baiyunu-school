// pages/student-activities/index.js
const api = require('../../utils/api');
const { requireAlumni } = require('../../utils/auth');

Page({
  data: { list: [], filter: 'all', categories: ['全部', '校友聚会', '学术沙龙', '文体活动', '文化讲座', '就业'] },
  onShow() {
    if (!requireAlumni()) return;
    this.load();
  },
  async load() {
    const list = await api.getActivities(50);
    this.setData({ list });
  },
  filterTap(e) { this.setData({ filter: e.currentTarget.dataset.cat }); },
  open(e) {
    wx.navigateTo({ url: `/pages/student-activity-detail/index?id=${e.currentTarget.dataset.id}` });
  },
  goHome() { wx.reLaunch({ url: '/pages/student-home/index' }); },
  goDonate() { wx.reLaunch({ url: '/pages/student-donate/index' }); },
  goMe() { wx.reLaunch({ url: '/pages/student-me/index' }); }
});
