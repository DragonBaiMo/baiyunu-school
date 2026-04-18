/**
 * 应用层 AES-256-GCM 加密（替代 pgcrypto）。
 * - key 由 ENCRYPTION_KEY 环境变量注入（64 位 hex = 32 字节）
 * - 输出 Buffer 结构：12B IV | 16B Tag | N B Ciphertext
 */

import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto';

const IV_LEN = 12;
const TAG_LEN = 16;

export function parseKey(hex: string): Buffer {
  if (!/^[0-9a-fA-F]{64}$/.test(hex)) {
    throw new Error('[crypto] ENCRYPTION_KEY 必须为 64 位 hex');
  }
  return Buffer.from(hex, 'hex');
}

export function encryptAesGcm(key: Buffer, plaintext: string): Buffer {
  const iv = randomBytes(IV_LEN);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const ct = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, ct]);
}

export function decryptAesGcm(key: Buffer, payload: Buffer): string {
  if (payload.length < IV_LEN + TAG_LEN) {
    throw new Error('[crypto] 密文长度不足');
  }
  const iv = payload.subarray(0, IV_LEN);
  const tag = payload.subarray(IV_LEN, IV_LEN + TAG_LEN);
  const ct = payload.subarray(IV_LEN + TAG_LEN);
  const decipher = createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  const pt = Buffer.concat([decipher.update(ct), decipher.final()]);
  return pt.toString('utf8');
}

export function sha256(value: string, salt = ''): Buffer {
  return createHash('sha256').update(salt + value, 'utf8').digest();
}

/**
 * 身份证号的 SHA-256+salt 哈希。用于 alumni_profile.id_card_hash / 申请去重查询。
 * 若未显式指定 salt，则读取环境变量 IDENTITY_HASH_SALT，再退化到常量默认值。
 */
export function hashIdCard(idCard: string, salt?: string): Buffer {
  const effective = salt ?? process.env['IDENTITY_HASH_SALT'] ?? 'bynu-id-salt';
  return sha256(idCard, effective);
}

