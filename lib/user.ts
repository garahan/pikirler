import { cookies } from 'next/headers';
import { prisma } from '@/lib/db';

/**
 * Lightweight anonymous identity. Each visitor gets a stable `uid` cookie and a
 * matching User row, so likes/replies/posts are attributable without a login
 * flow. Swap for real auth (JWT/OAuth) later without touching the components.
 */
export async function getCurrentUser() {
  const jar = cookies();
  const uid = jar.get('uid')?.value;

  if (uid) {
    const existing = await prisma.user.findUnique({ where: { id: uid } });
    if (existing) return existing;
  }

  const n = Math.floor(1000 + Math.random() * 9000);
  const username = `myhman_${n}`;
  return prisma.user.create({
    data: {
      username,
      avatar: `https://api.dicebear.com/7.x/thumbs/svg?seed=${username}`,
    },
  });
}

/** Sets the uid cookie on a response (call after getCurrentUser created one). */
export function setUidCookie(res: Response, id: string) {
  res.headers.append(
    'Set-Cookie',
    `uid=${id}; Path=/; Max-Age=31536000; SameSite=Lax; HttpOnly`
  );
  return res;
}
