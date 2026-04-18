import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createHarness, type TestHarness } from './harness.js';

const baseInput = {
  orgNodeId: 'org-root',
  authorId: 'user-1',
  contentMd: '# 内容',
};

describe('NewsService', () => {
  let h: TestHarness;
  beforeEach(async () => {
    h = await createHarness();
  });
  afterEach(async () => {
    await h.close();
  });

  it('create 初始未发布，getById 可见', async () => {
    const n = await h.news.create({
      ...baseInput,
      title: '开学典礼',
      category: '校园动态',
    });
    expect(n.published).toBe(false);
    expect(n.category).toBe('校园动态');
    const got = await h.news.getById(n.id);
    expect(got.id).toBe(n.id);
  });

  it('publish 后进入公开列表，未发布的不在公开列表', async () => {
    const a = await h.news.create({
      ...baseInput,
      title: '公告 A',
      category: '公告',
    });
    await h.news.create({
      ...baseInput,
      title: '公告 B 草稿',
      category: '公告',
    });
    await h.news.publish(a.id);
    const publicList = await h.news.listPublished({ page: 1, pageSize: 10 });
    expect(publicList.total).toBe(1);
    expect(publicList.items[0]?.title).toBe('公告 A');
    const adminList = await h.news.listAll({ page: 1, pageSize: 10 });
    expect(adminList.total).toBe(2);
  });

  it('分类过滤只返回匹配分类', async () => {
    const categories = ['校园动态', '学院新闻', '校友故事', '公告'] as const;
    for (const c of categories) {
      const row = await h.news.create({
        ...baseInput,
        title: `${c} 新闻`,
        category: c,
      });
      await h.news.publish(row.id);
    }
    const only = await h.news.listPublished({
      category: '校友故事',
      page: 1,
      pageSize: 50,
    });
    expect(only.total).toBe(1);
    expect(only.items[0]?.category).toBe('校友故事');
  });

  it('分页：pageSize=2 返回 2 条', async () => {
    for (let i = 0; i < 5; i += 1) {
      const row = await h.news.create({
        ...baseInput,
        title: `N${i}`,
        category: '校园动态',
      });
      await h.news.publish(row.id);
    }
    const p1 = await h.news.listPublished({ page: 1, pageSize: 2 });
    expect(p1.items).toHaveLength(2);
    expect(p1.total).toBe(5);
    const p3 = await h.news.listPublished({ page: 3, pageSize: 2 });
    expect(p3.items).toHaveLength(1);
  });

  it('update 可改分类；remove 后 getById 抛 NEWS_NOT_FOUND', async () => {
    const n = await h.news.create({
      ...baseInput,
      title: '草稿',
      category: '校园动态',
    });
    const updated = await h.news.update(n.id, { category: '学院新闻' });
    expect(updated.category).toBe('学院新闻');
    await h.news.remove(n.id);
    await expect(h.news.getById(n.id)).rejects.toMatchObject({
      code: 'NEWS_NOT_FOUND',
    });
  });
});
