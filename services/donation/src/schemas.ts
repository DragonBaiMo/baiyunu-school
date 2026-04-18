/**
 * donation Zod schemas — 捐赠订单 / 退款 / Webhook。
 */

import { z } from 'zod';

export const DonationChannelEnum = z.enum(['wechat', 'alipay', 'mock']);

export const DonationStatusEnum = z.enum(['init', 'paid', 'failed', 'refunded']);

export const CreateDonationSchema = z.object({
  amountCents: z.number().int().min(100).max(10_000_000),
  channel: DonationChannelEnum,
  alumniId: z.string().uuid().optional(),
  message: z.string().max(200).optional(),
  anonymous: z.boolean(),
});

export const RefundDonationSchema = z.object({
  orderId: z.string().min(1),
  reason: z.string().min(1).max(200),
  partialCents: z.number().int().positive().optional(),
});

export const WebhookPayloadSchema = z.object({
  outTradeNo: z.string().min(1).max(80),
  status: z.enum(['paid', 'failed']),
  paidAt: z
    .string()
    .optional()
    .refine((v) => v === undefined || !Number.isNaN(new Date(v).getTime()), {
      message: 'paidAt 需为合法 ISO 日期时间',
    }),
});

export const PublicWallQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(100).default(20),
  cursor: z.string().optional(),
});

export const AdminOrderListQuerySchema = z.object({
  status: DonationStatusEnum.optional(),
  channel: DonationChannelEnum.optional(),
  limit: z.coerce.number().int().positive().max(200).default(50),
  offset: z.coerce.number().int().nonnegative().default(0),
});
