// tests/integration/admin-members.test.js
const { loadPage, seed, auth } = require('./_helper');

describe('page: admin-members', () => {
  beforeEach(() => {
    seed();
    auth().setAuth('admin', { id: 'admin001' }, 'tok');
  });

  it('onShow 加载 6 个成员', async () => {
    const page = loadPage('admin-members');
    page.onShow();
    await page.load();
    expect(page.data.list).toHaveLength(6);
  });

  it('approve(u004) 后 list 中状态变为 approved', async () => {
    const page = loadPage('admin-members');
    page.onShow();
    await page.load();
    await page.approve({ currentTarget: { dataset: { id: 'u004' } } });
    const entry = page.data.list.find((m) => m.id === 'u004');
    expect(entry.status).toBe('approved');
  });

  it('reject(u006) 后状态变为 rejected', async () => {
    const page = loadPage('admin-members');
    page.onShow();
    await page.load();
    await page.reject({ currentTarget: { dataset: { id: 'u006' } } });
    const entry = page.data.list.find((m) => m.id === 'u006');
    expect(entry.status).toBe('rejected');
  });
});
