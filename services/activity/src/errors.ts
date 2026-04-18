/**
 * activity 领域错误。
 */

export type ActivityErrorCode =
  | 'ACTIVITY_NOT_FOUND'
  | 'ACTIVITY_NOT_PUBLISHED'
  | 'QUOTA_EXCEEDED'
  | 'ALREADY_ENROLLED'
  | 'ENROLLMENT_NOT_FOUND'
  | 'INVALID_TICKET'
  | 'ALREADY_CHECKED'
  | 'ACTIVITY_CLOSED'
  | 'FORM_VALIDATION_FAILED'
  | 'STEP_NOT_FOUND';

export class ActivityError extends Error {
  readonly status: number;
  readonly code: ActivityErrorCode;

  constructor(code: ActivityErrorCode, message: string, status = 400) {
    super(message);
    this.name = 'ActivityError';
    this.code = code;
    this.status = status;
  }
}
