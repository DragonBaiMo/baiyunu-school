/**
 * portal-cms 领域共享类型 + DI token。
 */

import type { DbClient } from '@bynu/db';
import type { z } from 'zod';
import type {
  CreateNewsSchema,
  CreatePageSchema,
  NewsListQuerySchema,
  PageDslSchema,
  UpdateNewsSchema,
  UpdatePageSchema,
} from './schemas.js';

export const CMS_DB = Symbol.for('bynu.portal-cms.db');

export type PageDsl = z.infer<typeof PageDslSchema>;
export type CreatePageInput = z.infer<typeof CreatePageSchema>;
export type UpdatePageInput = z.infer<typeof UpdatePageSchema>;
export type CreateNewsInput = z.infer<typeof CreateNewsSchema>;
export type UpdateNewsInput = z.infer<typeof UpdateNewsSchema>;
export type NewsListQuery = z.infer<typeof NewsListQuerySchema>;

export type NewsCategory = '校园动态' | '学院新闻' | '校友故事' | '公告';

export interface PageRow {
  id: string;
  slug: string;
  title: string;
  dsl: PageDsl;
  version: number;
  published: boolean;
  publishedAt: Date | null;
}

export interface TemplateRow {
  id: string;
  name: string;
  category: string;
  thumbnailUrl: string | null;
  dsl: PageDsl;
  builtin: boolean;
}

export interface NewsRow {
  id: string;
  orgNodeId: string;
  authorId: string;
  title: string;
  contentMd: string;
  pinned: boolean;
  category: NewsCategory;
  coverUrl: string | null;
  published: boolean;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface NewsListResult {
  items: NewsRow[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CmsRuntimeDeps {
  db: DbClient;
}
