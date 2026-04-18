/**
 * donation Nest 装配。
 * - forRoot({ db, hmacSalt, paymentPort })：显式注入
 * - register()：默认从 getDbSingleton() 取 db、环境变量取 salt、注入 MockPaymentPort
 *
 * 保留 DonationService / DonationController（ping 路由），以兼容 apps/server modules.test.ts。
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
import { ensureDonationColumns } from './bootstrap.js';
import {
  AdminDonationController,
  AlumniDonationController,
  DonationWebhookController,
  PublicDonationWallController,
} from './donation.controller.js';
import { DonationCoreService } from './donation.service.js';
import { MockPaymentPort, type IPaymentPort } from './payment.port.js';
import { DonationRolesGuard } from './roles.guard.js';
import { DON_DB, DON_HMAC_SALT, DON_PAYMENT_PORT } from './types.js';
import { DonationWallService } from './wall.service.js';

@Injectable()
export class DonationService {
  readonly moduleName = 'donation';
  ping(): string {
    return 'donation-service ready';
  }
}

@Controller('internal/donation')
export class DonationController {
  constructor(private readonly svc: DonationService) {}

  @Get('ping')
  ping(): { module: string; message: string } {
    return { module: this.svc.moduleName, message: this.svc.ping() };
  }
}

@Injectable()
export class DonationBootstrap implements OnModuleInit {
  constructor(@Inject(DON_DB) private readonly db: DbClient) {}

  async onModuleInit(): Promise<void> {
    await ensureMigrated(this.db);
    await ensureDonationColumns(this.db);
  }
}

export interface DonationModuleOptions {
  db?: DbClient;
  hmacSalt?: string;
  paymentPort?: IPaymentPort;
}

@Module({})
export class DonationModule {
  static register(): DynamicModule {
    return DonationModule.forRoot({});
  }

  static forRoot(opts: DonationModuleOptions): DynamicModule {
    const providers: Provider[] = [
      {
        provide: DON_DB,
        useFactory: () => opts.db ?? getDbSingleton(),
      },
      {
        provide: DON_HMAC_SALT,
        useFactory: () =>
          opts.hmacSalt ??
          process.env['DONATION_HMAC_SALT'] ??
          'bynu-default-donation-salt',
      },
      {
        provide: DON_PAYMENT_PORT,
        inject: [DON_HMAC_SALT],
        useFactory: (salt: string): IPaymentPort =>
          opts.paymentPort ?? new MockPaymentPort(salt),
      },
      DonationCoreService,
      DonationWallService,
      DonationRolesGuard,
      DonationService,
      DonationBootstrap,
    ];
    return {
      module: DonationModule,
      providers,
      controllers: [
        PublicDonationWallController,
        AlumniDonationController,
        DonationWebhookController,
        AdminDonationController,
        DonationController,
      ],
      exports: [DonationCoreService, DonationWallService, DonationService],
    };
  }
}
