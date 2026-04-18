/**
 * donation 领域错误。
 */

export type DonationErrorCode =
  | 'ORDER_NOT_FOUND'
  | 'ORDER_ALREADY_PAID'
  | 'ORDER_NOT_PAID'
  | 'INVALID_AMOUNT'
  | 'REFUND_EXCEEDS_PAID'
  | 'INVALID_WEBHOOK'
  | 'CHANNEL_UNSUPPORTED';

export class DonationError extends Error {
  readonly status: number;
  readonly code: DonationErrorCode;

  constructor(code: DonationErrorCode, message: string, status = 400) {
    super(message);
    this.name = 'DonationError';
    this.code = code;
    this.status = status;
  }
}
