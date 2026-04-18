/**
 * 建表脚本执行器。幂等：所有 CREATE TABLE 均带 IF NOT EXISTS。
 * dev/test 场景可在服务启动或测试前直接调用以获取可用 schema。
 */

import type { DbClient } from './client.js';
import { MIGRATION_SQL } from './migrations.js';

export async function ensureMigrated(db: DbClient): Promise<void> {
  const statements = MIGRATION_SQL.split(/;\s*\n/).filter((s) => s.trim().length > 0);
  for (const stmt of statements) {
    await db.query(stmt);
  }
}
