/**
 * @bynu/service-notification
 *
 * M1 Mock: all channels downgraded to writing notification_log.
 */

import { randomUUID } from 'node:crypto';
import {
  Controller,
  Get,
  Inject,
  Injectable,
  Module,
  Optional,
  type DynamicModule,
} from '@nestjs/common';
import type { DbClient } from '@bynu/db';

export type NotificationTemplate =
  | 'approval'
  | 'rejection'
  | 'supplement'
  | 'card_issued';

export type NotificationChannel = 'sms' | 'email' | 'push';

export interface INotificationPort {
  sendSms(
    phone: string,
    template: NotificationTemplate,
    vars: Record<string, unknown>,
  ): Promise<{ id: string; status: 'sent' | 'failed' }>;
}

export const NOTIFICATION_DB = Symbol.for('bynu.notification.db');

@Injectable()
export class NotificationService implements INotificationPort {
  readonly moduleName = 'notification';

  constructor(
    @Optional() @Inject(NOTIFICATION_DB) private readonly db?: DbClient,
  ) {}

  ping(): string {
    return 'notification-service ready';
  }

  async sendSms(
    phone: string,
    template: NotificationTemplate,
    vars: Record<string, unknown>,
  ): Promise<{ id: string; status: 'sent' | 'failed' }> {
    if (!this.db) {
      throw new Error('[notification] DbClient not injected');
    }
    const id = randomUUID();
    await this.db.query(
      `INSERT INTO notification_log (id, channel, target, template, payload, status) VALUES ($1,$2,$3,$4,$5,$6)`,
      [id, 'sms', phone, template, JSON.stringify(vars), 'sent'],
    );
    return { id, status: 'sent' };
  }

  async findRecent(limit = 10): Promise<Array<Record<string, unknown>>> {
    if (!this.db) return [];
    const res = await this.db.query(
      `SELECT id, channel, target, template, payload, status, sent_at FROM notification_log ORDER BY sent_at DESC LIMIT $1`,
      [limit],
    );
    return res.rows;
  }
}

@Controller('internal/notification')
export class NotificationController {
  constructor(private readonly svc: NotificationService) {}

  @Get('ping')
  ping(): { module: string; message: string } {
    return { module: this.svc.moduleName, message: this.svc.ping() };
  }
}

@Module({
  controllers: [NotificationController],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationModule {
  static forRoot(opts: { db: DbClient }): DynamicModule {
    return {
      module: NotificationModule,
      providers: [
        { provide: NOTIFICATION_DB, useValue: opts.db },
        NotificationService,
      ],
      controllers: [NotificationController],
      exports: [NotificationService],
      global: true,
    };
  }
}
