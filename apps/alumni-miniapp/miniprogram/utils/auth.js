// utils/auth.js - 登录态
const TOKEN_KEY = 'mp_token';
const USER_KEY = 'mp_user';
const ROLE_KEY = 'mp_role'; // 'alumni' | 'admin'

function setAuth(role, user, token) {
  wx.setStorageSync(ROLE_KEY, role);
  wx.setStorageSync(USER_KEY, user);
  wx.setStorageSync(TOKEN_KEY, token);
}
function clearAuth() {
  wx.removeStorageSync(ROLE_KEY);
  wx.removeStorageSync(USER_KEY);
  wx.removeStorageSync(TOKEN_KEY);
}
function getUser() { return wx.getStorageSync(USER_KEY) || null; }
function getRole() { return wx.getStorageSync(ROLE_KEY) || null; }
function getToken() { return wx.getStorageSync(TOKEN_KEY) || ''; }
function isAuthenticated() { return !!getToken(); }

function requireAlumni() {
  if (!isAuthenticated() || getRole() !== 'alumni') {
    wx.reLaunch({ url: '/pages/student-login/index' });
    return false;
  }
  return true;
}
function requireAdmin() {
  if (!isAuthenticated() || getRole() !== 'admin') {
    wx.reLaunch({ url: '/pages/admin-login/index' });
    return false;
  }
  return true;
}

module.exports = {
  setAuth, clearAuth, getUser, getRole, getToken,
  isAuthenticated, requireAlumni, requireAdmin
};
