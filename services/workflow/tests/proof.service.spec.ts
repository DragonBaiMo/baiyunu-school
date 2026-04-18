import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createHarness, type TestHarness } from './harness.js';

describe('ProofService', () => {
  let h: TestHarness;
  beforeEach(async () => {
    h = await createHarness();
  });
  afterEach(async () => {
    await h.close();
  });

  it('issueProof → verifyProof 通过', async () => {
    const p = await h.proofs.issueProof({
      alumniId: 'a1',
      proofType: '在学证明',
      payload: { year: 2024, college: 'CS' },
    });
    const r = await h.proofs.verifyProof(p.id, p.signature);
    expect(r.valid).toBe(true);
    expect(r.proof.id).toBe(p.id);
  });

  it('篡改签名 verifyProof 返回 false', async () => {
    const p = await h.proofs.issueProof({
      alumniId: 'a1',
      proofType: '学历证明',
      payload: { degree: '学士' },
    });
    const tampered = p.signature.replace(/.$/, (c) => (c === 'a' ? 'b' : 'a'));
    const r = await h.proofs.verifyProof(p.id, tampered);
    expect(r.valid).toBe(false);
  });

  it('payload 被直接篡改，签名不再匹配', async () => {
    const p = await h.proofs.issueProof({
      alumniId: 'a1',
      proofType: '成绩证明',
      payload: { score: 85 },
    });
    // 直接改库中的 payload
    await h.db.query(
      `UPDATE workflow_proof SET payload = $1 WHERE id = $2`,
      [JSON.stringify({ score: 99 }), p.id],
    );
    const r = await h.proofs.verifyProof(p.id, p.signature);
    expect(r.valid).toBe(false);
  });

  it('不存在的 proofId 抛 PROOF_NOT_FOUND', async () => {
    await expect(
      h.proofs.verifyProof('not-exist-id', 'sig'),
    ).rejects.toMatchObject({ code: 'PROOF_NOT_FOUND' });
  });

  it('issueProof 写入 audit_log', async () => {
    const p = await h.proofs.issueProof({
      alumniId: 'a1',
      proofType: '在读证明',
      payload: { year: 2024 },
    });
    const res = await h.db.query<{ n: string }>(
      `SELECT COUNT(*)::text AS n FROM audit_log
       WHERE action = 'workflow.proof.issue' AND target_id = $1`,
      [p.id],
    );
    expect(Number(res.rows[0]?.n ?? 0)).toBe(1);
  });
});
