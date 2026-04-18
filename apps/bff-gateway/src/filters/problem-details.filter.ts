/**
 * 全局异常过滤器：以 RFC 7807 Problem Details 格式统一错误响应。
 * 与 @bynu/server 共用相同实现。
 */

import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { Request, Response } from 'express';

interface ProblemDetailsBody {
  type: string;
  title: string;
  status: number;
  detail?: string;
  instance?: string;
  traceId?: string;
}

@Catch()
export class ProblemDetailsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const http = host.switchToHttp();
    const res = http.getResponse<Response>();
    const req = http.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let title = 'Internal Server Error';
    let detail: string | undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      title = exception.name;
      const resp = exception.getResponse();
      detail = typeof resp === 'string' ? resp : (resp as { message?: string }).message;
    } else if (exception instanceof Error) {
      detail = exception.message;
    }

    const body: ProblemDetailsBody = {
      type: `https://bynu.example.com/errors/${status}`,
      title,
      status,
      instance: req.originalUrl,
    };
    if (detail !== undefined) body.detail = detail;

    res.status(status).setHeader('content-type', 'application/problem+json').json(body);
  }
}
