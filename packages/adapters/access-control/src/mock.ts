import { randomUUID } from 'node:crypto';
import type { IAccessControlAdapter } from './interface.js';

export class MockAccessControlAdapter implements IAccessControlAdapter {
  private readonly whitelist = new Map<string, { alumniId: string; slotDate: string }>();

  async pushWhitelist(alumniId: string, slotDate: string): Promise<string> {
    const ticketId = `ACL-${randomUUID().slice(0, 8)}`;
    this.whitelist.set(ticketId, { alumniId, slotDate });
    return ticketId;
  }

  async revokeWhitelist(ticketId: string): Promise<void> {
    this.whitelist.delete(ticketId);
  }

  async verifyTicket(qr: string): Promise<boolean> {
    return this.whitelist.has(qr);
  }
}
