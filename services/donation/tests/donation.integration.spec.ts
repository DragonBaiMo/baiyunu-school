import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createHarness, makeWebhookRequest, type TestHarness } from './harness.js';

describe('donation 集成流：create → webhook → wall → refund', () => {
  let h: TestHarness;
  beforeEach(async () => {
    h = await createHarness();
  });
  afterEach(async () => {
    await h.close();
  });

  it('完整流程：init → paid（wall 出现）→ refunded', async () => {
    const alumniId = await h.seedAlumni({ pinyin: 'Wang' });
    const created = await h.donation.createOrder({
      amountCents: 88_888,
      channel: 'alipay',
      alumniId,
      anonymous: false,
      message: '反哺母校',
    });
    expect(created.order.status).toBe('init');
    expect(created.payUrl.startsWith('mock://pay/')).toBe(true);

    const hook = makeWebhookRequest(h.payment, created.order.outTradeNo);
    const paid = await h.donation.handleWebhook(hook.headers, hook.rawBody);
    expect(paid.order.status).toBe('paid');
    expect(paid.walled).toBe(true);

    const wall = await h.wall.listEntries({ limit: 10 });
    expect(wall.entries).toHaveLength(1);
    expect(wall.entries[0]?.displayName).toBe('W同学');

    const stats = await h.wall.stats();
    expect(stats.totalCents).toBe(88_888);
    expect(stats.totalCount).toBe(1);

    const refunded = await h.donation.refund({
      orderId: created.order.id,
      reason: '测试回滚',
    });
    expect(refunded.status).toBe('refunded');

    const list = await h.donation.listOrders({ limit: 10, offset: 0 });
    expect(list).toHaveLength(1);
    expect(list[0]?.status).toBe('refunded');
  });
});
