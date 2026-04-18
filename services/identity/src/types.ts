/**
 * Identity 领域内的共享类型与 DI token。
 */

import { Buffer } from 'node:buffer';
import type { DbClient } from '@bynu/db';
import type { IEduSystemAdapter } from '@bynu/adapter-edu-system';
import type { INotificationPort } from '@bynu/service-notification';

export const IDENTITY_DB = Symbol.for('bynu.identity.db');
export const IDENTITY_KEY = Symbol.for('bynu.identity.key');
export const IDENTITY_EDU = Symbol.for('bynu.identity.edu');
export const IDENTITY_NOTIFY = Symbol.for('bynu.identity.notify');

export interface IdentityRuntimeDeps {
  db: DbClient;
  key: Buffer;
  edu: IEduSystemAdapter;
  notify: INotificationPort;
}

/** 申请原始输入（来自前端表单）。敏感字段明文；服务内加密后落库。 */
export interface SubmitApplicationInput {
  name: string;
  idCard: string;
  phone: string;
  year: number;
  collegeId: string;
  deptId: string;
  classId: string;
  evidenceUrls: string[];
}

export type ApplicationStatus = 'pending' | 'approved' | 'rejected' | 'supplement';

export interface ApplicationListFilter {
  status?: ApplicationStatus | undefined;
  collegeId?: string | undefined;
  keyword?: string | undefined;
  page?: number | undefined;
  pageSize?: number | undefined;
}

export interface ApplicationRow {
  id: string;
  applicantName: string;
  status: ApplicationStatus;
  reviewerId: string | null;
  reviewedAt: Date | null;
  collegeId: string;
  year: number;
  createdAt: Date;
}

export interface ActorContext {
  /** actor 主键，用于 audit_log.actor_id。 */
  id: string;
  /** 角色列表；RBAC 过滤依赖此字段。 */
  roles: string[];
  /** 当 role=reviewer（院级）时，限定其所在学院。 */
  collegeId?: string;
}

export interface CardIssueResult {
  id: string;
  cardNo: string;
  alumniId: string;
  issuedAt: Date;
}

export interface QrRotateResult {
  cardId: string;
  code: string;
  expiresAt: number;
  rotationSec: number;
}

export interface QrVerifyResult {
  valid: boolean;
  cardId?: string;
  alumniId?: string;
}
