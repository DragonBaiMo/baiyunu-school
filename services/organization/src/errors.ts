/**
 * organization 领域错误。与 CmsError / IdentityError 对齐。
 */

export type OrgErrorCode =
  | 'NODE_NOT_FOUND'
  | 'CIRCULAR_PARENT'
  | 'DEPTH_EXCEEDED'
  | 'POST_NOT_FOUND'
  | 'NOT_MEMBER'
  | 'NODE_NOT_LEAF';

export class OrgError extends Error {
  readonly status: number;
  readonly code: OrgErrorCode;

  constructor(code: OrgErrorCode, message: string, status = 400) {
    super(message);
    this.name = 'OrgError';
    this.code = code;
    this.status = status;
  }
}
