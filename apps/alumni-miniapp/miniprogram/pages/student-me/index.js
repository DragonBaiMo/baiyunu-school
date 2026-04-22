// pages/student-me/index.js
const api = require('../../utils/api');
const { requireAlumni, getUser, clearAuth } = require('../../utils/auth');

Page({
  data: { user: null, enrollments: [], donations: [] },
  onShow() {
    if (!requireAlumni()) return;
    this.load();
  },
  async load() {
    const user = getUser();
    const [enrollments, donations] = await Promise.all([
      api.getMyEnrollments(user.id),
      api.getMyDonations(user.id)
    ]);
    this.setData({ user, enrollments, donations });
  },
  logout() {
    wx.showModal({
      title: '提示', content: '确认退出登录？',
      success: (res) => {
        if (res.confirm) {
          clearAuth();
          wx.reLaunch({ url: '/pages/launch/index' });
        }
      }
    });
  },
  goHome() { wx.reLaunch({ url: '/pages/student-home/index' }); },
  goActs() { wx.reLaunch({ url: '/pages/student-activities/index' }); },
  goDonate() { wx.reLaunch({ url: '/pages/student-donate/index' }); }
});
