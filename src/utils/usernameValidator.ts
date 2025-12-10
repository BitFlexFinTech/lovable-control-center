// Simulated database of taken usernames per platform
const takenUsernames: Record<string, Set<string>> = {
  instagram: new Set(['johndoe', 'janedoe', 'admin', 'official', 'support', 'help']),
  tiktok: new Set(['johndoe', 'viral', 'trending', 'admin', 'official']),
  twitter: new Set(['johndoe', 'elon', 'admin', 'twitter', 'x']),
  facebook: new Set(['johndoe', 'facebook', 'meta', 'admin', 'mark']),
  discord: new Set(['johndoe', 'discord', 'admin', 'mod', 'bot']),
  youtube: new Set(['johndoe', 'google', 'youtube', 'admin', 'official']),
  linkedin: new Set(['johndoe', 'linkedin', 'admin', 'hr', 'recruiter']),
};

// Username validation rules per platform
const usernameRules: Record<string, {
  minLength: number;
  maxLength: number;
  pattern: RegExp;
  description: string;
}> = {
  instagram: {
    minLength: 1,
    maxLength: 30,
    pattern: /^[a-zA-Z0-9._]+$/,
    description: 'Letters, numbers, periods, and underscores only',
  },
  tiktok: {
    minLength: 2,
    maxLength: 24,
    pattern: /^[a-zA-Z0-9._]+$/,
    description: 'Letters, numbers, periods, and underscores only',
  },
  twitter: {
    minLength: 4,
    maxLength: 15,
    pattern: /^[a-zA-Z0-9_]+$/,
    description: 'Letters, numbers, and underscores only',
  },
  facebook: {
    minLength: 5,
    maxLength: 50,
    pattern: /^[a-zA-Z0-9.]+$/,
    description: 'Letters, numbers, and periods only',
  },
  discord: {
    minLength: 2,
    maxLength: 32,
    pattern: /^[a-zA-Z0-9_]+$/,
    description: 'Letters, numbers, and underscores only',
  },
  youtube: {
    minLength: 3,
    maxLength: 30,
    pattern: /^[a-zA-Z0-9]+$/,
    description: 'Letters and numbers only',
  },
  linkedin: {
    minLength: 3,
    maxLength: 100,
    pattern: /^[a-zA-Z0-9-]+$/,
    description: 'Letters, numbers, and hyphens only',
  },
};

export interface UsernameValidationResult {
  isValid: boolean;
  isAvailable: boolean;
  errors: string[];
  suggestions: string[];
}

export async function validateUsername(
  username: string,
  platform: string
): Promise<UsernameValidationResult> {
  const rules = usernameRules[platform] || usernameRules.instagram;
  const errors: string[] = [];
  const suggestions: string[] = [];

  // Check length
  if (username.length < rules.minLength) {
    errors.push(`Username must be at least ${rules.minLength} characters`);
  }
  if (username.length > rules.maxLength) {
    errors.push(`Username must be no more than ${rules.maxLength} characters`);
  }

  // Check pattern
  if (!rules.pattern.test(username)) {
    errors.push(rules.description);
  }

  // Check reserved words
  const reservedWords = ['admin', 'support', 'help', 'official', 'mod', 'bot'];
  if (reservedWords.some(word => username.toLowerCase().includes(word))) {
    errors.push('Username contains reserved words');
  }

  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // Check availability
  const platformTaken = takenUsernames[platform] || new Set();
  const isAvailable = !platformTaken.has(username.toLowerCase());

  if (!isAvailable) {
    // Generate suggestions
    const baseUsername = username.replace(/\d+$/, '');
    for (let i = 1; i <= 5; i++) {
      const suggested = `${baseUsername}${Math.floor(Math.random() * 9999)}`;
      if (!platformTaken.has(suggested.toLowerCase())) {
        suggestions.push(suggested);
      }
    }
  }

  return {
    isValid: errors.length === 0,
    isAvailable,
    errors,
    suggestions: suggestions.slice(0, 3),
  };
}

export async function checkUsernameAvailabilityAllPlatforms(
  username: string
): Promise<Record<string, { available: boolean; suggestion?: string }>> {
  const platforms = Object.keys(usernameRules);
  const results: Record<string, { available: boolean; suggestion?: string }> = {};

  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 800));

  for (const platform of platforms) {
    const platformTaken = takenUsernames[platform] || new Set();
    const available = !platformTaken.has(username.toLowerCase());
    
    if (!available) {
      const suggestion = `${username}${Math.floor(Math.random() * 999)}`;
      results[platform] = { available, suggestion };
    } else {
      results[platform] = { available };
    }
  }

  return results;
}

export function generateSecurePassword(length: number = 16): string {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*';
  
  const allChars = uppercase + lowercase + numbers + symbols;
  
  // Ensure at least one of each type
  let password = '';
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];
  
  // Fill the rest
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  // Shuffle
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

export function validatePassword(password: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }
  if (password.length > 128) {
    errors.push('Password must be no more than 128 characters');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateEmail(email: string): boolean {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email);
}
