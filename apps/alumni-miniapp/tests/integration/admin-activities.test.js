// tests/integration/admin-activities.test.js
const { loadPage, seed, auth } = require('./_helper');

describe('page: admin-activities', () => {
  beforeEach(() => {
    seed();
    auth().setAuth('admin', { id: 'admin001' }, 'tok');
  });

  async function init() {
    const page = loadPage('admin-activities');
    page.onShow();
    await page.load();
    return page;
  }

  it('onShow 加载 5 条活动', async () => {
    const page = await init();
    expect(page.data.list).toHaveLength(5);
  });

  it('create 空字段显示 toast，不新增', async () => {
    const page = await init();
    page.toggleForm();
    await page.create();
    expect(wx.showToast).toHaveBeenCalledWith(expect.objectContaining({ title: '请填写完整信息' }));
    expect(page.data.list).toHaveLength(5);
  });

  it('create 成功后 list +1 + form 重置 + showForm=false', async () => {
    const page = await init();
    page.toggleForm();
    page.onF({ currentTarget: { dataset: { k: 'title' } }, detail: { value: '新活动' } });
    page.onF({ currentTarget: { dataset: { k: 'date' } }, detail: { value: '2026-06-01' } });
    page.onF({ currentTarget: { dataset: { k: 'location' } }, detail: { value: '大礼堂' } });
    page.onF({ currentTarget: { dataset: { k: 'capacity' } }, detail: { value: '50' } });
    await page.create();
    expect(page.data.list).toHaveLength(6);
    expect(page.data.list[0].title).toBe('新活动');
    expect(page.data.showForm).toBe(false);
    expect(page.data.form.title).toBe('');
  });

  it('remove 后 list -1', async () => {
    const page = await init();
    await page.remove({ currentTarget: { dataset: { id: 'a1' } } });
    expect(page.data.list.find((a) => a.id === 'a1')).toBeUndefined();
    expect(page.data.list).toHaveLength(4);
  });

  it('pickCat 切换 category', () => {
    const page = loadPage('admin-activities');
    page.pickCat({ detail: { value: 2 } });
    expect(page.data.form.category).toBe('文体活动');
  });
});
