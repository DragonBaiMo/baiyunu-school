// utils/api.js - mock 数据操作层（读取/写入 storage）
const { KEY } = require('./mock');

function delay(ms = 200) { return new Promise(r => setTimeout(r, ms)); }

// ===== 公共门户 =====
async function getNews(limit = 10) {
  await delay();
  return (wx.getStorageSync(KEY.NEWS) || []).slice(0, limit);
}
async function getActivities(limit = 20) {
  await delay();
  return (wx.getStorageSync(KEY.ACTIVITIES) || []).slice(0, limit);
}
async function getActivityById(id) {
  await delay();
  const list = wx.getStorageSync(KEY.ACTIVITIES) || [];
  return list.find(a => a.id === id) || null;
}
async function getDonationStats() {
  await delay();
  return wx.getStorageSync(KEY.DONATION_STATS) || null;
}

// ===== 校友 =====
async function enrollActivity(activityId, userId) {
  await delay();
  const acts = wx.getStorageSync(KEY.ACTIVITIES) || [];
  const act = acts.find(a => a.id === activityId);
  if (!act) throw new Error('活动不存在');
  if (act.enrolled >= act.capacity) throw new Error('名额已满');
  const enrolls = wx.getStorageSync(KEY.ENROLLMENTS) || [];
  if (enrolls.find(e => e.activityId === activityId && e.userId === userId)) {
    throw new Error('你已报名此活动');
  }
  act.enrolled += 1;
  wx.setStorageSync(KEY.ACTIVITIES, acts);
  enrolls.push({ id: `e_${Date.now()}`, activityId, userId, enrolledAt: new Date().toISOString() });
  wx.setStorageSync(KEY.ENROLLMENTS, enrolls);
  return { success: true, activity: act };
}
async function getMyEnrollments(userId) {
  await delay();
  const enrolls = (wx.getStorageSync(KEY.ENROLLMENTS) || []).filter(e => e.userId === userId);
  const acts = wx.getStorageSync(KEY.ACTIVITIES) || [];
  return enrolls.map(e => ({ ...e, activity: acts.find(a => a.id === e.activityId) }));
}
async function createDonation({ userId, projectName, amount }) {
  await delay();
  if (!amount || amount <= 0) throw new Error('捐赠金额无效');
  const orders = wx.getStorageSync(KEY.DONATION_ORDERS) || [];
  const order = {
    id: `d_${Date.now()}`,
    userId, projectName, amount,
    status: 'paid',
    createdAt: new Date().toISOString()
  };
  orders.unshift(order);
  wx.setStorageSync(KEY.DONATION_ORDERS, orders);
  const stats = wx.getStorageSync(KEY.DONATION_STATS);
  if (stats) {
    stats.totalAmount += amount;
    stats.totalDonors += 1;
    wx.setStorageSync(KEY.DONATION_STATS, stats);
  }
  return order;
}
async function getMyDonations(userId) {
  await delay();
  return (wx.getStorageSync(KEY.DONATION_ORDERS) || []).filter(o => o.userId === userId);
}

// ===== 管理员 =====
async function adminGetMembers() {
  await delay();
  return wx.getStorageSync(KEY.MEMBERS) || [];
}
async function adminUpdateMemberStatus(id, status) {
  await delay();
  const list = wx.getStorageSync(KEY.MEMBERS) || [];
  const m = list.find(x => x.id === id);
  if (!m) throw new Error('成员不存在');
  m.status = status;
  wx.setStorageSync(KEY.MEMBERS, list);
  return m;
}
async function adminGetActivities() {
  await delay();
  return wx.getStorageSync(KEY.ACTIVITIES) || [];
}
async function adminCreateActivity(payload) {
  await delay();
  const list = wx.getStorageSync(KEY.ACTIVITIES) || [];
  const act = {
    id: `a_${Date.now()}`,
    enrolled: 0,
    coverTag: '新',
    ...payload
  };
  list.unshift(act);
  wx.setStorageSync(KEY.ACTIVITIES, list);
  return act;
}
async function adminDeleteActivity(id) {
  await delay();
  let list = wx.getStorageSync(KEY.ACTIVITIES) || [];
  list = list.filter(a => a.id !== id);
  wx.setStorageSync(KEY.ACTIVITIES, list);
  return true;
}
async function adminGetNews() {
  await delay();
  return wx.getStorageSync(KEY.NEWS) || [];
}
async function adminCreateNews(payload) {
  await delay();
  const list = wx.getStorageSync(KEY.NEWS) || [];
  const item = {
    id: `n_${Date.now()}`,
    date: new Date().toISOString().slice(0, 10),
    ...payload
  };
  list.unshift(item);
  wx.setStorageSync(KEY.NEWS, list);
  return item;
}
async function adminDeleteNews(id) {
  await delay();
  let list = wx.getStorageSync(KEY.NEWS) || [];
  list = list.filter(n => n.id !== id);
  wx.setStorageSync(KEY.NEWS, list);
  return true;
}
async function adminStats() {
  await delay();
  const members = wx.getStorageSync(KEY.MEMBERS) || [];
  const acts = wx.getStorageSync(KEY.ACTIVITIES) || [];
  const news = wx.getStorageSync(KEY.NEWS) || [];
  const donations = wx.getStorageSync(KEY.DONATION_ORDERS) || [];
  const pendingMembers = members.filter(m => m.status === 'pending').length;
  const totalEnroll = acts.reduce((s, a) => s + (a.enrolled || 0), 0);
  const donationAmount = donations.reduce((s, d) => s + (d.amount || 0), 0);
  return {
    memberTotal: members.length,
    pendingMembers,
    activityTotal: acts.length,
    enrollTotal: totalEnroll,
    newsTotal: news.length,
    donationTotal: donationAmount
  };
}

module.exports = {
  getNews, getActivities, getActivityById, getDonationStats,
  enrollActivity, getMyEnrollments, createDonation, getMyDonations,
  adminGetMembers, adminUpdateMemberStatus,
  adminGetActivities, adminCreateActivity, adminDeleteActivity,
  adminGetNews, adminCreateNews, adminDeleteNews,
  adminStats
};
