/**
 * DSL 引擎：
 * - validateDsl：zod schema + 步骤 id 唯一 + form 步骤引用的字段必须存在于 formFields
 * - validateFormData：根据 FormField 规则（required/minLength/maxLength/regex/enum）逐字段校验
 */

import { Injectable } from '@nestjs/common';
import { ActivityError } from './errors.js';
import { ActivityDslSchema } from './schemas.js';
import type { ActivityDsl, FormField } from './types.js';

@Injectable()
export class DslService {
  /**
   * 校验 DSL：若不合法抛 FORM_VALIDATION_FAILED / STEP_NOT_FOUND。
   * 校验通过返回强类型化的 DSL。
   */
  validateDsl(raw: unknown): ActivityDsl {
    const parsed = ActivityDslSchema.safeParse(raw);
    if (!parsed.success) {
      const detail = parsed.error.issues
        .map((i) => `${i.path.join('.') || '<root>'}: ${i.message}`)
        .join('; ');
      throw new ActivityError(
        'FORM_VALIDATION_FAILED',
        `DSL 结构非法：${detail}`,
        400,
      );
    }
    const dsl = parsed.data;

    // 业务规则 1：步骤 id 唯一
    const seen = new Set<string>();
    for (const step of dsl.steps) {
      if (seen.has(step.id)) {
        throw new ActivityError(
          'FORM_VALIDATION_FAILED',
          `DSL 步骤 id 重复：${step.id}`,
          400,
        );
      }
      seen.add(step.id);
    }

    // 业务规则 2：form 步骤 config.fields 必须都存在于 formFields
    const fieldNames = new Set(
      (dsl.formFields ?? []).map((f) => f.name),
    );
    for (const step of dsl.steps) {
      if (step.type !== 'form') continue;
      for (const ref of step.config.fields) {
        if (!fieldNames.has(ref)) {
          throw new ActivityError(
            'STEP_NOT_FOUND',
            `DSL 步骤 ${step.id} 引用了未定义字段：${ref}`,
            400,
          );
        }
      }
    }
    return dsl;
  }

  /**
   * 按 FormField 规则校验用户提交的 formData。
   * 任意一条失败都会抛 FORM_VALIDATION_FAILED，携带所有失败详情。
   */
  validateFormData(
    formFields: FormField[] | undefined,
    data: Record<string, unknown>,
  ): void {
    if (!formFields || formFields.length === 0) return;
    const issues: string[] = [];
    for (const field of formFields) {
      const value = data[field.name];
      const missing =
        value === undefined || value === null || value === '';
      if (field.required && missing) {
        issues.push(`${field.name}: 必填`);
        continue;
      }
      if (missing) continue;

      if (typeof value === 'string') {
        if (
          typeof field.minLength === 'number' &&
          value.length < field.minLength
        ) {
          issues.push(
            `${field.name}: 长度不足 ${field.minLength}，当前 ${value.length}`,
          );
        }
        if (
          typeof field.maxLength === 'number' &&
          value.length > field.maxLength
        ) {
          issues.push(
            `${field.name}: 长度超过 ${field.maxLength}，当前 ${value.length}`,
          );
        }
        if (field.regex) {
          let re: RegExp;
          try {
            re = new RegExp(field.regex);
          } catch {
            issues.push(`${field.name}: 字段 regex 非法`);
            continue;
          }
          if (!re.test(value)) {
            issues.push(`${field.name}: 不符合正则 ${field.regex}`);
          }
        }
        if (field.enum && !field.enum.includes(value)) {
          issues.push(
            `${field.name}: 需为枚举 [${field.enum.join(',')}] 之一`,
          );
        }
      } else if (field.enum) {
        // 枚举型字段要求字符串
        issues.push(`${field.name}: 需为字符串且属于枚举`);
      }
    }
    if (issues.length > 0) {
      throw new ActivityError(
        'FORM_VALIDATION_FAILED',
        `表单校验失败：${issues.join('; ')}`,
        400,
      );
    }
  }
}
