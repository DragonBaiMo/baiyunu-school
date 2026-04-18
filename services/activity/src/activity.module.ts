/**
 * activity Nest 装配。
 * - forRoot({ db, hmacSalt })：显式注入（测试/工厂）
 * - register()：默认从 getDbSingleton() 取 db、从环境变量取 salt
 * 启动时：ensureMigrated + ensureActivityStateColumns + ensureActivityTemplateTable +
 * seedBuiltinActivityTemplates。
 *
 * 兼容既有骨架：继续导出 ActivityService / ActivityController（ping 路由）。
 */

import {
  Controller,
  Get,
  Inject,
  Injectable,
  Module,
  OnModuleInit,
  type DynamicModule,
  type Provider,
} from '@nestjs/common';
import { ensureMigrated, getDbSingleton, type DbClient } from '@bynu/db';
import { ActivityCoreService } from './activity.service.js';
import {
  AdminActivityController,
  AlumniActivityController,
  PublicActivityController,
} from './activity.controller.js';
import { DslService } from './dsl.service.js';
import { EnrollmentService } from './enrollment.service.js';
import { ActivityRolesGuard } from './roles.guard.js';
import { ActivityScreenService } from './screen.service.js';
import {
  ActivityTemplateService,
  ensureActivityStateColumns,
  ensureActivityTemplateTable,
  seedBuiltinActivityTemplates,
} from './template.service.js';
import { ACT_DB, ACT_HMAC_SALT } from './types.js';

/** 保留 ping service，server modules.test.ts 仍在引用。 */
@Injectable()
export class ActivityService {
  readonly moduleName = 'activity';
  ping(): string {
    return 'activity-service ready';
  }
}

@Controller('internal/activity')
export class ActivityController {
  constructor(private readonly svc: ActivityService) {}

  @Get('ping')
  ping(): { module: string; message: string } {
    return { module: this.svc.moduleName, message: this.svc.ping() };
  }
}

@Injectable()
export class ActivityBootstrap implements OnModuleInit {
  constructor(@Inject(ACT_DB) private readonly db: DbClient) {}

  async onModuleInit(): Promise<void> {
    await ensureMigrated(this.db);
    await ensureActivityStateColumns(this.db);
    await ensureActivityTemplateTable(this.db);
    await seedBuiltinActivityTemplates(this.db);
  }
}

export interface ActivityModuleOptions {
  db?: DbClient;
  hmacSalt?: string;
}

@Module({})
export class ActivityModule {
  static register(): DynamicModule {
    return ActivityModule.forRoot({});
  }

  static forRoot(opts: ActivityModuleOptions): DynamicModule {
    const providers: Provider[] = [
      {
        provide: ACT_DB,
        useFactory: () => opts.db ?? getDbSingleton(),
      },
      {
        provide: ACT_HMAC_SALT,
        useFactory: () =>
          opts.hmacSalt ??
          process.env['ACTIVITY_HMAC_SALT'] ??
          'bynu-default-activity-salt',
      },
      DslService,
      ActivityCoreService,
      EnrollmentService,
      ActivityScreenService,
      ActivityTemplateService,
      ActivityRolesGuard,
      ActivityService,
      ActivityBootstrap,
    ];
    return {
      module: ActivityModule,
      providers,
      controllers: [
        PublicActivityController,
        AlumniActivityController,
        AdminActivityController,
        ActivityController,
      ],
      exports: [
        ActivityCoreService,
        EnrollmentService,
        ActivityScreenService,
        ActivityTemplateService,
        DslService,
        ActivityService,
      ],
    };
  }
}
