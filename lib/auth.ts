import { SignJWT, jwtVerify } from 'jose'; // Assuming you use 'jose' for Edge compatibility in Next.js, or standard 'jsonwebtoken'

// 1. Strict Environment Variable Enforcement
const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      // Prevent the app from building/running in production without a secure secret
      throw new Error('FATAL ERROR: JWT_SECRET environment variable is not defined in production!');
    }
    // Fallback only for local development
    console.warn('WARNING: Using insecure default JWT_SECRET for development.');
    return 'dev-only-insecure-change-me';
  }
  
  return secret;
};

const SECRET = new TextEncoder().encode(getJwtSecret());

// 2. Implement strict expiration times
export async function signToken(payload: { userId: string; [key: string]: any }) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    // Sets token expiration inside the token itself (e.g., 7 days instead of indefinite/30 days)
    .setExpirationTime('7d') 
    .sign(SECRET);
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload;
  } catch (error) {
    // This will now automatically catch expired tokens and reject them
    console.error('Token verification failed:', error);
    return null;
  }
}
