import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  createHarness,
  SAMPLE_DSL,
  futureEnd,
  futureStart,
  type TestHarness,
} from './harness.js';

describe('ActivityScreenService', () => {
  let h: TestHarness;
  beforeEach(async () => {
    h = await createHarness();
  });
  afterEach(async () => {
    await h.close();
  });

  it('summary 返回 quota/enrolled/checked/checkInRate/recentCheckIns', async () => {
    const act = await h.activities.create({
      title: '双选会',
      dsl: SAMPLE_DSL,
      quota: 10,
      startAt: futureStart(60),
      endAt: futureEnd(4),
      creatorId: 'admin-1',
    });
    await h.activities.publish(act.id);
    const e1 = await h.enrollments.enroll({
      activityId: act.id,
      alumniId: 'a',
      formData: { realName: '张三' },
    });
    await h.enrollments.enroll({
      activityId: act.id,
      alumniId: 'b',
      formData: { realName: '李四' },
    });
    await h.enrollments.checkInByTicket(e1.qrTicket, 'op');
    const s = await h.screen.summary(act.id);
    expect(s.quota).toBe(10);
    expect(s.enrolled).toBe(2);
    expect(s.checked).toBe(1);
    expect(s.checkInRate).toBeCloseTo(0.5);
    expect(s.recentCheckIns).toHaveLength(1);
    expect(s.recentCheckIns[0]?.alumniId).toBe('a');
  });
});
