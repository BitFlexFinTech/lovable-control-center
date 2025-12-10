export type SocialPlatform = 
  | 'instagram' 
  | 'tiktok' 
  | 'twitter' 
  | 'facebook' 
  | 'discord' 
  | 'youtube' 
  | 'linkedin';

export interface GeneratedPersona {
  id: string;
  tenantId: string;
  fullName: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  recoveryEmail: string;
  dateOfBirth: string;
  country: string;
  gender: 'male' | 'female' | 'other';
  phone?: string;
  createdAt: string;
}

export interface SocialAccountPrefill {
  id: string;
  personaId: string;
  platform: SocialPlatform;
  fields: Record<string, string>;
  createdAt: string;
}

export interface PlatformTemplate {
  platform: SocialPlatform;
  name: string;
  color: string;
  icon: string;
  fields: {
    key: string;
    label: string;
    required: boolean;
  }[];
}

export const platformTemplates: PlatformTemplate[] = [
  {
    platform: 'instagram',
    name: 'Instagram',
    color: 'from-pink-500 to-purple-600',
    icon: 'Instagram',
    fields: [
      { key: 'email', label: 'Email', required: true },
      { key: 'fullName', label: 'Full Name', required: true },
      { key: 'username', label: 'Username', required: true },
      { key: 'password', label: 'Password', required: true },
      { key: 'dateOfBirth', label: 'Date of Birth', required: true },
    ],
  },
  {
    platform: 'tiktok',
    name: 'TikTok Ads',
    color: 'from-gray-900 to-gray-700',
    icon: 'Music2',
    fields: [
      { key: 'businessName', label: 'Business Name', required: true },
      { key: 'email', label: 'Email', required: true },
      { key: 'phone', label: 'Phone', required: true },
      { key: 'country', label: 'Country', required: true },
      { key: 'website', label: 'Website', required: true },
      { key: 'password', label: 'Password', required: true },
    ],
  },
  {
    platform: 'twitter',
    name: 'X (Twitter)',
    color: 'from-gray-800 to-black',
    icon: 'Twitter',
    fields: [
      { key: 'email', label: 'Email', required: true },
      { key: 'username', label: 'Username', required: true },
      { key: 'fullName', label: 'Full Name', required: true },
      { key: 'dateOfBirth', label: 'Date of Birth', required: true },
      { key: 'password', label: 'Password', required: true },
    ],
  },
  {
    platform: 'facebook',
    name: 'Facebook',
    color: 'from-blue-600 to-blue-800',
    icon: 'Facebook',
    fields: [
      { key: 'firstName', label: 'First Name', required: true },
      { key: 'lastName', label: 'Last Name', required: true },
      { key: 'email', label: 'Email', required: true },
      { key: 'password', label: 'Password', required: true },
      { key: 'dateOfBirth', label: 'Date of Birth', required: true },
      { key: 'gender', label: 'Gender', required: true },
    ],
  },
  {
    platform: 'discord',
    name: 'Discord',
    color: 'from-indigo-500 to-indigo-700',
    icon: 'MessageCircle',
    fields: [
      { key: 'email', label: 'Email', required: true },
      { key: 'username', label: 'Username', required: true },
      { key: 'password', label: 'Password', required: true },
      { key: 'dateOfBirth', label: 'Date of Birth', required: true },
    ],
  },
  {
    platform: 'youtube',
    name: 'YouTube (Google)',
    color: 'from-red-500 to-red-700',
    icon: 'Youtube',
    fields: [
      { key: 'firstName', label: 'First Name', required: true },
      { key: 'lastName', label: 'Last Name', required: true },
      { key: 'username', label: 'Username', required: true },
      { key: 'password', label: 'Password', required: true },
      { key: 'phone', label: 'Phone', required: false },
      { key: 'recoveryEmail', label: 'Recovery Email', required: true },
    ],
  },
  {
    platform: 'linkedin',
    name: 'LinkedIn',
    color: 'from-blue-700 to-blue-900',
    icon: 'Linkedin',
    fields: [
      { key: 'email', label: 'Email', required: true },
      { key: 'password', label: 'Password', required: true },
      { key: 'firstName', label: 'First Name', required: true },
      { key: 'lastName', label: 'Last Name', required: true },
    ],
  },
];
