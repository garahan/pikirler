// If your project originally used 'jsonwebtoken', you MUST run: npm install jose
import { SignJWT, jwtVerify } from 'jose';

// Move the secret generation into a helper function so it ONLY runs when called
const getSecret = () => {
  const secret = process.env.JWT_SECRET || 'dev-only-insecure-change-me';
  
  if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
     console.error('WARNING: Using insecure JWT_SECRET in production.');
  }
  
  return new TextEncoder().encode(secret);
};

export async function signToken(payload: { userId: string; [key: string]: any }) {
  // Evaluates the secret dynamically
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d') 
    .sign(getSecret());
}

export async function verifyToken(token: string) {
  try {
    // Evaluates the secret dynamically
    const { payload } = await jwtVerify(token, getSecret());
    return payload;
  } catch (error) {
    // Fails silently if token is expired or invalid, which is the expected behavior
    return null;
  }
}
