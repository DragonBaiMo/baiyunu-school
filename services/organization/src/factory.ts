/**
 * 程序化工厂：跳过 Nest DI，直接拿 2 个 service 实例。
 */

import type { DbClient } from '@bynu/db';
import { BbsService } from './bbs.service.js';
import { TreeService } from './tree.service.js';

export interface OrganizationDeps {
  db: DbClient;
}

export interface OrganizationServices {
  treeService: TreeService;
  bbsService: BbsService;
}

export function createOrganizationModule(
  deps: OrganizationDeps,
): OrganizationServices {
  const treeService = new TreeService(deps.db);
  const bbsService = new BbsService(deps.db);
  return { treeService, bbsService };
}
