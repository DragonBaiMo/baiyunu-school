// pages/student-home/index.js
const api = require('../../utils/api');
const { requireAlumni, getUser } = require('../../utils/auth');

Page({
  data: {
    user: null,
    news: [],
    hotActivities: [],
    donationStats: { totalAmount: 0, totalDonors: 0, ongoingProjects: 0, highlights: [] },
    loading: true
  },
  onShow() {
    if (!requireAlumni()) return;
    this.load();
  },
  async load() {
    const [news, acts, stats] = await Promise.all([
      api.getNews(5),
      api.getActivities(3),
      api.getDonationStats()
    ]);
    this.setData({
      user: getUser(),
      news,
      hotActivities: acts,
      donationStats: stats,
      loading: false
    });
  },
  openActivity(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/student-activity-detail/index?id=${id}` });
  },
  goDonate() { wx.navigateTo({ url: '/pages/student-donate/index' }); },
  goActivitiesList() { wx.navigateTo({ url: '/pages/student-activities/index' }); },
  toMe() { wx.navigateTo({ url: '/pages/student-me/index' }); }
});
