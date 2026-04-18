import { MockPaymentAdapter } from './mock.js';
import type { IPaymentAdapter } from './interface.js';

export function createPaymentAdapter(provider: string = process.env['PAYMENT_PROVIDER'] ?? 'mock'): IPaymentAdapter {
  switch (provider) {
    case 'mock':
      return new MockPaymentAdapter();
    case 'wechat':
    case 'wechat_v3':
    case 'alipay':
      throw new Error(`[payment] ${provider} 真实实现将在 Phase 2 完成，当前请用 mock`);
    default:
      throw new Error(`[payment] 未知 provider：${provider}`);
  }
}
