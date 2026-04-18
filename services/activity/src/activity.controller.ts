/**
 * activity HTTP 控制器：
 *   public：/api/v1/public/activities
 *   alumni：/api/v1/alumni/activities/...
 *   admin：/api/v1/admin/activities
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
import { ActivityCoreService } from './activity.service.js';
import { EnrollmentService } from './enrollment.service.js';
import {
  ActivityRolesGuard,
  RequirePerm,
  readActivityActor,
} from './roles.guard.js';
import {
  AdminActivityListQuerySchema,
  CheckInByTicketSchema,
  CreateActivitySchema,
  EnrollActivitySchema,
  PublicActivityListQuerySchema,
  UpdateActivitySchema,
} from './schemas.js';
import { ActivityScreenService } from './screen.service.js';
import type {
  ActivityRow,
  ActivityScreenSummary,
  EnrollmentRow,
} from './types.js';

function parseOrThrow<T extends z.ZodTypeAny>(
  schema: T,
  data: unknown,
): z.output<T> {
  const res = schema.safeParse(data);
  if (!res.success) {
    const detail = res.error.issues
      .map((i) => `${i.path.join('.') || '<root>'}: ${i.message}`)
      .join('; ');
    throw new BadRequestException(`请求参数校验失败：${detail}`);
  }
  return res.data as z.output<T>;
}

@Controller('api/v1/public/activities')
export class PublicActivityController {
  constructor(private readonly activities: ActivityCoreService) {}

  @Get()
  async list(@Query() query: unknown): Promise<ActivityRow[]> {
    const parsed = parseOrThrow(PublicActivityListQuerySchema, query ?? {});
    return this.activities.listPublic(parsed);
  }

  @Get(':id')
  async get(@Param('id') id: string): Promise<ActivityRow> {
    const activity = await this.activities.getById(id);
    if (activity.status !== 'published') {
      // 公开端仅暴露已发布活动
      throw new BadRequestException(`活动 ${id} 未发布`);
    }
    return activity;
  }
}

@UseGuards(ActivityRolesGuard)
@Controller('api/v1/alumni/activities')
export class AlumniActivityController {
  constructor(private readonly enrollments: EnrollmentService) {}

  @Post(':id/enroll')
  @RequirePerm('alumni', 'admin')
  async enroll(
    @Param('id') activityId: string,
    @Body() body: unknown,
    @Req() req: Request,
  ): Promise<EnrollmentRow> {
    const actor = readActivityActor(req);
    const raw =
      body && typeof body === 'object' ? { ...(body as object) } : {};
    const merged = {
      ...(raw as Record<string, unknown>),
      activityId,
      alumniId: actor.id,
    };
    const input = parseOrThrow(EnrollActivitySchema, merged);
    return this.enrollments.enroll(input);
  }

  @Get('enrollments')
  @RequirePerm('alumni', 'admin')
  async listMine(@Req() req: Request): Promise<EnrollmentRow[]> {
    const actor = readActivityActor(req);
    return this.enrollments.listByAlumni(actor.id);
  }

  @Delete('enrollments/:id')
  @RequirePerm('alumni', 'admin')
  async cancel(
    @Param('id') id: string,
    @Req() req: Request,
  ): Promise<EnrollmentRow> {
    const actor = readActivityActor(req);
    return this.enrollments.cancel(id, actor.id);
  }

  @Post('check-in')
  @RequirePerm('alumni', 'admin', 'activity_staff')
  async checkIn(
    @Body() body: unknown,
    @Req() req: Request,
  ): Promise<EnrollmentRow> {
    const operatorHeader = req.headers['x-operator-id'];
    const operatorId =
      (typeof operatorHeader === 'string' && operatorHeader) ||
      readActivityActor(req).id;
    const input = parseOrThrow(CheckInByTicketSchema, {
      ...((body ?? {}) as object),
      operatorId,
    });
    return this.enrollments.checkInByTicket(input.qrTicket, input.operatorId);
  }
}

@UseGuards(ActivityRolesGuard)
@Controller('api/v1/admin/activities')
export class AdminActivityController {
  constructor(
    private readonly activities: ActivityCoreService,
    private readonly enrollments: EnrollmentService,
    private readonly screen: ActivityScreenService,
  ) {}

  @Post()
  @RequirePerm('admin', 'activity_manager')
  async create(
    @Body() body: unknown,
    @Req() req: Request,
  ): Promise<ActivityRow> {
    const actor = readActivityActor(req);
    const raw =
      body && typeof body === 'object' ? { ...(body as object) } : {};
    const merged = {
      ...(raw as Record<string, unknown>),
      creatorId:
        (raw as Record<string, unknown>)['creatorId'] ?? actor.id,
    };
    const input = parseOrThrow(CreateActivitySchema, merged);
    return this.activities.create(input);
  }

  @Get()
  @RequirePerm('admin', 'activity_manager')
  async list(@Query() query: unknown): Promise<ActivityRow[]> {
    const parsed = parseOrThrow(AdminActivityListQuerySchema, query ?? {});
    return this.activities.listAdmin(parsed);
  }

  @Get(':id')
  @RequirePerm('admin', 'activity_manager')
  async get(@Param('id') id: string): Promise<ActivityRow> {
    return this.activities.getById(id);
  }

  @Put(':id')
  @RequirePerm('admin', 'activity_manager')
  async update(
    @Param('id') id: string,
    @Body() body: unknown,
  ): Promise<ActivityRow> {
    const input = parseOrThrow(UpdateActivitySchema, body ?? {});
    return this.activities.update(id, input);
  }

  @Post(':id/publish')
  @RequirePerm('admin', 'activity_manager')
  async publish(@Param('id') id: string): Promise<ActivityRow> {
    return this.activities.publish(id);
  }

  @Post(':id/cancel')
  @RequirePerm('admin', 'activity_manager')
  async cancel(@Param('id') id: string): Promise<ActivityRow> {
    return this.activities.cancel(id);
  }

  @Post(':id/close')
  @RequirePerm('admin', 'activity_manager')
  async close(@Param('id') id: string): Promise<ActivityRow> {
    return this.activities.close(id);
  }

  @Get(':id/enrollments')
  @RequirePerm('admin', 'activity_manager')
  async listEnrollments(
    @Param('id') activityId: string,
  ): Promise<EnrollmentRow[]> {
    return this.enrollments.listByActivity(activityId);
  }

  @Get(':id/screen')
  @RequirePerm('admin', 'activity_manager')
  async screenSummary(
    @Param('id') activityId: string,
  ): Promise<ActivityScreenSummary> {
    return this.screen.summary(activityId);
  }
}
