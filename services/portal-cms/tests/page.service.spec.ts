import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createHarness, samplePageDsl, type TestHarness } from './harness.js';

describe('PageService', () => {
  let h: TestHarness;
  beforeEach(async () => {
    h = await createHarness();
  });
  afterEach(async () => {
    await h.close();
  });

  it('createPage 写入首版且 published=false', async () => {
    const page = await h.pages.createPage({
      slug: 'home',
      title: '首页',
      dsl: samplePageDsl(),
    });
    expect(page.version).toBe(1);
    expect(page.published).toBe(false);
    expect(page.publishedAt).toBeNull();
  });

  it('重复 slug 抛 PAGE_SLUG_DUP', async () => {
    await h.pages.createPage({
      slug: 'home',
      title: '首页',
      dsl: samplePageDsl(),
    });
    await expect(
      h.pages.createPage({ slug: 'home', title: '首页 2', dsl: samplePageDsl() }),
    ).rejects.toMatchObject({ code: 'PAGE_SLUG_DUP', status: 409 });
  });

  it('updatePage 乐观锁：版本不匹配抛 PAGE_VERSION_CONFLICT', async () => {
    const page = await h.pages.createPage({
      slug: 'home',
      title: '首页',
      dsl: samplePageDsl(),
    });
    await expect(
      h.pages.updatePage('home', { version: page.version + 1, title: 'X' }),
    ).rejects.toMatchObject({ code: 'PAGE_VERSION_CONFLICT', status: 409 });
  });

  it('publishPage 生成新版本并将 published 标志迁移到最新', async () => {
    const page = await h.pages.createPage({
      slug: 'home',
      title: '首页',
      dsl: samplePageDsl(),
    });
    const published1 = await h.pages.publishPage('home', page.version);
    expect(published1.published).toBe(true);
    expect(published1.version).toBe(2);

    // 再创建一个编辑版（手动插入新版，模拟后续 update+publish 流程）
    // 先对 version=1 进行修改（title），然后二次 publish 仍以 version=2 为基线
    const published2 = await h.pages.publishPage('home', published1.version);
    expect(published2.version).toBe(3);

    // 历史已发布版本应被置 published=false
    const old = await h.pages.findBySlugAndVersion('home', published1.version);
    expect(old?.published).toBe(false);

    const latest = await h.pages.getBySlug('home');
    expect(latest.version).toBe(3);
    expect(latest.published).toBe(true);
  });

  it('getBySlug 只返回已发布页面；未发布抛 PAGE_NOT_FOUND', async () => {
    await h.pages.createPage({
      slug: 'about',
      title: '关于',
      dsl: samplePageDsl(),
    });
    await expect(h.pages.getBySlug('about')).rejects.toMatchObject({
      code: 'PAGE_NOT_FOUND',
      status: 404,
    });
  });

  it('listPages 每个 slug 返回最新版本', async () => {
    const p1 = await h.pages.createPage({
      slug: 'home',
      title: '首页',
      dsl: samplePageDsl(),
    });
    await h.pages.publishPage('home', p1.version);
    await h.pages.createPage({
      slug: 'about',
      title: '关于',
      dsl: samplePageDsl(),
    });
    const list = await h.pages.listPages();
    expect(list).toHaveLength(2);
    const home = list.find((r) => r.slug === 'home');
    expect(home?.version).toBe(2);
  });
});
