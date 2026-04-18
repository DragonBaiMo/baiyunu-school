/**
 * 程序化工厂：跳过 Nest DI，直接拿到领域服务实例。
 * 供单测/脚本场景使用。
 */

import type { DbClient } from '@bynu/db';
import { ActivityCoreService } from './activity.service.js';
import { DslService } from './dsl.service.js';
import { EnrollmentService } from './enrollment.service.js';
import { ActivityScreenService } from './screen.service.js';
import {
  ActivityTemplateService,
  ensureActivityStateColumns,
  ensureActivityTemplateTable,
  seedBuiltinActivityTemplates,
} from './template.service.js';

export interface ActivityDeps {
  db: DbClient;
  hmacSalt?: string;
}

export interface ActivityServices {
  dslService: DslService;
  activityService: ActivityCoreService;
  enrollmentService: EnrollmentService;
  screenService: ActivityScreenService;
  templateService: ActivityTemplateService;
}

export function createActivityModule(deps: ActivityDeps): ActivityServices {
  const dslService = new DslService();
  const activityService = new ActivityCoreService(deps.db, dslService);
  const enrollmentService = new EnrollmentService(
    deps.db,
    deps.hmacSalt ?? 'bynu-default-activity-salt',
    activityService,
    dslService,
  );
  const screenService = new ActivityScreenService(deps.db, activityService);
  const templateService = new ActivityTemplateService(deps.db);
  return {
    dslService,
    activityService,
    enrollmentService,
    screenService,
    templateService,
  };
}

export {
  ensureActivityStateColumns,
  ensureActivityTemplateTable,
  seedBuiltinActivityTemplates,
};
