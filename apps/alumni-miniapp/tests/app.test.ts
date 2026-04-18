import { describe, it, expect } from 'vitest';
import { TABS } from '../src/app.js';

describe('alumni-miniapp', () => {
  it('三 Tab 配置稳定', () => {
    expect(TABS).toEqual(['home', 'card', 'mine']);
  });
});
