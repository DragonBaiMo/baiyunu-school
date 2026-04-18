/**
 * donation HTTP 控制器：
 *   public：/api/v1/public/donation/wall (list + stats)
 *   alumni：/api/v1/alumni/donation/orders (POST create) + /:outTradeNo (GET)
 *   webhook：/api/v1/webhook/donation/:channel (POST)
 *   admin：/api/v1/admin/donation/orders (GET list) + /:id/refund (POST)
 *
 * webhook 需要原始请求体，因此从 `req.rawBody`（Express `bodyParser` 提供）或
 * JSON.stringify(body) 回退（测试环境）读取。
 */

import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { z } from 'zod';
import { DonationCoreService } from './donation.service.js';
import { DonationWallService } from './wall.service.js';
import {
  AdminOrderListQuerySchema,
  CreateDonationSchema,
  PublicWallQuerySchema,
  RefundDonationSchema,
} from './schemas.js';
import {
  DonationRolesGuard,
  RequirePerm,
  readDonationActor,
} from './roles.guard.js';
import type {
  DonationOrderRow,
  DonationWallStats,
  WallListResult,
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

@Controller('api/v1/public/donation/wall')
export class PublicDonationWallController {
  constructor(private readonly wall: DonationWallService) {}

  @Get()
  async list(@Query() query: unknown): Promise<WallListResult> {
    const parsed = parseOrThrow(PublicWallQuerySchema, query ?? {});
    return this.wall.listEntries(parsed);
  }

  @Get('stats')
  async stats(): Promise<DonationWallStats> {
    return this.wall.stats();
  }
}

@UseGuards(DonationRolesGuard)
@Controller('api/v1/alumni/donation/orders')
export class AlumniDonationController {
  constructor(private readonly donation: DonationCoreService) {}

  @Post()
  @RequirePerm('alumni', 'admin')
  async create(
    @Body() body: unknown,
    @Req() req: Request,
  ): Promise<{
    order: DonationOrderRow;
    payUrl: string;
    providerRef: string;
  }> {
    const actor = readDonationActor(req);
    const raw =
      body && typeof body === 'object' ? { ...(body as object) } : {};
    const merged = {
      ...(raw as Record<string, unknown>),
      alumniId: (raw as Record<string, unknown>)['alumniId'] ?? actor.id,
    };
    const input = parseOrThrow(CreateDonationSchema, merged);
    return this.donation.createOrder(input);
  }

  @Get(':outTradeNo')
  @RequirePerm('alumni', 'admin')
  async get(
    @Param('outTradeNo') outTradeNo: string,
  ): Promise<DonationOrderRow> {
    return this.donation.getOrder(outTradeNo);
  }
}

@Controller('api/v1/webhook/donation')
export class DonationWebhookController {
  constructor(private readonly donation: DonationCoreService) {}

  @Post(':channel')
  @HttpCode(200)
  async onHook(
    @Param('channel') _channel: string,
    @Body() body: unknown,
    @Req() req: Request & { rawBody?: Buffer | string },
  ): Promise<{ ok: boolean; status: string }> {
    const headers = req.headers as unknown as Record<string, unknown>;
    const rawBody =
      typeof req.rawBody === 'string'
        ? req.rawBody
        : Buffer.isBuffer(req.rawBody)
          ? req.rawBody.toString('utf8')
          : JSON.stringify(body ?? {});
    const result = await this.donation.handleWebhook(headers, rawBody);
    return { ok: true, status: result.order.status };
  }
}

@UseGuards(DonationRolesGuard)
@Controller('api/v1/admin/donation/orders')
export class AdminDonationController {
  constructor(private readonly donation: DonationCoreService) {}

  @Get()
  @RequirePerm('admin', 'donation_manager')
  async list(@Query() query: unknown): Promise<DonationOrderRow[]> {
    const parsed = parseOrThrow(AdminOrderListQuerySchema, query ?? {});
    return this.donation.listOrders(parsed);
  }

  @Post(':id/refund')
  @RequirePerm('admin', 'donation_manager')
  async refund(
    @Param('id') id: string,
    @Body() body: unknown,
  ): Promise<DonationOrderRow> {
    const raw =
      body && typeof body === 'object' ? { ...(body as object) } : {};
    const merged = {
      ...(raw as Record<string, unknown>),
      orderId: id,
    };
    const input = parseOrThrow(RefundDonationSchema, merged);
    return this.donation.refund(input);
  }
}
