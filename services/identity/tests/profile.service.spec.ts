import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { maskName } from '../src/profile.service.js';
import { createHarness, type TestHarness } from './harness.js';

describe('ProfileService', () => {
  let h: TestHarness;
  beforeEach(async () => {
    h = await createHarness();
  });
  afterEach(async () => {
    await h.close();
  });

  it('createFromApplication 加密后回读得到明文', async () => {
    const profile = await h.profile.createFromApplication({
      name: '王昭然',
      idCard: '11010119900101000X',
      phone: '13800138000',
      year: 2015,
      collegeId: 'CS',
      deptId: 'D',
      classId: 'C',
    });
    const byId = await h.profile.findById(profile.id);
    expect(byId.name).toBe('王昭然');
    expect(byId.idCard).toBe('11010119900101000X');
    expect(byId.phone).toBe('13800138000');
  });

  it('findByUserId 未命中返回 null', async () => {
    const r = await h.profile.findByUserId('unknown-user');
    expect(r).toBeNull();
  });

  it('maskName 保留首字并用星号补齐', () => {
    expect(maskName('王昭然')).toBe('王**');
    expect(maskName('')).toBe('');
  });
});
