/**
 * donation 鸣谢墙：公开列表 + 聚合统计。
 * 分页：cursor = 上一条 createdAt 的 ISO；倒序（最新在前）。
 */

import { Inject, Injectable, Optional } from '@nestjs/common';
import type { DbClient } from '@bynu/db';
import {
  DON_DB,
  type DonationWallStats,
  type PublicWallQuery,
  type WallListResult,
} from './types.js';

interface WallEntryDbRow {
  id: string;
  order_id: string;
  display_name: string;
  amount_cents: string | number | bigint;
  created_at: string | Date;
}

@Injectable()
export class DonationWallService {
  constructor(@Optional() @Inject(DON_DB) private readonly db: DbClient) {}

  async listEntries(query: PublicWallQuery): Promise<WallListResult> {
    const limit = query.limit;
    const params: unknown[] = [];
    let where = '';
    if (query.cursor) {
      params.push(query.cursor);
      where = `WHERE created_at < $${params.length}::timestamptz`;
    }
    params.push(limit + 1);
    const limitIdx = params.length;
    const res = await this.db.query(
      `SELECT id, order_id, display_name, amount_cents, created_at
       FROM donation_wall_entry
       ${where}
       ORDER BY created_at DESC, id DESC
       LIMIT $${limitIdx}`,
      params,
    );
    const rows = res.rows as unknown as WallEntryDbRow[];
    const hasMore = rows.length > limit;
    const page = hasMore ? rows.slice(0, limit) : rows;
    const entries = page.map((r) => ({
      id: r.id,
      displayName: r.display_name,
      amountCents: Number(r.amount_cents),
      createdAt: new Date(r.created_at),
    }));
    let nextCursor: string | null = null;
    if (hasMore) {
      const last = entries[entries.length - 1];
      if (last) nextCursor = last.createdAt.toISOString();
    }
    return { entries, cursor: nextCursor };
  }

  async stats(): Promise<DonationWallStats> {
    const totalRes = await this.db.query<{ total: string; cnt: string }>(
      `SELECT COALESCE(SUM(amount_cents),0)::text AS total,
              COUNT(*)::text AS cnt
       FROM donation_wall_entry`,
    );
    const totalCents = Number(totalRes.rows[0]?.total ?? 0);
    const totalCount = Number(totalRes.rows[0]?.cnt ?? 0);

    const recentRes = await this.db.query<{ total: string }>(
      `SELECT COALESCE(SUM(amount_cents),0)::text AS total
       FROM donation_wall_entry
       WHERE created_at >= NOW() - INTERVAL '24 hours'`,
    );
    const recent24hCents = Number(recentRes.rows[0]?.total ?? 0);

    const topRes = await this.db.query<{ display_name: string }>(
      `SELECT display_name
       FROM donation_wall_entry
       ORDER BY amount_cents DESC, created_at DESC
       LIMIT 1`,
    );
    const topDisplayName = topRes.rows[0]?.display_name ?? null;

    return { totalCents, totalCount, recent24hCents, topDisplayName };
  }
}
