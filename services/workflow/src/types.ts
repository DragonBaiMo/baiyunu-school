/**
 * workflow 共享类型 + DI token。
 */

import type { DbClient } from '@bynu/db';
import type { z } from 'zod';
import type {
  CreateReservationSchema,
  IssueProofSchema,
  ListSlotsQuerySchema,
  ProofTypeEnum,
  ServiceTypeEnum,
} from './schemas.js';

export const WF_DB = Symbol.for('bynu.workflow.db');
export const WF_SALT = Symbol.for('bynu.workflow.salt');

/** 每个时段默认容量 */
export const WF_DEFAULT_CAPACITY = 10;

/** 默认可预约时段（用于 listAvailableSlots 枚举） */
export const WF_DEFAULT_SLOTS: readonly string[] = [
  '09:00',
  '10:00',
  '11:00',
  '14:00',
  '15:00',
  '16:00',
];

export type ServiceType = z.infer<typeof ServiceTypeEnum>;
export type ProofType = z.infer<typeof ProofTypeEnum>;
export type CreateReservationInput = z.infer<typeof CreateReservationSchema>;
export type ListSlotsQuery = z.infer<typeof ListSlotsQuerySchema>;
export type IssueProofInput = z.infer<typeof IssueProofSchema>;

export interface ReservationRow {
  id: string;
  alumniId: string;
  serviceType: ServiceType;
  slotDate: string;
  slotTime: string;
  companions: Array<{ name: string; idCard?: string }>;
  status: 'pending' | 'confirmed' | 'cancelled';
  qrTicket: string;
}

export interface SlotAvailability {
  serviceType: ServiceType;
  slotDate: string;
  slotTime: string;
  capacity: number;
  remaining: number;
}

export interface ProofRow {
  id: string;
  alumniId: string;
  proofType: ProofType;
  payload: Record<string, unknown>;
  signature: string;
  issuedAt: Date;
}

export interface WorkflowRuntimeDeps {
  db: DbClient;
  salt: string;
}
