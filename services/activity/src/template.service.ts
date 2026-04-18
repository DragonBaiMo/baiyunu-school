/**
 * 活动模板服务：
 * - 3 个内置模板（返校节 / 讲座 / 募捐）
 * - `seedBuiltinActivityTemplates(db)` 幂等写入 `activity_template` 表
 * - `ensureActivityTemplateTable(db)` 建表 + ALTER 补列
 */

import { Inject, Injectable, Optional } from '@nestjs/common';
import type { DbClient } from '@bynu/db';
import { ActivityError } from './errors.js';
import { ActivityDslSchema } from './schemas.js';
import { ACT_DB, type ActivityDsl, type ActivityTemplateRow } from './types.js';

interface TemplateDbRow {
  id: string;
  name: string;
  category: string;
  description: string | null;
  dsl: unknown;
  builtin: boolean;
}

export async function ensureActivityTemplateTable(
  db: DbClient,
): Promise<void> {
  await db.query(`
    CREATE TABLE IF NOT EXISTS activity_template (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT,
      dsl JSONB NOT NULL DEFAULT '{}',
      builtin BOOLEAN NOT NULL DEFAULT FALSE
    )
  `);
}

/**
 * 补齐 activity 表的状态时间戳列。idempotent。
 */
export async function ensureActivityStateColumns(
  db: DbClient,
): Promise<void> {
  await db.query(
    `ALTER TABLE activity ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ`,
  );
  await db.query(
    `ALTER TABLE activity ADD COLUMN IF NOT EXISTS closed_at TIMESTAMPTZ`,
  );
  await db.query(
    `ALTER TABLE activity ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ`,
  );
}

export interface BuiltinActivityTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  dsl: ActivityDsl;
}

export const BUILTIN_ACTIVITY_TEMPLATES: BuiltinActivityTemplate[] = [
  {
    id: 'tpl-homecoming',
    name: '返校节活动',
    category: 'homecoming',
    description: '经典返校节流程：校友报名 + 到校须知通知',
    dsl: {
      steps: [
        {
          id: 'step-register',
          type: 'form',
          title: '填写返校信息',
          config: { fields: ['realName', 'phone', 'class'] },
        },
        {
          id: 'step-notice',
          type: 'notice',
          title: '入校须知',
          config: {
            content:
              '请提前 30 分钟到达，出示校友卡与身份证；严禁携带易燃易爆物品。',
          },
        },
      ],
      formFields: [
        {
          name: 'realName',
          label: '真实姓名',
          type: 'text',
          required: true,
          minLength: 2,
          maxLength: 20,
        },
        {
          name: 'phone',
          label: '联系电话',
          type: 'tel',
          required: true,
          regex: '^1[3-9]\\d{9}$',
        },
        {
          name: 'class',
          label: '所在班级',
          type: 'text',
          required: true,
          maxLength: 60,
        },
      ],
    },
  },
  {
    id: 'tpl-lecture',
    name: '讲座沙龙',
    category: 'lecture',
    description: '讲座报名流程：留资 + 单场次',
    dsl: {
      steps: [
        {
          id: 'step-register',
          type: 'form',
          title: '讲座报名',
          config: { fields: ['realName', 'email', 'interest'] },
        },
      ],
      formFields: [
        {
          name: 'realName',
          label: '姓名',
          type: 'text',
          required: true,
          minLength: 2,
          maxLength: 20,
        },
        {
          name: 'email',
          label: '邮箱',
          type: 'email',
          required: true,
          regex: '^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$',
        },
        {
          name: 'interest',
          label: '关注方向',
          type: 'select',
          required: false,
          enum: ['技术', '管理', '创业', '教育'],
        },
      ],
    },
  },
  {
    id: 'tpl-fund-raising',
    name: '募捐活动',
    category: 'donation',
    description: '含表单 + 支付占位 + 感谢通知',
    dsl: {
      steps: [
        {
          id: 'step-register',
          type: 'form',
          title: '填写捐赠人信息',
          config: { fields: ['realName', 'contact'] },
        },
        {
          id: 'step-pay',
          type: 'payment',
          title: '完成支付',
          config: { amountCents: 10000, channel: 'mock' },
        },
        {
          id: 'step-thanks',
          type: 'notice',
          title: '致谢',
          config: { content: '感谢您的善举，您的捐赠将记入数字长碑。' },
        },
      ],
      formFields: [
        {
          name: 'realName',
          label: '姓名',
          type: 'text',
          required: true,
          minLength: 2,
          maxLength: 20,
        },
        {
          name: 'contact',
          label: '联系方式',
          type: 'text',
          required: true,
          maxLength: 60,
        },
      ],
    },
  },
];

export async function seedBuiltinActivityTemplates(
  db: DbClient,
): Promise<void> {
  for (const tpl of BUILTIN_ACTIVITY_TEMPLATES) {
    // 运行时再校验一次，防止代码与 schema 漂移
    const parsed = ActivityDslSchema.parse(tpl.dsl);
    const existing = await db.query<{ id: string }>(
      `SELECT id FROM activity_template WHERE id = $1`,
      [tpl.id],
    );
    if (existing.rows.length === 0) {
      await db.query(
        `INSERT INTO activity_template
         (id, name, category, description, dsl, builtin)
         VALUES ($1,$2,$3,$4,$5,TRUE)`,
        [tpl.id, tpl.name, tpl.category, tpl.description, JSON.stringify(parsed)],
      );
    } else {
      await db.query(
        `UPDATE activity_template
         SET name=$2, category=$3, description=$4, dsl=$5, builtin=TRUE
         WHERE id=$1`,
        [tpl.id, tpl.name, tpl.category, tpl.description, JSON.stringify(parsed)],
      );
    }
  }
}

@Injectable()
export class ActivityTemplateService {
  constructor(@Optional() @Inject(ACT_DB) private readonly db: DbClient) {}

  async list(): Promise<ActivityTemplateRow[]> {
    const res = await this.db.query(
      `SELECT id, name, category, description, dsl, builtin
       FROM activity_template
       ORDER BY builtin DESC, name ASC`,
    );
    return (res.rows as unknown as TemplateDbRow[]).map(toTemplateRow);
  }

  async findById(id: string): Promise<ActivityTemplateRow> {
    const res = await this.db.query(
      `SELECT id, name, category, description, dsl, builtin
       FROM activity_template WHERE id = $1`,
      [id],
    );
    const row = res.rows[0] as TemplateDbRow | undefined;
    if (!row) {
      throw new ActivityError(
        'ACTIVITY_NOT_FOUND',
        `template ${id} 不存在`,
        404,
      );
    }
    return toTemplateRow(row);
  }
}

function toTemplateRow(row: TemplateDbRow): ActivityTemplateRow {
  const raw = row.dsl;
  const dsl =
    typeof raw === 'string'
      ? (JSON.parse(raw) as ActivityDsl)
      : (raw as ActivityDsl);
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    description: row.description,
    dsl,
    builtin: Boolean(row.builtin),
  };
}
