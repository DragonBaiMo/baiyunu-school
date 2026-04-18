/**
 * organization Nest 装配。
 * - `OrganizationModule.forRoot({ db })` 显式注入 DbClient
 * - `OrganizationModule.register()` 从 getDbSingleton() 取 db
 *
 * 兼容 apps/server/tests/modules.test.ts：保留 OrganizationService/OrganizationController (ping)。
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
import { BbsService } from './bbs.service.js';
import {
  AdminOrgController,
  AlumniOrgController,
  PublicOrgController,
} from './organization.controller.js';
import { OrgRolesGuard } from './roles.guard.js';
import { TreeService } from './tree.service.js';
import { ORG_DB } from './types.js';

/** 保留原 ping service，apps/server modules.test.ts 仍在引用。 */
@Injectable()
export class OrganizationService {
  readonly moduleName = 'organization';
  ping(): string {
    return 'organization-service ready';
  }
}

@Controller('internal/organization')
export class OrganizationController {
  constructor(private readonly svc: OrganizationService) {}

  @Get('ping')
  ping(): { module: string; message: string } {
    return { module: this.svc.moduleName, message: this.svc.ping() };
  }
}

@Injectable()
export class OrganizationBootstrap implements OnModuleInit {
  constructor(@Inject(ORG_DB) private readonly db: DbClient) {}

  async onModuleInit(): Promise<void> {
    await ensureMigrated(this.db);
  }
}

export interface OrganizationModuleOptions {
  db?: DbClient;
}

@Module({})
export class OrganizationModule {
  static register(): DynamicModule {
    return OrganizationModule.forRoot({});
  }

  static forRoot(opts: OrganizationModuleOptions): DynamicModule {
    const providers: Provider[] = [
      {
        provide: ORG_DB,
        useFactory: () => opts.db ?? getDbSingleton(),
      },
      TreeService,
      BbsService,
      OrgRolesGuard,
      OrganizationService,
      OrganizationBootstrap,
    ];
    return {
      module: OrganizationModule,
      providers,
      controllers: [
        PublicOrgController,
        AlumniOrgController,
        AdminOrgController,
        OrganizationController,
      ],
      exports: [TreeService, BbsService, OrganizationService],
    };
  }
}
