// tests/setup.js - WeChat 小程序测试环境 stub
import { vi, beforeEach } from 'vitest';

// ============== wx stub ==============
const _storage = new Map();

function setByPath(obj, pathStr, value) {
  const keys = pathStr.split('.');
  let cur = obj;
  for (let i = 0; i < keys.length - 1; i += 1) {
    const k = keys[i];
    if (cur[k] == null || typeof cur[k] !== 'object') {
      cur[k] = {};
    }
    cur = cur[k];
  }
  cur[keys[keys.length - 1]] = value;
}

function createWxStub() {
  return {
    _storage,
    getStorageSync: vi.fn((key) => (_storage.has(key) ? _storage.get(key) : '')),
    setStorageSync: vi.fn((key, value) => {
      _storage.set(key, value);
    }),
    removeStorageSync: vi.fn((key) => {
      _storage.delete(key);
    }),
    clearStorageSync: vi.fn(() => {
      _storage.clear();
    }),
    showToast: vi.fn(),
    showModal: vi.fn((opts) => {
      // 默认用户点击确定
      if (opts && typeof opts.success === 'function') {
        opts.success({ confirm: true, cancel: false });
      }
    }),
    navigateTo: vi.fn(),
    reLaunch: vi.fn(),
    switchTab: vi.fn(),
    redirectTo: vi.fn(),
    navigateBack: vi.fn()
  };
}

// ============== Page / App stub ==============
function instrumentPageOptions(options) {
  const page = { ...options };
  page.data = options.data ? JSON.parse(JSON.stringify(options.data)) : {};
  page.setData = function setData(patch) {
    if (!patch) return;
    Object.keys(patch).forEach((key) => {
      if (key.includes('.') || key.includes('[')) {
        setByPath(page.data, key.replace(/\[(\d+)\]/g, '.$1'), patch[key]);
      } else {
        page.data[key] = patch[key];
      }
    });
  };
  // 捕获以便测试直接访问
  globalThis.__lastPage = page;
  return page;
}

function installGlobals() {
  globalThis.wx = createWxStub();
  globalThis.Page = vi.fn((options) => instrumentPageOptions(options));
  globalThis.App = vi.fn((options) => {
    globalThis.__lastApp = options;
    return options;
  });
  globalThis.getApp = vi.fn(() => globalThis.__lastApp || {});

  // 让所有 setTimeout 同步执行（miniprogram 场景下仅用于 UX 过渡）
  const originalSetTimeout = globalThis.setTimeout;
  globalThis.__realSetTimeout = originalSetTimeout;
  globalThis.setTimeout = (fn /* , ms */) => {
    try { fn(); } catch (e) { /* swallow to mirror runtime */ }
    return 0;
  };
}

installGlobals();

beforeEach(() => {
  // 清 storage
  _storage.clear();
  // 重建 wx（重置所有 vi.fn 计数），同时保留 _storage 引用一致
  const fresh = createWxStub();
  Object.keys(fresh).forEach((k) => {
    globalThis.wx[k] = fresh[k];
  });
  globalThis.wx._storage = _storage;
  // 重置 Page/App stubs 的调用历史
  if (globalThis.Page && globalThis.Page.mockClear) globalThis.Page.mockClear();
  if (globalThis.App && globalThis.App.mockClear) globalThis.App.mockClear();
  globalThis.__lastPage = null;
  globalThis.__lastApp = null;
  // 清 require 缓存，让每个测试重新加载页面 / 模块
  // 注意：vitest 下 require 缓存以 CommonJS 为准
  if (typeof require !== 'undefined' && require.cache) {
    Object.keys(require.cache).forEach((k) => {
      if (k.includes('miniprogram')) {
        delete require.cache[k];
      }
    });
  }
});

// 通用工具：加载一个页面并返回其 page 对象
export function loadPage(absolutePath) {
  require(absolutePath);
  return globalThis.__lastPage;
}
