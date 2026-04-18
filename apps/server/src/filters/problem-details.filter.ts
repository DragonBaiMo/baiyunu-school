/**
 * 全局异常过滤器：以 RFC 7807 Problem Details 格式统一错误响应。
 * 复用 BFF 网关相同实现以保证两端响应契约一致。
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
  code?: string;
}

interface DomainErrorLike {
  name: string;
  status: number;
  code: string;
  message: string;
}

function isDomainError(x: unknown): x is DomainErrorLike {
  return (
    typeof x === 'object' &&
    x !== null &&
    typeof (x as { code?: unknown }).code === 'string' &&
    typeof (x as { status?: unknown }).status === 'number' &&
    typeof (x as { message?: unknown }).message === 'string'
  );
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
    let code: string | undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      title = exception.name;
      const resp = exception.getResponse();
      detail = typeof resp === 'string' ? resp : (resp as { message?: string }).message;
    } else if (isDomainError(exception)) {
      status = exception.status;
      title = exception.name;
      detail = exception.message;
      code = exception.code;
    } else if (exception instanceof Error) {
      detail = exception.message;
    }

    const body: ProblemDetailsBody = {
      type: `https://bynu.example.com/errors/${code ?? status}`,
      title,
      status,
      instance: req.originalUrl,
    };
    if (detail !== undefined) body.detail = detail;
    if (code !== undefined) body.code = code;

    res.status(status).setHeader('content-type', 'application/problem+json').json(body);
  }
}
