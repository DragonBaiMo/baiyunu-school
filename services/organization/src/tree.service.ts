/**
 * 组织树服务：闭包表维护、子树查询、节点移动、叶子删除。
 *
 * 闭包表约定：
 * - 每个节点自身有 (id, id, 0) 一行
 * - 对每个祖先 X 有 (X, id, depthFromX) 一行
 * - depth 从根开始计，限制 ≤ ORG_MAX_DEPTH
 */

import { randomUUID } from 'node:crypto';
import { Inject, Injectable, Optional } from '@nestjs/common';
import type { DbClient } from '@bynu/db';
import { OrgError } from './errors.js';
import {
  ORG_DB,
  ORG_MAX_DEPTH,
  type CreateNodeInput,
  type OrgNodeRow,
  type OrgNodeType,
  type OrgTreeNode,
  type UpdateNodeInput,
} from './types.js';

interface NodeDbRow {
  id: string;
  parent_id: string | null;
  name: string;
  type: string;
  meta: unknown;
}

@Injectable()
export class TreeService {
  constructor(@Optional() @Inject(ORG_DB) private readonly db: DbClient) {}

  async createNode(input: CreateNodeInput): Promise<OrgNodeRow> {
    const id = randomUUID();
    const meta = input.meta ?? {};
    await this.db.query('BEGIN');
    try {
      // 深度校验：父节点的根深度 + 1 ≤ ORG_MAX_DEPTH
      if (input.parentId) {
        const parent = await this.findById(input.parentId);
        if (!parent) {
          throw new OrgError(
            'NODE_NOT_FOUND',
            `parent ${input.parentId} 不存在`,
            404,
          );
        }
        const depthRes = await this.db.query<{ max_depth: number | string }>(
          `SELECT COALESCE(MAX(depth),0) AS max_depth
           FROM organization_closure WHERE descendant = $1`,
          [input.parentId],
        );
        const parentRootDepth = Number(depthRes.rows[0]?.max_depth ?? 0);
        if (parentRootDepth + 1 > ORG_MAX_DEPTH) {
          throw new OrgError(
            'DEPTH_EXCEEDED',
            `深度超过上限 ${ORG_MAX_DEPTH}`,
            400,
          );
        }
      }
      await this.db.query(
        `INSERT INTO organization_node (id, parent_id, name, type, meta)
         VALUES ($1,$2,$3,$4,$5)`,
        [id, input.parentId, input.name, input.type, JSON.stringify(meta)],
      );
      // 自闭包
      await this.db.query(
        `INSERT INTO organization_closure (ancestor, descendant, depth)
         VALUES ($1,$1,0)`,
        [id],
      );
      // 继承父闭包 depth+1
      if (input.parentId) {
        await this.db.query(
          `INSERT INTO organization_closure (ancestor, descendant, depth)
           SELECT ancestor, $1, depth + 1
           FROM organization_closure WHERE descendant = $2`,
          [id, input.parentId],
        );
      }
      await this.db.query('COMMIT');
    } catch (err) {
      await this.db.query('ROLLBACK');
      throw err;
    }
    const row = await this.findById(id);
    if (!row) throw new OrgError('NODE_NOT_FOUND', `节点 ${id} 插入后丢失`, 500);
    return row;
  }

  async updateNode(id: string, input: UpdateNodeInput): Promise<OrgNodeRow> {
    const current = await this.findById(id);
    if (!current) {
      throw new OrgError('NODE_NOT_FOUND', `节点 ${id} 不存在`, 404);
    }
    const nextName = input.name ?? current.name;
    const nextType: OrgNodeType = input.type ?? current.type;
    const nextMeta = input.meta ?? current.meta;
    await this.db.query(
      `UPDATE organization_node SET name=$2, type=$3, meta=$4 WHERE id=$1`,
      [id, nextName, nextType, JSON.stringify(nextMeta)],
    );
    return { ...current, name: nextName, type: nextType, meta: nextMeta };
  }

