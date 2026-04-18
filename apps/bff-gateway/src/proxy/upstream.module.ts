/**
 * Upstream HttpModule：指向 server (3001) 的 HTTP 客户端。
 * Wave B 仅注册模块和默认 baseURL；真实代理调用留给后续 Wave。
 */

import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { loadConfig } from '@bynu/config';
import { ForwardService } from './forward.service.js';

@Module({
  imports: [
    HttpModule.registerAsync({
      useFactory: () => {
        const cfg = loadConfig();
        return {
          baseURL: process.env['UPSTREAM_SERVER_URL'] ?? `http://127.0.0.1:${cfg.PORT_SERVER}`,
          timeout: 5_000,
          maxRedirects: 0,
        };
      },
    }),
  ],
  providers: [ForwardService],
  exports: [HttpModule, ForwardService],
})
export class UpstreamModule {}
