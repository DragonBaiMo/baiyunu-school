import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createHarness, makeWebhookRequest, type TestHarness } from './harness.js';

describe('DonationWallService — 鸣谢墙', () => {
  let h: TestHarness;
  beforeEach(async () => {
    h = await createHarness();
  });
  afterEach(async () => {
    await h.close();
  });

  async function donate(amount: number, anonymous = true): Promise<void> {
    const res = await h.donation.createOrder({
      amountCents: amount,
      channel: 'mock',
      anonymous,
    });
    const { headers, rawBody } = makeWebhookRequest(h.payment, res.order.outTradeNo);
    await h.donation.handleWebhook(headers, rawBody);
    // 保证 created_at 递增，避免同毫秒排序抖动
    await new Promise((r) => setTimeout(r, 5));
  }

  it('listEntries 倒序分页 + cursor', async () => {
    for (let i = 0; i < 5; i++) {
      await donate(1_000 * (i + 1));
    }
    const page1 = await h.wall.listEntries({ limit: 2 });
    expect(page1.entries).toHaveLength(2);
    expect(page1.cursor).not.toBeNull();
    // 金额倒序（最新先）：最新一笔 5000，上一笔 4000
    expect(page1.entries[0]?.amountCents).toBe(5_000);
    expect(page1.entries[1]?.amountCents).toBe(4_000);
    const page2 = await h.wall.listEntries({ limit: 2, cursor: page1.cursor! });
    expect(page2.entries).toHaveLength(2);
    expect(page2.entries[0]?.amountCents).toBe(3_000);
  });

  it('stats：totalCents / totalCount 正确', async () => {
    await donate(1_000);
    await donate(2_500);
    await donate(500);  // 注意：500 < 100 是可的
    const s = await h.wall.stats();
    expect(s.totalCount).toBe(3);
    expect(s.totalCents).toBe(4_000);
    expect(s.topDisplayName).toBe('好心人');
  });

  it('匿名订单显示为 "好心人"', async () => {
    await donate(1_000, true);
    const list = await h.wall.listEntries({ limit: 10 });
    expect(list.entries[0]?.displayName).toBe('好心人');
  });
});
