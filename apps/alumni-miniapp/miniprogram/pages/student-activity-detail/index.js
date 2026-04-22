// pages/student-activity-detail/index.js
const api = require('../../utils/api');
const { requireAlumni, getUser } = require('../../utils/auth');

Page({
  data: { act: null, loading: true, enrolling: false },
  onLoad(q) {
    if (!requireAlumni()) return;
    this.id = q.id;
    this.load();
  },
  async load() {
    const act = await api.getActivityById(this.id);
    this.setData({ act, loading: false });
  },
  async enroll() {
    if (this.data.enrolling) return;
    this.setData({ enrolling: true });
    try {
      const user = getUser();
      const res = await api.enrollActivity(this.id, user.id);
      wx.showToast({ title: '报名成功', icon: 'success' });
      this.setData({ act: res.activity });
    } catch (e) {
      wx.showToast({ title: e.message || '报名失败', icon: 'none' });
    } finally {
      this.setData({ enrolling: false });
    }
  }
});
