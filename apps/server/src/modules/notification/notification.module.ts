import { Module, type DynamicModule } from '@nestjs/common';
import {
  NotificationController,
  NotificationService,
  NOTIFICATION_DB,
} from '@bynu/service-notification';
import { getDbSingleton } from '@bynu/db';

/**
 * 服务器端装配 wrapper：延迟解析 db，避免在 AppModule 评估期就创建 PGlite 实例。
 */
@Module({
  controllers: [NotificationController],
  providers: [
    NotificationService,
    { provide: NOTIFICATION_DB, useFactory: () => getDbSingleton() },
  ],
  exports: [NotificationService],
})
export class NotificationModule {
  static register(): DynamicModule {
    return {
      module: NotificationModule,
      controllers: [NotificationController],
      providers: [
        NotificationService,
        { provide: NOTIFICATION_DB, useFactory: () => getDbSingleton() },
      ],
      exports: [NotificationService],
      global: true,
    };
  }
}
