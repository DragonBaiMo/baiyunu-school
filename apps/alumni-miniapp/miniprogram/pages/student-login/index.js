// pages/student-login/index.js
const { setAuth } = require('../../utils/auth');

Page({
  data: { name: '', studentId: '', loading: false },
  onName(e) { this.setData({ name: e.detail.value }); },
  onSid(e) { this.setData({ studentId: e.detail.value }); },
  ssoLogin() {
    this.setData({ loading: true });
    setTimeout(() => {
      setAuth('alumni', {
        id: 'u001',
        name: '张三',
        class: '2016级计算机',
        company: '某互联网公司',
        position: '技术专家'
      }, 'mock_sso_token_' + Date.now());
      wx.reLaunch({ url: '/pages/student-home/index' });
    }, 500);
  },
  formLogin() {
    const { name, studentId } = this.data;
    if (!name || !studentId) {
      wx.showToast({ title: '请填写姓名和学号', icon: 'none' });
      return;
    }
    this.setData({ loading: true });
    setTimeout(() => {
      setAuth('alumni', {
        id: 'u_' + studentId,
        name,
        class: '校友（自助登记）',
        company: '',
        position: ''
      }, 'mock_form_token_' + Date.now());
      wx.reLaunch({ url: '/pages/student-home/index' });
    }, 500);
  }
});
