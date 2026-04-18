import { describe, it, expect } from 'vitest';
import { createPaymentAdapter, MockPaymentAdapter } from '../src/index.js';

describe('@bynu/adapter-payment · Mock', () => {
  it('createOrder 返回 paid 状态订单', async () => {
    const adapter = new MockPaymentAdapter();
    const order = await adapter.createOrder({ amountCents: 10000, channel: 'mock' });
    expect(order.status).toBe('paid');
    expect(order.outTradeNo).toMatch(/^MOCK-/);
  });

  it('refund 后状态变为 refunded；未知订单抛错', async () => {
    const adapter = new MockPaymentAdapter();
    const order = await adapter.createOrder({ amountCents: 500, channel: 'mock' });
    const refunded = await adapter.refund(order.outTradeNo, 500);
    expect(refunded.status).toBe('refunded');
    await expect(adapter.refund('not-exist', 1)).rejects.toThrow();
  });

  it('factory 支持 mock，未知 provider 抛错', () => {
    expect(createPaymentAdapter('mock')).toBeInstanceOf(MockPaymentAdapter);
    expect(() => createPaymentAdapter('unknown')).toThrow();
  });
});
