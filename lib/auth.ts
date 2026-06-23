import { SignJWT, jwtVerify } from 'jose';

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  
  if (!secret) {
    // Check if we are actively running in production runtime (Serverless environment)
    // and NOT just running a static build process.
    if (process.env.NODE_ENV === 'production' && typeof window === 'undefined') {
      // This ensures it only catches missing secrets when handling actual live requests
      console.error('FATAL ERROR: JWT_SECRET environment variable is missing in production!');
    }
    return 'dev-only-insecure-change-me';
  }
  
  return secret;
};

const SECRET = new TextEncoder().encode(getJwtSecret());

export async function signToken(payload: { userId: string; [key: string]: any }) {
  // Guard clause at the function level: if someone actually tries to sign a token in production with the fallback, block it immediately.
  if (process.env.NODE_ENV === 'production' && process.env.JWT_SECRET === undefined) {
    throw new Error('JWT signing blocked: JWT_SECRET is missing.');
  }

  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d') 
    .sign(SECRET);
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}
