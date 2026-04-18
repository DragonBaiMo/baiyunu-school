/**
 * 测试夹具：内存 pglite + 迁移 + portal-cms 服务实例 + 内置模板种子。
 */

import { createDbClient, ensureMigrated, type DbClient } from '@bynu/db';
import {
  NewsService,
  PageService,
  TemplateService,
  createPortalCmsModule,
  seedBuiltinTemplates,
} from '../src/index.js';

export interface TestHarness {
  db: DbClient;
  pages: PageService;
  templates: TemplateService;
  news: NewsService;
  close(): Promise<void>;
}

export async function createHarness(): Promise<TestHarness> {
  const db = createDbClient('pglite:memory://');
  await ensureMigrated(db);
  const svcs = createPortalCmsModule({ db });
  await seedBuiltinTemplates(db);
  return {
    db,
    pages: svcs.pageService,
    templates: svcs.templateService,
    news: svcs.newsService,
    async close() {
      await db.close();
    },
  };
}

export function samplePageDsl() {
  return {
    blocks: [
      {
        kind: 'hero' as const,
        title: '欢迎回到母校',
        subtitle: '校友之家欢迎您',
        cta: { text: '进入', href: '/home' },
      },
    ],
  };
}
