/**
 * `@bynu/adapters` 汇总壳：
 * 将 6 个 Adapter 子包统一再导出，便于 BFF / Server 一处 import。
 * 各子包仍可独立发布与测试。
 */

export * as payment from '@bynu/adapter-payment';
export * as eduSystem from '@bynu/adapter-edu-system';
export * as stuAffairs from '@bynu/adapter-stu-affairs';
export * as accessControl from '@bynu/adapter-access-control';
export * as chaoxingSso from '@bynu/adapter-chaoxing-sso';
export * as eSign from '@bynu/adapter-e-sign';
