/**
 * 种子脚本：
 * 1. 读取 DATABASE_URL（默认 pglite:./.data/pg）
 * 2. 执行建表 SQL
 * 3. 注入 5 位合成校友（姓名/身份证/手机号 均为 AES-256-GCM 加密后落库）
 */

import { randomUUID } from 'node:crypto';
import { buildSyntheticAlumni } from '@bynu/test-utils';
import { createDbClient } from './client.js';
import { MIGRATION_SQL } from './migrations.js';
import { encryptAesGcm, parseKey, sha256 } from './crypto.js';

const DATABASE_URL = process.env['DATABASE_URL'] ?? 'pglite:./.data/pg';
const ENCRYPTION_KEY = process.env['ENCRYPTION_KEY'] ??
  '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';

async function main(): Promise<void> {
  console.log(`[seed] DATABASE_URL=${DATABASE_URL}`);
  const db = createDbClient(DATABASE_URL);
  const key = parseKey(ENCRYPTION_KEY);

  console.log('[seed] 执行建表 DDL...');
  // pglite 当前版本对多语句支持良好；逐条切割以兼容性更强
  const statements = MIGRATION_SQL.split(/;\s*\n/).filter((s) => s.trim().length > 0);
  for (const stmt of statements) {
    await db.query(stmt);
  }

  console.log('[seed] 清空 alumni_profile 并注入 5 位合成校友...');
  await db.query('DELETE FROM alumni_profile');

  const alumni = buildSyntheticAlumni(5);
  for (const a of alumni) {
    const id = randomUUID();
    const userId = `u-${id.slice(0, 8)}`;
    await db.query(
      `INSERT INTO alumni_profile
       (id, user_id, name_enc, name_pinyin, id_card_enc, id_card_hash, phone_enc,
        year, college_id, dept_id, class_id, avatar_url, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
      [
        id,
        userId,
        encryptAesGcm(key, a.name),
        a.name,
        encryptAesGcm(key, a.idCard),
        sha256(a.idCard, 'bynu-salt'),
        encryptAesGcm(key, a.phone),
        a.year,
        a.collegeId,
        a.deptId,
        a.classId,
        null,
        'active',
      ],
    );
  }

  const { rows } = await db.query<{ n: string }>('SELECT COUNT(*)::text AS n FROM alumni_profile');
  console.log(`[seed] 完成。alumni_profile 当前 ${rows[0]?.n ?? '?'} 行。`);
  await db.close();
}

main().catch((err: unknown) => {
  console.error('[seed] 失败：', err);
  process.exit(1);
});
