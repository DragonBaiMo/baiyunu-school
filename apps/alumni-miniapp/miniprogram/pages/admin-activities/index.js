// pages/admin-activities/index.js
const api = require('../../utils/api');
const { requireAdmin } = require('../../utils/auth');

Page({
  data: {
    list: [],
    showForm: false,
    form: { title: '', date: '', location: '', category: '校友聚会', capacity: 100, description: '' },
    categories: ['校友聚会', '学术沙龙', '文体活动', '文化讲座', '就业']
  },
  onShow() {
    if (!requireAdmin()) return;
    this.load();
  },
  async load() { this.setData({ list: await api.adminGetActivities() }); },
  toggleForm() { this.setData({ showForm: !this.data.showForm }); },
  onF(e) {
    const key = e.currentTarget.dataset.k;
    const v = e.detail.value;
    this.setData({ [`form.${key}`]: key === 'capacity' ? Number(v) : v });
  },
  pickCat(e) {
    this.setData({ 'form.category': this.data.categories[e.detail.value] });
  },
  async create() {
    const { title, date, location, capacity } = this.data.form;
    if (!title || !date || !location || !capacity) {
      wx.showToast({ title: '请填写完整信息', icon: 'none' });
      return;
    }
    await api.adminCreateActivity({ ...this.data.form, coverTag: '新' });
    wx.showToast({ title: '创建成功', icon: 'success' });
    this.setData({
      showForm: false,
      form: { title: '', date: '', location: '', category: '校友聚会', capacity: 100, description: '' }
    });
    this.load();
  },
  async remove(e) {
    const id = e.currentTarget.dataset.id;
    const res = await new Promise(r => wx.showModal({ title: '确认删除', content: '确定删除该活动？', success: r }));
    if (res.confirm) {
      await api.adminDeleteActivity(id);
      wx.showToast({ title: '已删除', icon: 'success' });
      this.load();
    }
  }
});
