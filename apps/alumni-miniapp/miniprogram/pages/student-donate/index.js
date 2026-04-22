// pages/student-donate/index.js
const api = require('../../utils/api');
const { requireAlumni, getUser } = require('../../utils/auth');

Page({
  data: {
    stats: null,
    project: '白云之光奖学金',
    amount: 100,
    amounts: [50, 100, 500, 1000],
    myOrders: [],
    submitting: false
  },
  onShow() {
    if (!requireAlumni()) return;
    this.load();
  },
  async load() {
    const stats = await api.getDonationStats();
    const myOrders = await api.getMyDonations(getUser().id);
    this.setData({ stats, myOrders });
  },
  pickAmount(e) { this.setData({ amount: Number(e.currentTarget.dataset.v) }); },
  onAmount(e) { this.setData({ amount: Number(e.detail.value) || 0 }); },
  pickProject(e) { this.setData({ project: e.currentTarget.dataset.name }); },
  async submit() {
    if (!this.data.amount || this.data.amount <= 0) {
      wx.showToast({ title: '请输入有效金额', icon: 'none' });
      return;
    }
    this.setData({ submitting: true });
    try {
      await api.createDonation({
        userId: getUser().id,
        projectName: this.data.project,
        amount: this.data.amount
      });
      wx.showToast({ title: '捐赠成功 · 感谢支持', icon: 'success' });
      this.load();
    } catch (e) {
      wx.showToast({ title: e.message, icon: 'none' });
    } finally {
      this.setData({ submitting: false });
    }
  },
  goHome() { wx.reLaunch({ url: '/pages/student-home/index' }); },
  goActs() { wx.reLaunch({ url: '/pages/student-activities/index' }); },
  goMe() { wx.reLaunch({ url: '/pages/student-me/index' }); }
});
