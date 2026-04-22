// pages/admin-news/index.js
const api = require('../../utils/api');
const { requireAdmin } = require('../../utils/auth');

Page({
  data: {
    list: [], showForm: false,
    form: { title: '', summary: '', category: '校友动态' },
    categories: ['校友动态', '学院通告', '奖助学金', '就业招聘', '校园建设']
  },
  onShow() { if (!requireAdmin()) return; this.load(); },
  async load() { this.setData({ list: await api.adminGetNews() }); },
  toggleForm() { this.setData({ showForm: !this.data.showForm }); },
  onF(e) {
    const k = e.currentTarget.dataset.k;
    this.setData({ [`form.${k}`]: e.detail.value });
  },
  pickCat(e) {
    this.setData({ 'form.category': this.data.categories[e.detail.value] });
  },
  async create() {
    const { title, summary } = this.data.form;
    if (!title || !summary) {
      wx.showToast({ title: '请填写完整', icon: 'none' });
      return;
    }
    await api.adminCreateNews(this.data.form);
    wx.showToast({ title: '发布成功', icon: 'success' });
    this.setData({ showForm: false, form: { title: '', summary: '', category: '校友动态' } });
    await this.load();
  },
  async remove(e) {
    const id = e.currentTarget.dataset.id;
    const res = await new Promise(r => wx.showModal({ title: '确认', content: '确定删除？', success: r }));
    if (res.confirm) {
      await api.adminDeleteNews(id);
      wx.showToast({ title: '已删除', icon: 'success' });
      await this.load();
    }
  }
});
