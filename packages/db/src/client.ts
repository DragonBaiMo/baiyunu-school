/**
 * 数据库客户端工厂。
 * - `pglite:<path>` → 使用 @electric-sql/pglite 的文件持久化模式（dev 默认）
 * - `postgres://` / `postgresql://` → node-postgres pg.Client（生产）
 *
 * 对外只暴露 `query(sql, params)` 以解耦具体实现。
 */

import { mkdirSync } from 'node:fs';
import { dirname, isAbsolute, resolve } from 'node:path';
import { PGlite } from '@electric-sql/pglite';
import pg from 'pg';

export interface DbClient {
  query<R extends Record<string, unknown> = Record<string, unknown>>(
    sql: string,
    params?: readonly unknown[],
  ): Promise<{ rows: R[]; rowCount: number }>;
  close(): Promise<void>;
  readonly kind: 'pglite' | 'pg';
}

function createPgliteClient(path: string): DbClient {
  // 支持 `memory://` 纯内存模式（测试用），其余视为磁盘路径
  let ctorArg: string;
  if (path === '' || path === 'memory://' || path.startsWith('memory:')) {
    ctorArg = 'memory://';
  } else {
    // 规范化为绝对路径；递归创建父目录避免 pglite mkdirSync 非递归失败
    const absPath = isAbsolute(path) ? path : resolve(process.cwd(), path);
    try {
      mkdirSync(dirname(absPath), { recursive: true });
      mkdirSync(absPath, { recursive: true });
    } catch {
      /* 已存在则忽略 */
    }
    ctorArg = absPath;
  }
  const pglite = new PGlite(ctorArg);
  return {
    kind: 'pglite',
    async query(sql, params) {
      const res = await pglite.query(sql, params ? [...params] : undefined);
      return {
        rows: res.rows as unknown as Record<string, unknown>[],
        rowCount: res.rows.length,
      } as { rows: never[]; rowCount: number };
    },
    async close() {
      await pglite.close();
    },
  };
}

function createPgClient(url: string): DbClient {
  const client = new pg.Client({ connectionString: url });
  let connected = false;
  return {
    kind: 'pg',
    async query(sql, params) {
      if (!connected) {
        await client.connect();
        connected = true;
      }
      const res = await client.query(sql, params ? [...params] : undefined);
      return {
        rows: res.rows as Record<string, unknown>[],
        rowCount: res.rowCount ?? res.rows.length,
      } as { rows: never[]; rowCount: number };
    },
    async close() {
      if (connected) await client.end();
    },
  };
}

export function createDbClient(url: string): DbClient {
  if (url.startsWith('pglite:')) {
    const p = url.slice('pglite:'.length);
    return createPgliteClient(p);
  }
  if (url.startsWith('postgres://') || url.startsWith('postgresql://')) {
    return createPgClient(url);
  }
  throw new Error(`[db] 未知的 DATABASE_URL 方案：${url}`);
}

export async function dbHealth(client: DbClient): Promise<'ok' | 'fail'> {
  try {
    const res = await client.query<{ ok: number }>('SELECT 1 AS ok');
    return res.rows[0]?.['ok'] === 1 ? 'ok' : 'fail';
  } catch {
    return 'fail';
  }
}

let _singleton: DbClient | undefined;

/**
 * 获取进程级 DbClient 单例（基于首次传入的 url）。
 * - 默认读取 `process.env.DATABASE_URL`；否则回退到 pglite:./.data/pg
 * - 多模块共享同一连接，保证 pglite 内存数据一致
 */
export function getDbSingleton(url?: string): DbClient {
  if (!_singleton) {
    const effective = url ?? process.env['DATABASE_URL'] ?? 'pglite:./.data/pg';
    _singleton = createDbClient(effective);
  }
  return _singleton;
}

/** 仅用于测试：清除单例引用（不会自动关闭，调用方自理）。 */
export function resetDbSingleton(): void {
  _singleton = undefined;
}

