/**
 * Identity 内部 HTTP 控制器（/internal/identity/*）。
 * - 使用 Zod 在入口显式校验请求体/查询参数；失败抛 BadRequestException
 * - RBAC 通过 RolesGuard + @Roles() 元数据声明
 * - 所有业务失败抛 IdentityError，由 ProblemDetailsFilter 统一转换
 */

import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { z } from 'zod';
import { ApplicationService } from './application.service.js';
import { CardService } from './card.service.js';
import { Internal, Roles, RolesGuard, readActor } from './roles.guard.js';
import {
  ListQuerySchema,
  RejectBodySchema,
  RotateQrBodySchema,
  SubmitApplicationSchema,
  SupplementBodySchema,
  VerifyQrBodySchema,
} from './schemas.js';

function parseOrThrow<T>(schema: z.ZodType<T>, data: unknown): T {
  const res = schema.safeParse(data);
  if (!res.success) {
    const detail = res.error.issues
      .map((i) => `${i.path.join('.') || '<root>'}: ${i.message}`)
      .join('; ');
    throw new BadRequestException(`请求参数校验失败：${detail}`);
  }
  return res.data;
}

@Internal()
@UseGuards(RolesGuard)
@Controller('internal/identity')
export class IdentityApplicationsController {
  constructor(private readonly app: ApplicationService) {}

  @Post('applications')
  async submit(@Body() body: unknown): Promise<{ id: string; status: string }> {
    const input = parseOrThrow(SubmitApplicationSchema, body);
    return this.app.submit(input);
  }

  @Get('applications')
  @Roles('admin', 'reviewer_all', 'reviewer_college')
  async list(@Query() query: unknown, @Req() req: Request): Promise<unknown> {
    const filter = parseOrThrow(ListQuerySchema, query);
    const actor = readActor(req);
    return this.app.list(filter, actor);
  }

  @Post('applications/:id/approve')
  @Roles('admin', 'reviewer_all', 'reviewer_college')
  async approve(
    @Param('id') id: string,
    @Req() req: Request,
  ): Promise<unknown> {
    const actor = readActor(req);
    return this.app.approve(id, actor.id);
  }

  @Post('applications/:id/reject')
  @Roles('admin', 'reviewer_all', 'reviewer_college')
  async reject(
    @Param('id') id: string,
    @Body() body: unknown,
    @Req() req: Request,
  ): Promise<{ ok: true }> {
    const { reason } = parseOrThrow(RejectBodySchema, body);
    const actor = readActor(req);
    await this.app.reject(id, actor.id, reason);
    return { ok: true };
  }

  @Post('applications/:id/supplement')
  @Roles('admin', 'reviewer_all', 'reviewer_college')
  async supplement(
    @Param('id') id: string,
    @Body() body: unknown,
    @Req() req: Request,
  ): Promise<{ ok: true }> {
    const { note } = parseOrThrow(SupplementBodySchema, body);
    const actor = readActor(req);
    await this.app.supplement(id, actor.id, note);
    return { ok: true };
  }
}

@Internal()
@UseGuards(RolesGuard)
@Controller('internal/identity')
export class IdentityCardsController {
  constructor(private readonly cards: CardService) {}

  @Post('cards/:id/rotate-qr')
  async rotate(
    @Param('id') id: string,
    @Body() body: unknown,
  ): Promise<unknown> {
    const { nowSec } = parseOrThrow(RotateQrBodySchema, body ?? {});
    return this.cards.rotateQrCode(id, nowSec);
  }

  @Post('cards/verify-qr')
  async verify(@Body() body: unknown): Promise<unknown> {
    const { code } = parseOrThrow(VerifyQrBodySchema, body);
    return this.cards.verifyQrCode(code);
  }
}
