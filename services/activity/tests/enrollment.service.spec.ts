import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  createHarness,
  SAMPLE_DSL,
  futureEnd,
  futureStart,
  type TestHarness,
} from './harness.js';

describe('EnrollmentService', () => {
  let h: TestHarness;
  beforeEach(async () => {
    h = await createHarness();
  });
  afterEach(async () => {
    await h.close();
  });

  async function createPublished(quota = 5): Promise<string> {
    const act = await h.activities.create({
      title: '讲座',
      dsl: SAMPLE_DSL,
      quota,
      startAt: futureStart(60),
      endAt: futureEnd(4),
      creatorId: 'admin-1',
    });
    await h.activities.publish(act.id);
    return act.id;
  }

  it('enroll 成功，qrTicket 生成且 formData 含签名字段', async () => {
    const actId = await createPublished();
    const r = await h.enrollments.enroll({
      activityId: actId,
      alumniId: 'alum-1',
      formData: { realName: '张三' },
    });
    expect(r.status).toBe('enrolled');
    expect(r.qrTicket).toMatch(/^[A-Z2-7]{20,40}$/);
    expect(typeof r.formData['_sig']).toBe('string');
    expect(typeof r.formData['_issuedAt']).toBe('string');
  });

  it('重复报名抛 ALREADY_ENROLLED', async () => {
    const actId = await createPublished();
    await h.enrollments.enroll({
      activityId: actId,
      alumniId: 'alum-1',
      formData: { realName: '张三' },
    });
    await expect(
      h.enrollments.enroll({
        activityId: actId,
        alumniId: 'alum-1',
        formData: { realName: '张三' },
      }),
    ).rejects.toMatchObject({ code: 'ALREADY_ENROLLED' });
  });

  it('满额抛 QUOTA_EXCEEDED', async () => {
    const actId = await createPublished(2);
    await h.enrollments.enroll({
      activityId: actId,
      alumniId: 'a',
      formData: { realName: '张三' },
    });
    await h.enrollments.enroll({
      activityId: actId,
      alumniId: 'b',
      formData: { realName: '李四' },
    });
    await expect(
      h.enrollments.enroll({
        activityId: actId,
        alumniId: 'c',
        formData: { realName: '王五' },
      }),
    ).rejects.toMatchObject({ code: 'QUOTA_EXCEEDED' });
  });

  it('未发布活动 enroll 抛 ACTIVITY_NOT_PUBLISHED', async () => {
    const act = await h.activities.create({
      title: '未发布',
      dsl: SAMPLE_DSL,
      quota: 10,
      startAt: futureStart(60),
      endAt: futureEnd(4),
      creatorId: 'admin-1',
    });
    await expect(
      h.enrollments.enroll({
        activityId: act.id,
        alumniId: 'x',
        formData: { realName: '张三' },
      }),
    ).rejects.toMatchObject({ code: 'ACTIVITY_NOT_PUBLISHED' });
  });

  it('表单校验失败抛 FORM_VALIDATION_FAILED', async () => {
    const actId = await createPublished();
    await expect(
      h.enrollments.enroll({
        activityId: actId,
        alumniId: 'alum-x',
        formData: {}, // 缺 realName
      }),
    ).rejects.toMatchObject({ code: 'FORM_VALIDATION_FAILED' });
  });

  it('checkInByTicket 成功；再次签到抛 ALREADY_CHECKED', async () => {
    const actId = await createPublished();
    const r = await h.enrollments.enroll({
      activityId: actId,
      alumniId: 'alum-1',
      formData: { realName: '张三' },
    });
    const checked = await h.enrollments.checkInByTicket(
      r.qrTicket,
      'operator-1',
    );
    expect(checked.status).toBe('checked');
    expect(checked.checkInAt).not.toBeNull();
    await expect(
      h.enrollments.checkInByTicket(r.qrTicket, 'operator-1'),
    ).rejects.toMatchObject({ code: 'ALREADY_CHECKED' });
  });

  it('篡改 HMAC 签名抛 INVALID_TICKET', async () => {
    const actId = await createPublished();
    const r = await h.enrollments.enroll({
      activityId: actId,
      alumniId: 'alum-1',
      formData: { realName: '张三' },
    });
    // 直接改库中的 _sig
    const tampered = JSON.stringify({
      ...r.formData,
      _sig: 'deadbeef',
    });
    await h.db.query(
      `UPDATE activity_enrollment SET form_data = $1 WHERE id = $2`,
      [tampered, r.id],
    );
    await expect(
      h.enrollments.checkInByTicket(r.qrTicket, 'operator-1'),
    ).rejects.toMatchObject({ code: 'INVALID_TICKET' });
  });

  it('cancel 报名（未签到）成功；非 owner 无权取消', async () => {
    const actId = await createPublished();
    const r = await h.enrollments.enroll({
      activityId: actId,
      alumniId: 'alum-1',
      formData: { realName: '张三' },
    });
    await expect(
      h.enrollments.cancel(r.id, 'not-owner'),
    ).rejects.toMatchObject({ code: 'ENROLLMENT_NOT_FOUND' });
    const cancelled = await h.enrollments.cancel(r.id, 'alum-1');
    expect(cancelled.status).toBe('cancelled');
  });
});
