/**
 * Identity 领域错误对象。遵循 RFC 7807 + 自定义 code 的双层表达。
 * ProblemDetailsFilter 会据此生成 `{ type, title, status, detail, code }`。
 */

export type IdentityErrorCode =
  | 'DUPLICATE_PENDING'
  | 'EDU_NOT_FOUND'
  | 'APPLICATION_NOT_FOUND'
  | 'APPLICATION_INVALID_STATE'
  | 'CARD_NOT_FOUND'
  | 'CARD_REVOKED'
  | 'QR_INVALID'
  | 'FORBIDDEN';

export class IdentityError extends Error {
  /** 与 HTTP status 对应，默认 400。 */
  readonly status: number;
  /** 稳定机器码，供客户端判定业务语义。 */
  readonly code: IdentityErrorCode;

  constructor(code: IdentityErrorCode, message: string, status = 400) {
    super(message);
    this.name = 'IdentityError';
    this.code = code;
    this.status = status;
  }
}
