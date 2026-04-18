/**
 * Pino 日志封装：
 * - 开发模式 pretty 输出，生产 JSON
 * - 支持子 logger 传入 traceId / module
 */

import pino, { type Logger } from 'pino';

export type AppLogger = Logger;

export interface LoggerOptions {
  level?: string;
  name?: string;
  pretty?: boolean;
}

export function createLogger(opts: LoggerOptions = {}): AppLogger {
  const level = opts.level ?? process.env.LOG_LEVEL ?? 'info';
  const base = { name: opts.name ?? 'bynu', level };
  // 不使用 pino.transport（thread-stream），避免在 bundled/CJS 环境中找不到 worker 文件。
  // 统一通过同步 stream 写 stdout；生产环境由上游采集 JSON。
  return pino(base, pino.destination({ dest: 1, sync: true }));
}

export const logger = createLogger();