  /** 重建子树闭包：更新 parent_id + 删除外部祖先关系 + 按新父插入 */
  async moveNode(nodeId: string, newParentId: string | null): Promise<void> {
    const node = await this.findById(nodeId);
    if (!node) {
      throw new OrgError('NODE_NOT_FOUND', `节点 ${nodeId} 不存在`, 404);
    }
    if (newParentId) {
      // 循环检测：newParent 不得为 node 的后代（含自身）
      const inSubtree = await this.db.query<{ c: string }>(
        `SELECT descendant AS c FROM organization_closure
         WHERE ancestor = $1 AND descendant = $2`,
        [nodeId, newParentId],
      );
      if (inSubtree.rows.length > 0) {
        throw new OrgError(
          'CIRCULAR_PARENT',
          `新父节点 ${newParentId} 位于 ${nodeId} 的子树内`,
          400,
        );
      }
      const parent = await this.findById(newParentId);
      if (!parent) {
        throw new OrgError(
          'NODE_NOT_FOUND',
          `父节点 ${newParentId} 不存在`,
          404,
        );
      }
      // 深度校验：newParent 根深度 + 1 + 当前子树深度 ≤ ORG_MAX_DEPTH
      const pRes = await this.db.query<{ max_depth: number | string }>(
        `SELECT COALESCE(MAX(depth),0) AS max_depth
         FROM organization_closure WHERE descendant = $1`,
        [newParentId],
      );
      const parentDepth = Number(pRes.rows[0]?.max_depth ?? 0);
      const sRes = await this.db.query<{ max_depth: number | string }>(
        `SELECT COALESCE(MAX(depth),0) AS max_depth
         FROM organization_closure WHERE ancestor = $1`,
        [nodeId],
      );
      const subtreeDepth = Number(sRes.rows[0]?.max_depth ?? 0);
      if (parentDepth + 1 + subtreeDepth > ORG_MAX_DEPTH) {
        throw new OrgError(
          'DEPTH_EXCEEDED',
          `移动后深度超过上限 ${ORG_MAX_DEPTH}`,
          400,
        );
      }
    }

    await this.db.query('BEGIN');
    try {
      await this.db.query(
        `UPDATE organization_node SET parent_id=$2 WHERE id=$1`,
        [nodeId, newParentId],
      );
      // 删除 "子树外祖先 → 子树内节点" 的所有旧闭包
      await this.db.query(
        `DELETE FROM organization_closure
         WHERE descendant IN (
           SELECT descendant FROM organization_closure WHERE ancestor = $1
         )
         AND ancestor NOT IN (
           SELECT descendant FROM organization_closure WHERE ancestor = $1
         )`,
        [nodeId],
      );
      // 重新按新父插入
      if (newParentId) {
        await this.db.query(
          `INSERT INTO organization_closure (ancestor, descendant, depth)
           SELECT p.ancestor, c.descendant, p.depth + c.depth + 1
           FROM organization_closure p
           CROSS JOIN organization_closure c
           WHERE p.descendant = $2 AND c.ancestor = $1`,
          [nodeId, newParentId],
        );
      }
      await this.db.query('COMMIT');
    } catch (err) {
      await this.db.query('ROLLBACK');
      throw err;
    }
  }

  async listChildren(parentId: string | null): Promise<OrgNodeRow[]> {
    const sql = parentId
      ? `SELECT id, parent_id, name, type, meta FROM organization_node WHERE parent_id = $1 ORDER BY name`
      : `SELECT id, parent_id, name, type, meta FROM organization_node WHERE parent_id IS NULL ORDER BY name`;
    const params = parentId ? [parentId] : [];
    const res = await this.db.query(sql, params);
    return (res.rows as unknown as NodeDbRow[]).map(toNodeRow);
  }

