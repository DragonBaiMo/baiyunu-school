import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createHarness, type TestHarness } from './harness.js';

describe('TemplateService', () => {
  let h: TestHarness;
  beforeEach(async () => {
    h = await createHarness();
  });
  afterEach(async () => {
    await h.close();
  });

  it('listTemplates 返回 3 个内置模板', async () => {
    const list = await h.templates.listTemplates();
    const ids = list.map((t) => t.id);
    expect(ids).toContain('tpl-home-default');
    expect(ids).toContain('tpl-news-list');
    expect(ids).toContain('tpl-donation-landing');
    const home = list.find((t) => t.id === 'tpl-home-default');
    expect(home?.builtin).toBe(true);
    expect(home?.dsl.blocks.length).toBeGreaterThan(0);
    // hero block 必须包含 title/subtitle/cta
    const hero = home?.dsl.blocks.find((b) => b.kind === 'hero');
    expect(hero).toBeDefined();
    if (hero && hero.kind === 'hero') {
      expect(hero.title).toBeTruthy();
      expect(hero.cta.text).toBeTruthy();
    }
  });

  it('applyTemplate 创建首版页面并写入模板 dsl', async () => {
    const page = await h.templates.applyTemplate('home', 'tpl-home-default', '母校首页');
    expect(page.slug).toBe('home');
    expect(page.title).toBe('母校首页');
    expect(page.version).toBe(1);
    expect(page.dsl.blocks.some((b) => b.kind === 'hero')).toBe(true);
  });

  it('applyTemplate 对已有 slug 执行更新而非重建', async () => {
    await h.templates.applyTemplate('donate', 'tpl-home-default', '早期版本');
    const updated = await h.templates.applyTemplate(
      'donate',
      'tpl-donation-landing',
      '正式版本',
    );
    expect(updated.version).toBe(1);
    expect(updated.title).toBe('正式版本');
    // dsl 应被替换为 donation-landing 模板
    const hasDonationHero = updated.dsl.blocks.some(
      (b) => b.kind === 'hero' && b.title.includes('情怀聚善'),
    );
    expect(hasDonationHero).toBe(true);
  });

  it('不存在的模板抛 TEMPLATE_NOT_FOUND', async () => {
    await expect(
      h.templates.applyTemplate('x', 'tpl-not-exist'),
    ).rejects.toMatchObject({ code: 'TEMPLATE_NOT_FOUND', status: 404 });
  });
});
