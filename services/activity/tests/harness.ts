/**
 * 测试夹具：内存 pglite + 迁移 + activity 服务实例 + 默认模板表。
 */

import { createDbClient, ensureMigrated, type DbClient } from '@bynu/db';
import {
  ActivityCoreService,
  ActivityScreenService,
  ActivityTemplateService,
  DslService,
  EnrollmentService,
  createActivityModule,
  ensureActivityStateColumns,
  ensureActivityTemplateTable,
  seedBuiltinActivityTemplates,
} from '../src/index.js';

export const TEST_HMAC_SALT = 'test-activity-salt';

export interface TestHarness {
  db: DbClient;
  dsl: DslService;
  activities: ActivityCoreService;
  enrollments: EnrollmentService;
  screen: ActivityScreenService;
  templates: ActivityTemplateService;
  close(): Promise<void>;
}

export async function createHarness(): Promise<TestHarness> {
  const db = createDbClient('pglite:memory://');
  await ensureMigrated(db);
  await ensureActivityStateColumns(db);
  await ensureActivityTemplateTable(db);
  await seedBuiltinActivityTemplates(db);
  const svcs = createActivityModule({ db, hmacSalt: TEST_HMAC_SALT });
  return {
    db,
    dsl: svcs.dslService,
    activities: svcs.activityService,
    enrollments: svcs.enrollmentService,
    screen: svcs.screenService,
    templates: svcs.templateService,
    async close() {
      await db.close();
    },
  };
}

/** 一个最小的合法 DSL，用于大量测试复用。 */
export const SAMPLE_DSL = {
  steps: [
    {
      id: 'step-register',
      type: 'form' as const,
      title: '填报',
      config: { fields: ['realName'] },
    },
  ],
  formFields: [
    {
      name: 'realName',
      label: '姓名',
      type: 'text' as const,
      required: true,
      minLength: 2,
      maxLength: 20,
    },
  ],
};

export function futureStart(minutesAhead = 60): string {
  return new Date(Date.now() + minutesAhead * 60_000).toISOString();
}

export function futureEnd(hoursAhead = 4): string {
  return new Date(Date.now() + hoursAhead * 3600_000).toISOString();
}
