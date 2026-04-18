/**
 * workflow HTTP 控制器：
 *   alumni：/api/v1/alumni/workflow/{slots,reservations,proofs}
 *   public：/api/v1/public/workflow/proofs/:id/verify
 */

import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { z } from 'zod';
import { ProofService } from './proof.service.js';
import { ReservationService } from './reservation.service.js';
import {
  RequirePerm,
  WorkflowRolesGuard,
  readWorkflowActor,
} from './roles.guard.js';
import {
  CreateReservationSchema,
  IssueProofSchema,
  ListSlotsQuerySchema,
  VerifyProofSchema,
} from './schemas.js';
import type {
  ProofRow,
  ReservationRow,
  SlotAvailability,
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

@UseGuards(WorkflowRolesGuard)
@Controller('api/v1/alumni/workflow')
export class AlumniWorkflowController {
  constructor(
    private readonly reservations: ReservationService,
    private readonly proofs: ProofService,
  ) {}

  @Get('slots')
  @RequirePerm('alumni', 'admin')
  async listSlots(@Query() query: unknown): Promise<SlotAvailability[]> {
    const parsed = parseOrThrow(ListSlotsQuerySchema, query ?? {});
    return this.reservations.listAvailableSlots(parsed);
  }

  @Post('reservations')
  @RequirePerm('alumni', 'admin')
  async create(
    @Body() body: unknown,
    @Req() req: Request,
  ): Promise<ReservationRow> {
    const actor = readWorkflowActor(req);
    const raw =
      body && typeof body === 'object' ? { ...(body as object) } : {};
    (raw as Record<string, unknown>).alumniId = actor.id;
    const input = parseOrThrow(CreateReservationSchema, raw);
    return this.reservations.create(input);
  }

  @Get('reservations')
  @RequirePerm('alumni', 'admin')
  async list(@Req() req: Request): Promise<ReservationRow[]> {
    const actor = readWorkflowActor(req);
    return this.reservations.listByAlumni(actor.id);
  }

  @Delete('reservations/:id')
  @RequirePerm('alumni', 'admin')
  async cancel(
    @Param('id') id: string,
    @Req() req: Request,
  ): Promise<ReservationRow> {
    const actor = readWorkflowActor(req);
    return this.reservations.cancel(id, actor.id);
  }

  @Post('proofs')
  @RequirePerm('alumni', 'admin')
  async issueProof(
    @Body() body: unknown,
    @Req() req: Request,
  ): Promise<ProofRow> {
    const actor = readWorkflowActor(req);
    const raw =
      body && typeof body === 'object' ? { ...(body as object) } : {};
    (raw as Record<string, unknown>).alumniId = actor.id;
    const input = parseOrThrow(IssueProofSchema, raw);
    return this.proofs.issueProof(input);
  }
}

@Controller('api/v1/public/workflow')
export class PublicWorkflowController {
  constructor(private readonly proofs: ProofService) {}

  @Get('proofs/:id/verify')
  async verify(
    @Param('id') id: string,
    @Query() query: unknown,
  ): Promise<{ valid: boolean; proof: ProofRow }> {
    const parsed = parseOrThrow(VerifyProofSchema, query ?? {});
    return this.proofs.verifyProof(id, parsed.signature);
  }
}
