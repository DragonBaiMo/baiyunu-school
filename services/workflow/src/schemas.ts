/**
 * Zod 请求/响应校验。
 */

import { z } from 'zod';

export const ServiceTypeEnum = z.enum(['返校', '证明', '档案']);

export const ProofTypeEnum = z.enum(['在学证明', '学历证明', '在读证明', '成绩证明']);

const DateOnlySchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'slotDate 需为 YYYY-MM-DD');

const TimeSlotSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'slotTime 需为 HH:MM');

export const CreateReservationSchema = z.object({
  alumniId: z.string().min(1),
  serviceType: ServiceTypeEnum,
  slotDate: DateOnlySchema,
  slotTime: TimeSlotSchema,
  companions: z
    .array(
      z.object({
        name: z.string().min(1).max(60),
        idCard: z.string().min(6).max(32).optional(),
      }),
    )
    .max(5)
    .default([]),
});

export const CancelReservationSchema = z.object({
  reservationId: z.string().min(1),
  alumniId: z.string().min(1),
});

export const ListSlotsQuerySchema = z.object({
  serviceType: ServiceTypeEnum,
  startDate: DateOnlySchema,
  endDate: DateOnlySchema,
});

export const IssueProofSchema = z.object({
  alumniId: z.string().min(1),
  proofType: ProofTypeEnum,
  payload: z.record(z.unknown()),
});

export const VerifyProofSchema = z.object({
  signature: z.string().min(1),
});
