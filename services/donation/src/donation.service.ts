/**
 * donation 核心服务：
 *   - createOrder：生成 outTradeNo，INSERT status=init，调用 IPaymentPort.createOrder → payUrl
 *   - handleWebhook：verifyWebhook → 事务内 UPDATE status=paid + INSERT donation_wall_entry
 *   - refund：paid 订单可退；支持 partialCents；事务内更新
 *   - getOrder / listOrders
 *
 * 非匿名订单：displayName 从 alumni_profile.name_pinyin 派生（取姓氏+"同学"），
 * 若找不到则回退 "**同学"。匿名订单：displayName='好心人'。
 */

import { randomBytes, randomUUID } from 'node:crypto';
import { Inject, Injectable, Optional } from '@nestjs/common';
import type { DbClient } from '@bynu/db';
import { DonationError } from './errors.js';
import type { IPaymentPort } from './payment.port.js';
import {
  DON_DB,
  DON_PAYMENT_PORT,
  type AdminOrderListQuery,
  type CreateDonationInput,
  type CreateOrderResult,
  type DonationChannel,
  type DonationOrderRow,
  type DonationStatus,
  type RefundDonationInput,
} from './types.js';

interface OrderDbRow {
  id: string;
  alumni_id: string | null;
  amount_cents: string | number | bigint;
  channel: string;
  status: string;
  out_trade_no: string;
  paid_at: string | Date | null;
  message: string | null;
  anonymous: boolean;
  created_at: string | Date;
}

const ORDER_FIELDS = `
  id, alumni_id, amount_cents, channel, status, out_trade_no,
  paid_at, message, anonymous, created_at
`;

@Injectable()
export class DonationCoreService {
  constructor(
    @Optional() @Inject(DON_DB) private readonly db: DbClient,
    @Optional() @Inject(DON_PAYMENT_PORT) private readonly payment: IPaymentPort,
  ) {}

  async createOrder(input: CreateDonationInput): Promise<CreateOrderResult> {
    if (input.amountCents < 100) {
      throw new DonationError(
        'INVALID_AMOUNT',
        `金额 ${input.amountCents} 低于最小值 100 分`,
        400,
      );
    }
    const outTradeNo = `DN${Date.now()}${randomBytes(3).toString('hex')}`.toUpperCase();
    const id = randomUUID();
    await this.db.query(
      `INSERT INTO donation_order
       (id, alumni_id, amount_cents, channel, status, out_trade_no, message, anonymous)
       VALUES ($1,$2,$3,$4,'init',$5,$6,$7)`,
      [
        id,
        input.alumniId ?? null,
        input.amountCents,
        input.channel,
        outTradeNo,
        input.message ?? null,
        input.anonymous,
      ],
    );
    const provider = await this.payment.createOrder({
      outTradeNo,
      amount: input.amountCents,
      channel: input.channel,
      meta: { alumniId: input.alumniId, anonymous: input.anonymous },
    });
    const order = await this.getOrder(outTradeNo);
    return { order, payUrl: provider.payUrl, providerRef: provider.providerRef };
  }

  async handleWebhook(
    headers: Record<string, unknown>,
    rawBody: string,
  ): Promise<{ order: DonationOrderRow; walled: boolean }> {
    const verify = await this.payment.verifyWebhook(headers, rawBody);
    if (!verify.valid || !verify.payload) {
      throw new DonationError(
        'INVALID_WEBHOOK',
        `webhook 校验失败：${verify.reason ?? '未知'}`,
        401,
      );
    }
    const payload = verify.payload;
    const order = await this.getOrderOrNull(payload.outTradeNo);
    if (!order) {
      throw new DonationError(
        'ORDER_NOT_FOUND',
        `订单 ${payload.outTradeNo} 不存在`,
        404,
      );
    }
    if (order.status === 'paid' || order.status === 'refunded') {
      throw new DonationError(
        'ORDER_ALREADY_PAID',
        `订单 ${payload.outTradeNo} 已处于 ${order.status} 状态`,
        409,
      );
    }
    if (payload.status === 'failed') {
      await this.db.query(
        `UPDATE donation_order SET status='failed' WHERE out_trade_no=$1`,
        [payload.outTradeNo],
      );
      return { order: await this.getOrder(payload.outTradeNo), walled: false };
    }

    const displayName = await this.resolveDisplayName(order);
    const paidAtIso = payload.paidAt ?? new Date().toISOString();

    await this.db.query('BEGIN');
    try {
      await this.db.query(
        `UPDATE donation_order
         SET status='paid', paid_at=$2::timestamptz
         WHERE out_trade_no=$1 AND status='init'`,
        [payload.outTradeNo, paidAtIso],
      );
      await this.db.query(
        `INSERT INTO donation_wall_entry
         (id, order_id, display_name, amount_cents)
         VALUES ($1,$2,$3,$4)`,
        [randomUUID(), order.id, displayName, order.amountCents],
      );
      await this.db.query('COMMIT');
    } catch (err) {
      await this.db.query('ROLLBACK');
      throw err;
    }
    return { order: await this.getOrder(payload.outTradeNo), walled: true };
  }

