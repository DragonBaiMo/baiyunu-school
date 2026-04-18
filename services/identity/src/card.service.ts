/**
 * 电子校友卡服务：卡号发放 + TOTP 风格动态 QR（30s rotation，±1 步容忍）。
 *
 * QR code 格式：v1.{base64url(cardId)}.{base64url(hmac(qrSecret, step))}
 * - step = floor(nowMs / (rotationSec * 1000))
 * - 验证时容忍 step-1 / step / step+1 三个窗口
 * - 单独 revoke 后 qr_secret 作废，verifyQrCode 恒返回 invalid
 */

import { Buffer } from 'node:buffer';
import {
  createHmac,
  randomBytes,
  randomUUID,
  timingSafeEqual,
} from 'node:crypto';
import { Inject, Injectable, Optional } from '@nestjs/common';
import type { DbClient } from '@bynu/db';
import { IdentityError } from './errors.js';
import { IDENTITY_DB, type CardIssueResult, type QrRotateResult, type QrVerifyResult } from './types.js';
import { __toBufferForInternalUse as toBuffer } from './profile.service.js';

const QR_VERSION = 'v1';
const DEFAULT_ROTATION_SEC = 30;

@Injectable()
export class CardService {
  constructor(@Optional() @Inject(IDENTITY_DB) private readonly db: DbClient) {}

  /**
   * 发卡：生成 cardNo（BYN-{year}-{6 位序列}）+ qrSecret（32B 随机）。
   * 前置条件：同一 alumniId 未被撤销前允许多次重发，但 cardNo 全局唯一。
   * 副作用：INSERT alumni_card。
   */
  async issue(alumniId: string, year?: number): Promise<CardIssueResult> {
    const id = randomUUID();
    const y = year ?? new Date().getFullYear();
    const countRes = await this.db.query<{ n: string }>(
      'SELECT COUNT(*)::text AS n FROM alumni_card',
    );
    const seq = Number(countRes.rows[0]?.n ?? '0') + 1;
    const cardNo = `BYN-${y}-${String(seq).padStart(6, '0')}`;
    const qrSecret = randomBytes(32);
    const issuedAt = new Date();
    await this.db.query(
      `INSERT INTO alumni_card (id, alumni_id, card_no, qr_secret, rotation_sec, issued_at)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [id, alumniId, cardNo, qrSecret, DEFAULT_ROTATION_SEC, issuedAt],
    );
    return { id, cardNo, alumniId, issuedAt };
  }

  /**
   * 旋转 QR。
   * @param nowSec 注入的当前 Unix 秒；便于测试与模拟时间偏移。默认取 `Date.now()/1000`。
   */
  async rotateQrCode(cardId: string, nowSec?: number): Promise<QrRotateResult> {
    const row = await this.loadActiveCard(cardId);
    const rotationSec = Number(row['rotation_sec'] ?? DEFAULT_ROTATION_SEC);
    const now = nowSec ?? Math.floor(Date.now() / 1000);
    const step = Math.floor(now / rotationSec);
    const secret = toBuffer(row['qr_secret']);
    const mac = hmacAt(secret, step);
    const code = `${QR_VERSION}.${toB64Url(Buffer.from(cardId))}.${toB64Url(mac)}`;
    const expiresAt = (step + 1) * rotationSec * 1000;
    return { cardId, code, expiresAt, rotationSec };
  }

  /**
   * 校验 QR。允许 step-1/step/step+1 三窗口命中。
   */
  async verifyQrCode(code: string, nowSec?: number): Promise<QrVerifyResult> {
    const parts = code.split('.');
    if (parts.length !== 3 || parts[0] !== QR_VERSION) return { valid: false };
    const cardIdRaw = parts[1];
    const macRaw = parts[2];
    if (!cardIdRaw || !macRaw) return { valid: false };
    let cardId: string;
    let macProvided: Buffer;
    try {
      cardId = fromB64Url(cardIdRaw).toString('utf8');
      macProvided = fromB64Url(macRaw);
    } catch {
      return { valid: false };
    }
    const res = await this.db.query(
      `SELECT id, alumni_id, qr_secret, rotation_sec, revoked_at
       FROM alumni_card WHERE id = $1`,
      [cardId],
    );
    const row = res.rows[0];
    if (!row) return { valid: false };
    if ((row as Record<string, unknown>)['revoked_at']) return { valid: false };
    const rotationSec = Number((row as Record<string, unknown>)['rotation_sec'] ?? DEFAULT_ROTATION_SEC);
    const now = nowSec ?? Math.floor(Date.now() / 1000);
    const step = Math.floor(now / rotationSec);
    const secret = toBuffer((row as Record<string, unknown>)['qr_secret']);
    for (const s of [step - 1, step, step + 1]) {
      const expected = hmacAt(secret, s);
      if (expected.length === macProvided.length && timingSafeEqual(expected, macProvided)) {
        return {
          valid: true,
          cardId,
          alumniId: String((row as Record<string, unknown>)['alumni_id']),
        };
      }
    }
    return { valid: false };
  }

  /**
   * 撤销：软删除。撤销后 verifyQrCode 恒返回 invalid。
   * 副作用：UPDATE alumni_card.revoked_at；写入 audit_log。
   */
  async revoke(cardId: string, reviewerId: string, reason: string): Promise<void> {
    const row = await this.loadActiveCard(cardId);
    await this.db.query(
      `UPDATE alumni_card SET revoked_at = NOW() WHERE id = $1`,
      [cardId],
    );
    await this.writeAudit(reviewerId, 'card.revoke', cardId, { reason, cardNo: row['card_no'] });
  }

  /** 查找卡信息（未撤销），否则抛 CARD_REVOKED / CARD_NOT_FOUND。 */
  async findById(cardId: string): Promise<{ id: string; cardNo: string; alumniId: string }> {
    const row = await this.loadActiveCard(cardId);
    return {
      id: String(row['id']),
      cardNo: String(row['card_no']),
      alumniId: String(row['alumni_id']),
    };
  }

  private async loadActiveCard(cardId: string): Promise<Record<string, unknown>> {
    const res = await this.db.query(
      `SELECT id, alumni_id, card_no, qr_secret, rotation_sec, revoked_at
       FROM alumni_card WHERE id = $1`,
      [cardId],
    );
    const row = res.rows[0] as Record<string, unknown> | undefined;
    if (!row) throw new IdentityError('CARD_NOT_FOUND', `card ${cardId} 不存在`, 404);
    if (row['revoked_at']) throw new IdentityError('CARD_REVOKED', `card ${cardId} 已撤销`, 410);
    return row;
  }

  private async writeAudit(
    actorId: string,
    action: string,
    targetId: string,
    payload: Record<string, unknown>,
  ): Promise<void> {
    await this.db.query(
      `INSERT INTO audit_log (id, actor_id, action, target_type, target_id, payload)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [randomUUID(), actorId, action, 'alumni_card', targetId, JSON.stringify(payload)],
    );
  }
}

function hmacAt(secret: Buffer, step: number): Buffer {
  const buf = Buffer.alloc(8);
  buf.writeBigInt64BE(BigInt(step));
  return createHmac('sha256', secret).update(buf).digest();
}

function toB64Url(buf: Buffer): string {
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromB64Url(s: string): Buffer {
  const pad = s.length % 4 === 0 ? '' : '='.repeat(4 - (s.length % 4));
  return Buffer.from(s.replace(/-/g, '+').replace(/_/g, '/') + pad, 'base64');
}
