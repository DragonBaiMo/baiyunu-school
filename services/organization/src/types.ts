/**
 * organization 领域共享类型 + DI token。
 */

import type { DbClient } from '@bynu/db';
import type { z } from 'zod';
import type {
  CreateNodeSchema,
  CreatePostSchema,
  ListPostsQuerySchema,
  OrgNodeTypeEnum,
  OrgPostVisibilityEnum,
  UpdateNodeSchema,
} from './schemas.js';

export const ORG_DB = Symbol.for('bynu.organization.db');

export const ORG_MAX_DEPTH = 5;

export type OrgNodeType = z.infer<typeof OrgNodeTypeEnum>;
export type OrgPostVisibility = z.infer<typeof OrgPostVisibilityEnum>;
export type CreateNodeInput = z.infer<typeof CreateNodeSchema>;
export type UpdateNodeInput = z.infer<typeof UpdateNodeSchema>;
export type CreatePostInput = z.infer<typeof CreatePostSchema>;
export type ListPostsQuery = z.infer<typeof ListPostsQuerySchema>;

export interface OrgNodeRow {
  id: string;
  parentId: string | null;
  name: string;
  type: OrgNodeType;
  meta: Record<string, unknown>;
}

export interface OrgTreeNode extends OrgNodeRow {
  children: OrgTreeNode[];
}

export interface OrgPostRow {
  id: string;
  orgNodeId: string;
  authorId: string;
  title: string;
  contentMd: string;
  visibility: OrgPostVisibility;
  pinned: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ListPostsResult {
  items: OrgPostRow[];
  nextCursor: string | null;
}

export interface OrgRuntimeDeps {
  db: DbClient;
}
