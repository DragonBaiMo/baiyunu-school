import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createHarness, type TestHarness } from './harness.js';

describe('workflow integration', () => {
  let h: TestHarness;
  beforeEach(async () => {
    h = await createHarness();
  });
  afterEach(async () => {
    await h.close();
  });

  it('预约 → 取消 → 容量恢复', async () => {
    const r = await h.reservations.create({
      alumniId: 'alumni-1',
      serviceType: '返校',
      slotDate: '2026-09-10',
      slotTime: '15:00',
      companions: [{ name: '张三' }],
    });
    const listBefore = await h.reservations.listByAlumni('alumni-1');
    expect(listBefore).toHaveLength(1);
    const cancelled = await h.reservations.cancel(r.id, 'alumni-1');
    expect(cancelled.status).toBe('cancelled');
    const slots = await h.reservations.listAvailableSlots({
      serviceType: '返校',
      startDate: '2026-09-10',
      endDate: '2026-09-10',
    });
    const s = slots.find((i) => i.slotTime === '15:00');
    expect(s?.remaining).toBe(10);
  });

  it('开证明 → 公共校验通过；篡改后失败', async () => {
    const p = await h.proofs.issueProof({
      alumniId: 'alumni-2',
      proofType: '在学证明',
      payload: { college: '计算机学院', year: 2024 },
    });
    const ok = await h.proofs.verifyProof(p.id, p.signature);
    expect(ok.valid).toBe(true);
    const bad = await h.proofs.verifyProof(p.id, 'deadbeef');
    expect(bad.valid).toBe(false);
  });
});
