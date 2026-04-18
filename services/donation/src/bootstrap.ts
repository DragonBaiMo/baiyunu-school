/**
 * donation 表补列 + 启动幂等初始化。
 */

import type { DbClient } from '@bynu/db';

export async function ensureDonationColumns(db: DbClient): Promise<void> {
  // 主表兜底（若迁移已建则忽略）
  await db.query(`
    CREATE TABLE IF NOT EXISTS donation_order (
      id TEXT PRIMARY KEY,
      alumni_id TEXT,
      amount_cents BIGINT NOT NULL,
      channel TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'init',
      out_trade_no TEXT UNIQUE NOT NULL,
      paid_at TIMESTAMPTZ,
      message TEXT,
      anonymous BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  await db.query(
    `ALTER TABLE donation_order ADD COLUMN IF NOT EXISTS message TEXT`,
  );
  await db.query(
    `ALTER TABLE donation_order ADD COLUMN IF NOT EXISTS anonymous BOOLEAN NOT NULL DEFAULT FALSE`,
  );
  await db.query(
    `ALTER TABLE donation_order ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`,
  );
  await db.query(
    `ALTER TABLE donation_order ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ`,
  );

  await db.query(`
    CREATE TABLE IF NOT EXISTS donation_wall_entry (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL,
      display_name TEXT NOT NULL,
      amount_cents BIGINT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  await db.query(
    `ALTER TABLE donation_wall_entry ADD COLUMN IF NOT EXISTS display_name TEXT`,
  );
  await db.query(
    `ALTER TABLE donation_wall_entry ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`,
  );
}
