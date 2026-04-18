/**
 * donation 共享类型 + DI token。
 */

import type { z } from 'zod';
import type {
  AdminOrderListQuerySchema,
  CreateDonationSchema,
  DonationChannelEnum,
  DonationStatusEnum,
  PublicWallQuerySchema,
  RefundDonationSchema,
  WebhookPayloadSchema,
} from './schemas.js';

export const DON_DB = Symbol.for('bynu.donation.db');
export const DON_HMAC_SALT = Symbol.for('bynu.donation.hmac-salt');
export const DON_PAYMENT_PORT = Symbol.for('bynu.donation.payment-port');

export type DonationChannel = z.infer<typeof DonationChannelEnum>;
export type DonationStatus = z.infer<typeof DonationStatusEnum>;
export type CreateDonationInput = z.infer<typeof CreateDonationSchema>;
export type RefundDonationInput = z.infer<typeof RefundDonationSchema>;
export type WebhookPayload = z.infer<typeof WebhookPayloadSchema>;
export type PublicWallQuery = z.infer<typeof PublicWallQuerySchema>;
export type AdminOrderListQuery = z.infer<typeof AdminOrderListQuerySchema>;

export interface DonationOrderRow {
  id: string;
  alumniId: string | null;
  amountCents: number;
  channel: DonationChannel;
  status: DonationStatus;
  outTradeNo: string;
  paidAt: Date | null;
  message: string | null;
  anonymous: boolean;
  createdAt: Date;
}

export interface DonationWallEntryRow {
  id: string;
  orderId: string;
  displayName: string;
  amountCents: number;
  createdAt: Date;
}

export interface DonationWallStats {
  totalCents: number;
  totalCount: number;
  recent24hCents: number;
  topDisplayName: string | null;
}

export interface CreateOrderResult {
  order: DonationOrderRow;
  payUrl: string;
  providerRef: string;
}

export interface WallListResult {
  entries: Array<{
    id: string;
    displayName: string;
    amountCents: number;
    createdAt: Date;
  }>;
  cursor: string | null;
}
