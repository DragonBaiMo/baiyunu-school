import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  createHarness,
  SAMPLE_DSL,
  futureEnd,
  futureStart,
  type TestHarness,
} from './harness.js';

describe('activity integration', () => {
  let h: TestHarness;
  beforeEach(async () => {
    h = await createHarness();
  });
  afterEach(async () => {
    await h.close();
  });

  it('完整流程：admin 创建→发布→2 校友报名→1 签到→summary checkInRate=0.5', async () => {
    // admin 创建
    const created = await h.activities.create({
      title: '返校节 2026',
      templateId: 'tpl-homecoming',
      dsl: SAMPLE_DSL,
      quota: 100,
      startAt: futureStart(30),
      endAt: futureEnd(8),
      creatorId: 'admin-1',
    });
    expect(created.status).toBe('draft');

    // 发布
    const published = await h.activities.publish(created.id);
    expect(published.status).toBe('published');

    // 2 校友报名
    const e1 = await h.enrollments.enroll({
      activityId: created.id,
      alumniId: 'alum-A',
      formData: { realName: '张三' },
    });
    const e2 = await h.enrollments.enroll({
      activityId: created.id,
      alumniId: 'alum-B',
      formData: { realName: '李四' },
    });
    expect(e1.status).toBe('enrolled');
    expect(e2.status).toBe('enrolled');

    // 1 签到
    const checked = await h.enrollments.checkInByTicket(
      e1.qrTicket,
      'staff-1',
    );
    expect(checked.status).toBe('checked');

    // summary
    const s = await h.screen.summary(created.id);
    expect(s.enrolled).toBe(2);
    expect(s.checked).toBe(1);
    expect(s.checkInRate).toBeCloseTo(0.5);

    // listByActivity / listByAlumni 路径
    const byAct = await h.enrollments.listByActivity(created.id);
    expect(byAct).toHaveLength(2);
    const mine = await h.enrollments.listByAlumni('alum-A');
    expect(mine[0]?.status).toBe('checked');

    // 模板种子应该落库
    const tpls = await h.templates.list();
    expect(tpls.map((t) => t.id)).toEqual(
      expect.arrayContaining([
        'tpl-homecoming',
        'tpl-lecture',
        'tpl-fund-raising',
      ]),
    );
  });
});
