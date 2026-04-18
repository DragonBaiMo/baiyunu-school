/**
 * 报名 + 扫码签到服务。
 *
 * 核心约束：
 * - 活动必须 published 且未过 start_at
 * - form_data 通过 DSL.formFields 校验
 * - 名额：事务中 SELECT quota + COUNT(*)，配合 UNIQUE (activity_id, alumni_id) 防重
 * - qr_ticket：base32(randomBytes(16))；对 `${activityId}|${alumniId}|${issuedAt}` 做 HMAC-SHA256，
 *   存在 form_data._sig / form_data._issuedAt，用作扫码双因子
 */

import { createHmac, randomBytes, randomUUID } from 'node:crypto';
import { Inject, Injectable, Optional } from '@nestjs/common';
import type { DbClient } from '@bynu/db';
import { ActivityCoreService } from './activity.service.js';
import { DslService } from './dsl.service.js';
import { ActivityError } from './errors.js';
import {
  ACT_DB,
  ACT_HMAC_SALT,
  type EnrollActivityInput,
  type EnrollmentRow,
  type EnrollmentStatus,
} from './types.js';

interface EnrollmentDbRow {
  id: string;
  activity_id: string;
  alumni_id: string;
  form_data: unknown;
  qr_ticket: string;
  check_in_at: string | Date | null;
  status: string;
}

const ENROLL_FIELDS = `
  id, activity_id, alumni_id, form_data, qr_ticket, check_in_at, status
`;

@Injectable()
export class EnrollmentService {
  constructor(
    @Optional() @Inject(ACT_DB) private readonly db: DbClient,
    @Optional()
    @Inject(ACT_HMAC_SALT)
    private readonly hmacSalt: string = 'bynu-default-activity-salt',
    private readonly activities: ActivityCoreService,
    private readonly dsl: DslService,
  ) {}

  async enroll(
    input: EnrollActivityInput & { now?: Date },
  ): Promise<EnrollmentRow> {
    const activity = await this.activities.getById(input.activityId);
    if (activity.status === 'cancelled' || activity.status === 'closed') {
      throw new ActivityError(
        'ACTIVITY_CLOSED',
        `活动 ${activity.id} 已 ${activity.status}，不可报名`,
        409,
      );
    }
    if (activity.status !== 'published') {
      throw new ActivityError(
        'ACTIVITY_NOT_PUBLISHED',
        `活动 ${activity.id} 未发布，不可报名`,
        409,
      );
    }
    const now = input.now ?? new Date();
    if (activity.startAt.getTime() <= now.getTime()) {
      throw new ActivityError(
        'ACTIVITY_CLOSED',
        `活动 ${activity.id} 已开始，报名通道已关闭`,
        409,
      );
    }

    // 表单校验
    this.dsl.validateFormData(activity.dsl.formFields, input.formData);

    const id = randomUUID();
    const issuedAt = now.toISOString();
    const qrTicket = generateBase32Ticket();
    const signature = computeHmac(
      activity.id,
      input.alumniId,
      issuedAt,
      this.hmacSalt,
    );
    const persistedFormData: Record<string, unknown> = {
      ...input.formData,
      _sig: signature,
      _issuedAt: issuedAt,
    };

    await this.db.query('BEGIN');
    try {
      // 名额检查：在事务内先查再插，UNIQUE 保证并发下的重复拒绝
      const quotaRes = await this.db.query<{ quota: number | string }>(
        `SELECT quota FROM activity WHERE id = $1`,
        [activity.id],
      );
      const quota = Number(quotaRes.rows[0]?.quota ?? activity.quota);
      const cntRes = await this.db.query<{ n: string }>(
        `SELECT COUNT(*)::text AS n FROM activity_enrollment
         WHERE activity_id = $1 AND status <> 'cancelled'`,
        [activity.id],
      );
      const used = Number(cntRes.rows[0]?.n ?? 0);
      if (used >= quota) {
        throw new ActivityError(
          'QUOTA_EXCEEDED',
          `活动 ${activity.id} 名额已满（${used}/${quota}）`,
          409,
        );
      }
      try {
        await this.db.query(
          `INSERT INTO activity_enrollment
           (id, activity_id, alumni_id, form_data, qr_ticket, status)
           VALUES ($1,$2,$3,$4,$5,'enrolled')`,
          [
            id,
            activity.id,
            input.alumniId,
            JSON.stringify(persistedFormData),
            qrTicket,
          ],
        );
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        if (/unique|duplicate/i.test(msg)) {
          throw new ActivityError(
            'ALREADY_ENROLLED',
            `校友 ${input.alumniId} 已报名该活动`,
            409,
          );
        }
        throw err;
      }
      await this.db.query('COMMIT');
    } catch (err) {
      await this.db.query('ROLLBACK');
      throw err;
    }
    return this.getById(id);
  }

  async cancel(enrollmentId: string, alumniId: string): Promise<EnrollmentRow> {
    const current = await this.getById(enrollmentId);
    if (current.alumniId !== alumniId) {
      throw new ActivityError(
        'ENROLLMENT_NOT_FOUND',
        `校友 ${alumniId} 无权取消报名 ${enrollmentId}`,
        403,
      );
    }
    if (current.status === 'checked') {
      throw new ActivityError(
        'ALREADY_CHECKED',
        `报名 ${enrollmentId} 已签到，不可取消`,
        409,
      );
    }
    if (current.status === 'cancelled') return current;
    await this.db.query(
      `UPDATE activity_enrollment SET status='cancelled' WHERE id=$1`,
      [enrollmentId],
    );
    return this.getById(enrollmentId);
  }