  async getSubtree(rootId: string): Promise<OrgTreeNode> {
    const root = await this.findById(rootId);
    if (!root) {
      throw new OrgError('NODE_NOT_FOUND', `节点 ${rootId} 不存在`, 404);
    }
    const res = await this.db.query(
      `SELECT n.id, n.parent_id, n.name, n.type, n.meta
       FROM organization_node n
       JOIN organization_closure c ON c.descendant = n.id
       WHERE c.ancestor = $1`,
      [rootId],
    );
    const rows = (res.rows as unknown as NodeDbRow[]).map(toNodeRow);
    const byId = new Map<string, OrgTreeNode>();
    for (const r of rows) byId.set(r.id, { ...r, children: [] });
    for (const r of rows) {
      if (r.id === rootId) continue;
      const parent = r.parentId ? byId.get(r.parentId) : undefined;
      const self = byId.get(r.id);
      if (parent && self) parent.children.push(self);
    }
    const rootNode = byId.get(rootId);
    if (!rootNode) {
      throw new OrgError('NODE_NOT_FOUND', `节点 ${rootId} 不存在`, 404);
    }
    return rootNode;
  }

  /** 获取所有祖先（含自身），按深度升序 */
  async getAncestors(nodeId: string): Promise<OrgNodeRow[]> {
    const node = await this.findById(nodeId);
    if (!node) {
      throw new OrgError('NODE_NOT_FOUND', `节点 ${nodeId} 不存在`, 404);
    }
    const res = await this.db.query(
      `SELECT n.id, n.parent_id, n.name, n.type, n.meta, c.depth
       FROM organization_node n
       JOIN organization_closure c ON c.ancestor = n.id
       WHERE c.descendant = $1
       ORDER BY c.depth DESC`,
      [nodeId],
    );
    return (res.rows as unknown as NodeDbRow[]).map(toNodeRow);
  }

  async removeNode(nodeId: string): Promise<void> {
    const node = await this.findById(nodeId);
    if (!node) {
      throw new OrgError('NODE_NOT_FOUND', `节点 ${nodeId} 不存在`, 404);
    }
    const childRes = await this.db.query<{ n: string }>(
      `SELECT COUNT(*)::text AS n FROM organization_closure
       WHERE ancestor = $1 AND depth > 0`,
      [nodeId],
    );
    if (Number(childRes.rows[0]?.n ?? 0) > 0) {
      throw new OrgError('NODE_NOT_LEAF', `节点 ${nodeId} 非叶子`, 400);
    }
    await this.db.query('BEGIN');
    try {
      await this.db.query(
        `DELETE FROM organization_closure WHERE descendant = $1 OR ancestor = $1`,
        [nodeId],
      );
      await this.db.query(`DELETE FROM organization_node WHERE id = $1`, [nodeId]);
      await this.db.query('COMMIT');
    } catch (err) {
      await this.db.query('ROLLBACK');
      throw err;
    }
  }

  async findById(id: string): Promise<OrgNodeRow | null> {
    const res = await this.db.query(
      `SELECT id, parent_id, name, type, meta FROM organization_node WHERE id = $1`,
      [id],
    );
    const row = res.rows[0] as NodeDbRow | undefined;
    return row ? toNodeRow(row) : null;
  }

  async getById(id: string): Promise<OrgNodeRow> {
    const row = await this.findById(id);
    if (!row) throw new OrgError('NODE_NOT_FOUND', `节点 ${id} 不存在`, 404);
    return row;
  }
}

function toNodeRow(row: NodeDbRow): OrgNodeRow {
  const rawMeta = row.meta;
  const meta: Record<string, unknown> =
    typeof rawMeta === 'string'
      ? (JSON.parse(rawMeta) as Record<string, unknown>)
      : ((rawMeta as Record<string, unknown>) ?? {});
  return {
    id: row.id,
    parentId: row.parent_id,
    name: row.name,
    type: row.type as OrgNodeType,
    meta,
  };
}
