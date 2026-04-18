/**
 * Zod 请求/响应 schema。在 Controller 入口显式校验，同时作为 DSL 结构的运行时约束源。
 *
 * 页面 DSL 支持 5 种 block：hero / news / stats / quickLinks / richText。
 */

import { z } from 'zod';

export const HeroBlockSchema = z.object({
  kind: z.literal('hero'),
  title: z.string().min(1).max(120),
  subtitle: z.string().max(240),
  cta: z.object({
    text: z.string().min(1).max(40),
    href: z.string().min(1).max(500),
  }),
  backgroundUrl: z.string().url().optional(),
});

export const NewsBlockSchema = z.object({
  kind: z.literal('news'),
  category: z.enum(['校园动态', '学院新闻', '校友故事', '公告']),
  limit: z.number().int().positive().max(50),
  title: z.string().max(80).optional(),
});

export const StatsBlockSchema = z.object({
  kind: z.literal('stats'),
  items: z
    .array(
      z.object({
        label: z.string().min(1).max(40),
        value: z.string().min(1).max(40),
      }),
    )
    .min(1)
    .max(8),
});

export const QuickLinksBlockSchema = z.object({
  kind: z.literal('quickLinks'),
  items: z
    .array(
      z.object({
        label: z.string().min(1).max(30),
        href: z.string().min(1).max(500),
        icon: z.string().max(60).optional(),
      }),
    )
    .min(1)
    .max(12),
});

export const RichTextBlockSchema = z.object({
  kind: z.literal('richText'),
  markdown: z.string().min(1),
});

export const PageBlockSchema = z.discriminatedUnion('kind', [
  HeroBlockSchema,
  NewsBlockSchema,
  StatsBlockSchema,
  QuickLinksBlockSchema,
  RichTextBlockSchema,
]);

export const PageDslSchema = z.object({
  blocks: z.array(PageBlockSchema).min(1).max(30),
});

export const NewsCategoryEnum = z.enum(['校园动态', '学院新闻', '校友故事', '公告']);

export const CreatePageSchema = z.object({
  slug: z
    .string()
    .min(1)
    .max(80)
    .regex(/^[a-z0-9][a-z0-9-]*$/),
  title: z.string().min(1).max(120),
  dsl: PageDslSchema,
});

export const UpdatePageSchema = z.object({
  title: z.string().min(1).max(120).optional(),
  dsl: PageDslSchema.optional(),
  version: z.number().int().positive(),
});

export const PublishPageSchema = z.object({
  version: z.number().int().positive(),
});

export const ApplyTemplateSchema = z.object({
  slug: z
    .string()
    .min(1)
    .max(80)
    .regex(/^[a-z0-9][a-z0-9-]*$/),
  templateId: z.string().min(1),
  title: z.string().min(1).max(120).optional(),
});

export const CreateNewsSchema = z.object({
  title: z.string().min(1).max(120),
  contentMd: z.string().min(1),
  category: NewsCategoryEnum,
  orgNodeId: z.string().min(1),
  authorId: z.string().min(1),
  pinned: z.boolean().optional(),
  coverUrl: z.string().url().optional(),
});

export const UpdateNewsSchema = z.object({
  title: z.string().min(1).max(120).optional(),
  contentMd: z.string().min(1).optional(),
  category: NewsCategoryEnum.optional(),
  pinned: z.boolean().optional(),
  coverUrl: z.string().url().optional(),
});

export const NewsListQuerySchema = z.object({
  category: NewsCategoryEnum.optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
});
