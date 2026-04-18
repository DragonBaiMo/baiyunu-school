/**
 * 校友档案服务：审批通过时从申请记录派生一条 AlumniProfile。
 * 所有敏感字段（姓名/身份证/手机号）在存库前均经 AES-256-GCM 加密；
 * 身份证号同时存一份 SHA-256+salt 摘要用于唯一性查询。
 */

import { Buffer } from 'node:buffer';
import { randomUUID } from 'node:crypto';
import { Inject, Injectable, Optional } from '@nestjs/common';
import type { DbClient } from '@bynu/db';
import { decryptAesGcm, encryptAesGcm, hashIdCard } from '@bynu/db';
import { IdentityError } from './errors.js';
import { IDENTITY_DB, IDENTITY_KEY } from './types.js';

export interface DecryptedProfile {
  id: string;
  userId: string;
  name: string;
  namePinyin: string;
  idCard: string;
  phone: string;
  year: number;
  collegeId: string;
  deptId: string;
  classId: string;
  status: string;
  createdAt: Date;
}

export interface CreateProfileInput {
  name: string;
  idCard: string;
  phone: string;
  year: number;
  collegeId: string;
  deptId: string;
  classId: string;
  namePinyin?: string;
}

@Injectable()
export class ProfileService {
  constructor(
    @Optional() @Inject(IDENTITY_DB) private readonly db: DbClient,
    @Optional() @Inject(IDENTITY_KEY) private readonly key: Buffer,
  ) {}

  /**
   * 创建校友档案。
   * 前置条件：调用方已完成 EDU_NOT_FOUND / DUPLICATE_PENDING 校验。
   * 副作用：INSERT alumni_profile；若 id_card_hash 已存在会抛数据库唯一约束错误。
   */
  async createFromApplication(input: CreateProfileInput): Promise<DecryptedProfile> {
    const id = randomUUID();
    const userId = `u-${id.slice(0, 8)}`;
    const namePinyin = input.namePinyin ?? maskName(input.name);
    await this.db.query(
      `INSERT INTO alumni_profile
       (id, user_id, name_enc, name_pinyin, id_card_enc, id_card_hash, phone_enc,
        year, college_id, dept_id, class_id, avatar_url, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
      [
        id,
        userId,
        encryptAesGcm(this.key, input.name),
        namePinyin,
        encryptAesGcm(this.key, input.idCard),
        hashIdCard(input.idCard),
        encryptAesGcm(this.key, input.phone),
        input.year,
        input.collegeId,
        input.deptId,
        input.classId,
        null,
        'active',
      ],
    );
    return {
      id,
      userId,
      name: input.name,
      namePinyin,
      idCard: input.idCard,
      phone: input.phone,
      year: input.year,
      collegeId: input.collegeId,
      deptId: input.deptId,
      classId: input.classId,
      status: 'active',
      createdAt: new Date(),
    };
  }

  /** 根据 profile id 返回解密后的档案；未找到抛 APPLICATION_NOT_FOUND（404）。 */
  async findById(id: string): Promise<DecryptedProfile> {
    const res = await this.db.query(
      `SELECT id, user_id, name_enc, name_pinyin, id_card_enc, phone_enc,
              year, college_id, dept_id, class_id, status, created_at
       FROM alumni_profile WHERE id = $1`,
      [id],
    );
    const row = res.rows[0];
    if (!row) throw new IdentityError('APPLICATION_NOT_FOUND', `profile ${id} 不存在`, 404);
    return this.decodeRow(row as Record<string, unknown>);
  }

  async findByUserId(userId: string): Promise<DecryptedProfile | null> {
    const res = await this.db.query(
      `SELECT id, user_id, name_enc, name_pinyin, id_card_enc, phone_enc,
              year, college_id, dept_id, class_id, status, created_at
       FROM alumni_profile WHERE user_id = $1`,
      [userId],
    );
    const row = res.rows[0];
    if (!row) return null;
    return this.decodeRow(row as Record<string, unknown>);
  }

  private decodeRow(row: Record<string, unknown>): DecryptedProfile {
    return {
      id: String(row['id']),
      userId: String(row['user_id']),
      name: decryptAesGcm(this.key, toBuffer(row['name_enc'])),
      namePinyin: String(row['name_pinyin']),
      idCard: decryptAesGcm(this.key, toBuffer(row['id_card_enc'])),
      phone: decryptAesGcm(this.key, toBuffer(row['phone_enc'])),
      year: Number(row['year']),
      collegeId: String(row['college_id']),
      deptId: String(row['dept_id']),
      classId: String(row['class_id']),
      status: String(row['status']),
      createdAt: new Date(String(row['created_at'])),
    };
  }
}

/** 姓名遮蔽：保留首字，其余用星号，用于列表展示与查询 keyword。 */
export function maskName(name: string): string {
  if (!name) return '';
  const first = Array.from(name)[0] ?? '';
  return first + '*'.repeat(Math.max(1, Array.from(name).length - 1));
}

function toBuffer(value: unknown): Buffer {
  if (value instanceof Uint8Array) return Buffer.from(value);
  if (typeof value === 'string') {
    // pg 驱动对 bytea 会返回 `\x...`；pglite 通常直接返回 Uint8Array
    const str = value.startsWith('\\x') ? value.slice(2) : value;
    return Buffer.from(str, 'hex');
  }
  throw new IdentityError('APPLICATION_NOT_FOUND', '无法解码 bytea 字段', 500);
}

export { toBuffer as __toBufferForInternalUse };
