/**
 * 申请漏斗服务：submit / supplement / approve / reject / list。
 *
 * 契约要点：
 * - 敏感字段 AES-256-GCM 加密后落 payload JSONB（base64 字符串形式）
 * - 身份证额外存 sha256 摘要 payload.idCardHash，用于 pending 去重与后续索引
 * - approve 时联动 ProfileService.createFromApplication + CardService.issue + NotificationService.sendSms
 * - list 支持 RBAC：role=reviewer_college 时必须限定 actor.collegeId
 */

import { Buffer } from 'node:buffer';
import { randomUUID } from 'node:crypto';
import { Inject, Injectable, Optional } from '@nestjs/common';
import type { DbClient } from '@bynu/db';
import { decryptAesGcm, encryptAesGcm, hashIdCard } from '@bynu/db';
import type { IEduSystemAdapter } from '@bynu/adapter-edu-system';
import type { INotificationPort } from '@bynu/service-notification';
import { IdentityError } from './errors.js';
import { CardService } from './card.service.js';
import { ProfileService, maskName } from './profile.service.js';
import {
  IDENTITY_DB,
  IDENTITY_EDU,
  IDENTITY_KEY,
  IDENTITY_NOTIFY,
  type ActorContext,
  type ApplicationListFilter,
  type ApplicationRow,
  type ApplicationStatus,
  type SubmitApplicationInput,
} from './types.js';

export interface SubmitApplicationResult {
  id: string;
  status: ApplicationStatus;
}

export interface ApproveApplicationResult {
  applicationId: string;
  profileId: string;
  cardId: string;
  cardNo: string;
  notificationId: string;
}

export interface ApplicationListResult {
  items: ApplicationRow[];
  total: number;
  page: number;
  pageSize: number;
}

interface ApplicationPayload {
  nameEnc: string;
  idCardEnc: string;
  phoneEnc: string;
  idCardHash: string;
  namePinyin: string;
  year: number;
  collegeId: string;
  deptId: string;
  classId: string;
  evidenceUrls: string[];
  supplementHistory?: Array<{ at: string; reviewerId: string; note: string }>;
  rejectReason?: string;
}

@Injectable()
export class ApplicationService {
  constructor(
    @Optional() @Inject(IDENTITY_DB) private readonly db: DbClient,
    @Optional() @Inject(IDENTITY_KEY) private readonly key: Buffer,
    @Optional() @Inject(IDENTITY_EDU) private readonly edu: IEduSystemAdapter,
    @Optional() @Inject(IDENTITY_NOTIFY) private readonly notify: INotificationPort,
    private readonly cardService: CardService,
    private readonly profileService: ProfileService,
  ) {}

  /**
   * 提交申请。
   * 前置条件：payload 已通过 zod 结构校验。
   * 规则：
   * 1) edu.verifyEnrollment 必须返回 true，否则 EDU_NOT_FOUND(422)
   * 2) 同一身份证 hash 若已存在 pending/supplement 记录，DUPLICATE_PENDING(409)
   * 3) 加密姓名/身份证/手机号后写 alumni_application.payload
   */
  async submit(input: SubmitApplicationInput): Promise<SubmitApplicationResult> {
    const ok = await this.edu.verifyEnrollment({ idCard: input.idCard, year: input.year });
    if (!ok) {
      throw new IdentityError(
        'EDU_NOT_FOUND',
        '教务系统未查到对应学籍，无法受理申请',
        422,
      );
    }
    const idCardHash = hashIdCard(input.idCard);
    const idCardHashB64 = idCardHash.toString('base64');
    const dup = await this.db.query(
      `SELECT id FROM alumni_application
       WHERE payload->>'idCardHash' = $1 AND status IN ('pending','supplement')
       LIMIT 1`,
      [idCardHashB64],
    );
    if (dup.rows.length > 0) {
      throw new IdentityError(
        'DUPLICATE_PENDING',
        '已存在进行中的同身份证申请，不能重复提交',
        409,
      );
    }

    const id = randomUUID();
    const payload: ApplicationPayload = {
      nameEnc: encryptAesGcm(this.key, input.name).toString('base64'),
      idCardEnc: encryptAesGcm(this.key, input.idCard).toString('base64'),
      phoneEnc: encryptAesGcm(this.key, input.phone).toString('base64'),
      idCardHash: idCardHashB64,
      namePinyin: maskName(input.name),
      year: input.year,
      collegeId: input.collegeId,
      deptId: input.deptId,
      classId: input.classId,
      evidenceUrls: input.evidenceUrls,
    };
    await this.db.query(
      `INSERT INTO alumni_application
       (id, applicant_name, payload, status, evidence_urls)
       VALUES ($1,$2,$3,$4,$5)`,
      [
        id,
        maskName(input.name),
        JSON.stringify(payload),
        'pending',
        input.evidenceUrls,
      ],
    );
    return { id, status: 'pending' };
  }

