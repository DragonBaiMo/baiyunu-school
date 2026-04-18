/**
 * JwtModule：注册 Passport + JWT 策略。
 * - 全局 JwtAuthGuard 在 admin / alumni 路由通过 @UseGuards 引用
 * - 公共路由（/api/v1/public/*）不引用 Guard，因此匿名可达
 */

import { Module } from '@nestjs/common';
import { JwtModule as NestJwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { loadConfig } from '@bynu/config';
import { JwtStrategy } from './jwt.strategy.js';
import { RolesGuard } from './roles.guard.js';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    NestJwtModule.register({
      secret: process.env['JWT_SECRET'] ?? loadConfig().JWT_SECRET,
      signOptions: { expiresIn: '1h' },
    }),
  ],
  providers: [JwtStrategy, RolesGuard],
  exports: [PassportModule, NestJwtModule, JwtStrategy, RolesGuard],
})
export class AuthJwtModule {}
