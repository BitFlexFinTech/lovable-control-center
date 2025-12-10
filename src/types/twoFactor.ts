export interface TwoFactorAccount {
  id: string;
  integrationId: string;
  integrationName: string;
  integrationIcon: string;
  siteId: string;
  siteName: string;
  email: string;
  secret: string;
  issuer: string;
  createdAt: string;
}

export interface TOTPCode {
  code: string;
  timeRemaining: number;
  period: number;
}