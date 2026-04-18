/**
 * 新闻服务：基于 post 表存储。
 * 约定：
 * - visibility='news' 用于与普通 post 区分
 * - meta.category / meta.coverUrl 为新闻扩展字段
 * - 公开列表仅返回 published=true
 */

import { randomUUID } from 'node:crypto';
import { Inject, Injectable, Optional } from '@nestjs/common';
import type { DbClient } from '@bynu/db';
import { CmsError } from './errors.js';
import {
  CMS_DB,
  type CreateNewsInput,
  type NewsCategory,
  type NewsListQuery,
  type NewsListResult,
  type NewsRow,
  type UpdateNewsInput,
} from './types.js';

interface NewsDbRow {
  id: string;
  org_node_id: string;
  author_id: string;
  title: string;
  content_md: string;
  pinned: boolean;
  meta: unknown;
  published: boolean;
  published_at: string | Date | null;
  created_at: string | Date;
  updated_at: string | Date;
}

interface NewsMeta {
  category: NewsCategory;
  coverUrl?: string;
}

@Injectable()
export class NewsService {
  constructor(@Optional() @Inject(CMS_DB) private readonly db: DbClient) {}

  async create(input: CreateNewsInput): Promise<NewsRow> {
    const id = randomUUID();
    const meta: NewsMeta = input.coverUrl
      ? { category: input.category, coverUrl: input.coverUrl }
      : { category: input.category };
    await this.db.query(
      `INSERT INTO post
       (id, org_node_id, author_id, title, content_md, pinned, visibility, meta, published)
       VALUES ($1,$2,$3,$4,$5,$6,'news',$7,FALSE)`,
      [
        id,
        input.orgNodeId,
        input.authorId,
        input.title,
        input.contentMd,
        input.pinned ?? false,
        JSON.stringify(meta),
      ],
    );
    return this.getById(id);
  }

  async update(id: string, input: UpdateNewsInput): Promise<NewsRow> {
    const current = await this.getById(id);
    const currentMeta: NewsMeta = {
      category: current.category,
      ...(current.coverUrl ? { coverUrl: current.coverUrl } : {}),
    };
    const nextCategory: NewsCategory = input.category ?? currentMeta.category;
    const nextCover = input.coverUrl ?? currentMeta.coverUrl;
    const nextMeta: NewsMeta = nextCover
      ? { category: nextCategory, coverUrl: nextCover }
      : { category: nextCategory };
    await this.db.query(
      `UPDATE post SET
         title = COALESCE($2, title),
         content_md = COALESCE($3, content_md),
         pinned = COALESCE($4, pinned),
         meta = $5,
         updated_at = NOW()
       WHERE id = $1 AND visibility = 'news'`,
      [
        id,
        input.title ?? null,
        input.contentMd ?? null,
        input.pinned ?? null,
        JSON.stringify(nextMeta),
      ],
    );
    return this.getById(id);
  }

  /** 发布：事务内置 published=true + published_at=NOW(). */
  async publish(id: string): Promise<NewsRow> {
    await this.db.query('BEGIN');
    try {
      const res = await this.db.query<{ id: string }>(
        `SELECT id FROM post WHERE id = $1 AND visibility = 'news'`,
        [id],
      );
      if (res.rows.length === 0) {
        throw new CmsError('NEWS_NOT_FOUND', `news ${id} 不存在`, 404);
      }
      await this.db.query(
        `UPDATE post SET published = TRUE, published_at = NOW(), updated_at = NOW()
         WHERE id = $1`,
        [id],
      );
      await this.db.query('COMMIT');
      return this.getById(id);
    } catch (err) {
      await this.db.query('ROLLBACK');
      throw err;
    }
  }

  async remove(id: string): Promise<void> {
    // 先校验存在性：pglite DELETE 无 RETURNING 时 rowCount=0，无法据此判断
    await this.getById(id);
    await this.db.query(
      `DELETE FROM post WHERE id = $1 AND visibility = 'news'`,
      [id],
    );
  }

  async getById(id: string): Promise<NewsRow> {
    const res = await this.db.query(
      `SELECT id, org_node_id, author_id, title, content_md, pinned, meta,
              published, published_at, created_at, updated_at
       FROM post WHERE id = $1 AND visibility = 'news'`,
      [id],
    );
    const row = res.rows[0] as NewsDbRow | undefined;
    if (!row) {
      throw new CmsError('NEWS_NOT_FOUND', `news ${id} 不存在`, 404);
    }
    return toNewsRow(row);
  }

  /** 公开列表：仅 published=true，按 pinned desc, published_at desc 排序。 */
  async listPublished(query: NewsListQuery): Promise<NewsListResult> {
    return this.listInternal(query, { publishedOnly: true });
  }

  /** 管理列表：包含草稿与已发布。 */
  async listAll(query: NewsListQuery): Promise<NewsListResult> {
    return this.listInternal(query, { publishedOnly: false });
  }

  private async listInternal(
    query: NewsListQuery,
    opts: { publishedOnly: boolean },
  ): Promise<NewsListResult> {
    const page = Math.max(1, query.page);
    const pageSize = Math.min(100, Math.max(1, query.pageSize));
    const clauses: string[] = [`visibility = 'news'`];
    const params: unknown[] = [];
    if (opts.publishedOnly) {
      clauses.push(`published = TRUE`);
    }
    if (query.category) {
      params.push(query.category);
      clauses.push(`meta->>'category' = $${params.length}`);
    }
    const where = `WHERE ${clauses.join(' AND ')}`;
    const totalRes = await this.db.query<{ n: string }>(
      `SELECT COUNT(*)::text AS n FROM post ${where}`,
      params,
    );
    const total = Number(totalRes.rows[0]?.n ?? '0');
    params.push(pageSize);
    params.push((page - 1) * pageSize);
    const listRes = await this.db.query(
      `SELECT id, org_node_id, author_id, title, content_md, pinned, meta,
              published, published_at, created_at, updated_at
       FROM post ${where}
       ORDER BY pinned DESC, COALESCE(published_at, created_at) DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params,
    );
    return {
      items: (listRes.rows as unknown as NewsDbRow[]).map(toNewsRow),
      total,
      page,
      pageSize,
    };
  }
}

function toNewsRow(row: NewsDbRow): NewsRow {
  const rawMeta = row.meta;
  const meta: NewsMeta =
    typeof rawMeta === 'string' ? (JSON.parse(rawMeta) as NewsMeta) : (rawMeta as NewsMeta);
  return {
    id: row.id,
    orgNodeId: row.org_node_id,
    authorId: row.author_id,
    title: row.title,
    contentMd: row.content_md,
    pinned: Boolean(row.pinned),
    category: meta.category,
    coverUrl: meta.coverUrl ?? null,
    published: Boolean(row.published),
    publishedAt: row.published_at ? new Date(row.published_at) : null,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}
