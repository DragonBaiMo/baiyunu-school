// tests/integration/admin-news.test.js
const { loadPage, seed, auth } = require('./_helper');

describe('page: admin-news', () => {
  beforeEach(() => {
    seed();
    auth().setAuth('admin', { id: 'admin001' }, 'tok');
  });

  async function init() {
    const page = loadPage('admin-news');
    page.onShow();
    await page.load();
    return page;
  }

  it('onShow 加载 5 条新闻', async () => {
    const page = await init();
    expect(page.data.list).toHaveLength(5);
  });

  it('create 空字段 toast 且不新增', async () => {
    const page = await init();
    page.toggleForm();
    await page.create();
    expect(wx.showToast).toHaveBeenCalledWith(expect.objectContaining({ title: '请填写完整' }));
    expect(page.data.list).toHaveLength(5);
  });

  it('create 成功后 list +1 + 表单重置', async () => {
    const page = await init();
    page.toggleForm();
    page.onF({ currentTarget: { dataset: { k: 'title' } }, detail: { value: '新资讯' } });
    page.onF({ currentTarget: { dataset: { k: 'summary' } }, detail: { value: '简报' } });
    await page.create();
    expect(page.data.list).toHaveLength(6);
    expect(page.data.list[0].title).toBe('新资讯');
    expect(page.data.showForm).toBe(false);
    expect(page.data.form.title).toBe('');
  });

  it('remove 后 list -1', async () => {
    const page = await init();
    await page.remove({ currentTarget: { dataset: { id: 'n1' } } });
    expect(page.data.list.find((n) => n.id === 'n1')).toBeUndefined();
    expect(page.data.list).toHaveLength(4);
  });
});
