import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createHarness, makeWebhookRequest, type TestHarness } from './harness.js';

describe('DonationCoreService — refund', () => {
  let h: TestHarness;
  beforeEach(async () => {
    h = await createHarness();
  });
  afterEach(async () => {
    await h.close();
  });

  async function paidOrder(amount = 50_000): Promise<{ id: string; outTradeNo: string; amount: number }> {
    const res = await h.donation.createOrder({
      amountCents: amount,
      channel: 'mock',
      anonymous: true,
    });
    const { headers, rawBody } = makeWebhookRequest(h.payment, res.order.outTradeNo);
    await h.donation.handleWebhook(headers, rawBody);
    return { id: res.order.id, outTradeNo: res.order.outTradeNo, amount };
  }

  it('全额退款成功：status=refunded', async () => {
    const o = await paidOrder();
    const r = await h.donation.refund({ orderId: o.id, reason: '用户申请' });
    expect(r.status).toBe('refunded');
  });

  it('partialCents 超过订单金额：REFUND_EXCEEDS_PAID', async () => {
    const o = await paidOrder(10_000);
    await expect(
      h.donation.refund({
        orderId: o.id,
        reason: '错付',
        partialCents: 20_000,
      }),
    ).rejects.toMatchObject({ code: 'REFUND_EXCEEDS_PAID' });
  });

  it('未支付订单退款：ORDER_NOT_PAID', async () => {
    const created = await h.donation.createOrder({
      amountCents: 10_000,
      channel: 'mock',
      anonymous: true,
    });
    await expect(
      h.donation.refund({ orderId: created.order.id, reason: '取消' }),
    ).rejects.toMatchObject({ code: 'ORDER_NOT_PAID' });
  });

  it('部分退款金额合法：允许 partialCents < amount', async () => {
    const o = await paidOrder(20_000);
    const r = await h.donation.refund({
      orderId: o.id,
      reason: '部分错付',
      partialCents: 5_000,
    });
    expect(r.status).toBe('refunded');
  });
});
