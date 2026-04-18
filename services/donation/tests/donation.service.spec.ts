import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createHarness, makeWebhookRequest, type TestHarness } from './harness.js';

describe('DonationCoreService — createOrder + webhook', () => {
  let h: TestHarness;
  beforeEach(async () => {
    h = await createHarness();
  });
  afterEach(async () => {
    await h.close();
  });

  it('createOrder 成功：payUrl 形如 mock://pay/<outTradeNo>，DB 存 init', async () => {
    const res = await h.donation.createOrder({
      amountCents: 10_000,
      channel: 'mock',
      anonymous: true,
    });
    expect(res.order.status).toBe('init');
    expect(res.order.amountCents).toBe(10_000);
    expect(res.payUrl).toBe(`mock://pay/${res.order.outTradeNo}`);
    expect(res.order.outTradeNo.startsWith('DN')).toBe(true);
    const fetched = await h.donation.getOrder(res.order.outTradeNo);
    expect(fetched.id).toBe(res.order.id);
    expect(fetched.anonymous).toBe(true);
  });

  it('amountCents < 100 抛 INVALID_AMOUNT', async () => {
    await expect(
      h.donation.createOrder({
        amountCents: 50,
        channel: 'mock',
        anonymous: true,
      }),
    ).rejects.toMatchObject({ code: 'INVALID_AMOUNT' });
  });

  it('handleWebhook paid → 订单更新 + wall 记录（匿名 → 好心人）', async () => {
    const res = await h.donation.createOrder({
      amountCents: 20_000,
      channel: 'mock',
      anonymous: true,
      message: '母校加油',
    });
    const { headers, rawBody } = makeWebhookRequest(h.payment, res.order.outTradeNo);
    const r = await h.donation.handleWebhook(headers, rawBody);
    expect(r.order.status).toBe('paid');
    expect(r.order.paidAt).not.toBeNull();
    expect(r.walled).toBe(true);
    const list = await h.wall.listEntries({ limit: 20 });
    expect(list.entries).toHaveLength(1);
    expect(list.entries[0]?.displayName).toBe('好心人');
    expect(list.entries[0]?.amountCents).toBe(20_000);
  });

  it('非匿名 + 已知校友：displayName 派生自 name_pinyin 首字母', async () => {
    const alumniId = await h.seedAlumni({ pinyin: 'Li' });
    const res = await h.donation.createOrder({
      amountCents: 30_000,
      channel: 'wechat',
      alumniId,
      anonymous: false,
    });
    const { headers, rawBody } = makeWebhookRequest(h.payment, res.order.outTradeNo);
    await h.donation.handleWebhook(headers, rawBody);
    const list = await h.wall.listEntries({ limit: 20 });
    expect(list.entries[0]?.displayName).toBe('L同学');
  });

  it('重复 webhook：已 paid 再投递抛 ORDER_ALREADY_PAID', async () => {
    const res = await h.donation.createOrder({
      amountCents: 10_000,
      channel: 'mock',
      anonymous: true,
    });
    const { headers, rawBody } = makeWebhookRequest(h.payment, res.order.outTradeNo);
    await h.donation.handleWebhook(headers, rawBody);
    const again = makeWebhookRequest(h.payment, res.order.outTradeNo);
    await expect(
      h.donation.handleWebhook(again.headers, again.rawBody),
    ).rejects.toMatchObject({ code: 'ORDER_ALREADY_PAID' });
  });

  it('HMAC 不匹配：INVALID_WEBHOOK', async () => {
    const res = await h.donation.createOrder({
      amountCents: 10_000,
      channel: 'mock',
      anonymous: true,
    });
    const rawBody = JSON.stringify({
      outTradeNo: res.order.outTradeNo,
      status: 'paid',
    });
    await expect(
      h.donation.handleWebhook({ 'x-mock-signature': 'deadbeef' }, rawBody),
    ).rejects.toMatchObject({ code: 'INVALID_WEBHOOK' });
  });
});
