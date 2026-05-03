import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
);

export async function verifyAuth(token: string) {
  try {
    const verified = await jwtVerify(token, secret);
    return verified.payload;
  } catch (err) {
    return null;
  }
}

export async function generateToken(
  payload: Record<string, unknown>,
  expiresIn: string = '7d'
): Promise<string> {
  const { SignJWT } = await import('jose');

  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(secret);
}

export async function validateWhatsappWebhook(
  _signature: string,
  _body: string
): Promise<boolean> {
  // Validate Twilio webhook signature
  // Implementation depends on Twilio SDK
  return true;
}
