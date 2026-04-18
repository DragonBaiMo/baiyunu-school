/**
 * 透传反向代理 Service：
 * - 透传 method / originalUrl（含 query）/ body / headers 到上游 server。
 * - 过滤 hop-by-hop headers，追加 x-forwarded-for / x-trace-id / x-auth-user-id。
 * - 上游 4xx/5xx 直接透传 status + body；ECONNREFUSED → 502；timeout → 504。
 * - 超时 10s；二进制安全（arraybuffer）。
 */

import { Inject, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { randomUUID } from 'node:crypto';
import type { Request, Response } from 'express';
import type { AxiosError, AxiosResponse, Method, RawAxiosRequestHeaders } from 'axios';

const HOP_BY_HOP = new Set([
  'connection',
  'keep-alive',
  'transfer-encoding',
  'upgrade',
  'proxy-authorization',
  'proxy-authenticate',
  'te',
  'trailer',
  'host',
  'content-length',
]);

interface RequestWithUser extends Request {
  user?: { sub?: string; roles?: readonly string[] } | undefined;
}

interface ProblemDetailsBody {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
  traceId: string;
}

@Injectable()
export class ForwardService {
  constructor(@Inject(HttpService) private readonly http: HttpService) {}

  async forward(req: RequestWithUser, res: Response): Promise<void> {
    const traceId = randomUUID();
    const headers = this.buildUpstreamHeaders(req, traceId);

    let upstream: AxiosResponse<ArrayBuffer>;
    try {
      upstream = await firstValueFrom(
        this.http.request<ArrayBuffer>({
          method: req.method as Method,
          url: req.originalUrl,
          data: this.forwardableBody(req),
          headers,
          responseType: 'arraybuffer',
          validateStatus: () => true,
          timeout: 10_000,
          maxRedirects: 0,
        }),
      );
    } catch (err) {
      this.writeUpstreamError(err, res, req, traceId);
      return;
    }

    for (const [k, v] of Object.entries(upstream.headers)) {
      if (HOP_BY_HOP.has(k.toLowerCase())) continue;
      if (v === undefined || v === null) continue;
      res.setHeader(k, v as string | string[] | number);
    }
    res.setHeader('x-trace-id', traceId);
    res.status(upstream.status).send(Buffer.from(upstream.data));
  }

  private buildUpstreamHeaders(req: RequestWithUser, traceId: string): RawAxiosRequestHeaders {
    const headers: RawAxiosRequestHeaders = {};
    for (const [k, v] of Object.entries(req.headers)) {
      const lk = k.toLowerCase();
      if (HOP_BY_HOP.has(lk)) continue;
      if (v === undefined) continue;
      headers[lk] = Array.isArray(v) ? v.join(',') : v;
    }
    const existingXff = req.headers['x-forwarded-for'];
    const xff = Array.isArray(existingXff) ? existingXff.join(',') : (existingXff ?? req.ip ?? '');
    headers['x-forwarded-for'] = xff;
    headers['x-trace-id'] = traceId;
    if (req.user?.sub) headers['x-auth-user-id'] = req.user.sub;
    return headers;
  }

  private forwardableBody(req: Request): unknown {
    if (req.method === 'GET' || req.method === 'HEAD') return undefined;
    return req.body;
  }

  private writeUpstreamError(
    err: unknown,
    res: Response,
    req: Request,
    traceId: string,
  ): void {
    const ae = err as AxiosError;
    let status = 502;
    let title = 'Bad Gateway';
    let detail = ae.message ?? 'Upstream error';
    if (ae.code === 'ECONNABORTED' || ae.code === 'ETIMEDOUT') {
      status = 504;
      title = 'Gateway Timeout';
      detail = 'Upstream timed out';
    } else if (ae.code === 'ECONNREFUSED') {
      status = 502;
      title = 'Bad Gateway';
      detail = 'Upstream refused connection';
    }
    const body: ProblemDetailsBody = {
      type: `https://bynu.example.com/errors/${status}`,
      title,
      status,
      detail,
      instance: req.originalUrl,
      traceId,
    };
    res
      .status(status)
      .setHeader('content-type', 'application/problem+json')
      .setHeader('x-trace-id', traceId)
      .send(JSON.stringify(body));
  }
}
