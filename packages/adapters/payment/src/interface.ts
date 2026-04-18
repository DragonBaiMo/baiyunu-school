/**
 * 支付 Adapter 抽象接口。
 * 真实实现（微信支付 v3 / 支付宝）在 Phase 2 落地，本阶段只保证接口契约与 Mock 可用。
 */

export type PaymentChannel = 'mock' | 'wechat' | 'alipay';

export interface CreateOrderInput {
  amountCents: number;
  channel: PaymentChannel;
  meta?: Record<string, string>;
}

export interface OrderView {
  outTradeNo: string;
  status: 'init' | 'paid' | 'failed' | 'refunded';
  amountCents: number;
  paidAt?: string;
  channel: PaymentChannel;
}

export interface IPaymentAdapter {
  createOrder(input: CreateOrderInput): Promise<OrderView>;
  queryOrder(outTradeNo: string): Promise<OrderView | null>;
  refund(outTradeNo: string, amountCents: number): Promise<OrderView>;
  verifyWebhook(headers: Record<string, string>, body: string): Promise<boolean>;
}
