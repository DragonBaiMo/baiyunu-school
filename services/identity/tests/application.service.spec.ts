import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createHarness, type TestHarness } from './harness.js';

describe('ApplicationService', () => {
  let h: TestHarness;
  beforeEach(async () => {
    h = await createHarness();
  });
  afterEach(async () => {
    await h.close();
  });

  it('submit 成功并加密敏感字段', async () => {
    const res = await h.application.submit({
      name: '王昭然',
      idCard: '11010119900101000X',
      phone: '13800138000',
      year: 2015,
      collegeId: 'CS',
      deptId: 'D1',
      classId: 'C1',
      evidenceUrls: [],
    });
    expect(res.status).toBe('pending');
    const row = await h.db.query(
      `SELECT payload, applicant_name FROM alumni_application WHERE id = $1`,
      [res.id],
    );
    const raw = row.rows[0] as Record<string, unknown>;
    expect(String(raw['applicant_name'])).not.toContain('昭');
    const payload = typeof raw['payload'] === 'string'
      ? JSON.parse(raw['payload'] as string)
      : (raw['payload'] as Record<string, unknown>);
    // 明文不得落库
    expect(JSON.stringify(payload)).not.toContain('11010119900101000X');
    expect(JSON.stringify(payload)).not.toContain('13800138000');
    expect(payload['idCardHash']).toBeTypeOf('string');
  });

  it('教务系统未命中时抛 EDU_NOT_FOUND', async () => {
    await expect(
      h.application.submit({
        name: '无此人',
        idCard: '110101199001010000',
        phone: '13800138000',
        year: 2099,
        collegeId: 'CS',
        deptId: 'D',
        classId: 'C',
        evidenceUrls: [],
      }),
    ).rejects.toMatchObject({ code: 'EDU_NOT_FOUND', status: 422 });
  });

  it('同身份证重复申请抛 DUPLICATE_PENDING', async () => {
    const input = {
      name: '王昭然',
      idCard: '11010119900101000X',
      phone: '13800138000',
      year: 2015,
      collegeId: 'CS',
      deptId: 'D',
      classId: 'C',
      evidenceUrls: [],
    };
    await h.application.submit(input);
    await expect(h.application.submit(input)).rejects.toMatchObject({
      code: 'DUPLICATE_PENDING',
      status: 409,
    });
  });

  it('approve 级联发卡并写两条通知', async () => {
    const submitted = await h.application.submit({
      name: '李寒雪',
      idCard: '110101199101010002',
      phone: '13800138001',
      year: 2016,
      collegeId: 'EM',
      deptId: 'D',
      classId: 'C',
      evidenceUrls: [],
    });
    const res = await h.application.approve(submitted.id, 'reviewer-1');
    expect(res.cardNo).toMatch(/^BYN-2016-\d{6}$/);
    const noti = await h.notify.findRecent(10);
    const templates = noti.map((n) => String(n['template']));
    expect(templates).toContain('approval');
    expect(templates).toContain('card_issued');

    // approved 后再次 approve 应当失败
    await expect(h.application.approve(submitted.id, 'reviewer-1')).rejects.toMatchObject({
      code: 'APPLICATION_INVALID_STATE',
    });
  });

  it('reject 记录原因并发送 rejection 短信', async () => {
    const submitted = await h.application.submit({
      name: '张明哲',
      idCard: '110101199201010003',
      phone: '13800138002',
      year: 2017,
      collegeId: 'FL',
      deptId: 'D',
      classId: 'C',
      evidenceUrls: [],
    });
    await h.application.reject(submitted.id, 'reviewer-1', '材料不完整');
    const rows = await h.db.query(
      `SELECT status, payload FROM alumni_application WHERE id = $1`,
      [submitted.id],
    );
    const row = rows.rows[0] as Record<string, unknown>;
    expect(row['status']).toBe('rejected');
    const payload = typeof row['payload'] === 'string'
      ? JSON.parse(row['payload'] as string)
      : (row['payload'] as Record<string, unknown>);
    expect(payload['rejectReason']).toBe('材料不完整');
    const noti = await h.notify.findRecent(10);
    expect(noti.map((n) => n['template'])).toContain('rejection');
  });

  it('list 对 reviewer_college 强制按学院过滤，且拒绝未知角色', async () => {
    await h.application.submit({
      name: '王昭然',
      idCard: '11010119900101000X',
      phone: '13800138000',
      year: 2015,
      collegeId: 'CS',
      deptId: 'D',
      classId: 'C',
      evidenceUrls: [],
    });
    await h.application.submit({
      name: '李寒雪',
      idCard: '110101199101010002',
      phone: '13800138001',
      year: 2016,
      collegeId: 'EM',
      deptId: 'D',
      classId: 'C',
      evidenceUrls: [],
    });

    // admin 看全部
    const all = await h.application.list({}, { id: 'admin-1', roles: ['admin'] });
    expect(all.total).toBe(2);

    // reviewer_college 只能看 CS
    const cs = await h.application.list(
      {},
      { id: 'u', roles: ['reviewer_college'], collegeId: 'CS' },
    );
    expect(cs.total).toBe(1);
    expect(cs.items[0]?.collegeId).toBe('CS');

    // 未知角色拒绝
    await expect(
      h.application.list({}, { id: 'u', roles: ['alumni'] }),
    ).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });
});
