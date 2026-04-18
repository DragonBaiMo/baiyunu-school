/**
 * 领域模型：枚举与值对象。
 * 保持纯 TS、零 IO，供全链路（前端 + 后端 + Adapter）复用。
 */

export const AlumniStatus = {
  Active: 'active',
  Frozen: 'frozen',
} as const;
export type AlumniStatus = (typeof AlumniStatus)[keyof typeof AlumniStatus];

export const ApplicationStatus = {
  Pending: 'pending',
  Approved: 'approved',
  Rejected: 'rejected',
  Supplement: 'supplement',
} as const;
export type ApplicationStatus = (typeof ApplicationStatus)[keyof typeof ApplicationStatus];

export const OrgNodeType = {
  School: '校级',
  College: '院级',
  Department: '系级',
  Class: '班级',
  Branch: '分会',
} as const;
export type OrgNodeType = (typeof OrgNodeType)[keyof typeof OrgNodeType];

export const EnrollmentStatus = {
  Enrolled: 'enrolled',
  Checked: 'checked',
  Cancelled: 'cancelled',
} as const;
export type EnrollmentStatus = (typeof EnrollmentStatus)[keyof typeof EnrollmentStatus];

export const DonationStatus = {
  Init: 'init',
  Paid: 'paid',
  Failed: 'failed',
  Refunded: 'refunded',
} as const;
export type DonationStatus = (typeof DonationStatus)[keyof typeof DonationStatus];

export function isValidIdCard(s: string): boolean {
  return /^[0-9]{17}[0-9X]$/.test(s);
}

export function maskPhone(phone: string): string {
  if (phone.length !== 11) return phone;
  return `${phone.slice(0, 3)}****${phone.slice(7)}`;
}

export function maskName(name: string): string {
  if (name.length <= 1) return name;
  if (name.length === 2) return `${name[0] ?? ''}*`;
  return `${name[0] ?? ''}${'*'.repeat(name.length - 2)}${name[name.length - 1] ?? ''}`;
}
