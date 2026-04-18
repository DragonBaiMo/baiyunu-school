import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createHarness, type TestHarness } from './harness.js';

describe('organization integration', () => {
  let h: TestHarness;
  beforeEach(async () => {
    h = await createHarness();
  });
  afterEach(async () => {
    await h.close();
  });

  it('建校 -> 建院 -> 建班 -> 校级发帖，子级 includeDescendants=true 可见', async () => {
    const school = await h.tree.createNode({
      parentId: null,
      name: '白云大学',
      type: 'SCHOOL',
    });
    const college = await h.tree.createNode({
      parentId: school.id,
      name: '计算机学院',
      type: 'COLLEGE',
    });
    const klass = await h.tree.createNode({
      parentId: college.id,
      name: '软工21班',
      type: 'CLASS',
    });
    const post = await h.bbs.createPost({
      orgNodeId: school.id,
      authorId: 'admin-1',
      title: '校级公告',
      contentMd: '欢迎返校',
      visibility: 'public',
    });
    const fromKlass = await h.bbs.listPostsByNode(klass.id, {
      includeDescendants: false,
      limit: 10,
    });
    expect(fromKlass.items).toHaveLength(0);
    // 从学校级 includeDescendants 列出所有
    const fromSchool = await h.bbs.listPostsByNode(school.id, {
      includeDescendants: true,
      limit: 10,
    });
    expect(fromSchool.items.map((i) => i.id)).toContain(post.id);
    // 子树包含三级
    const subtree = await h.tree.getSubtree(school.id);
    expect(subtree.children[0]?.children[0]?.id).toBe(klass.id);
  });
});
