/**
 * 校友路由：需 JWT，任何角色均可。
 * - GET /api/v1/alumni/ping → 原生
 * - 其他 /api/v1/alumni/** → 透传到 server
 */

import { All, Controller, Get, Inject, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request, Response } from 'express';
import { ForwardService } from '../proxy/forward.service.js';

interface RequestWithUser extends Request {
  user?: { sub?: string; roles?: readonly string[] } | undefined;
}

@Controller('api/v1/alumni')
@UseGuards(AuthGuard('jwt'))
export class AlumniController {
  constructor(@Inject(ForwardService) private readonly fwd: ForwardService) {}

  @Get('ping')
  ping(): { ok: true; scope: 'alumni' } {
    return { ok: true, scope: 'alumni' };
  }

  @All('*')
  async catchAll(@Req() req: RequestWithUser, @Res() res: Response): Promise<void> {
    await this.fwd.forward(req, res);
  }
}
