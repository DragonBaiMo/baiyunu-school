/**
 * 返校预约服务：
 * - listAvailableSlots(serviceType, dateRange)：枚举时段 × 日期，读 reservation 表计算剩余
 * - create：UNIQUE 触发抛 SLOT_CONFLICT；分配 qr_ticket=uuid
 * - cancel：仅 owner 可撤销
 * - listByAlumni：按日期升序
 */

import { randomUUID } from 'node:crypto';
import { Inject, Injectable, Optional } from '@nestjs/common';
import type { DbClient } from '@bynu/db';
import { WorkflowError } from './errors.js';
import {
  WF_DB,
  WF_DEFAULT_CAPACITY,
  WF_DEFAULT_SLOTS,
  type CreateReservationInput,
  type ListSlotsQuery,
  type ReservationRow,
  type ServiceType,
  type SlotAvailability,
} from './types.js';

interface ReservationDbRow {
  id: string;
  alumni_id: string;
  service_type: string;
  slot_date: string | Date;
  slot_time: string;
  companions: unknown;
  status: string;
  qr_ticket: string;
}

@Injectable()
export class ReservationService {
  constructor(@Optional() @Inject(WF_DB) private readonly db: DbClient) {}

  async listAvailableSlots(query: ListSlotsQuery): Promise<SlotAvailability[]> {
    const start = new Date(`${query.startDate}T00:00:00Z`);
    const end = new Date(`${query.endDate}T00:00:00Z`);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      throw new WorkflowError(
        'SLOT_NOT_AVAILABLE',
        '日期范围非法',
        400,
      );
    }
    if (end.getTime() < start.getTime()) {
      return [];
    }
    const dates: string[] = [];
    for (
      let d = new Date(start);
      d.getTime() <= end.getTime();
      d.setUTCDate(d.getUTCDate() + 1)
    ) {
      dates.push(d.toISOString().slice(0, 10));
    }
    const res = await this.db.query<{
      slot_date: string | Date;
      slot_time: string;
      n: string;
    }>(
      `SELECT slot_date, slot_time, COUNT(*)::text AS n
       FROM reservation
       WHERE service_type = $1
         AND slot_date >= $2::date
         AND slot_date <= $3::date
         AND status <> 'cancelled'
       GROUP BY slot_date, slot_time`,
      [query.serviceType, query.startDate, query.endDate],
    );
    const usage = new Map<string, number>();
    for (const row of res.rows) {
      const key = `${normalizeDate(row.slot_date)}|${row.slot_time}`;
      usage.set(key, Number(row.n));
    }
    const items: SlotAvailability[] = [];
    for (const date of dates) {
      for (const time of WF_DEFAULT_SLOTS) {
        const used = usage.get(`${date}|${time}`) ?? 0;
        items.push({
          serviceType: query.serviceType,
          slotDate: date,
          slotTime: time,
          capacity: WF_DEFAULT_CAPACITY,
          remaining: Math.max(0, WF_DEFAULT_CAPACITY - used),
        });
      }
    }
    return items;
  }

  async create(input: CreateReservationInput): Promise<ReservationRow> {
    const id = randomUUID();
    const qrTicket = randomUUID();
    // 容量校验
    const cntRes = await this.db.query<{ n: string }>(
      `SELECT COUNT(*)::text AS n FROM reservation
       WHERE service_type = $1 AND slot_date = $2::date AND slot_time = $3
         AND status <> 'cancelled'`,
      [input.serviceType, input.slotDate, input.slotTime],
    );
    const used = Number(cntRes.rows[0]?.n ?? 0);
    if (used >= WF_DEFAULT_CAPACITY) {
      throw new WorkflowError(
        'SLOT_NOT_AVAILABLE',
        `时段 ${input.slotDate} ${input.slotTime} 已满`,
        409,
      );
    }
    try {
      await this.db.query(
        `INSERT INTO reservation
         (id, alumni_id, service_type, slot_date, slot_time, companions, status, qr_ticket)
         VALUES ($1,$2,$3,$4::date,$5,$6,'pending',$7)`,
        [
          id,
          input.alumniId,
          input.serviceType,
          input.slotDate,
          input.slotTime,
          JSON.stringify(input.companions),
          qrTicket,
        ],
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (/unique|duplicate/i.test(msg)) {
        throw new WorkflowError(
          'SLOT_CONFLICT',
          `${input.alumniId} 已在该时段有预约`,
          409,
        );
      }
      throw err;
    }
    return this.getById(id);
  }

  async cancel(reservationId: string, alumniId: string): Promise<ReservationRow> {
    const current = await this.getById(reservationId);
    if (current.alumniId !== alumniId) {
      throw new WorkflowError(
        'NOT_OWNER',
        `仅预约发起人可取消`,
        403,
      );
    }
    await this.db.query(
      `UPDATE reservation SET status = 'cancelled' WHERE id = $1`,
      [reservationId],
    );
    return this.getById(reservationId);
  }

  async listByAlumni(alumniId: string): Promise<ReservationRow[]> {
    const res = await this.db.query(
      `SELECT id, alumni_id, service_type, slot_date, slot_time, companions, status, qr_ticket
       FROM reservation WHERE alumni_id = $1
       ORDER BY slot_date ASC, slot_time ASC`,
      [alumniId],
    );
    return (res.rows as unknown as ReservationDbRow[]).map(toReservationRow);
  }

  async getById(id: string): Promise<ReservationRow> {
    const res = await this.db.query(
      `SELECT id, alumni_id, service_type, slot_date, slot_time, companions, status, qr_ticket
       FROM reservation WHERE id = $1`,
      [id],
    );
    const row = res.rows[0] as ReservationDbRow | undefined;
    if (!row) {
      throw new WorkflowError(
        'RESERVATION_NOT_FOUND',
        `预约 ${id} 不存在`,
        404,
      );
    }
    return toReservationRow(row);
  }
}

function normalizeDate(d: string | Date): string {
  if (d instanceof Date) return d.toISOString().slice(0, 10);
  return d.slice(0, 10);
}

function toReservationRow(row: ReservationDbRow): ReservationRow {
  const rawCompanions = row.companions;
  const companions =
    typeof rawCompanions === 'string'
      ? (JSON.parse(rawCompanions) as ReservationRow['companions'])
      : ((rawCompanions as ReservationRow['companions']) ?? []);
  return {
    id: row.id,
    alumniId: row.alumni_id,
    serviceType: row.service_type as ServiceType,
    slotDate: normalizeDate(row.slot_date),
    slotTime: row.slot_time,
    companions,
    status: row.status as ReservationRow['status'],
    qrTicket: row.qr_ticket,
  };
}
