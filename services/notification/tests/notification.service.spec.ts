import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createDbClient, ensureMigrated, type DbClient } from '@bynu/db';
import { NotificationService } from '../src/index.js';

describe('NotificationService', () => {
  let db: DbClient;
  let svc: NotificationService;

  beforeEach(async () => {
    db = createDbClient('pglite:memory://');
    await ensureMigrated(db);
    svc = new NotificationService(db);
  });
  afterEach(async () => {
    await db.close();
  });

  it('sendSms 写入 notification_log 并返回 sent 状态', async () => {
    const res = await svc.sendSms('13800138000', 'approval', { applicationId: 'a1' });
    expect(res.status).toBe('sent');
    expect(res.id).toMatch(/[0-9a-f-]{36}/);
    const rows = await db.query(`SELECT channel, target, template FROM notification_log`);
    expect(rows.rows.length).toBe(1);
    expect(rows.rows[0]).toMatchObject({
      channel: 'sms',
      target: '13800138000',
      template: 'approval',
    });
  });

  it('findRecent 限制返回条数', async () => {
    await svc.sendSms('13800138001', 'approval', { i: 1 });
    await svc.sendSms('13800138002', 'rejection', { i: 2 });
    await svc.sendSms('13800138003', 'card_issued', { i: 3 });
    const recent = await svc.findRecent(2);
    expect(recent.length).toBe(2);
    const all = await svc.findRecent(10);
    const templates = all.map((n) => String(n['template']));
    expect(templates).toContain('approval');
    expect(templates).toContain('rejection');
    expect(templates).toContain('card_issued');
  });

  it('未注入 db 时 sendSms 抛错', async () => {
    const orphan = new NotificationService();
    await expect(orphan.sendSms('13800138000', 'approval', {})).rejects.toThrow();
  });

  it('ping 无需 db 即可工作', () => {
    expect(new NotificationService().ping()).toContain('notification');
  });
});
