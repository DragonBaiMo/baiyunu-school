import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createHarness, SAMPLE_DSL, futureEnd, futureStart, type TestHarness } from './harness.js';

describe('ActivityCoreService 状态机', () => {
  let h: TestHarness;
  beforeEach(async () => {
    h = await createHarness();
  });
  afterEach(async () => {
    await h.close();
  });

  async function createDraft(title = '返校节'): Promise<string> {
    const act = await h.activities.create({
      title,
      templateId: 'tpl-homecoming',
      dsl: SAMPLE_DSL,
      quota: 5,
      startAt: futureStart(120),
      endAt: futureEnd(6),
      creatorId: 'admin-1',
    });
    return act.id;
  }

  it('create → draft；publish → published 并写入 publishedAt', async () => {
    const id = await createDraft();
    const draft = await h.activities.getById(id);
    expect(draft.status).toBe('draft');
    expect(draft.publishedAt).toBeNull();
    const published = await h.activities.publish(id);
    expect(published.status).toBe('published');
    expect(published.publishedAt).not.toBeNull();
  });

  it('仅 draft 可 update；published 后 update 被拒', async () => {
    const id = await createDraft();
    const updated = await h.activities.update(id, { title: '返校节 v2' });
    expect(updated.title).toBe('返校节 v2');
    await h.activities.publish(id);
    await expect(
      h.activities.update(id, { title: '另一个标题' }),
    ).rejects.toMatchObject({ code: 'ACTIVITY_CLOSED' });
  });

  it('published → close；draft/closed 再 close 被拒（幂等/拒绝）', async () => {
    const id = await createDraft();
    await expect(h.activities.close(id)).rejects.toMatchObject({
      code: 'ACTIVITY_CLOSED',
    });
    await h.activities.publish(id);
    const closed = await h.activities.close(id);
    expect(closed.status).toBe('closed');
    expect(closed.closedAt).not.toBeNull();
    // 再次 close：幂等返回
    const again = await h.activities.close(id);
    expect(again.status).toBe('closed');
  });

  it('cancel 可作用于 draft 与 published；closed 状态下被拒', async () => {
    const draftId = await createDraft('A');
    const cancelledDraft = await h.activities.cancel(draftId);
    expect(cancelledDraft.status).toBe('cancelled');
    expect(cancelledDraft.cancelledAt).not.toBeNull();

    const publishedId = await createDraft('B');
    await h.activities.publish(publishedId);
    const cancelledPublished = await h.activities.cancel(publishedId);
    expect(cancelledPublished.status).toBe('cancelled');

    const closedId = await createDraft('C');
    await h.activities.publish(closedId);
    await h.activities.close(closedId);
    await expect(h.activities.cancel(closedId)).rejects.toMatchObject({
      code: 'ACTIVITY_CLOSED',
    });
  });

  it('listPublic 只返回 published；listAdmin 返回全部', async () => {
    const pubId = await createDraft('pub');
    await h.activities.publish(pubId);
    await createDraft('draft-only');
    const pub = await h.activities.listPublic({ limit: 50, offset: 0 });
    expect(pub.map((a) => a.id)).toContain(pubId);
    expect(pub.every((a) => a.status === 'published')).toBe(true);
    const all = await h.activities.listAdmin({ limit: 50, offset: 0 });
    expect(all.length).toBeGreaterThanOrEqual(2);
  });
});
