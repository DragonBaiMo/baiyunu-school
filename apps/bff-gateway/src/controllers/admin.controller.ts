/**
 * 管理路由：需 JWT + admin 角色。
 * - GET /api/v1/admin/ping → 原生（super-admin / portal-admin）
 * - 其他 /api/v1/admin/** → 透传到 server（任何 admin 角色即可）
 */

import { All, Controller, Get, Inject, Req, Res, SetMetadata, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request, Response } from 'express';
import { Roles } from '../auth/roles.decorator.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { RbacGuard } from '../auth/rbac.guard.js';
import { ForwardService } from '../proxy/forward.service.js';

interface RequestWithUser extends Request {
  user?: { sub?: string; roles?: readonly string[] } | undefined;
}

@Controller('api/v1/admin')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class AdminController {
  constructor(@Inject(ForwardService) private readonly fwd: ForwardService) {}

  @Get('ping')
  @Roles('super-admin', 'portal-admin')
  ping(): { ok: true; scope: 'admin' } {
    return { ok: true, scope: 'admin' };
  }

  @UseGuards(AuthGuard('jwt'), RbacGuard)
  @SetMetadata('roles', ['admin', 'super-admin', 'portal-admin', 'identity-reviewer', 'activity-runner', 'donation-ops', 'org-admin'])
  @All('*')
  async catchAll(@Req() req: RequestWithUser, @Res() res: Response): Promise<void> {
    await this.fwd.forward(req, res);
  }
}
