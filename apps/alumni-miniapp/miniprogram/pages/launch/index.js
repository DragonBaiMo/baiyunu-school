// pages/launch/index.js
const { isAuthenticated, getRole } = require('../../utils/auth');

Page({
  data: {},
  onShow() {
    // 已登录则直达
    if (isAuthenticated()) {
      const role = getRole();
      if (role === 'alumni') wx.reLaunch({ url: '/pages/student-home/index' });
      else if (role === 'admin') wx.reLaunch({ url: '/pages/admin-dashboard/index' });
    }
  },
  goAlumni() { wx.navigateTo({ url: '/pages/student-login/index' }); },
  goAdmin() { wx.navigateTo({ url: '/pages/admin-login/index' }); }
});
