import { createHash, randomUUID } from 'node:crypto';
import type { ESignTask, IESignAdapter } from './interface.js';

export class MockESignAdapter implements IESignAdapter {
  private readonly store = new Map<string, { task: ESignTask; bytes: Buffer }>();

  async createSignTask(pdfBytes: Buffer, signer: string): Promise<ESignTask> {
    const sha = createHash('sha256').update(pdfBytes).digest('hex');
    const taskId = `SIGN-${randomUUID().slice(0, 8)}`;
    const task: ESignTask = { taskId, status: 'signed', sha256: sha };
    // 水印形式：在末尾追加 `\n%signed-by=<signer>\n` 字节
    const stamped = Buffer.concat([pdfBytes, Buffer.from(`\n%signed-by=${signer}\n`, 'utf8')]);
    this.store.set(taskId, { task, bytes: stamped });
    return task;
  }

  async queryTask(taskId: string): Promise<ESignTask | null> {
    return this.store.get(taskId)?.task ?? null;
  }

  async downloadSigned(taskId: string): Promise<Buffer> {
    const item = this.store.get(taskId);
    if (!item) throw new Error(`[e-sign] 任务不存在：${taskId}`);
    return item.bytes;
  }
}
