// app.js - 白云大学校友平台小程序入口
const { ensureMockSeed } = require('./utils/mock');

App({
  onLaunch() {
    // 首次启动时注入 mock 种子数据
    ensureMockSeed();
  },
  globalData: {
    appName: '白云大学校友平台',
    version: '0.1.0'
  }
});
