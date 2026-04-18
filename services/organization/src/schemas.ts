/**
 * Zod 请求/响应校验。对齐 migrations 中的 organization_node.type 取值。
 */

import { z } from 'zod';

export const OrgNodeTypeEnum = z.enum([
  'SCHOOL',
  'COLLEGE',
  'DEPARTMENT',
  'CLASS',
  'BRANCH',
]);

export const OrgPostVisibilityEnum = z.enum(['public', 'members']);

export const CreateNodeSchema = z.object({
  parentId: z.string().min(1).nullable(),
  name: z.string().min(1).max(120),
  type: OrgNodeTypeEnum,
  meta: z.record(z.unknown()).optional(),
});

export const UpdateNodeSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  type: OrgNodeTypeEnum.optional(),
  meta: z.record(z.unknown()).optional(),
});

export const MoveNodeSchema = z.object({
  newParentId: z.string().min(1).nullable(),
});

export const CreatePostSchema = z.object({
  orgNodeId: z.string().min(1),
  authorId: z.string().min(1),
  title: z.string().min(1).max(200),
  contentMd: z.string().min(1),
  visibility: OrgPostVisibilityEnum.default('public'),
});

export const ListPostsQuerySchema = z.object({
  orgNodeId: z.string().min(1),
  includeDescendants: z.coerce.boolean().default(false),
  pinned: z.coerce.boolean().optional(),
  cursor: z.string().optional(),
  limit: z.coerce.number().int().positive().max(100).default(20),
});
