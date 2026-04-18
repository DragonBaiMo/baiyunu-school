/**
 * 活动核心服务：create / update / publish / cancel / close / list / getById
 *
 * 状态机：draft → published → closed（管理员关闭）
 *                         → cancelled（管理员取消，例如恶劣天气）
 * update 仅允许 draft；published/closed/cancelled 均拒绝修改 DSL 等关键字段。
 */

import { randomUUID } from 'node:crypto';
import { Inject, Injectable, Optional } from '@nestjs/common';
import type { DbClient } from '@bynu/db';
import { DslService } from './dsl.service.js';
import { ActivityError } from './errors.js';
import {
  ACT_DB,
  type ActivityDsl,
  type ActivityRow,
  type ActivityStatus,
  type AdminActivityListQuery,
  type CreateActivityInput,
  type PublicActivityListQuery,
  type UpdateActivityInput,
} from './types.js';

interface ActivityDbRow {
  id: string;
  title: string;
  template_id: string | null;
  dsl: unknown;
  quota: number;
  start_at: string | Date;
  end_at: string | Date;
  status: string;
  creator_id: string;
  published_at: string | Date | null;
  closed_at: string | Date | null;
  cancelled_at: string | Date | null;
}

const SELECT_FIELDS = `
  id, title, template_id, dsl, quota, start_at, end_at, status, creator_id,
  published_at, closed_at, cancelled_at
`;

@Injectable()
export class ActivityCoreService {
  constructor(
    @Optional() @Inject(ACT_DB) private readonly db: DbClient,
    private readonly dsl: DslService,
  ) {}

  async create(input: CreateActivityInput): Promise<ActivityRow> {
    const dsl = this.dsl.validateDsl(input.dsl);
    const id = randomUUID();
    await this.db.query(
      `INSERT INTO activity
       (id, title, template_id, dsl, quota, start_at, end_at, status, creator_id)
       VALUES ($1,$2,$3,$4,$5,$6::timestamptz,$7::timestamptz,'draft',$8)`,
      [
        id,
        input.title,
        input.templateId ?? null,
        JSON.stringify(dsl),
        input.quota,
        input.startAt,
        input.endAt,
        input.creatorId,
      ],
    );
    return this.getById(id);
  }

  async update(id: string, input: UpdateActivityInput): Promise<ActivityRow> {
    const current = await this.getById(id);
    if (current.status !== 'draft') {
      throw new ActivityError(
        'ACTIVITY_CLOSED',
        `活动 ${id} 当前状态 ${current.status}，仅 draft 可修改`,
        409,
      );
    }
    const nextTitle = input.title ?? current.title;
    const nextDsl = input.dsl ? this.dsl.validateDsl(input.dsl) : current.dsl;
    const nextQuota = input.quota ?? current.quota;
    const nextStart = input.startAt
      ? new Date(input.startAt).toISOString()
      : current.startAt.toISOString();
    const nextEnd = input.endAt
      ? new Date(input.endAt).toISOString()
      : current.endAt.toISOString();
    await this.db.query(
      `UPDATE activity
       SET title=$2, dsl=$3, quota=$4, start_at=$5::timestamptz, end_at=$6::timestamptz
       WHERE id=$1`,
      [id, nextTitle, JSON.stringify(nextDsl), nextQuota, nextStart, nextEnd],
    );
    return this.getById(id);
  }

  async publish(id: string): Promise<ActivityRow> {
    const current = await this.getById(id);
    if (current.status === 'published') return current;
    if (current.status !== 'draft') {
      throw new ActivityError(
        'ACTIVITY_CLOSED',
        `活动 ${id} 状态 ${current.status} 不可发布`,
        409,
      );
    }
    // 二次校验 DSL（防止旧数据绕过）
    this.dsl.validateDsl(current.dsl);
    await this.db.query(
      `UPDATE activity
       SET status='published', published_at=NOW()
       WHERE id=$1`,
      [id],
    );
    return this.getById(id);
  }

  async cancel(id: string): Promise<ActivityRow> {
    const current = await this.getById(id);
    if (current.status === 'cancelled') return current;
    if (current.status === 'closed') {
      throw new ActivityError(
        'ACTIVITY_CLOSED',
        `活动 ${id} 已关闭，不可取消`,
        409,
      );
    }
    await this.db.query(
      `UPDATE activity
       SET status='cancelled', cancelled_at=NOW()
       WHERE id=$1`,
      [id],
    );
    return this.getById(id);
  }

  async close(id: string): Promise<ActivityRow> {
    const current = await this.getById(id);
    if (current.status === 'closed') return current;
    if (current.status !== 'published') {
      throw new ActivityError(
        'ACTIVITY_CLOSED',
        `活动 ${id} 状态 ${current.status} 不可关闭`,
        409,
      );
    }
    await this.db.query(
      `UPDATE activity
       SET status='closed', closed_at=NOW()
       WHERE id=$1`,
      [id],
    );
    return this.getById(id);
  }

  async listPublic(query: PublicActivityListQuery): Promise<ActivityRow[]> {
    const res = await this.db.query(
      `SELECT ${SELECT_FIELDS}
       FROM activity
       WHERE status = 'published'
       ORDER BY start_at ASC
       LIMIT $1 OFFSET $2`,
      [query.limit, query.offset],
    );
    return (res.rows as unknown as ActivityDbRow[]).map(toActivityRow);
  }

  async listAdmin(query: AdminActivityListQuery): Promise<ActivityRow[]> {
    const params: unknown[] = [];
    const clauses: string[] = [];
    if (query.status) {
      params.push(query.status);
      clauses.push(`status = $${params.length}`);
    }
    params.push(query.limit);
    const limitIdx = params.length;
    params.push(query.offset);
    const offsetIdx = params.length;
    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
    const res = await this.db.query(
      `SELECT ${SELECT_FIELDS}
       FROM activity
       ${where}
       ORDER BY start_at DESC
       LIMIT $${limitIdx} OFFSET $${offsetIdx}`,
      params,
    );
    return (res.rows as unknown as ActivityDbRow[]).map(toActivityRow);
  }

  async getById(
    id: string,
    opts: { includeDsl?: boolean } = {},
  ): Promise<ActivityRow> {
    const res = await this.db.query(
      `SELECT ${SELECT_FIELDS} FROM activity WHERE id = $1`,
      [id],
    );
    const row = res.rows[0] as ActivityDbRow | undefined;
    if (!row) {
      throw new ActivityError(
        'ACTIVITY_NOT_FOUND',
        `活动 ${id} 不存在`,
        404,
      );
    }
    const full = toActivityRow(row);
    if (opts.includeDsl === false) {
      return {
        ...full,
        dsl: { steps: [], formFields: [] } satisfies ActivityDsl,
      };
    }
    return full;
  }
}

function toActivityRow(row: ActivityDbRow): ActivityRow {
  const rawDsl = row.dsl;
  const dsl =
    typeof rawDsl === 'string'
      ? (JSON.parse(rawDsl) as ActivityDsl)
      : (rawDsl as ActivityDsl);
  return {
    id: row.id,
    title: row.title,
    templateId: row.template_id,
    dsl,
    quota: Number(row.quota),
    startAt: new Date(row.start_at),
    endAt: new Date(row.end_at),
    status: row.status as ActivityStatus,
    creatorId: row.creator_id,
    publishedAt: row.published_at ? new Date(row.published_at) : null,
    closedAt: row.closed_at ? new Date(row.closed_at) : null,
    cancelledAt: row.cancelled_at ? new Date(row.cancelled_at) : null,
  };
}
