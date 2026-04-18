/**
 * 页面模板服务：列出模板、应用模板到指定 slug（作为新页的初始 dsl）。
 * M1 内置 3 个模板，由 `seedBuiltinTemplates(db)` 幂等写入。
 */

import { Inject, Injectable, Optional } from '@nestjs/common';
import type { DbClient } from '@bynu/db';
import { CmsError } from './errors.js';
import { PageService } from './page.service.js';
import { PageDslSchema } from './schemas.js';
import { CMS_DB, type PageDsl, type PageRow, type TemplateRow } from './types.js';

interface TemplateDbRow {
  id: string;
  name: string;
  category: string;
  thumbnail_url: string | null;
  dsl: unknown;
  builtin: boolean;
}

export interface BuiltinTemplate {
  id: string;
  name: string;
  category: string;
  dsl: PageDsl;
}

/** M1 内置模板：首页默认 / 新闻列表 / 捐赠落地页。 */
export const BUILTIN_TEMPLATES: BuiltinTemplate[] = [
  {
    id: 'tpl-home-default',
    name: '校友门户默认首页',
    category: 'home',
    dsl: {
      blocks: [
        {
          kind: 'hero',
          title: '回到白云五校，回到精神家园',
          subtitle: '汇聚四海校友 · 共筑母校荣光',
          cta: { text: '立即入站', href: '/onboarding' },
        },
        {
          kind: 'stats',
          items: [
            { label: '注册校友', value: '28,432' },
            { label: '在办活动', value: '12' },
            { label: '累计捐赠', value: '¥1,204,580' },
          ],
        },
        {
          kind: 'news',
          category: '校园动态',
          limit: 6,
          title: '最新动态',
        },
        {
          kind: 'quickLinks',
          items: [
            { label: '校友卡', href: '/card' },
            { label: '活动报名', href: '/activities' },
            { label: '捐赠通道', href: '/donation' },
            { label: '就业双选', href: '/jobs' },
          ],
        },
      ],
    },
  },
  {
    id: 'tpl-news-list',
    name: '新闻资讯列表页',
    category: 'news',
    dsl: {
      blocks: [
        {
          kind: 'hero',
          title: '新闻资讯',
          subtitle: '校园动态 · 学院新闻 · 校友故事',
          cta: { text: '查看全部', href: '/news' },
        },
        {
          kind: 'news',
          category: '学院新闻',
          limit: 20,
          title: '学院新闻',
        },
        {
          kind: 'news',
          category: '校友故事',
          limit: 10,
          title: '校友故事',
        },
      ],
    },
  },
  {
    id: 'tpl-donation-landing',
    name: '捐赠落地页',
    category: 'donation',
    dsl: {
      blocks: [
        {
          kind: 'hero',
          title: '情怀聚善 · 实项捐建',
          subtitle: '每一笔善款都汇入数字长碑',
          cta: { text: '我要捐赠', href: '/donation/new' },
        },
        {
          kind: 'richText',
          markdown: '## 为什么捐赠\n\n- 支持母校发展\n- 帮扶困难学生\n- 共建荣光长碑',
        },
        {
          kind: 'stats',
          items: [
            { label: '累计善款', value: '¥1,204,580' },
            { label: '参与校友', value: '3,240' },
          ],
        },
      ],
    },
  },
];

/** 幂等种子：内置模板若存在则覆盖其 name/category/dsl，保证版本随代码更新。 */
export async function seedBuiltinTemplates(db: DbClient): Promise<void> {
  for (const tpl of BUILTIN_TEMPLATES) {
    // 运行时再校验一次，避免代码与 schema 漂移
    const parsed = PageDslSchema.parse(tpl.dsl);
    const existing = await db.query<{ id: string }>(
      `SELECT id FROM portal_template WHERE id = $1`,
      [tpl.id],
    );
    if (existing.rows.length === 0) {
      await db.query(
        `INSERT INTO portal_template (id, name, category, thumbnail_url, dsl, builtin)
         VALUES ($1,$2,$3,$4,$5,TRUE)`,
        [tpl.id, tpl.name, tpl.category, null, JSON.stringify(parsed)],
      );
    } else {
      await db.query(
        `UPDATE portal_template SET name=$2, category=$3, dsl=$4, builtin=TRUE WHERE id=$1`,
        [tpl.id, tpl.name, tpl.category, JSON.stringify(parsed)],
      );
    }
  }
}

@Injectable()
export class TemplateService {
  constructor(
    @Optional() @Inject(CMS_DB) private readonly db: DbClient,
    private readonly pageService: PageService,
  ) {}

  async listTemplates(): Promise<TemplateRow[]> {
    const res = await this.db.query(
      `SELECT id, name, category, thumbnail_url, dsl, builtin
       FROM portal_template
       ORDER BY builtin DESC, name ASC`,
    );
    return (res.rows as unknown as TemplateDbRow[]).map(toTemplateRow);
  }

  async findById(id: string): Promise<TemplateRow> {
    const res = await this.db.query(
      `SELECT id, name, category, thumbnail_url, dsl, builtin
       FROM portal_template WHERE id = $1`,
      [id],
    );
    const row = res.rows[0] as TemplateDbRow | undefined;
    if (!row) {
      throw new CmsError('TEMPLATE_NOT_FOUND', `template ${id} 不存在`, 404);
    }
    return toTemplateRow(row);
  }

  /**
   * 将模板 dsl 写入 slug 对应页面。若页面不存在则创建首版；若已存在则对最新版本执行 updatePage。
   * 用于管理端“一键套用模板”。
   */
  async applyTemplate(slug: string, templateId: string, title?: string): Promise<PageRow> {
    const template = await this.findById(templateId);
    const existing = await this.db.query<{ version: number }>(
      `SELECT version FROM portal_page WHERE slug = $1 ORDER BY version DESC LIMIT 1`,
      [slug],
    );
    if (existing.rows.length === 0) {
      return this.pageService.createPage({
        slug,
        title: title ?? template.name,
        dsl: template.dsl,
      });
    }
    const current = existing.rows[0];
    const version = Number(current?.version ?? 1);
    return this.pageService.updatePage(slug, {
      version,
      ...(title ? { title } : {}),
      dsl: template.dsl,
    });
  }
}

function toTemplateRow(row: TemplateDbRow): TemplateRow {
  const raw = row.dsl;
  const dsl = typeof raw === 'string' ? (JSON.parse(raw) as PageDsl) : (raw as PageDsl);
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    thumbnailUrl: row.thumbnail_url,
    dsl,
    builtin: Boolean(row.builtin),
  };
}
