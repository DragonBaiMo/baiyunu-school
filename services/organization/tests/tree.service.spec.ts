import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createHarness, type TestHarness } from './harness.js';

describe('TreeService', () => {
  let h: TestHarness;
  beforeEach(async () => {
    h = await createHarness();
  });
  afterEach(async () => {
    await h.close();
  });

  it('创建三级树，闭包深度正确，祖先链可查', async () => {
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
      name: '软工2021班',
      type: 'CLASS',
    });
    // 闭包：(school,klass,2)
    const closureRes = await h.db.query<{ depth: number | string }>(
      `SELECT depth FROM organization_closure WHERE ancestor = $1 AND descendant = $2`,
      [school.id, klass.id],
    );
    expect(Number(closureRes.rows[0]?.depth ?? -1)).toBe(2);
    const ancestors = await h.tree.getAncestors(klass.id);
    expect(ancestors.map((a) => a.id)).toEqual([
      school.id,
      college.id,
      klass.id,
    ]);
  });

  it('getSubtree 返回完整树结构', async () => {
    const school = await h.tree.createNode({
      parentId: null,
      name: 'S',
      type: 'SCHOOL',
    });
    const c1 = await h.tree.createNode({
      parentId: school.id,
      name: 'C1',
      type: 'COLLEGE',
    });
    await h.tree.createNode({
      parentId: school.id,
      name: 'C2',
      type: 'COLLEGE',
    });
    await h.tree.createNode({
      parentId: c1.id,
      name: 'D1',
      type: 'DEPARTMENT',
    });
    const subtree = await h.tree.getSubtree(school.id);
    expect(subtree.children).toHaveLength(2);
    const branch = subtree.children.find((c) => c.name === 'C1');
    expect(branch?.children).toHaveLength(1);
    expect(branch?.children[0]?.name).toBe('D1');
  });

  it('深度 > 5 拒绝：从根到第 6 级时抛 DEPTH_EXCEEDED', async () => {
    let parent: string | null = null;
    const types = ['SCHOOL', 'COLLEGE', 'DEPARTMENT', 'CLASS', 'BRANCH', 'BRANCH'] as const;
    // 允许 depth 0..5（共 6 个节点）
    for (let i = 0; i < 6; i += 1) {
      const n = await h.tree.createNode({
        parentId: parent,
        name: `n${i}`,
        type: types[i] ?? 'BRANCH',
      });
      parent = n.id;
    }
    // 第 7 个（depth=6）应被拒
    await expect(
      h.tree.createNode({ parentId: parent, name: 'n6', type: 'BRANCH' }),
    ).rejects.toMatchObject({ code: 'DEPTH_EXCEEDED' });
  });

  it('moveNode 重建闭包：移动后祖先链更新', async () => {
    const s = await h.tree.createNode({
      parentId: null,
      name: 'S',
      type: 'SCHOOL',
    });
    const c1 = await h.tree.createNode({
      parentId: s.id,
      name: 'C1',
      type: 'COLLEGE',
    });
    const c2 = await h.tree.createNode({
      parentId: s.id,
      name: 'C2',
      type: 'COLLEGE',
    });
    const d1 = await h.tree.createNode({
      parentId: c1.id,
      name: 'D1',
      type: 'DEPARTMENT',
    });
    // 把 D1 从 C1 挪到 C2
    await h.tree.moveNode(d1.id, c2.id);
    const ancestors = await h.tree.getAncestors(d1.id);
    const ids = ancestors.map((a) => a.id);
    expect(ids).toContain(c2.id);
    expect(ids).not.toContain(c1.id);
    // 旧闭包已清理
    const old = await h.db.query<{ n: string }>(
      `SELECT COUNT(*)::text AS n FROM organization_closure
       WHERE ancestor = $1 AND descendant = $2`,
      [c1.id, d1.id],
    );
    expect(Number(old.rows[0]?.n ?? 0)).toBe(0);
  });

  it('moveNode 循环检测：把父节点移动到自身子树下被拒', async () => {
    const s = await h.tree.createNode({
      parentId: null,
      name: 'S',
      type: 'SCHOOL',
    });
    const c = await h.tree.createNode({
      parentId: s.id,
      name: 'C',
      type: 'COLLEGE',
    });
    const d = await h.tree.createNode({
      parentId: c.id,
      name: 'D',
      type: 'DEPARTMENT',
    });
    await expect(h.tree.moveNode(c.id, d.id)).rejects.toMatchObject({
      code: 'CIRCULAR_PARENT',
    });
  });

  it('removeNode：非叶失败，叶子成功', async () => {
    const s = await h.tree.createNode({
      parentId: null,
      name: 'S',
      type: 'SCHOOL',
    });
    const c = await h.tree.createNode({
      parentId: s.id,
      name: 'C',
      type: 'COLLEGE',
    });
    await expect(h.tree.removeNode(s.id)).rejects.toMatchObject({
      code: 'NODE_NOT_LEAF',
    });
    await h.tree.removeNode(c.id);
    expect(await h.tree.findById(c.id)).toBeNull();
  });

  it('updateNode：修改 name/type/meta 持久化生效', async () => {
    const s = await h.tree.createNode({
      parentId: null,
      name: '白云',
      type: 'SCHOOL',
      meta: { motto: 'old' },
    });
    const updated = await h.tree.updateNode(s.id, {
      name: '白云大学',
      meta: { motto: 'new' },
    });
    expect(updated.name).toBe('白云大学');
    expect(updated.meta).toMatchObject({ motto: 'new' });
    const reload = await h.tree.getById(s.id);
    expect(reload.name).toBe('白云大学');
  });

  it('listChildren：只返回直接子节点', async () => {
    const s = await h.tree.createNode({
      parentId: null,
      name: 'S',
      type: 'SCHOOL',
    });
    const c = await h.tree.createNode({
      parentId: s.id,
      name: 'C',
      type: 'COLLEGE',
    });
    await h.tree.createNode({
      parentId: c.id,
      name: 'D',
      type: 'DEPARTMENT',
    });
    const children = await h.tree.listChildren(s.id);
    expect(children).toHaveLength(1);
    expect(children[0]?.id).toBe(c.id);
    const roots = await h.tree.listChildren(null);
    expect(roots.map((r) => r.id)).toContain(s.id);
  });
});
