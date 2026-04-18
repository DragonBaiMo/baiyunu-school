import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createHarness, type TestHarness } from './harness.js';

describe('portal-cms integration', () => {
  let h: TestHarness;
  beforeEach(async () => {
    h = await createHarness();
  });
  afterEach(async () => {
    await h.close();
  });

  it('完整流程：建页 -> 套模板 -> 发布 -> 公开 slug 命中', async () => {
    // 1. 套模板创建首页（内部已落 portal_page v1）
    const applied = await h.templates.applyTemplate(
      'home',
      'tpl-home-default',
      '校友首页',
    );
    expect(applied.version).toBe(1);
    expect(applied.published).toBe(false);

    // 2. 发布
    const published = await h.pages.publishPage('home', applied.version);
    expect(published.published).toBe(true);
    expect(published.version).toBe(2);

    // 3. 公开端取到的是已发布最新版
    const pub = await h.pages.getBySlug('home');
    expect(pub.version).toBe(2);
    expect(pub.published).toBe(true);
    expect(pub.dsl.blocks.some((b) => b.kind === 'hero')).toBe(true);

    // 4. news 发布 + 公开列表联动
    const news = await h.news.create({
      orgNodeId: 'org-root',
      authorId: 'u1',
      title: '母校百年庆典',
      contentMd: '## 内容',
      category: '校园动态',
    });
    await h.news.publish(news.id);
    const list = await h.news.listPublished({
      category: '校园动态',
      page: 1,
      pageSize: 5,
    });
    expect(list.total).toBe(1);
    expect(list.items[0]?.title).toBe('母校百年庆典');
  });
});
