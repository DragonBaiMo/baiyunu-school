import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createHarness, type TestHarness } from './harness.js';

async function seedTree(h: TestHarness) {
  const school = await h.tree.createNode({
    parentId: null,
    name: 'S',
    type: 'SCHOOL',
  });
  const college = await h.tree.createNode({
    parentId: school.id,
    name: 'C',
    type: 'COLLEGE',
  });
  const klass = await h.tree.createNode({
    parentId: college.id,
    name: 'K',
    type: 'CLASS',
  });
  return { school, college, klass };
}

describe('BbsService', () => {
  let h: TestHarness;
  beforeEach(async () => {
    h = await createHarness();
  });
  afterEach(async () => {
    await h.close();
  });

  it('createPost + listPostsByNode 仅返回直接子节点帖子', async () => {
    const { school, college } = await seedTree(h);
    const p1 = await h.bbs.createPost({
      orgNodeId: school.id,
      authorId: 'u1',
      title: 'S-post',
      contentMd: '正文',
      visibility: 'public',
    });
    await h.bbs.createPost({
      orgNodeId: college.id,
      authorId: 'u2',
      title: 'C-post',
      contentMd: '正文',
      visibility: 'public',
    });
    const result = await h.bbs.listPostsByNode(school.id, {
      includeDescendants: false,
      limit: 20,
    });
    expect(result.items).toHaveLength(1);
    expect(result.items[0]?.id).toBe(p1.id);
  });

  it('includeDescendants=true 通过闭包表扩展子节点', async () => {
    const { school, college, klass } = await seedTree(h);
    await h.bbs.createPost({
      orgNodeId: school.id,
      authorId: 'u',
      title: 'S',
      contentMd: 's',
      visibility: 'public',
    });
    await h.bbs.createPost({
      orgNodeId: college.id,
      authorId: 'u',
      title: 'C',
      contentMd: 'c',
      visibility: 'public',
    });
    await h.bbs.createPost({
      orgNodeId: klass.id,
      authorId: 'u',
      title: 'K',
      contentMd: 'k',
      visibility: 'public',
    });
    const result = await h.bbs.listPostsByNode(school.id, {
      includeDescendants: true,
      limit: 20,
    });
    expect(result.items).toHaveLength(3);
  });

  it('pin 后排序置顶：pinned 在前', async () => {
    const { school } = await seedTree(h);
    const a = await h.bbs.createPost({
      orgNodeId: school.id,
      authorId: 'u',
      title: 'A',
      contentMd: 'a',
      visibility: 'public',
    });
    // 稍作延时以确保 created_at 严格递增
    await new Promise((r) => setTimeout(r, 10));
    await h.bbs.createPost({
      orgNodeId: school.id,
      authorId: 'u',
      title: 'B',
      contentMd: 'b',
      visibility: 'public',
    });
    await h.bbs.pinPost(a.id);
    const result = await h.bbs.listPostsByNode(school.id, {
      includeDescendants: false,
      limit: 20,
    });
    expect(result.items[0]?.id).toBe(a.id);
    expect(result.items[0]?.pinned).toBe(true);
  });

  it('分页 cursor：按 limit 翻页', async () => {
    const { school } = await seedTree(h);
    for (let i = 0; i < 5; i += 1) {
      await h.bbs.createPost({
        orgNodeId: school.id,
        authorId: 'u',
        title: `T${i}`,
        contentMd: 'c',
        visibility: 'public',
      });
      await new Promise((r) => setTimeout(r, 2));
    }
    const page1 = await h.bbs.listPostsByNode(school.id, {
      includeDescendants: false,
      limit: 2,
    });
    expect(page1.items).toHaveLength(2);
    expect(page1.nextCursor).toBeTruthy();
    const page2 = await h.bbs.listPostsByNode(school.id, {
      includeDescendants: false,
      limit: 2,
      cursor: page1.nextCursor!,
    });
    expect(page2.items).toHaveLength(2);
    const overlap = page1.items
      .map((i) => i.id)
      .filter((id) => page2.items.some((p) => p.id === id));
    expect(overlap).toHaveLength(0);
  });

  it('deletePost：作者可删、其他普通用户不行、admin 可删', async () => {
    const { school } = await seedTree(h);
    const p = await h.bbs.createPost({
      orgNodeId: school.id,
      authorId: 'author-1',
      title: 'x',
      contentMd: 'x',
      visibility: 'public',
    });
    await expect(
      h.bbs.deletePost(p.id, { userId: 'other', roles: ['alumni'] }),
    ).rejects.toMatchObject({ code: 'NOT_MEMBER' });
    // admin 可删
    const p2 = await h.bbs.createPost({
      orgNodeId: school.id,
      authorId: 'author-1',
      title: 'y',
      contentMd: 'y',
      visibility: 'public',
    });
    await h.bbs.deletePost(p2.id, { userId: 'someone', roles: ['admin'] });
    await expect(h.bbs.getById(p2.id)).rejects.toMatchObject({
      code: 'POST_NOT_FOUND',
    });
    // 作者可删
    await h.bbs.deletePost(p.id, { userId: 'author-1', roles: [] });
    await expect(h.bbs.getById(p.id)).rejects.toMatchObject({
      code: 'POST_NOT_FOUND',
    });
  });
});
