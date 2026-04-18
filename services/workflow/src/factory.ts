/**
 * 程序化工厂。
 */

import type { DbClient } from '@bynu/db';
import { ProofService, ensureProofTable } from './proof.service.js';
import { ReservationService } from './reservation.service.js';

export interface WorkflowDeps {
  db: DbClient;
  salt?: string;
}

export interface WorkflowServices {
  reservationService: ReservationService;
  proofService: ProofService;
}

export function createWorkflowModule(deps: WorkflowDeps): WorkflowServices {
  const reservationService = new ReservationService(deps.db);
  const proofService = new ProofService(
    deps.db,
    deps.salt ?? 'bynu-default-salt',
  );
  return { reservationService, proofService };
}

export { ensureProofTable };
