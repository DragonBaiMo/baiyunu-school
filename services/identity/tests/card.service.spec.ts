import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createHarness, type TestHarness } from './harness.js';

describe('CardService', () => {
  let h: TestHarness;
  beforeEach(async () => {
    h = await createHarness();
  });
  afterEach(async () => {
    await h.close();
  });

  it('issue 生成唯一递增 cardNo', async () => {
    const a = await h.card.issue('alumni-1', 2020);
    const b = await h.card.issue('alumni-2', 2020);
    expect(a.cardNo).toMatch(/^BYN-2020-\d{6}$/);
    expect(b.cardNo).not.toBe(a.cardNo);
  });

  it('rotate → verify 在同一步窗口内通过', async () => {
    const c = await h.card.issue('alumni-1', 2021);
    const t = 1_700_000_000;
    const rotate = await h.card.rotateQrCode(c.id, t);
    const v = await h.card.verifyQrCode(rotate.code, t);
    expect(v.valid).toBe(true);
    expect(v.cardId).toBe(c.id);
  });

  it('±1 步窗口容忍，±2 步失败', async () => {
    const c = await h.card.issue('alumni-1', 2021);
    const t = 1_700_000_000;
    const rotate = await h.card.rotateQrCode(c.id, t);
    expect((await h.card.verifyQrCode(rotate.code, t + 30)).valid).toBe(true);
    expect((await h.card.verifyQrCode(rotate.code, t - 30)).valid).toBe(true);
    expect((await h.card.verifyQrCode(rotate.code, t + 120)).valid).toBe(false);
  });

  it('revoke 后任何窗口都 invalid', async () => {
    const c = await h.card.issue('alumni-1', 2021);
    const rotate = await h.card.rotateQrCode(c.id);
    await h.card.revoke(c.id, 'reviewer-1', '遗失补办');
    expect((await h.card.verifyQrCode(rotate.code)).valid).toBe(false);
    await expect(h.card.rotateQrCode(c.id)).rejects.toMatchObject({
      code: 'CARD_REVOKED',
    });
  });

  it('非法格式 QR 返回 invalid', async () => {
    expect((await h.card.verifyQrCode('not-a-qr')).valid).toBe(false);
    expect((await h.card.verifyQrCode('v2.x.y')).valid).toBe(false);
  });
});
