// pages/admin-login/index.js
const { setAuth } = require('../../utils/auth');

Page({
  data: { username: '', password: '', loading: false },
  onU(e) { this.setData({ username: e.detail.value }); },
  onP(e) { this.setData({ password: e.detail.value }); },
  login() {
    const { username, password } = this.data;
    if (username !== 'admin' || password !== 'admin123') {
      wx.showToast({ title: '账号或密码错误', icon: 'none' });
      return;
    }
    this.setData({ loading: true });
    setTimeout(() => {
      setAuth('admin', {
        id: 'admin001', name: '系统管理员', role: 'super_admin'
      }, 'mock_admin_token_' + Date.now());
      wx.reLaunch({ url: '/pages/admin-dashboard/index' });
    }, 400);
  },
  fillDemo() {
    this.setData({ username: 'admin', password: 'admin123' });
  }
});
