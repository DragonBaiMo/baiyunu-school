/**
 * 测试夹具：内存 pglite + 迁移 + organization 服务实例。
 */

import { createDbClient, ensureMigrated, type DbClient } from '@bynu/db';
import {
  BbsService,
  TreeService,
  createOrganizationModule,
} from '../src/index.js';

export interface TestHarness {
  db: DbClient;
  tree: TreeService;
  bbs: BbsService;
  close(): Promise<void>;
}

export async function createHarness(): Promise<TestHarness> {
  const db = createDbClient('pglite:memory://');
  await ensureMigrated(db);
  const svcs = createOrganizationModule({ db });
  return {
    db,
    tree: svcs.treeService,
    bbs: svcs.bbsService,
    async close() {
      await db.close();
    },
  };
}
