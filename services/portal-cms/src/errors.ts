/**
 * portal-cms 领域错误对象。结构与 IdentityError 对齐，
 * ProblemDetailsFilter 据此生成 `{ type, title, status, detail, code }`。
 */

export type CmsErrorCode =
  | 'PAGE_NOT_FOUND'
  | 'PAGE_SLUG_DUP'
  | 'PAGE_VERSION_CONFLICT'
  | 'TEMPLATE_NOT_FOUND'
  | 'NEWS_NOT_FOUND';

export class CmsError extends Error {
  readonly status: number;
  readonly code: CmsErrorCode;

  constructor(code: CmsErrorCode, message: string, status = 400) {
    super(message);
    this.name = 'CmsError';
    this.code = code;
    this.status = status;
  }
}
