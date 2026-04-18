import { describe, it, expect } from 'vitest';
import { isValidIdCard, maskName, maskPhone, OrgNodeType } from '../src/index.js';

describe('@bynu/domain', () => {
  it('身份证基本格式校验', () => {
    expect(isValidIdCard('11010119900101001X')).toBe(true);
    expect(isValidIdCard('123')).toBe(false);
  });

  it('脱敏手机号保留首尾', () => {
    expect(maskPhone('13812345678')).toBe('138****5678');
  });

  it('脱敏姓名 2 字与多字', () => {
    expect(maskName('张三')).toBe('张*');
    expect(maskName('欧阳明哲')).toBe('欧**哲');
  });

  it('组织节点枚举包含 5 级', () => {
    expect(Object.values(OrgNodeType)).toHaveLength(5);
  });
});
