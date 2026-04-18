export interface IAccessControlAdapter {
  pushWhitelist(alumniId: string, slotDate: string): Promise<string>;
  revokeWhitelist(ticketId: string): Promise<void>;
  verifyTicket(qr: string): Promise<boolean>;
}
