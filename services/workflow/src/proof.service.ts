/**
 * 电子证明服务：
 * - 使用自建 workflow_proof 表（CREATE TABLE IF NOT EXISTS，幂等）
 * - 签名：sha256(alumniId|proofType|payloadJson|timestamp|salt)
 * - audit_log 同步记录签发事件
 */

import { createHash, randomUUID } from 'node:crypto';
import { Inject, Injectable, Optional } from '@nestjs/common';
import type { DbClient } from '@bynu/db';
import { WorkflowError } from './errors.js';
import {
  WF_DB,
  WF_SALT,
  type IssueProofInput,
  type ProofRow,
  type ProofType,
} from './types.js';

interface ProofDbRow {
  id: string;
  alumni_id: string;
  proof_type: string;
  payload: unknown;
  signature: string;
  issued_at: string | Date;
}

export async function ensureProofTable(db: DbClient): Promise<void> {
  await db.query(`
    CREATE TABLE IF NOT EXISTS workflow_proof (
      id TEXT PRIMARY KEY,
      alumni_id TEXT NOT NULL,
      proof_type TEXT NOT NULL,
      payload JSONB NOT NULL DEFAULT '{}',
      signature TEXT NOT NULL,
      issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

@Injectable()
export class ProofService {
  constructor(
    @Optional() @Inject(WF_DB) private readonly db: DbClient,
    @Optional() @Inject(WF_SALT) private readonly salt: string = 'bynu-default-salt',
  ) {}

  async issueProof(input: IssueProofInput): Promise<ProofRow> {
    const id = randomUUID();
    const issuedAt = new Date();
    const timestamp = issuedAt.toISOString();
    const payloadJson = canonicalJson(input.payload);
    const signature = computeSignature(
      input.alumniId,
      input.proofType,
      payloadJson,
      timestamp,
      this.salt,
    );
    await this.db.query('BEGIN');
    try {
      await this.db.query(
        `INSERT INTO workflow_proof (id, alumni_id, proof_type, payload, signature, issued_at)
         VALUES ($1,$2,$3,$4,$5,$6::timestamptz)`,
        [id, input.alumniId, input.proofType, payloadJson, signature, timestamp],
      );
      await this.db.query(
        `INSERT INTO audit_log (id, actor_id, action, target_type, target_id, payload)
         VALUES ($1,$2,'workflow.proof.issue','workflow_proof',$3,$4)`,
        [
          randomUUID(),
          input.alumniId,
          id,
          JSON.stringify({
            proofType: input.proofType,
            signature,
            issuedAt: timestamp,
          }),
        ],
      );
      await this.db.query('COMMIT');
    } catch (err) {
      await this.db.query('ROLLBACK');
      throw err;
    }
    return {
      id,
      alumniId: input.alumniId,
      proofType: input.proofType,
      payload: input.payload,
      signature,
      issuedAt,
    };
  }

  async getById(id: string): Promise<ProofRow> {
    const res = await this.db.query(
      `SELECT id, alumni_id, proof_type, payload, signature, issued_at
       FROM workflow_proof WHERE id = $1`,
      [id],
    );
    const row = res.rows[0] as ProofDbRow | undefined;
    if (!row) {
      throw new WorkflowError(
        'PROOF_NOT_FOUND',
        `证明 ${id} 不存在`,
        404,
      );
    }
    return toProofRow(row);
  }

  /** 校验：重算 sha256 对比签名 */
  async verifyProof(
    proofId: string,
    signature: string,
  ): Promise<{ valid: boolean; proof: ProofRow }> {
    const proof = await this.getById(proofId);
    const payloadJson = canonicalJson(proof.payload);
    const expected = computeSignature(
      proof.alumniId,
      proof.proofType,
      payloadJson,
      proof.issuedAt.toISOString(),
      this.salt,
    );
    const valid = expected === proof.signature && expected === signature;
    return { valid, proof };
  }
}

function computeSignature(
  alumniId: string,
  proofType: ProofType,
  payloadJson: string,
  timestamp: string,
  salt: string,
): string {
  return createHash('sha256')
    .update(`${alumniId}|${proofType}|${payloadJson}|${timestamp}|${salt}`)
    .digest('hex');
}

/**
 * 确定性 JSON 序列化：递归按 key 升序排列，消除 JSONB 存储后 key 顺序差异。
 */
function canonicalJson(value: unknown): string {
  if (value === null || typeof value !== 'object') {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map((v) => canonicalJson(v)).join(',')}]`;
  }
  const obj = value as Record<string, unknown>;
  const keys = Object.keys(obj).sort();
  const parts = keys.map(
    (k) => `${JSON.stringify(k)}:${canonicalJson(obj[k])}`,
  );
  return `{${parts.join(',')}}`;
}

function toProofRow(row: ProofDbRow): ProofRow {
  const rawPayload = row.payload;
  const payload =
    typeof rawPayload === 'string'
      ? (JSON.parse(rawPayload) as Record<string, unknown>)
      : ((rawPayload as Record<string, unknown>) ?? {});
  return {
    id: row.id,
    alumniId: row.alumni_id,
    proofType: row.proof_type as ProofType,
    payload,
    signature: row.signature,
    issuedAt: new Date(row.issued_at),
  };
}