  async refund(input: RefundDonationInput): Promise<DonationOrderRow> {
    const order = await this.getOrderByIdOrNull(input.orderId);
    if (!order) {
      throw new DonationError(
        'ORDER_NOT_FOUND',
        `订单 ${input.orderId} 不存在`,
        404,
      );
    }
    if (order.status !== 'paid') {
      throw new DonationError(
        'ORDER_NOT_PAID',
        `订单 ${input.orderId} 当前状态 ${order.status}，不可退款`,
        409,
      );
    }
    const refundAmount = input.partialCents ?? order.amountCents;
    if (refundAmount <= 0) {
      throw new DonationError(
        'INVALID_AMOUNT',
        `退款金额 ${refundAmount} 非法`,
        400,
      );
    }
    if (refundAmount > order.amountCents) {
      throw new DonationError(
        'REFUND_EXCEEDS_PAID',
        `退款金额 ${refundAmount} 超过订单金额 ${order.amountCents}`,
        409,
      );
    }
    const r = await this.payment.refund(order.outTradeNo, refundAmount);
    if (!r.success) {
      throw new DonationError(
        'INVALID_WEBHOOK',
        `支付端口退款失败：${order.outTradeNo}`,
        502,
      );
    }
    await this.db.query('BEGIN');
    try {
      await this.db.query(
        `UPDATE donation_order SET status='refunded' WHERE id=$1 AND status='paid'`,
        [order.id],
      );
      await this.db.query('COMMIT');
    } catch (err) {
      await this.db.query('ROLLBACK');
      throw err;
    }
    return this.getOrderByIdOrThrow(order.id);
  }

  async getOrder(outTradeNo: string): Promise<DonationOrderRow> {
    const row = await this.getOrderOrNull(outTradeNo);
    if (!row) {
      throw new DonationError(
        'ORDER_NOT_FOUND',
        `订单 ${outTradeNo} 不存在`,
        404,
      );
    }
    return row;
  }

  async listOrders(query: AdminOrderListQuery): Promise<DonationOrderRow[]> {
    const params: unknown[] = [];
    const clauses: string[] = [];
    if (query.status) {
      params.push(query.status);
      clauses.push(`status = $${params.length}`);
    }
    if (query.channel) {
      params.push(query.channel);
      clauses.push(`channel = $${params.length}`);
    }
    params.push(query.limit);
    const limitIdx = params.length;
    params.push(query.offset);
    const offsetIdx = params.length;
    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
    const res = await this.db.query(
      `SELECT ${ORDER_FIELDS}
       FROM donation_order
       ${where}
       ORDER BY created_at DESC
       LIMIT $${limitIdx} OFFSET $${offsetIdx}`,
      params,
    );
    return (res.rows as unknown as OrderDbRow[]).map(toOrderRow);
  }

  private async getOrderOrNull(
    outTradeNo: string,
  ): Promise<DonationOrderRow | null> {
    const res = await this.db.query(
      `SELECT ${ORDER_FIELDS} FROM donation_order WHERE out_trade_no=$1`,
      [outTradeNo],
    );
    const row = res.rows[0] as OrderDbRow | undefined;
    return row ? toOrderRow(row) : null;
  }

  private async getOrderByIdOrNull(
    id: string,
  ): Promise<DonationOrderRow | null> {
    const res = await this.db.query(
      `SELECT ${ORDER_FIELDS} FROM donation_order WHERE id=$1`,
      [id],
    );
    const row = res.rows[0] as OrderDbRow | undefined;
    return row ? toOrderRow(row) : null;
  }

  private async getOrderByIdOrThrow(id: string): Promise<DonationOrderRow> {
    const o = await this.getOrderByIdOrNull(id);
    if (!o) {
      throw new DonationError('ORDER_NOT_FOUND', `订单 ${id} 不存在`, 404);
    }
    return o;
  }

  private async resolveDisplayName(
    order: DonationOrderRow,
  ): Promise<string> {
    if (order.anonymous) return '好心人';
    if (!order.alumniId) return '**同学';
    try {
      const res = await this.db.query<{ name_pinyin: string }>(
        `SELECT name_pinyin FROM alumni_profile WHERE id=$1`,
        [order.alumniId],
      );
      const pinyin = res.rows[0]?.['name_pinyin'];
      if (typeof pinyin === 'string' && pinyin.length > 0) {
        const head = pinyin.split(/\s+/)[0] ?? pinyin;
        const letter = head.charAt(0).toUpperCase();
        return `${letter}同学`;
      }
    } catch {
      /* fallthrough */
    }
    return '**同学';
  }
}

function toOrderRow(row: OrderDbRow): DonationOrderRow {
  return {
    id: row.id,
    alumniId: row.alumni_id,
    amountCents: Number(row.amount_cents),
    channel: row.channel as DonationChannel,
    status: row.status as DonationStatus,
    outTradeNo: row.out_trade_no,
    paidAt: row.paid_at ? new Date(row.paid_at) : null,
    message: row.message,
    anonymous: Boolean(row.anonymous),
    createdAt: new Date(row.created_at),
  };
}