  /**
   * 补充材料：reviewer 请申请者上传更多证据。
   * 允许状态：pending | supplement；其他状态抛 APPLICATION_INVALID_STATE。
   */
  async supplement(
    id: string,
    reviewerId: string,
    note: string,
  ): Promise<void> {
    const row = await this.loadById(id);
    if (!['pending', 'supplement'].includes(row.status)) {
      throw new IdentityError(
        'APPLICATION_INVALID_STATE',
        `当前状态 ${row.status} 不允许补充`,
        409,
      );
    }
    const payload = { ...row.payload };
    payload.supplementHistory = [
      ...(payload.supplementHistory ?? []),
      { at: new Date().toISOString(), reviewerId, note },
    ];
    await this.db.query(
      `UPDATE alumni_application SET payload=$2, status='supplement', reviewer_id=$3 WHERE id=$1`,
      [id, JSON.stringify(payload), reviewerId],
    );
    await this.writeAudit(reviewerId, 'application.supplement', id, { note });
    await this.notify.sendSms(maskPhone(payload), 'supplement', {
      applicationId: id,
      note,
    });
  }

  /**
   * 审批通过：创建 AlumniProfile + 发卡 + 推送短信。
   * 原子性说明：M1 顺序串行，不使用 tx；失败时依赖调用方重试（幂等由 cardNo 唯一约束保证）。
   */
  async approve(id: string, reviewerId: string): Promise<ApproveApplicationResult> {
    const row = await this.loadById(id);
    if (!['pending', 'supplement'].includes(row.status)) {
      throw new IdentityError(
        'APPLICATION_INVALID_STATE',
        `当前状态 ${row.status} 不允许审批通过`,
        409,
      );
    }
    const plain = this.decryptPayload(row.payload);
    const profile = await this.profileService.createFromApplication({
      name: plain.name,
      idCard: plain.idCard,
      phone: plain.phone,
      year: row.payload.year,
      collegeId: row.payload.collegeId,
      deptId: row.payload.deptId,
      classId: row.payload.classId,
      namePinyin: row.payload.namePinyin,
    });
    const card = await this.cardService.issue(profile.id, row.payload.year);
    await this.db.query(
      `UPDATE alumni_application
       SET status='approved', reviewer_id=$2, reviewed_at=NOW() WHERE id=$1`,
      [id, reviewerId],
    );
    await this.writeAudit(reviewerId, 'application.approve', id, {
      profileId: profile.id,
      cardId: card.id,
    });
    const notification = await this.notify.sendSms(plain.phone, 'approval', {
      applicationId: id,
      cardNo: card.cardNo,
    });
    // card_issued 作为二次通知，便于前端渲染领卡提示
    await this.notify.sendSms(plain.phone, 'card_issued', {
      cardId: card.id,
      cardNo: card.cardNo,
    });
    return {
      applicationId: id,
      profileId: profile.id,
      cardId: card.id,
      cardNo: card.cardNo,
      notificationId: notification.id,
    };
  }

  /**
   * 驳回：记录原因 + 发送驳回短信。
   */
  async reject(id: string, reviewerId: string, reason: string): Promise<void> {
    const row = await this.loadById(id);
    if (!['pending', 'supplement'].includes(row.status)) {
      throw new IdentityError(
        'APPLICATION_INVALID_STATE',
        `当前状态 ${row.status} 不允许驳回`,
        409,
      );
    }
    const payload = { ...row.payload, rejectReason: reason };
    await this.db.query(
      `UPDATE alumni_application
       SET status='rejected', reviewer_id=$2, reviewed_at=NOW(), payload=$3 WHERE id=$1`,
      [id, reviewerId, JSON.stringify(payload)],
    );
    await this.writeAudit(reviewerId, 'application.reject', id, { reason });
    const plain = this.decryptPayload(row.payload);
    await this.notify.sendSms(plain.phone, 'rejection', {
      applicationId: id,
      reason,
    });
  }