  async checkInByTicket(
    qrTicket: string,
    operatorId: string,
  ): Promise<EnrollmentRow> {
    void operatorId; // 预留：未来写入 audit_log
    const res = await this.db.query(
      `SELECT ${ENROLL_FIELDS} FROM activity_enrollment WHERE qr_ticket = $1`,
      [qrTicket],
    );
    const row = res.rows[0] as EnrollmentDbRow | undefined;
    if (!row) {
      throw new ActivityError(
        'INVALID_TICKET',
        `扫码票据 ${qrTicket} 不存在`,
        404,
      );
    }
    const current = toEnrollmentRow(row);
    if (current.status === 'cancelled') {
      throw new ActivityError(
        'INVALID_TICKET',
        `报名 ${current.id} 已取消`,
        409,
      );
    }
    const sig = current.formData['_sig'];
    const issuedAt = current.formData['_issuedAt'];
    if (typeof sig !== 'string' || typeof issuedAt !== 'string') {
      throw new ActivityError(
        'INVALID_TICKET',
        `报名 ${current.id} 缺少签名`,
        400,
      );
    }
    const expected = computeHmac(
      current.activityId,
      current.alumniId,
      issuedAt,
      this.hmacSalt,
    );
    if (!timingSafeEq(expected, sig)) {
      throw new ActivityError(
        'INVALID_TICKET',
        `报名 ${current.id} 签名不匹配`,
        401,
      );
    }
    if (current.status === 'checked') {
      throw new ActivityError(
        'ALREADY_CHECKED',
        `报名 ${current.id} 已签到`,
        409,
      );
    }
    await this.db.query('BEGIN');
    try {
      await this.db.query(
        `UPDATE activity_enrollment
         SET status='checked', check_in_at=NOW()
         WHERE id=$1 AND status='enrolled'`,
        [current.id],
      );
      await this.db.query('COMMIT');
    } catch (err) {
      await this.db.query('ROLLBACK');
      throw err;
    }
    return this.getById(current.id);
  }

  async listByActivity(
    activityId: string,
    query: { limit?: number; offset?: number; status?: EnrollmentStatus } = {},
  ): Promise<EnrollmentRow[]> {
    const limit = Math.min(500, Math.max(1, query.limit ?? 100));
    const offset = Math.max(0, query.offset ?? 0);
    const params: unknown[] = [activityId];
    const clauses: string[] = ['activity_id = $1'];
    if (query.status) {
      params.push(query.status);
      clauses.push(`status = $${params.length}`);
    }
    params.push(limit);
    const limitIdx = params.length;
    params.push(offset);
    const offsetIdx = params.length;
    const res = await this.db.query(
      `SELECT ${ENROLL_FIELDS}
       FROM activity_enrollment
       WHERE ${clauses.join(' AND ')}
       ORDER BY id ASC
       LIMIT $${limitIdx} OFFSET $${offsetIdx}`,
      params,
    );
    return (res.rows as unknown as EnrollmentDbRow[]).map(toEnrollmentRow);
  }

  async listByAlumni(alumniId: string): Promise<EnrollmentRow[]> {
    const res = await this.db.query(
      `SELECT ${ENROLL_FIELDS}
       FROM activity_enrollment
       WHERE alumni_id = $1
       ORDER BY id ASC`,
      [alumniId],
    );
    return (res.rows as unknown as EnrollmentDbRow[]).map(toEnrollmentRow);
  }

  async getById(id: string): Promise<EnrollmentRow> {
    const res = await this.db.query(
      `SELECT ${ENROLL_FIELDS} FROM activity_enrollment WHERE id = $1`,
      [id],
    );
    const row = res.rows[0] as EnrollmentDbRow | undefined;
    if (!row) {
      throw new ActivityError(
        'ENROLLMENT_NOT_FOUND',
        `报名 ${id} 不存在`,
        404,
      );
    }
    return toEnrollmentRow(row);
  }
}

function toEnrollmentRow(row: EnrollmentDbRow): EnrollmentRow {
  const raw = row.form_data;
  const formData =
    typeof raw === 'string'
      ? (JSON.parse(raw) as Record<string, unknown>)
      : ((raw as Record<string, unknown>) ?? {});
  return {
    id: row.id,
    activityId: row.activity_id,
    alumniId: row.alumni_id,
    formData,
    qrTicket: row.qr_ticket,
    checkInAt: row.check_in_at ? new Date(row.check_in_at) : null,
    status: row.status as EnrollmentStatus,
  };
}

function computeHmac(
  activityId: string,
  alumniId: string,
  issuedAt: string,
  salt: string,
): string {
  return createHmac('sha256', salt)
    .update(`${activityId}|${alumniId}|${issuedAt}`)
    .digest('hex');
}

function timingSafeEq(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

/** RFC4648 base32（无 padding），输入 16 字节，输出 26 字符。 */
function generateBase32Ticket(): string {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  const bytes = randomBytes(16);
  let bits = 0;
  let value = 0;
  let out = '';
  for (const b of bytes) {
    value = (value << 8) | b;
    bits += 8;
    while (bits >= 5) {
      bits -= 5;
      out += alphabet[(value >>> bits) & 31];
    }
  }
  if (bits > 0) {
    out += alphabet[(value << (5 - bits)) & 31];
  }
  return out;
}
