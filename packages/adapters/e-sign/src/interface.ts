export interface ESignTask {
  taskId: string;
  status: 'pending' | 'signed' | 'failed';
  sha256: string;
}

export interface IESignAdapter {
  createSignTask(pdfBytes: Buffer, signer: string): Promise<ESignTask>;
  queryTask(taskId: string): Promise<ESignTask | null>;
  downloadSigned(taskId: string): Promise<Buffer>;
}