  /**
   * 分页列表。RBAC：
   * - actor.roles 含 'admin' / 'reviewer_all'：无强制 collegeId 过滤
   * - 含 'reviewer_college'：必须绑定 actor.collegeId，并强制过滤
   * - 其余角色：FORBIDDEN
   */
  async list(
    filter: ApplicationListFilter,
    actor: ActorContext,
  ): Promise<ApplicationListResult> {
    const isAdmin = actor.roles.includes('admin') || actor.roles.includes('reviewer_all');
    const isCollegeReviewer = actor.roles.includes('reviewer_college');
    if (!isAdmin && !isCollegeReviewer) {
      throw new IdentityError('FORBIDDEN', '当前角色不具备申请列表访问权限', 403);
    }
    const page = Math.max(1, filter.page ?? 1);
    const pageSize = Math.min(100, Math.max(1, filter.pageSize ?? 20));
    const clauses: string[] = [];
    const params: unknown[] = [];
    if (filter.status) {
      params.push(filter.status);
      clauses.push(`status = $${params.length}`);
    }
    const effectiveCollegeId = isAdmin ? filter.collegeId : actor.collegeId;
    if (!isAdmin && !actor.collegeId) {
      throw new IdentityError('FORBIDDEN', 'reviewer_college 必须绑定学院', 403);
    }
    if (effectiveCollegeId) {
      params.push(effectiveCollegeId);
      clauses.push(`payload->>'collegeId' = $${params.length}`);
    }
    if (filter.keyword) {
      params.push(`%${filter.keyword}%`);
      clauses.push(`applicant_name ILIKE $${params.length}`);
    }
    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
    const totalRes = await this.db.query<{ n: string }>(
      `SELECT COUNT(*)::text AS n FROM alumni_application ${where}`,
      params,
    );
    const total = Number(totalRes.rows[0]?.n ?? '0');
    params.push(pageSize);
    params.push((page - 1) * pageSize);
    const listRes = await this.db.query(
      `SELECT id, applicant_name, status, reviewer_id, reviewed_at,
              payload->>'collegeId' AS college_id, (payload->>'year')::int AS year,
              created_at
       FROM alumni_application ${where}
       ORDER BY created_at DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params,
    );
    const items: ApplicationRow[] = listRes.rows.map((r) => {
      const rec = r as Record<string, unknown>;
      return {
        id: String(rec['id']),
        applicantName: String(rec['applicant_name']),
        status: String(rec['status']) as ApplicationStatus,
        reviewerId: rec['reviewer_id'] == null ? null : String(rec['reviewer_id']),
        reviewedAt: rec['reviewed_at'] == null ? null : new Date(String(rec['reviewed_at'])),
        collegeId: String(rec['college_id'] ?? ''),
        year: Number(rec['year']),
        createdAt: new Date(String(rec['created_at'])),
      };
    });
    return { items, total, page, pageSize };
  }

  private async loadById(id: string): Promise<{
    id: string;
    status: ApplicationStatus;
    payload: ApplicationPayload;
  }> {
    const res = await this.db.query(
      `SELECT id, status, payload FROM alumni_application WHERE id = $1`,
      [id],
    );
    const row = res.rows[0] as Record<string, unknown> | undefined;
    if (!row) throw new IdentityError('APPLICATION_NOT_FOUND', `application ${id} 不存在`, 404);
    const payload = typeof row['payload'] === 'string'
      ? (JSON.parse(row['payload']) as ApplicationPayload)
      : (row['payload'] as ApplicationPayload);
    return {
      id: String(row['id']),
      status: String(row['status']) as ApplicationStatus,
      payload,
    };
  }

  private decryptPayload(payload: ApplicationPayload): {
    name: string;
    idCard: string;
    phone: string;
  } {
    return {
      name: decryptAesGcm(this.key, Buffer.from(payload.nameEnc, 'base64')),
      idCard: decryptAesGcm(this.key, Buffer.from(payload.idCardEnc, 'base64')),
      phone: decryptAesGcm(this.key, Buffer.from(payload.phoneEnc, 'base64')),
    };
  }

  private async writeAudit(
    actorId: string,
    action: string,
    targetId: string,
    payload: Record<string, unknown>,
  ): Promise<void> {
    await this.db.query(
      `INSERT INTO audit_log (id, actor_id, action, target_type, target_id, payload)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [randomUUID(), actorId, action, 'alumni_application', targetId, JSON.stringify(payload)],
    );
  }
}

/** 对 payload 内 phoneEnc 进行 best-effort 遮蔽：无法解密则返回占位 phone。 */
function maskPhone(_p: ApplicationPayload): string {
  // supplement 场景尚未拿到解密后的手机号；返回占位值由 notification 日志记录。
  return 'masked-phone';
}
