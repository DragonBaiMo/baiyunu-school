/**
 * 测试夹具：内存 pglite + 迁移 + workflow 服务实例。
 */

import { createDbClient, ensureMigrated, type DbClient } from '@bynu/db';
import {
  ProofService,
  ReservationService,
  createWorkflowModule,
  ensureProofTable,
} from '../src/index.js';

export interface TestHarness {
  db: DbClient;
  reservations: ReservationService;
  proofs: ProofService;
  close(): Promise<void>;
}

export async function createHarness(): Promise<TestHarness> {
  const db = createDbClient('pglite:memory://');
  await ensureMigrated(db);
  await ensureProofTable(db);
  const svcs = createWorkflowModule({ db, salt: 'test-salt' });
  return {
    db,
    reservations: svcs.reservationService,
    proofs: svcs.proofService,
    async close() {
      await db.close();
    },
  };
}
