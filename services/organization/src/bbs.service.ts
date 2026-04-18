/**
 * BBS 帖子服务：基于 post 表。与 news（visibility='news'）区分：
 * 使用 visibility='public' 或 'members' 表示普通帖子。
 */

import { randomUUID } from 'node:crypto';
import { Inject, Injectable, Optional } from '@nestjs/common';
import type { DbClient } from '@bynu/db';
import { OrgError } from './errors.js';
import {
  ORG_DB,
  type CreatePostInput,
  type ListPostsQuery,
  type ListPostsResult,
  type OrgPostRow,
  type OrgPostVisibility,
} from './types.js';

interface PostDbRow {
  id: string;
  org_node_id: string;
  author_id: string;
  title: string;
  content_md: string;
  pinned: boolean;
  visibility: string;
  created_at: string | Date;
  updated_at: string | Date;
}

@Injectable()
export class BbsService {
  constructor(@Optional() @Inject(ORG_DB) private readonly db: DbClient) {}

  async createPost(input: CreatePostInput): Promise<OrgPostRow> {
    const id = randomUUID();
    await this.db.query(
      `INSERT INTO post
       (id, org_node_id, author_id, title, content_md, pinned, visibility, meta, published)
       VALUES ($1,$2,$3,$4,$5,FALSE,$6,'{}',TRUE)`,
      [
        id,
        input.orgNodeId,
        input.authorId,
        input.title,
        input.contentMd,
        input.visibility,
      ],
    );
    return this.getById(id);
  }

  async getById(id: string): Promise<OrgPostRow> {
    const res = await this.db.query(
      `SELECT id, org_node_id, author_id, title, content_md, pinned, visibility,
              created_at, updated_at
       FROM post WHERE id = $1 AND visibility IN ('public','members')`,
      [id],
    );
    const row = res.rows[0] as PostDbRow | undefined;
    if (!row) throw new OrgError('POST_NOT_FOUND', `帖子 ${id} 不存在`, 404);
    return toPostRow(row);
  }

  async listPostsByNode(
    orgNodeId: string,
    query: Omit<ListPostsQuery, 'orgNodeId'>,
  ): Promise<ListPostsResult> {
    const limit = Math.min(100, Math.max(1, query.limit));
    const params: unknown[] = [];
    let nodeFilter: string;
    if (query.includeDescendants) {
      params.push(orgNodeId);
      nodeFilter = `p.org_node_id IN (
        SELECT descendant FROM organization_closure WHERE ancestor = $${params.length}
      )`;
    } else {
      params.push(orgNodeId);
      nodeFilter = `p.org_node_id = $${params.length}`;
    }
    const clauses: string[] = [nodeFilter, `p.visibility IN ('public','members')`];
    if (typeof query.pinned === 'boolean') {
      params.push(query.pinned);
      clauses.push(`p.pinned = $${params.length}`);
    }
    if (query.cursor) {
      const parsed = parseCursor(query.cursor);
      if (parsed) {
        params.push(parsed.createdAt.toISOString());
        params.push(parsed.id);
        const ts = params.length - 1;
        const idx = params.length;
        // 按 (pinned desc, created_at desc, id desc) 排序的游标
        clauses.push(
          `(p.created_at, p.id) < ($${ts}::timestamptz, $${idx})`,
        );
      }
    }
    params.push(limit + 1);
    const limitIdx = params.length;
    const res = await this.db.query(
      `SELECT p.id, p.org_node_id, p.author_id, p.title, p.content_md, p.pinned,
              p.visibility, p.created_at, p.updated_at
       FROM post p
       WHERE ${clauses.join(' AND ')}
       ORDER BY p.pinned DESC, p.created_at DESC, p.id DESC
       LIMIT $${limitIdx}`,
      params,
    );
    const rows = (res.rows as unknown as PostDbRow[]).map(toPostRow);
    let nextCursor: string | null = null;
    if (rows.length > limit) {
      const extra = rows.pop();
      if (extra) nextCursor = encodeCursor(extra.createdAt, extra.id);
    }
    return { items: rows, nextCursor };
  }

  async pinPost(id: string): Promise<OrgPostRow> {
    await this.getById(id);
    await this.db.query(
      `UPDATE post SET pinned = TRUE, updated_at = NOW()
       WHERE id = $1 AND visibility IN ('public','members')`,
      [id],
    );
    return this.getById(id);
  }

  async unpinPost(id: string): Promise<OrgPostRow> {
    await this.getById(id);
    await this.db.query(
      `UPDATE post SET pinned = FALSE, updated_at = NOW()
       WHERE id = $1 AND visibility IN ('public','members')`,
      [id],
    );
    return this.getById(id);
  }

  async deletePost(
    id: string,
    actor: { userId: string; roles: string[] },
  ): Promise<void> {
    const post = await this.getById(id);
    const isAuthor = post.authorId === actor.userId;
    const isAdmin = actor.roles.some((r) =>
      ['admin', 'org_manager'].includes(r),
    );
    if (!isAuthor && !isAdmin) {
      throw new OrgError(
        'NOT_MEMBER',
        `仅作者或管理员可删除帖子`,
        403,
      );
    }
    await this.db.query(
      `DELETE FROM post WHERE id = $1 AND visibility IN ('public','members')`,
      [id],
    );
  }
}

function toPostRow(row: PostDbRow): OrgPostRow {
  return {
    id: row.id,
    orgNodeId: row.org_node_id,
    authorId: row.author_id,
    title: row.title,
    contentMd: row.content_md,
    pinned: Boolean(row.pinned),
    visibility: row.visibility as OrgPostVisibility,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

function encodeCursor(createdAt: Date, id: string): string {
  return Buffer.from(`${createdAt.toISOString()}|${id}`).toString('base64url');
}

function parseCursor(cursor: string): { createdAt: Date; id: string } | null {
  try {
    const s = Buffer.from(cursor, 'base64url').toString('utf8');
    const idx = s.lastIndexOf('|');
    if (idx < 0) return null;
    const iso = s.slice(0, idx);
    const id = s.slice(idx + 1);
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return null;
    return { createdAt: d, id };
  } catch {
    return null;
  }
}
