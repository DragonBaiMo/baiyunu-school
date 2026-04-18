/**
 * 程序化工厂：跳过 Nest DI，直接拿到 3 个 service 实例。
 * 供单测/脚本场景使用。
 */

import type { DbClient } from '@bynu/db';
import { NewsService } from './news.service.js';
import { PageService } from './page.service.js';
import { TemplateService } from './template.service.js';

export interface PortalCmsDeps {
  db: DbClient;
}

export interface PortalCmsServices {
  pageService: PageService;
  templateService: TemplateService;
  newsService: NewsService;
}

export function createPortalCmsModule(deps: PortalCmsDeps): PortalCmsServices {
  const pageService = new PageService(deps.db);
  const templateService = new TemplateService(deps.db, pageService);
  const newsService = new NewsService(deps.db);
  return { pageService, templateService, newsService };
}
