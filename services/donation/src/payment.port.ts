/**
 * 支付端口抽象 + Mock 实现（内存）。
 *
 * verifyWebhook：
 *   headers['x-mock-signature'] = hex(HMAC-SHA256(salt, rawBody))
 *   使用 timingSafeEqual 防时序攻击。
 */

import { createHmac, timingSafeEqual } from 'node:crypto';
import type { DonationChannel, WebhookPayload } from './types.js';

export interface PaymentCreateOrderInput {
  outTradeNo: string;
  amount: number; // cents
  channel: DonationChannel;
  meta?: Record<string, unknown>;
}

export interface PaymentCreateOrderResult {
  payUrl: string;
  providerRef: string;
}

export type PaymentQueryStatus = 'init' | 'paid' | 'failed' | 'refunded';

export interface PaymentQueryResult {
  outTradeNo: string;
  status: PaymentQueryStatus;
  paidAt?: Date | null;
}

export interface PaymentRefundResult {
  outTradeNo: string;
  refundAmount: number;
  success: boolean;
}

export interface WebhookVerifyResult {
  valid: boolean;
  payload?: WebhookPayload;
  reason?: string;
}

export interface IPaymentPort {
  createOrder(input: PaymentCreateOrderInput): Promise<PaymentCreateOrderResult>;
  queryOrder(outTradeNo: string): Promise<PaymentQueryResult | null>;
  refund(outTradeNo: string, amount: number): Promise<PaymentRefundResult>;
  verifyWebhook(
    headers: Record<string, unknown>,
    rawBody: string,
  ): Promise<WebhookVerifyResult>;
}

interface MockOrderState {
  outTradeNo: string;
  amount: number;
  channel: DonationChannel;
  status: PaymentQueryStatus;
  paidAt: Date | null;
  refundedAmount: number;
}

/**
 * 内存 Mock 支付端口：
 *  - createOrder：生成 `mock://pay/{outTradeNo}`，状态 init
 *  - queryOrder：返回内存态
 *  - refund：仅 paid 可退；不超过已支付金额
 *  - verifyWebhook：比较 `x-mock-signature` 头与 HMAC(salt, rawBody)
 */
export class MockPaymentPort implements IPaymentPort {
  private readonly store = new Map<string, MockOrderState>();

  constructor(private readonly hmacSalt: string) {}

  async createOrder(
    input: PaymentCreateOrderInput,
  ): Promise<PaymentCreateOrderResult> {
    this.store.set(input.outTradeNo, {
      outTradeNo: input.outTradeNo,
      amount: input.amount,
      channel: input.channel,
      status: 'init',
      paidAt: null,
      refundedAmount: 0,
    });
    return {
      payUrl: `mock://pay/${input.outTradeNo}`,
      providerRef: `mock-${input.outTradeNo}`,
    };
  }

  async queryOrder(outTradeNo: string): Promise<PaymentQueryResult | null> {
    const s = this.store.get(outTradeNo);
    if (!s) return null;
    return { outTradeNo, status: s.status, paidAt: s.paidAt };
  }

  async refund(
    outTradeNo: string,
    amount: number,
  ): Promise<PaymentRefundResult> {
    const s = this.store.get(outTradeNo);
    if (!s) return { outTradeNo, refundAmount: 0, success: false };
    s.refundedAmount += amount;
    s.status = 'refunded';
    return { outTradeNo, refundAmount: amount, success: true };
  }

  async verifyWebhook(
    headers: Record<string, unknown>,
    rawBody: string,
  ): Promise<WebhookVerifyResult> {
    const sigHeader = headers['x-mock-signature'];
    if (typeof sigHeader !== 'string' || sigHeader.length === 0) {
      return { valid: false, reason: '缺少 x-mock-signature' };
    }
    const expected = createHmac('sha256', this.hmacSalt)
      .update(rawBody, 'utf8')
      .digest('hex');
    const a = Buffer.from(sigHeader, 'utf8');
    const b = Buffer.from(expected, 'utf8');
    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      return { valid: false, reason: '签名不匹配' };
    }
    let parsed: unknown;
    try {
      parsed = JSON.parse(rawBody);
    } catch {
      return { valid: false, reason: 'body 非合法 JSON' };
    }
    if (!parsed || typeof parsed !== 'object') {
      return { valid: false, reason: 'body 非对象' };
    }
    const obj = parsed as Record<string, unknown>;
    const outTradeNo = typeof obj['outTradeNo'] === 'string' ? obj['outTradeNo'] : '';
    const status = obj['status'];
    if (!outTradeNo || (status !== 'paid' && status !== 'failed')) {
      return { valid: false, reason: 'payload 字段非法' };
    }
    const payload: WebhookPayload = {
      outTradeNo,
      status,
      paidAt: typeof obj['paidAt'] === 'string' ? (obj['paidAt'] as string) : undefined,
    };
    return { valid: true, payload };
  }

  /** 测试辅助：构造一个合法签名。 */
  signBody(rawBody: string): string {
    return createHmac('sha256', this.hmacSalt)
      .update(rawBody, 'utf8')
      .digest('hex');
  }
}
