import { randomUUID } from 'node:crypto';
import type { IPaymentAdapter, CreateOrderInput, OrderView } from './interface.js';

/**
 * 内存 Mock：下单后立即置为 paid，webhook 一律通过。
 */
export class MockPaymentAdapter implements IPaymentAdapter {
  private readonly store = new Map<string, OrderView>();

  async createOrder(input: CreateOrderInput): Promise<OrderView> {
    const outTradeNo = `MOCK-${randomUUID().slice(0, 12)}`;
    const order: OrderView = {
      outTradeNo,
      status: 'paid',
      amountCents: input.amountCents,
      paidAt: new Date().toISOString(),
      channel: input.channel,
    };
    this.store.set(outTradeNo, order);
    return order;
  }

  async queryOrder(outTradeNo: string): Promise<OrderView | null> {
    return this.store.get(outTradeNo) ?? null;
  }

  async refund(outTradeNo: string, _amountCents: number): Promise<OrderView> {
    const existing = this.store.get(outTradeNo);
    if (!existing) throw new Error(`[mock-payment] 订单不存在：${outTradeNo}`);
    const updated: OrderView = { ...existing, status: 'refunded' };
    this.store.set(outTradeNo, updated);
    return updated;
  }

  async verifyWebhook(_headers: Record<string, string>, _body: string): Promise<boolean> {
    return true;
  }
}
