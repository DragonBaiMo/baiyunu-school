/**
 * organization HTTP 控制器：
 *   公开：/api/v1/public/org/nodes/:id/subtree、/api/v1/public/org/posts
 *   校友：/api/v1/alumni/org/posts (POST)
 *   管理：/api/v1/admin/org/nodes (CRUD/move)、/api/v1/admin/org/posts/:id/pin
 */

import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { z } from 'zod';
import { BbsService } from './bbs.service.js';
import { OrgRolesGuard, RequirePerm, readOrgActor } from './roles.guard.js';
import {
  CreateNodeSchema,
  CreatePostSchema,
  ListPostsQuerySchema,
  MoveNodeSchema,
  UpdateNodeSchema,
} from './schemas.js';
import { TreeService } from './tree.service.js';
import type {
  ListPostsResult,
  OrgNodeRow,
  OrgPostRow,
  OrgTreeNode,
} from './types.js';

function parseOrThrow<T extends z.ZodTypeAny>(schema: T, data: unknown): z.output<T> {
  const res = schema.safeParse(data);
  if (!res.success) {
    const detail = res.error.issues
      .map((i) => `${i.path.join('.') || '<root>'}: ${i.message}`)
      .join('; ');
    throw new BadRequestException(`请求参数校验失败：${detail}`);
  }
  return res.data as z.output<T>;
}

@Controller('api/v1/public/org')
export class PublicOrgController {
  constructor(
    private readonly tree: TreeService,
    private readonly bbs: BbsService,
  ) {}

  @Get('nodes/:id/subtree')
  async subtree(@Param('id') id: string): Promise<OrgTreeNode> {
    return this.tree.getSubtree(id);
  }

  @Get('posts')
  async listPosts(@Query() query: unknown): Promise<ListPostsResult> {
    const parsed = parseOrThrow(ListPostsQuerySchema, query ?? {});
    const { orgNodeId, ...rest } = parsed;
    return this.bbs.listPostsByNode(orgNodeId, rest);
  }
}

@UseGuards(OrgRolesGuard)
@Controller('api/v1/alumni/org')
export class AlumniOrgController {
  constructor(private readonly bbs: BbsService) {}

  @Post('posts')
  @RequirePerm('alumni', 'admin')
  async createPost(@Body() body: unknown, @Req() req: Request): Promise<OrgPostRow> {
    const actor = readOrgActor(req);
    const raw =
      body && typeof body === 'object' ? { ...(body as object) } : {};
    // authorId 以网关注入的 x-user-id 为准，避免客户端伪造
    (raw as Record<string, unknown>).authorId = actor.id;
    const input = parseOrThrow(CreatePostSchema, raw);
    return this.bbs.createPost(input);
  }

  @Delete('posts/:id')
  @RequirePerm('alumni', 'admin', 'org_manager')
  async deletePost(
    @Param('id') id: string,
    @Req() req: Request,
  ): Promise<{ ok: true }> {
    const actor = readOrgActor(req);
    await this.bbs.deletePost(id, { userId: actor.id, roles: actor.roles });
    return { ok: true };
  }
}

@UseGuards(OrgRolesGuard)
@Controller('api/v1/admin/org')
export class AdminOrgController {
  constructor(
    private readonly tree: TreeService,
    private readonly bbs: BbsService,
  ) {}

  @Post('nodes')
  @RequirePerm('admin', 'org_manager')
  async createNode(@Body() body: unknown): Promise<OrgNodeRow> {
    const input = parseOrThrow(CreateNodeSchema, body);
    return this.tree.createNode(input);
  }

  @Put('nodes/:id')
  @RequirePerm('admin', 'org_manager')
  async updateNode(
    @Param('id') id: string,
    @Body() body: unknown,
  ): Promise<OrgNodeRow> {
    const input = parseOrThrow(UpdateNodeSchema, body);
    return this.tree.updateNode(id, input);
  }

  @Post('nodes/:id/move')
  @RequirePerm('admin', 'org_manager')
  async moveNode(
    @Param('id') id: string,
    @Body() body: unknown,
  ): Promise<{ ok: true }> {
    const input = parseOrThrow(MoveNodeSchema, body);
    await this.tree.moveNode(id, input.newParentId);
    return { ok: true };
  }

  @Get('nodes/:id/children')
  @RequirePerm('admin', 'org_manager')
  async listChildren(@Param('id') id: string): Promise<OrgNodeRow[]> {
    return this.tree.listChildren(id);
  }

  @Delete('nodes/:id')
  @RequirePerm('admin', 'org_manager')
  async removeNode(@Param('id') id: string): Promise<{ ok: true }> {
    await this.tree.removeNode(id);
    return { ok: true };
  }

  @Post('posts/:id/pin')
  @RequirePerm('admin', 'org_manager')
  async pinPost(@Param('id') id: string): Promise<OrgPostRow> {
    return this.bbs.pinPost(id);
  }

  @Post('posts/:id/unpin')
  @RequirePerm('admin', 'org_manager')
  async unpinPost(@Param('id') id: string): Promise<OrgPostRow> {
    return this.bbs.unpinPost(id);
  }
}
