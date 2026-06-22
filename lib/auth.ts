import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/db';

const SECRET = process.env.JWT_SECRET || 'dev-only-insecure-change-me';
const COOKIE = 'token';
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export type PublicUser = {
  id: string;
  username: string;
  displayName: string;
  avatar: string | null;
  bio: string | null;
  isBot: boolean;
  isAdmin: boolean;
};

export function publicUser(u: {
  id: string;
  username: string;
  displayName?: string | null;
  avatar?: string | null;
  bio?: string | null;
  isBot?: boolean;
  isAdmin?: boolean;
}): PublicUser {
  return {
    id: u.id,
    username: u.username,
    displayName: u.displayName || u.username,
    avatar: u.avatar ?? null,
    bio: u.bio ?? null,
    isBot: !!u.isBot,
    isAdmin: !!u.isAdmin,
  };
}

export function signToken(userId: string): string {
  return jwt.sign({ uid: userId }, SECRET, { expiresIn: '30d' });
}

export function verifyToken(token: string): string | null {
  try {
    const decoded = jwt.verify(token, SECRET) as { uid: string };
    return decoded.uid;
  } catch {
    return null;
  }
}

/** Reads the session cookie and returns the full user row, or null. */
export async function getCurrentUser() {
  const token = cookies().get(COOKIE)?.value;
  if (!token) return null;
  const uid = verifyToken(token);
  if (!uid) return null;
  return prisma.user.findUnique({ where: { id: uid } });
}

export const sessionCookie = (token: string) => ({
  name: COOKIE,
  value: token,
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: MAX_AGE,
});

export const clearedCookie = () => ({
  name: COOKIE,
  value: '',
  httpOnly: true,
  path: '/',
  maxAge: 0,
});
