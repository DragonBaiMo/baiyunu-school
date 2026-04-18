/**
 * Zod 请求/DSL 校验。
 *
 * DSL 结构：
 *   {
 *     steps: Step[],          // 1..10 个步骤（form/payment/approval/notice）
 *     formFields?: FormField[] // 当存在 form 步骤时，字段定义的单一事实来源
 *   }
 */

import { z } from 'zod';

export const ActivityStatusEnum = z.enum([
  'draft',
  'published',
  'closed',
  'cancelled',
]);

export const DslStepTypeEnum = z.enum([
  'form',
  'payment',
  'approval',
  'notice',
]);

export const FormFieldSchema = z.object({
  name: z
    .string()
    .min(1)
    .max(40)
    .regex(/^[a-zA-Z_][a-zA-Z0-9_]*$/, 'FormField.name 须为合法标识符'),
  label: z.string().min(1).max(60),
  type: z.enum(['text', 'number', 'select', 'textarea', 'tel', 'email']),
  required: z.boolean().optional(),
  minLength: z.number().int().nonnegative().optional(),
  maxLength: z.number().int().positive().optional(),
  regex: z.string().max(200).optional(),
  enum: z.array(z.string().min(1)).min(1).max(40).optional(),
});

const FormStepConfig = z.object({
  fields: z.array(z.string().min(1)).min(1).max(40),
});

const PaymentStepConfig = z.object({
  amountCents: z.number().int().nonnegative(),
  channel: z.enum(['mock', 'wechat', 'alipay']).default('mock'),
});

const ApprovalStepConfig = z.object({
  approverRole: z.string().min(1).max(40),
});

const NoticeStepConfig = z.object({
  content: z.string().min(1).max(2000),
});

export const DslStepSchema = z.discriminatedUnion('type', [
  z.object({
    id: z.string().min(1).max(40),
    type: z.literal('form'),
    title: z.string().min(1).max(120),
    config: FormStepConfig,
  }),
  z.object({
    id: z.string().min(1).max(40),
    type: z.literal('payment'),
    title: z.string().min(1).max(120),
    config: PaymentStepConfig,
  }),
  z.object({
    id: z.string().min(1).max(40),
    type: z.literal('approval'),
    title: z.string().min(1).max(120),
    config: ApprovalStepConfig,
  }),
  z.object({
    id: z.string().min(1).max(40),
    type: z.literal('notice'),
    title: z.string().min(1).max(120),
    config: NoticeStepConfig,
  }),
]);

export const ActivityDslSchema = z.object({
  steps: z.array(DslStepSchema).min(1).max(10),
  formFields: z.array(FormFieldSchema).max(40).optional(),
});

const IsoDateTime = z
  .string()
  .min(1)
  .refine((v) => !Number.isNaN(new Date(v).getTime()), {
    message: '需为合法 ISO 日期时间',
  });

export const CreateActivitySchema = z.object({
  title: z.string().min(1).max(120),
  templateId: z.string().min(1).max(80).optional(),
  dsl: ActivityDslSchema,
  quota: z.number().int().positive().max(100_000),
  startAt: IsoDateTime,
  endAt: IsoDateTime,
  creatorId: z.string().min(1).max(80),
});

export const UpdateActivitySchema = z.object({
  title: z.string().min(1).max(120).optional(),
  dsl: ActivityDslSchema.optional(),
  quota: z.number().int().positive().max(100_000).optional(),
  startAt: IsoDateTime.optional(),
  endAt: IsoDateTime.optional(),
});

export const PublishActivitySchema = z.object({
  id: z.string().min(1),
});

export const CancelActivitySchema = z.object({
  id: z.string().min(1),
});

export const EnrollActivitySchema = z.object({
  activityId: z.string().min(1),
  alumniId: z.string().min(1),
  formData: z.record(z.unknown()).default({}),
});

export const CheckInByTicketSchema = z.object({
  qrTicket: z.string().min(8).max(200),
  operatorId: z.string().min(1),
});

export const PublicActivityListQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(100).default(20),
  offset: z.coerce.number().int().nonnegative().default(0),
});

export const AdminActivityListQuerySchema = z.object({
  status: ActivityStatusEnum.optional(),
  limit: z.coerce.number().int().positive().max(200).default(50),
  offset: z.coerce.number().int().nonnegative().default(0),
});
