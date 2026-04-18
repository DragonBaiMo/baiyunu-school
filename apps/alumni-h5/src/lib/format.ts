/**
 * H5 简单工具：将分数脱敏为段。
 */
export function maskScore(n: number): string {
  if (n < 0) return '--';
  if (n >= 9000) return `${Math.floor(n / 1000)}k+`;
  return n.toString();
}
