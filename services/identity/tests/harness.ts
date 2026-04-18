/**
 * 测试夹具：内存 pglite + 迁移 + 身份域服务实例。
 */

import { Buffer } from 'node:buffer';
import { createDbClient, ensureMigrated, parseKey, type DbClient } from '@bynu/db';
import type { IEduSystemAdapter, EduAlumniRecord } from '@bynu/adapter-edu-system';
import { NotificationService } from '@bynu/service-notification';
import {
  ApplicationService,
  CardService,
  ProfileService,
  createIdentityModule,
} from '../src/index.js';

export interface TestHarness {
  db: DbClient;
  key: Buffer;
  edu: TestEduAdapter;
  notify: NotificationService;
  application: ApplicationService;
  card: CardService;
  profile: ProfileService;
  close(): Promise<void>;
}

export class TestEduAdapter implements IEduSystemAdapter {
  readonly records: EduAlumniRecord[] = [
    { idCard: '11010119900101000X', name: '王昭然', year: 2015, college: 'CS', major: 'SE' },
    { idCard: '110101199101010002', name: '李寒雪', year: 2016, college: 'EM', major: 'ACC' },
    { idCard: '110101199201010003', name: '张明哲', year: 2017, college: 'FL', major: 'ENG' },
  ];

  async queryAlumni(idCard: string): Promise<EduAlumniRecord | null> {
    return this.records.find((r) => r.idCard === idCard) ?? null;
  }
  async listGraduates(year: number): Promise<EduAlumniRecord[]> {
    return this.records.filter((r) => r.year === year);
  }
  async verifyEnrollment(payload: { idCard: string; year: number }): Promise<boolean> {
    return this.records.some(
      (r) => r.idCard === payload.idCard && r.year === payload.year,
    );
  }
}

export async function createHarness(): Promise<TestHarness> {
  const db = createDbClient('pglite:memory://');
  await ensureMigrated(db);
  const key = parseKey(
    '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
  );
  const notify = new NotificationService(db);
  const edu = new TestEduAdapter();
  const services = createIdentityModule({ db, key, edu, notify });
  return {
    db,
    key,
    edu,
    notify,
    application: services.applicationService,
    card: services.cardService,
    profile: services.profileService,
    async close() {
      await db.close();
    },
  };
}
