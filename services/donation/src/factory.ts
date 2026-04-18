/**
 * 程序化工厂：跳过 Nest DI，直接拿到 donation 领域服务实例。
 */

import type { DbClient } from '@bynu/db';
import { DonationCoreService } from './donation.service.js';
import { MockPaymentPort, type IPaymentPort } from './payment.port.js';
import { DonationWallService } from './wall.service.js';

export interface DonationDeps {
  db: DbClient;
  hmacSalt?: string;
  paymentPort?: IPaymentPort;
}

export interface DonationServices {
  donationService: DonationCoreService;
  wallService: DonationWallService;
  paymentPort: IPaymentPort;
}

export function createDonationModule(deps: DonationDeps): DonationServices {
  const salt = deps.hmacSalt ?? 'bynu-default-donation-salt';
  const paymentPort = deps.paymentPort ?? new MockPaymentPort(salt);
  const donationService = new DonationCoreService(deps.db, paymentPort);
  const wallService = new DonationWallService(deps.db);
  return { donationService, wallService, paymentPort };
}

export { ensureDonationColumns } from './bootstrap.js';
