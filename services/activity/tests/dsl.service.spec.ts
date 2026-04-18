import { describe, it, expect } from 'vitest';
import { DslService } from '../src/dsl.service.js';
import { SAMPLE_DSL } from './harness.js';

/** 捕获同步 fn 抛出的错误；不抛时返回 null。 */
function catchError(fn: () => unknown): unknown {
  try {
    fn();
    return null;
  } catch (e) {
    return e;
  }
}

describe('DslService.validateDsl', () => {
  const dsl = new DslService();

  it('接受合法 DSL', () => {
    const ok = dsl.validateDsl(SAMPLE_DSL);
    expect(ok.steps).toHaveLength(1);
    expect(ok.formFields?.[0]?.name).toBe('realName');
  });

  it('拒绝步骤 id 重复', () => {
    expect(() =>
      dsl.validateDsl({
        steps: [
          {
            id: 'dup',
            type: 'notice',
            title: 'A',
            config: { content: 'hello' },
          },
          {
            id: 'dup',
            type: 'notice',
            title: 'B',
            config: { content: 'world' },
          },
        ],
      }),
    ).toThrowError(/步骤 id 重复/);
  });

  it('拒绝步骤数超过 10', () => {
    const steps = Array.from({ length: 11 }, (_, i) => ({
      id: `s-${i}`,
      type: 'notice' as const,
      title: '通知',
      config: { content: 'x' },
    }));
    expect(() => dsl.validateDsl({ steps })).toThrowError(
      /DSL 结构非法/,
    );
  });

  it('form 步骤引用未定义字段抛 STEP_NOT_FOUND', () => {
    const err = catchError(() =>
      dsl.validateDsl({
        steps: [
          {
            id: 's1',
            type: 'form',
            title: '填报',
            config: { fields: ['not-exist'] },
          },
        ],
        formFields: [
          {
            name: 'realName',
            label: '姓名',
            type: 'text',
            required: true,
          },
        ],
      }),
    );
    expect(err).toMatchObject({ code: 'STEP_NOT_FOUND' });
  });
});

describe('DslService.validateFormData', () => {
  const dsl = new DslService();
  const fields = [
    {
      name: 'realName',
      label: '姓名',
      type: 'text' as const,
      required: true,
      minLength: 2,
    },
    {
      name: 'phone',
      label: '电话',
      type: 'tel' as const,
      required: true,
      regex: '^1[3-9]\\d{9}$',
    },
    {
      name: 'color',
      label: '颜色',
      type: 'select' as const,
      required: false,
      enum: ['red', 'green', 'blue'],
    },
  ];

  it('required 缺失抛 FORM_VALIDATION_FAILED', () => {
    const err = catchError(() =>
      dsl.validateFormData(fields, {
        phone: '13800138000',
      }),
    );
    expect(err).toMatchObject({ code: 'FORM_VALIDATION_FAILED' });
  });

  it('regex 不匹配抛 FORM_VALIDATION_FAILED', () => {
    const err = catchError(() =>
      dsl.validateFormData(fields, {
        realName: '张三',
        phone: '123',
      }),
    );
    expect(err).toMatchObject({ code: 'FORM_VALIDATION_FAILED' });
  });

  it('enum 值不在枚举内抛 FORM_VALIDATION_FAILED', () => {
    const err = catchError(() =>
      dsl.validateFormData(fields, {
        realName: '张三',
        phone: '13800138000',
        color: 'purple',
      }),
    );
    expect(err).toMatchObject({ code: 'FORM_VALIDATION_FAILED' });
  });

  it('全部合法时通过', () => {
    expect(() =>
      dsl.validateFormData(fields, {
        realName: '张三',
        phone: '13800138000',
        color: 'red',
      }),
    ).not.toThrow();
  });
});
