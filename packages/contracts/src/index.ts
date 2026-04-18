/**
 * contracts 包入口：
 * - Zod schema（运行时校验）
 * - generated/ 由 `pnpm gen:api` 产出 TS 类型
 */

import { z } from 'zod';

export const DepStatusSchema = z.enum(['ok', 'fail']);
export type DepStatus = z.infer<typeof DepStatusSchema>;

export const HealthResponseSchema = z.object({
  status: z.enum(['ok', 'degraded', 'fail']),
  deps: z.object({
    db: DepStatusSchema,
    cache: DepStatusSchema,
  }),
  version: z.string(),
});
export type HealthResponse = z.infer<typeof HealthResponseSchema>;

export const ProblemDetailsSchema = z.object({
  type: z.string(),
  title: z.string(),
  status: z.number().int(),
  detail: z.string().optional(),
  instance: z.string().optional(),
  traceId: z.string().optional(),
  errors: z
    .array(z.object({ field: z.string(), code: z.string() }))
    .optional(),
});
export type ProblemDetails = z.infer<typeof ProblemDetailsSchema>;
