/**
 * Zod 请求/响应 schema，供 controller 手动校验与 contracts 包复用。
 */

import { z } from 'zod';

export const SubmitApplicationSchema = z.object({
  name: z.string().min(1).max(64),
  idCard: z.string().regex(/^\d{17}[\dXx]$/),
  phone: z.string().regex(/^\d{11}$/),
  year: z.number().int().min(1950).max(2100),
  collegeId: z.string().min(1),
  deptId: z.string().min(1),
  classId: z.string().min(1),
  evidenceUrls: z.array(z.string().url()).max(10),
});

export const SupplementBodySchema = z.object({
  note: z.string().min(1).max(500),
});

export const RejectBodySchema = z.object({
  reason: z.string().min(1).max(200),
});

export const ListQuerySchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected', 'supplement']).optional(),
  collegeId: z.string().optional(),
  keyword: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
});

export const VerifyQrBodySchema = z.object({
  code: z.string().min(1),
});

export const RotateQrBodySchema = z.object({
  nowSec: z.number().int().optional(),
});
