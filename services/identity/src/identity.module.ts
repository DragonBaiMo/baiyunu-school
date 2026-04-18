/**
 * Identity 模块装配。对外保留两种使用方式：
 * 1. `IdentityModule`                 — 默认 providers，自动从 env/loadConfig 拉取依赖
 * 2. `IdentityModule.forRoot({...})`  — 显式注入依赖（测试 / e2e 推荐）
 *
 * 兼容既有骨架：继续导出 IdentityService / IdentityController（ping）。
 */

import { Buffer } from 'node:buffer';
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
import { Reflector } from '@nestjs/core';
import { ensureMigrated, getDbSingleton, parseKey, type DbClient } from '@bynu/db';
import { createEduSystemAdapter, type IEduSystemAdapter } from '@bynu/adapter-edu-system';
import { NotificationService, type INotificationPort } from '@bynu/service-notification';
import { ApplicationService } from './application.service.js';
import { CardService } from './card.service.js';
import { ProfileService } from './profile.service.js';
import {
  IdentityApplicationsController,
  IdentityCardsController,
} from './identity.controller.js';
import { RolesGuard } from './roles.guard.js';
import {
  IDENTITY_DB,
  IDENTITY_EDU,
  IDENTITY_KEY,
  IDENTITY_NOTIFY,
} from './types.js';

/** 保留原 ping 服务，modules.test.ts 仍在引用。 */
@Injectable()
export class IdentityService {
  readonly moduleName = 'identity';
  ping(): string {
    return 'identity-service ready';
  }
}

@Controller('internal/identity')
export class IdentityController {
  constructor(private readonly svc: IdentityService) {}

  @Get('ping')
  ping(): { module: string; message: string } {
    return { module: this.svc.moduleName, message: this.svc.ping() };
  }
}

function defaultProviders(): Provider[] {
  return [];
}

/** 在 Nest 启动时确保 pglite schema 已建；对真实 Postgres 亦幂等。 */
@Injectable()
export class IdentityBootstrap implements OnModuleInit {
  constructor(@Inject(IDENTITY_DB) private readonly db: DbClient) {}

  async onModuleInit(): Promise<void> {
    await ensureMigrated(this.db);
  }
}

export interface IdentityModuleOptions {
  db?: DbClient;
  edu?: IEduSystemAdapter;
  notify?: INotificationPort;
  key?: Buffer;
  encryptionKeyHex?: string;
}

@Module({})
export class IdentityModule {
  /** 默认模块：从进程 env 推导依赖（服务启动使用）。 */
  static register(): DynamicModule {
    return IdentityModule.forRoot({});
  }

  static forRoot(opts: IdentityModuleOptions): DynamicModule {
    const providers = [
      {
        provide: IDENTITY_DB,
        useFactory: () => opts.db ?? getDbSingleton(),
      },
      {
        provide: IDENTITY_KEY,
        useFactory: () => {
          if (opts.key) return opts.key;
          const hex =
            opts.encryptionKeyHex ??
            process.env['ENCRYPTION_KEY'] ??
            '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
          return parseKey(hex);
        },
      },
      {
        provide: IDENTITY_EDU,
        useFactory: () => opts.edu ?? createEduSystemAdapter(),
      },
      {
        provide: IDENTITY_NOTIFY,
        // 若调用方未注入 notify，则尝试从 Nest 容器获取 NotificationService
        useFactory: (fallback: NotificationService) => opts.notify ?? fallback,
        inject: [NotificationService],
      },
      ApplicationService,
      CardService,
      ProfileService,
      IdentityService,
      Reflector,
      RolesGuard,
      IdentityBootstrap,
      ...defaultProviders(),
    ];
    return {
      module: IdentityModule,
      providers,
      controllers: [
        IdentityApplicationsController,
        IdentityCardsController,
        IdentityController,
      ],
      exports: [ApplicationService, CardService, ProfileService, IdentityService],
    };
  }
}
