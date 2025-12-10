// TOTP Generator Utilities
// Generates time-based one-time passwords compatible with Authy/Google Authenticator

const BASE32_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

// Generate a random base32 secret
export function generateSecret(length: number = 32): string {
  let secret = '';
  for (let i = 0; i < length; i++) {
    secret += BASE32_CHARS[Math.floor(Math.random() * BASE32_CHARS.length)];
  }
  return secret;
}

// Decode base32 to bytes
function base32Decode(encoded: string): Uint8Array {
  encoded = encoded.replace(/=+$/, '').toUpperCase();
  const output = [];
  let bits = 0;
  let value = 0;

  for (let i = 0; i < encoded.length; i++) {
    const index = BASE32_CHARS.indexOf(encoded[i]);
    if (index === -1) continue;

    value = (value << 5) | index;
    bits += 5;

    if (bits >= 8) {
      output.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }

  return new Uint8Array(output);
}

// HMAC-SHA1 implementation
async function hmacSha1(key: Uint8Array, message: Uint8Array): Promise<Uint8Array> {
  const keyBuffer = key.buffer.slice(key.byteOffset, key.byteOffset + key.byteLength) as ArrayBuffer;
  const messageBuffer = message.buffer.slice(message.byteOffset, message.byteOffset + message.byteLength) as ArrayBuffer;
  
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyBuffer,
    { name: 'HMAC', hash: 'SHA-1' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageBuffer);
  return new Uint8Array(signature);
}

// Generate TOTP code
export async function generateTOTP(secret: string, period: number = 30): Promise<string> {
  const key = base32Decode(secret);
  const time = Math.floor(Date.now() / 1000 / period);
  
  // Convert time to 8-byte buffer
  const timeBuffer = new Uint8Array(8);
  let t = time;
  for (let i = 7; i >= 0; i--) {
    timeBuffer[i] = t & 0xff;
    t = Math.floor(t / 256);
  }

  const hmac = await hmacSha1(key, timeBuffer);
  
  // Dynamic truncation
  const offset = hmac[hmac.length - 1] & 0xf;
  const code = (
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff)
  ) % 1000000;

  return code.toString().padStart(6, '0');
}

// Get time remaining until code expires
export function getTimeRemaining(period: number = 30): number {
  return period - (Math.floor(Date.now() / 1000) % period);
}

// Generate QR code URL for authenticator apps
export function generateQRCodeURL(
  secret: string,
  accountName: string,
  issuer: string
): string {
  const encodedIssuer = encodeURIComponent(issuer);
  const encodedAccount = encodeURIComponent(accountName);
  const otpauth = `otpauth://totp/${encodedIssuer}:${encodedAccount}?secret=${secret}&issuer=${encodedIssuer}&algorithm=SHA1&digits=6&period=30`;
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(otpauth)}`;
}