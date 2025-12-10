const firstNames = {
  male: ['James', 'John', 'Robert', 'Michael', 'David', 'William', 'Richard', 'Joseph', 'Thomas', 'Christopher', 'Alex', 'Daniel', 'Matthew', 'Anthony', 'Mark'],
  female: ['Mary', 'Patricia', 'Jennifer', 'Linda', 'Barbara', 'Elizabeth', 'Susan', 'Jessica', 'Sarah', 'Karen', 'Emma', 'Olivia', 'Sophia', 'Isabella', 'Mia'],
};

const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Anderson', 'Taylor', 'Thomas', 'Moore', 'Jackson', 'White', 'Harris', 'Martin', 'Thompson', 'Young'];

const countries = ['United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'France', 'Spain', 'Italy', 'Netherlands', 'Sweden'];

function generateRandomString(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function generateRandomDate(minAge: number, maxAge: number): string {
  const now = new Date();
  const minYear = now.getFullYear() - maxAge;
  const maxYear = now.getFullYear() - minAge;
  const year = Math.floor(Math.random() * (maxYear - minYear + 1)) + minYear;
  const month = Math.floor(Math.random() * 12) + 1;
  const day = Math.floor(Math.random() * 28) + 1;
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function generateUsername(firstName: string, lastName: string): string {
  const styles = [
    () => `${firstName.toLowerCase()}${lastName.toLowerCase()}${Math.floor(Math.random() * 999)}`,
    () => `${firstName.toLowerCase()}_${lastName.toLowerCase()}`,
    () => `${firstName.toLowerCase()}${Math.floor(Math.random() * 9999)}`,
    () => `${firstName[0].toLowerCase()}${lastName.toLowerCase()}${Math.floor(Math.random() * 99)}`,
  ];
  return styles[Math.floor(Math.random() * styles.length)]();
}

function generatePhone(): string {
  const prefix = ['+1', '+44', '+49', '+33', '+34'][Math.floor(Math.random() * 5)];
  const number = Math.floor(Math.random() * 9000000000) + 1000000000;
  return `${prefix} ${number.toString().slice(0, 3)}-${number.toString().slice(3, 6)}-${number.toString().slice(6)}`;
}

export interface GeneratedPersonaData {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  username: string;
  email: string;
  password: string;
  recoveryEmail: string;
  dateOfBirth: string;
  country: string;
  gender: 'male' | 'female' | 'other';
  phone: string;
}

export function generatePersona(domain: string): GeneratedPersonaData {
  const gender = Math.random() > 0.5 ? 'male' : 'female';
  const firstName = firstNames[gender][Math.floor(Math.random() * firstNames[gender].length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  const username = generateUsername(firstName, lastName);
  
  return {
    id: `persona-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    firstName,
    lastName,
    fullName: `${firstName} ${lastName}`,
    username,
    email: `${username}@${domain}`,
    password: generateRandomString(16),
    recoveryEmail: `${username}.recovery@${domain}`,
    dateOfBirth: generateRandomDate(18, 45),
    country: countries[Math.floor(Math.random() * countries.length)],
    gender,
    phone: generatePhone(),
  };
}

export function generatePlatformFields(
  persona: GeneratedPersonaData,
  platform: string,
  siteDomain: string
): Record<string, string> {
  const baseFields = {
    email: persona.email,
    password: persona.password,
    username: persona.username,
    fullName: persona.fullName,
    firstName: persona.firstName,
    lastName: persona.lastName,
    dateOfBirth: persona.dateOfBirth,
    gender: persona.gender,
    phone: persona.phone,
    recoveryEmail: persona.recoveryEmail,
  };

  switch (platform) {
    case 'instagram':
      return {
        email: baseFields.email,
        fullName: baseFields.fullName,
        username: baseFields.username,
        password: baseFields.password,
        dateOfBirth: baseFields.dateOfBirth,
      };
    case 'tiktok':
      return {
        businessName: `${persona.lastName} Media`,
        email: baseFields.email,
        phone: baseFields.phone,
        country: persona.country,
        website: `https://${siteDomain}`,
        password: baseFields.password,
      };
    case 'twitter':
      return {
        email: baseFields.email,
        username: baseFields.username,
        fullName: baseFields.fullName,
        dateOfBirth: baseFields.dateOfBirth,
        password: baseFields.password,
      };
    case 'facebook':
      return {
        firstName: baseFields.firstName,
        lastName: baseFields.lastName,
        email: baseFields.email,
        password: baseFields.password,
        dateOfBirth: baseFields.dateOfBirth,
        gender: baseFields.gender,
      };
    case 'discord':
      return {
        email: baseFields.email,
        username: baseFields.username,
        password: baseFields.password,
        dateOfBirth: baseFields.dateOfBirth,
      };
    case 'youtube':
      return {
        firstName: baseFields.firstName,
        lastName: baseFields.lastName,
        username: baseFields.username,
        password: baseFields.password,
        phone: baseFields.phone,
        recoveryEmail: baseFields.recoveryEmail,
      };
    case 'linkedin':
      return {
        email: baseFields.email,
        password: baseFields.password,
        firstName: baseFields.firstName,
        lastName: baseFields.lastName,
      };
    default:
      return baseFields;
  }
}
