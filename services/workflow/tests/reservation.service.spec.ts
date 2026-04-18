import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createHarness, type TestHarness } from './harness.js';

describe('ReservationService', () => {
  let h: TestHarness;
  beforeEach(async () => {
    h = await createHarness();
  });
  afterEach(async () => {
    await h.close();
  });

  it('create 成功并生成 qrTicket', async () => {
    const r = await h.reservations.create({
      alumniId: 'a1',
      serviceType: '返校',
      slotDate: '2026-05-01',
      slotTime: '09:00',
      companions: [],
    });
    expect(r.qrTicket).toMatch(/^[0-9a-f-]{36}$/);
    expect(r.status).toBe('pending');
  });

  it('同一校友同槽重复预约抛 SLOT_CONFLICT', async () => {
    await h.reservations.create({
      alumniId: 'a1',
      serviceType: '返校',
      slotDate: '2026-05-02',
      slotTime: '10:00',
      companions: [],
    });
    await expect(
      h.reservations.create({
        alumniId: 'a1',
        serviceType: '返校',
        slotDate: '2026-05-02',
        slotTime: '10:00',
        companions: [],
      }),
    ).rejects.toMatchObject({ code: 'SLOT_CONFLICT' });
  });

  it('非 owner 取消被拒', async () => {
    const r = await h.reservations.create({
      alumniId: 'owner',
      serviceType: '返校',
      slotDate: '2026-05-03',
      slotTime: '11:00',
      companions: [],
    });
    await expect(h.reservations.cancel(r.id, 'other')).rejects.toMatchObject({
      code: 'NOT_OWNER',
    });
    const ok = await h.reservations.cancel(r.id, 'owner');
    expect(ok.status).toBe('cancelled');
  });

  it('listAvailableSlots 剩余容量计算正确', async () => {
    // 3 个不同校友占 09:00
    for (const id of ['a', 'b', 'c']) {
      await h.reservations.create({
        alumniId: id,
        serviceType: '返校',
        slotDate: '2026-06-01',
        slotTime: '09:00',
        companions: [],
      });
    }
    const slots = await h.reservations.listAvailableSlots({
      serviceType: '返校',
      startDate: '2026-06-01',
      endDate: '2026-06-01',
    });
    const nine = slots.find((s) => s.slotTime === '09:00');
    expect(nine?.remaining).toBe(10 - 3);
    const ten = slots.find((s) => s.slotTime === '10:00');
    expect(ten?.remaining).toBe(10);
  });

  it('取消后不再占用容量', async () => {
    const r = await h.reservations.create({
      alumniId: 'x',
      serviceType: '返校',
      slotDate: '2026-07-01',
      slotTime: '14:00',
      companions: [],
    });
    await h.reservations.cancel(r.id, 'x');
    const slots = await h.reservations.listAvailableSlots({
      serviceType: '返校',
      startDate: '2026-07-01',
      endDate: '2026-07-01',
    });
    const s = slots.find((i) => i.slotTime === '14:00');
    expect(s?.remaining).toBe(10);
  });

  it('listByAlumni 按日期升序', async () => {
    await h.reservations.create({
      alumniId: 'z',
      serviceType: '返校',
      slotDate: '2026-08-05',
      slotTime: '09:00',
      companions: [],
    });
    await h.reservations.create({
      alumniId: 'z',
      serviceType: '返校',
      slotDate: '2026-08-01',
      slotTime: '09:00',
      companions: [],
    });
    const list = await h.reservations.listByAlumni('z');
    expect(list).toHaveLength(2);
    expect(list[0]?.slotDate).toBe('2026-08-01');
    expect(list[1]?.slotDate).toBe('2026-08-05');
  });
});
