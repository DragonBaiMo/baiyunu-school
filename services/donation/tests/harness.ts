/**
 * 测试夹具：内存 pglite + 迁移 + donation 服务实例。
 */

import { randomUUID } from 'node:crypto';
import { createDbClient, ensureMigrated, type DbClient } from '@bynu/db';
import {
  DonationCoreService,
  DonationWallService,
  MockPaymentPort,
  createDonationModule,
  ensureDonationColumns,
} from '../src/index.js';

export const TEST_HMAC_SALT = 'test-donation-salt';

export interface TestHarness {
  db: DbClient;
  donation: DonationCoreService;
  wall: DonationWallService;
  payment: MockPaymentPort;
  close(): Promise<void>;
  /** 写入一条 alumni_profile 以便显示名解析测试。 */
  seedAlumni(opts?: { pinyin?: string }): Promise<string>;
}

export async function createHarness(): Promise<TestHarness> {
  const db = createDbClient('pglite:memory://');
  await ensureMigrated(db);
  await ensureDonationColumns(db);
  const port = new MockPaymentPort(TEST_HMAC_SALT);
  const svcs = createDonationModule({
    db,
    hmacSalt: TEST_HMAC_SALT,
    paymentPort: port,
  });
  return {
    db,
    donation: svcs.donationService,
    wall: svcs.wallService,
    payment: port,
    async seedAlumni(opts = {}) {
      const id = randomUUID();
      const userId = randomUUID();
      const bytes = Buffer.from('x');
      const hash = Buffer.concat([Buffer.from(id, 'utf8')]);
      await db.query(
        `INSERT INTO alumni_profile
         (id, user_id, name_enc, name_pinyin, id_card_enc, id_card_hash, phone_enc,
          year, college_id, dept_id, class_id)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
        [
          id,
          userId,
          bytes,
          opts.pinyin ?? 'Zhang',
          bytes,
          hash,
          bytes,
          2020,
          'c1',
          'd1',
          'cls-1',
        ],
      );
      return id;
    },
    async close() {
      await db.close();
    },
  };
}

export function makeWebhookRequest(
  port: MockPaymentPort,
  outTradeNo: string,
  status: 'paid' | 'failed' = 'paid',
): { headers: Record<string, string>; rawBody: string } {
  const body = { outTradeNo, status, paidAt: new Date().toISOString() };
  const rawBody = JSON.stringify(body);
  const signature = port.signBody(rawBody);
  return {
    headers: { 'x-mock-signature': signature },
    rawBody,
  };
}
