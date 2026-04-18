/**
 * activity 共享类型 + DI token。
 */

import type { DbClient } from '@bynu/db';
import type { z } from 'zod';
import type {
  ActivityDslSchema,
  ActivityStatusEnum,
  AdminActivityListQuerySchema,
  CheckInByTicketSchema,
  CreateActivitySchema,
  DslStepSchema,
  DslStepTypeEnum,
  EnrollActivitySchema,
  FormFieldSchema,
  PublicActivityListQuerySchema,
  UpdateActivitySchema,
} from './schemas.js';

export const ACT_DB = Symbol.for('bynu.activity.db');
export const ACT_HMAC_SALT = Symbol.for('bynu.activity.hmac-salt');

export type ActivityStatus = z.infer<typeof ActivityStatusEnum>;
export type DslStepType = z.infer<typeof DslStepTypeEnum>;
export type ActivityDsl = z.infer<typeof ActivityDslSchema>;
export type DslStep = z.infer<typeof DslStepSchema>;
export type FormField = z.infer<typeof FormFieldSchema>;
export type CreateActivityInput = z.infer<typeof CreateActivitySchema>;
export type UpdateActivityInput = z.infer<typeof UpdateActivitySchema>;
export type EnrollActivityInput = z.infer<typeof EnrollActivitySchema>;
export type CheckInByTicketInput = z.infer<typeof CheckInByTicketSchema>;
export type PublicActivityListQuery = z.infer<
  typeof PublicActivityListQuerySchema
>;
export type AdminActivityListQuery = z.infer<
  typeof AdminActivityListQuerySchema
>;

export type EnrollmentStatus = 'enrolled' | 'checked' | 'cancelled';

export interface ActivityRow {
  id: string;
  title: string;
  templateId: string | null;
  dsl: ActivityDsl;
  quota: number;
  startAt: Date;
  endAt: Date;
  status: ActivityStatus;
  creatorId: string;
  publishedAt: Date | null;
  closedAt: Date | null;
  cancelledAt: Date | null;
}

export interface ActivityTemplateRow {
  id: string;
  name: string;
  category: string;
  description: string | null;
  dsl: ActivityDsl;
  builtin: boolean;
}

export interface EnrollmentRow {
  id: string;
  activityId: string;
  alumniId: string;
  formData: Record<string, unknown>;
  qrTicket: string;
  checkInAt: Date | null;
  status: EnrollmentStatus;
}

export interface ActivityScreenSummary {
  quota: number;
  enrolled: number;
  checked: number;
  checkInRate: number;
  recentCheckIns: Array<{
    enrollmentId: string;
    alumniId: string;
    checkInAt: Date;
  }>;
}

export interface ActivityRuntimeDeps {
  db: DbClient;
  hmacSalt: string;
}
