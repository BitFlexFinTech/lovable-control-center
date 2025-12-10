import { Mail, EmailAccount } from '@/types/mail';

export const emailAccounts: EmailAccount[] = [
  {
    id: 'acc-1',
    tenantId: 'tenant-1',
    name: 'Admin',
    email: 'admin@acme-commerce.com',
    type: 'admin',
    createdAt: '2024-01-15T10:00:00Z',
  },
  {
    id: 'acc-2',
    tenantId: 'tenant-1',
    name: 'Accounts',
    email: 'accounts@acme-commerce.com',
    type: 'accounts',
    createdAt: '2024-01-15T10:00:00Z',
  },
  {
    id: 'acc-3',
    tenantId: 'tenant-1',
    name: 'Social',
    email: 'social@acme-commerce.com',
    type: 'social',
    createdAt: '2024-01-15T10:00:00Z',
  },
  {
    id: 'acc-4',
    tenantId: 'tenant-1',
    name: 'Marketing',
    email: 'marketing@acme-commerce.com',
    type: 'marketing',
    createdAt: '2024-01-15T10:00:00Z',
  },
];

export const mails: Mail[] = [
  {
    id: 'mail-1',
    tenantId: 'tenant-1',
    accountId: 'acc-1',
    sender: {
      name: 'Stripe',
      email: 'notifications@stripe.com',
    },
    recipients: {
      to: ['admin@acme-commerce.com'],
    },
    subject: 'Your payout of $12,450.00 is on its way',
    body: `Hi there,

Your payout of $12,450.00 has been initiated and should arrive in your bank account within 2 business days.

Payout Details:
- Amount: $12,450.00
- Destination: ****1234
- Expected Arrival: December 12, 2024

Thank you for using Stripe!

Best regards,
The Stripe Team`,
    bodyPreview: 'Your payout of $12,450.00 has been initiated and should arrive in your bank account within 2 business days.',
    timestamp: '2024-12-10T09:30:00Z',
    folder: 'inbox',
    status: 'unread',
    isStarred: true,
    hasAttachments: false,
  },
  {
    id: 'mail-2',
    tenantId: 'tenant-1',
    accountId: 'acc-1',
    sender: {
      name: 'GitHub',
      email: 'noreply@github.com',
    },
    recipients: {
      to: ['admin@acme-commerce.com'],
    },
    subject: 'Security alert: new sign-in from Chrome on Mac',
    body: `Hi,

We noticed a new sign-in to your GitHub account:

- When: December 10, 2024 at 8:15 AM PST
- Device: Chrome on Mac
- Location: San Francisco, CA, USA

If this was you, you can safely ignore this message.

If this wasn't you, please secure your account immediately.

Thanks,
GitHub Security`,
    bodyPreview: 'We noticed a new sign-in to your GitHub account from Chrome on Mac in San Francisco.',
    timestamp: '2024-12-10T08:15:00Z',
    folder: 'inbox',
    status: 'read',
    isStarred: false,
    hasAttachments: false,
  },
  {
    id: 'mail-3',
    tenantId: 'tenant-1',
    accountId: 'acc-4',
    sender: {
      name: 'Google Ads',
      email: 'google-ads-noreply@google.com',
    },
    recipients: {
      to: ['marketing@acme-commerce.com'],
    },
    subject: 'Your weekly performance report is ready',
    body: `Hello,

Your weekly Google Ads performance report is now available.

Key Highlights:
- Impressions: 125,000 (+15%)
- Clicks: 3,450 (+8%)
- Conversions: 245 (+12%)
- Cost: $1,250

View your full report in Google Ads dashboard.

Best,
Google Ads Team`,
    bodyPreview: 'Your weekly Google Ads performance report is now available. Key highlights: 125K impressions, 3.4K clicks.',
    timestamp: '2024-12-10T07:00:00Z',
    folder: 'inbox',
    status: 'unread',
    isStarred: false,
    hasAttachments: true,
    attachments: [
      { name: 'weekly-report.pdf', size: 245000, type: 'application/pdf' },
    ],
  },
  {
    id: 'mail-4',
    tenantId: 'tenant-1',
    accountId: 'acc-3',
    sender: {
      name: 'Instagram Business',
      email: 'business@instagram.com',
    },
    recipients: {
      to: ['social@acme-commerce.com'],
    },
    subject: 'Your account insights for this week',
    body: `Hi there,

Here's a summary of your Instagram Business account performance:

- Reach: 45,000
- Profile Visits: 1,200
- New Followers: 350
- Top Post: Product showcase (+500 likes)

Keep up the great work!

Instagram Business Team`,
    bodyPreview: 'Here\'s a summary of your Instagram Business account performance this week.',
    timestamp: '2024-12-09T18:00:00Z',
    folder: 'inbox',
    status: 'read',
    isStarred: false,
    hasAttachments: false,
  },
  {
    id: 'mail-5',
    tenantId: 'tenant-1',
    accountId: 'acc-2',
    sender: {
      name: 'QuickBooks',
      email: 'notifications@quickbooks.com',
    },
    recipients: {
      to: ['accounts@acme-commerce.com'],
    },
    subject: 'Invoice #1234 has been paid',
    body: `Good news!

Invoice #1234 for $2,500.00 has been paid by Acme Corp.

Payment Details:
- Invoice Amount: $2,500.00
- Payment Method: Bank Transfer
- Payment Date: December 9, 2024

View invoice details in QuickBooks.

Thank you,
QuickBooks`,
    bodyPreview: 'Invoice #1234 for $2,500.00 has been paid by Acme Corp.',
    timestamp: '2024-12-09T14:30:00Z',
    folder: 'inbox',
    status: 'read',
    isStarred: true,
    hasAttachments: false,
  },
  {
    id: 'mail-6',
    tenantId: 'tenant-1',
    accountId: 'acc-1',
    sender: {
      name: 'Alex Morgan',
      email: 'admin@controlcenter.io',
    },
    recipients: {
      to: ['team@acme-commerce.com'],
    },
    subject: 'Q4 Review Meeting Notes',
    body: `Hi Team,

Attached are the notes from our Q4 review meeting.

Key action items:
1. Update product catalog
2. Launch holiday campaign
3. Review analytics dashboard

Let me know if you have questions.

Best,
Alex`,
    bodyPreview: 'Attached are the notes from our Q4 review meeting. Key action items included.',
    timestamp: '2024-12-08T16:00:00Z',
    folder: 'sent',
    status: 'read',
    isStarred: false,
    hasAttachments: true,
    attachments: [
      { name: 'Q4-meeting-notes.docx', size: 48000, type: 'application/docx' },
    ],
  },
  {
    id: 'mail-7',
    tenantId: 'tenant-1',
    accountId: 'acc-1',
    sender: {
      name: 'Newsletter Platform',
      email: 'noreply@newsletter.com',
    },
    recipients: {
      to: ['admin@acme-commerce.com'],
    },
    subject: 'Upgrade to Premium for more features',
    body: `Upgrade now and unlock premium features including advanced analytics, custom branding, and priority support.`,
    bodyPreview: 'Upgrade now and unlock premium features including advanced analytics.',
    timestamp: '2024-12-07T10:00:00Z',
    folder: 'spam',
    status: 'read',
    isStarred: false,
    hasAttachments: false,
  },
  {
    id: 'mail-8',
    tenantId: 'tenant-1',
    accountId: 'acc-1',
    sender: {
      name: 'Alex Morgan',
      email: 'admin@controlcenter.io',
    },
    recipients: {
      to: ['vendors@example.com'],
    },
    subject: 'Draft: Partnership Proposal',
    body: `Dear Partner,

We are excited to propose a partnership opportunity...

[DRAFT - TO BE COMPLETED]`,
    bodyPreview: 'We are excited to propose a partnership opportunity...',
    timestamp: '2024-12-06T11:00:00Z',
    folder: 'drafts',
    status: 'read',
    isStarred: false,
    hasAttachments: false,
  },
];
