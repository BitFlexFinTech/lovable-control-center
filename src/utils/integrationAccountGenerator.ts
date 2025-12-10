import { StoredCredential, IntegrationSource, integrationTemplates } from '@/types/credentials';

// Generate a strong password (16+ chars, mixed case, numbers, special chars)
export function generateStrongPassword(): string {
  const uppercase = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lowercase = 'abcdefghjkmnpqrstuvwxyz';
  const numbers = '23456789';
  const special = '!@#$%&*';
  
  const allChars = uppercase + lowercase + numbers + special;
  
  // Ensure at least one of each type
  let password = '';
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += special[Math.floor(Math.random() * special.length)];
  
  // Fill remaining with random characters
  for (let i = 0; i < 14; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

// Generate additional fields based on integration type
function generateAdditionalFields(
  integrationId: string,
  domain: string,
  siteName: string
): Record<string, string> {
  const template = integrationTemplates.find(t => t.id === integrationId);
  if (!template) return {};

  const fields: Record<string, string> = {};
  const baseDomain = domain.replace(/\.[^.]+$/, '');
  
  template.fields.forEach(field => {
    if (field.key === 'email' || field.key === 'password') return;
    
    switch (field.key) {
      case 'businessName':
      case 'companyName':
        fields[field.key] = siteName;
        break;
      case 'website':
        fields[field.key] = `https://${domain}`;
        break;
      case 'country':
        fields[field.key] = 'United States';
        break;
      case 'phone':
        fields[field.key] = '+1 (555) 123-4567';
        break;
      case 'sendingDomain':
      case 'domain':
        fields[field.key] = domain;
        break;
      case 'propertyName':
        fields[field.key] = `${siteName} - Web Property`;
        break;
      case 'projectName':
        fields[field.key] = `${siteName} Analytics`;
        break;
      case 'tenantName':
        fields[field.key] = baseDomain;
        break;
      case 'bucketName':
        fields[field.key] = `${baseDomain}-storage`;
        break;
      case 'region':
        fields[field.key] = 'us-east-1';
        break;
      case 'cloudName':
        fields[field.key] = baseDomain;
        break;
      case 'username':
        fields[field.key] = baseDomain.replace(/[^a-z0-9]/gi, '');
        break;
      case 'teamName':
      case 'workspaceName':
        fields[field.key] = siteName;
        break;
      case 'serverName':
        fields[field.key] = `${siteName} Community`;
        break;
      case 'fullName':
        fields[field.key] = siteName;
        break;
      case 'pageName':
        fields[field.key] = siteName;
        break;
      case 'channelName':
        fields[field.key] = siteName;
        break;
      default:
        fields[field.key] = '';
    }
  });

  return fields;
}

// Generate a single integration credential
export function generateIntegrationCredential(
  integrationId: string,
  siteId: string,
  siteName: string,
  siteDomain: string,
  siteColor: string,
  source: IntegrationSource
): StoredCredential | null {
  const template = integrationTemplates.find(t => t.id === integrationId);
  if (!template) return null;

  const now = new Date().toISOString();
  const email = `${integrationId}@${siteDomain}`;
  const password = generateStrongPassword();
  const additionalFields = generateAdditionalFields(integrationId, siteDomain, siteName);

  return {
    id: `cred-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    siteId,
    siteName,
    siteDomain,
    siteColor,
    integrationId,
    integrationName: template.name,
    integrationIcon: template.icon,
    category: template.category,
    email,
    password,
    username: additionalFields.username,
    additionalFields,
    status: 'demo',
    source,
    createdAt: now,
    updatedAt: now,
  };
}

// Generate credentials for multiple integrations
export function generateCredentialsForIntegrations(
  integrationIds: string[],
  siteId: string,
  siteName: string,
  siteDomain: string,
  siteColor: string,
  source: IntegrationSource
): StoredCredential[] {
  return integrationIds
    .map(id => generateIntegrationCredential(id, siteId, siteName, siteDomain, siteColor, source))
    .filter((cred): cred is StoredCredential => cred !== null);
}

// Generate Control Center credentials
export function generateControlCenterCredentials(): StoredCredential[] {
  const ccIntegrations = ['auth0', 'sendgrid', 'google-analytics', 'aws-s3', 'slack', 'github'];
  
  return generateCredentialsForIntegrations(
    ccIntegrations,
    'control-center',
    'Control Center',
    'controlcenter.lovable.app',
    '#00D4FF',
    'control-center'
  );
}
