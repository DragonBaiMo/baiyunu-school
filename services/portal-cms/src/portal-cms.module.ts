/**
 * portal-cms Nest 装配。
 * - `PortalCmsModule.forRoot({ db })` 显式注入 DbClient（测试/工厂推荐）
 * - `PortalCmsModule.register()` 默认从 getDbSingleton() 取 db
 *
 * 兼容既有骨架：继续导出 PortalCmsService / PortalCmsController（ping 路由）。
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
import { NewsService } from './news.service.js';
import { PageService } from './page.service.js';
import {
  AdminPortalController,
  PublicPortalController,
} from './portal.controller.js';
import { CmsRolesGuard } from './roles.guard.js';
import { TemplateService, seedBuiltinTemplates } from './template.service.js';
import { CMS_DB } from './types.js';

/** 保留原 ping service，apps/server modules.test.ts 仍在引用。 */
@Injectable()
export class PortalCmsService {
  readonly moduleName = 'portal-cms';
  ping(): string {
    return 'portal-cms-service ready';
  }
}

@Controller('internal/portal-cms')
export class PortalCmsController {
  constructor(private readonly svc: PortalCmsService) {}

  @Get('ping')
  ping(): { module: string; message: string } {
    return { module: this.svc.moduleName, message: this.svc.ping() };
  }
}

@Injectable()
export class PortalCmsBootstrap implements OnModuleInit {
  constructor(@Inject(CMS_DB) private readonly db: DbClient) {}

  async onModuleInit(): Promise<void> {
    await ensureMigrated(this.db);
    await seedBuiltinTemplates(this.db);
  }
}

export interface PortalCmsModuleOptions {
  db?: DbClient;
}

@Module({})
export class PortalCmsModule {
  static register(): DynamicModule {
    return PortalCmsModule.forRoot({});
  }

  static forRoot(opts: PortalCmsModuleOptions): DynamicModule {
    const providers: Provider[] = [
      {
        provide: CMS_DB,
        useFactory: () => opts.db ?? getDbSingleton(),
      },
      PageService,
      TemplateService,
      NewsService,
      CmsRolesGuard,
      PortalCmsService,
      PortalCmsBootstrap,
    ];
    return {
      module: PortalCmsModule,
      providers,
      controllers: [
        PublicPortalController,
        AdminPortalController,
        PortalCmsController,
      ],
      exports: [PageService, TemplateService, NewsService, PortalCmsService],
    };
  }
}
