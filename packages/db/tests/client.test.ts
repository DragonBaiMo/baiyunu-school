import { describe, it, expect } from 'vitest';
import { createDbClient, dbHealth } from '../src/client.js';
import { MIGRATION_SQL } from '../src/migrations.js';

describe('@bynu/db · client (pglite in-memory)', () => {
  it('SELECT 1 与 dbHealth 正常', async () => {
    const db = createDbClient('pglite:memory://');
    const res = await db.query<{ ok: number }>('SELECT 1 AS ok');
    expect(res.rows[0]?.['ok']).toBe(1);
    expect(await dbHealth(db)).toBe('ok');
    await db.close();
  });

  it('迁移 SQL 可在 pglite 中执行', async () => {
    const db = createDbClient('pglite:memory://');
    const stmts = MIGRATION_SQL.split(/;\s*\n/).filter((s) => s.trim().length > 0);
    for (const stmt of stmts) {
      await db.query(stmt);
    }
    const { rows } = await db.query<{ n: string }>(
      "SELECT COUNT(*)::text AS n FROM alumni_profile",
    );
    expect(rows[0]?.['n']).toBe('0');
    await db.close();
  });
});
