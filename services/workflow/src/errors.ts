/**
 * workflow 领域错误。
 */

export type WorkflowErrorCode =
  | 'SLOT_CONFLICT'
  | 'SLOT_NOT_AVAILABLE'
  | 'RESERVATION_NOT_FOUND'
  | 'PROOF_NOT_FOUND'
  | 'NOT_OWNER'
  | 'INVALID_SIGNATURE';

export class WorkflowError extends Error {
  readonly status: number;
  readonly code: WorkflowErrorCode;

  constructor(code: WorkflowErrorCode, message: string, status = 400) {
    super(message);
    this.name = 'WorkflowError';
    this.code = code;
    this.status = status;
  }
}
