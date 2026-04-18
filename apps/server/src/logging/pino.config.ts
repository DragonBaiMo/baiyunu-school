/**
 * NestJS-Pino LoggerModule 配置：
 * - dev：pino-pretty 彩色输出
 * - prod：JSON 单行（采集友好）
 * - 自动绑定 reqId，过滤 /metrics、/internal/health 噪声
 */

import type { Params } from 'nestjs-pino';

export function buildPinoOptions(env: NodeJS.ProcessEnv = process.env): Params {
  const isProd = env['NODE_ENV'] === 'production';
  const level = env['LOG_LEVEL'] ?? 'info';
  return {
    pinoHttp: {
      name: 'server',
      level,
      autoLogging: {
        ignore: (req) => {
          const url = (req as { url?: string }).url ?? '';
          return url.startsWith('/metrics') || url.startsWith('/internal/health');
        },
      },
      ...(isProd
        ? {}
        : {
            transport: {
              target: 'pino-pretty',
              options: { colorize: true, singleLine: true, translateTime: 'SYS:HH:MM:ss.l' },
            },
          }),
    },
  };
}
