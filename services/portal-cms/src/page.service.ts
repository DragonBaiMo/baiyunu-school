/**
 * 页面服务：页面 DSL 的创建、更新、发布、查询。
 *
 * 版本策略：
 * - create：首版 version=1、published=false。
 * - update：必须带当前版本号；命中后写回同一 (slug, version) 行（字段级覆盖）。
 * - publish：事务中读取指定版本、生成新版本号（现有最大 +1）、插入新行并置 published=true。
 *   同一 slug 的历史版本 published 保持 false，确保 getBySlug 命中当前最新已发布版本。
 */

import { randomUUID } from 'node:crypto';
import { Inject, Injectable, Optional } from '@nestjs/common';
import type { DbClient } from '@bynu/db';
import { CmsError } from './errors.js';
import { CMS_DB, type CreatePageInput, type PageDsl, type PageRow, type UpdatePageInput } from './types.js';

interface PageDbRow {
  id: string;
  slug: string;
  title: string;
  dsl: unknown;
  version: number;
  published: boolean;
  published_at: string | Date | null;
}

@Injectable()
export class PageService {
  constructor(@Optional() @Inject(CMS_DB) private readonly db: DbClient) {}

  /**
   * 创建页面首版。slug 唯一；若已存在则抛 PAGE_SLUG_DUP。
   */
  async createPage(input: CreatePageInput): Promise<PageRow> {
    const exists = await this.db.query<{ id: string }>(
      `SELECT id FROM portal_page WHERE slug = $1 LIMIT 1`,
      [input.slug],
    );
    if (exists.rows.length > 0) {
      throw new CmsError('PAGE_SLUG_DUP', `slug ${input.slug} 已存在`, 409);
    }
    const id = randomUUID();
    await this.db.query(
      `INSERT INTO portal_page (id, slug, title, dsl, version, published)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [id, input.slug, input.title, JSON.stringify(input.dsl), 1, false],
    );
    return {
      id,
      slug: input.slug,
      title: input.title,
      dsl: input.dsl,
      version: 1,
      published: false,
      publishedAt: null,
    };
  }

  /**
   * 更新页面：乐观锁。需传当前 version，命中后字段覆盖（title/dsl 可选）。
   * 版本号不变；若要生成新版本号请调用 publishPage。
   */
  async updatePage(slug: string, input: UpdatePageInput): Promise<PageRow> {
    const current = await this.findBySlugAndVersion(slug, input.version);
    if (!current) {
      throw new CmsError(
        'PAGE_VERSION_CONFLICT',
        `page ${slug} 版本 ${input.version} 不存在或已被其他人更新`,
        409,
      );
    }
    const nextTitle = input.title ?? current.title;
    const nextDsl = input.dsl ?? current.dsl;
    await this.db.query(
      `UPDATE portal_page SET title = $1, dsl = $2 WHERE id = $3`,
      [nextTitle, JSON.stringify(nextDsl), current.id],
    );
    return { ...current, title: nextTitle, dsl: nextDsl };
  }

  /**
   * 发布：以给定 version 为基线生成新版本（maxVersion+1）并置 published=true。
   * 同一 slug 历史已发布版本会被置 published=false，保证 getBySlug 唯一命中。
   */
  async publishPage(slug: string, baseVersion: number): Promise<PageRow> {
    await this.db.query('BEGIN');
    try {
      const base = await this.findBySlugAndVersion(slug, baseVersion);
      if (!base) {
        throw new CmsError(
          'PAGE_VERSION_CONFLICT',
          `page ${slug} 版本 ${baseVersion} 不存在`,
          409,
        );
      }
      const maxRes = await this.db.query<{ max_version: number | string | null }>(
        `SELECT COALESCE(MAX(version), 0) AS max_version FROM portal_page WHERE slug = $1`,
        [slug],
      );
      const nextVersion = Number(maxRes.rows[0]?.max_version ?? 0) + 1;
      await this.db.query(
        `UPDATE portal_page SET published = FALSE WHERE slug = $1 AND published = TRUE`,
        [slug],
      );
      const id = randomUUID();
      await this.db.query(
        `INSERT INTO portal_page (id, slug, title, dsl, version, published, published_at)
         VALUES ($1,$2,$3,$4,$5,TRUE,NOW())`,
        [id, slug, base.title, JSON.stringify(base.dsl), nextVersion],
      );
      await this.db.query('COMMIT');
      return {
        id,
        slug,
        title: base.title,
        dsl: base.dsl,
        version: nextVersion,
        published: true,
        publishedAt: new Date(),
      };
    } catch (err) {
      await this.db.query('ROLLBACK');
      throw err;
    }
  }

  /**
   * 公开读取：只返回 published=true 的最新版本。
   */
  async getBySlug(slug: string): Promise<PageRow> {
    const res = await this.db.query(
      `SELECT id, slug, title, dsl, version, published, published_at
       FROM portal_page
       WHERE slug = $1 AND published = TRUE
       ORDER BY version DESC
       LIMIT 1`,
      [slug],
    );
    const row = res.rows[0] as PageDbRow | undefined;
    if (!row) {
      throw new CmsError('PAGE_NOT_FOUND', `page ${slug} 未发布或不存在`, 404);
    }
    return toPageRow(row);
  }

  /**
   * 管理列表：按 slug 分组取最新版本。
   */
  async listPages(): Promise<PageRow[]> {
    const res = await this.db.query(
      `SELECT DISTINCT ON (slug) id, slug, title, dsl, version, published, published_at
       FROM portal_page
       ORDER BY slug, version DESC`,
    );
    return (res.rows as unknown as PageDbRow[]).map(toPageRow);
  }

  /** 管理获取：按 (slug, version)。 */
  async findBySlugAndVersion(slug: string, version: number): Promise<PageRow | null> {
    const res = await this.db.query(
      `SELECT id, slug, title, dsl, version, published, published_at
       FROM portal_page WHERE slug = $1 AND version = $2`,
      [slug, version],
    );
    const row = res.rows[0] as PageDbRow | undefined;
    return row ? toPageRow(row) : null;
  }
}

function toPageRow(row: PageDbRow): PageRow {
  const rawDsl = row.dsl;
  const dsl = typeof rawDsl === 'string' ? (JSON.parse(rawDsl) as PageDsl) : (rawDsl as PageDsl);
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    dsl,
    version: Number(row.version),
    published: Boolean(row.published),
    publishedAt: row.published_at ? new Date(row.published_at) : null,
  };
}
