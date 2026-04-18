/**
 * 程序化工厂：不依赖 Nest 容器，直接拿到 3 个 service 实例。
 * 适合单元测试 / 脚本场景使用。
 */

import type { Buffer } from 'node:buffer';
import type { DbClient } from '@bynu/db';
import type { IEduSystemAdapter } from '@bynu/adapter-edu-system';
import type { INotificationPort } from '@bynu/service-notification';
import { ApplicationService } from './application.service.js';
import { CardService } from './card.service.js';
import { ProfileService } from './profile.service.js';

export interface IdentityDeps {
  db: DbClient;
  key: Buffer;
  edu: IEduSystemAdapter;
  notify: INotificationPort;
}

export interface IdentityServices {
  applicationService: ApplicationService;
  cardService: CardService;
  profileService: ProfileService;
}

export function createIdentityModule(deps: IdentityDeps): IdentityServices {
  const profileService = new ProfileService(deps.db, deps.key);
  const cardService = new CardService(deps.db);
  const applicationService = new ApplicationService(
    deps.db,
    deps.key,
    deps.edu,
    deps.notify,
    cardService,
    profileService,
  );
  return { applicationService, cardService, profileService };
}
