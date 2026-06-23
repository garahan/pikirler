import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { signToken, sessionCookie, clearedCookie, publicUser, getCurrentUser } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ALLOWED_AVATAR = /^https:\/\/api\.dicebear\.com\//;

// GET /api/auth?action=me
export async function GET() {
  const me = await getCurrentUser();
  return NextResponse.json({ user: me ? publicUser(me) : null });
}

// POST /api/auth?action=login|logout|register
export async function POST(req: NextRequest) {
  const action = new URL(req.url).searchParams.get('action');

  // --- LOGOUT ---
  if (action === 'logout') {
    const res = NextResponse.json({ ok: true });
    res.cookies.set(clearedCookie());
    return res;
  }

  // --- LOGIN ---
  if (action === 'login') {
    try {
      const { username, password } = await req.json();
      const u = String(username ?? '').trim().toLowerCase();
      const pw = String(password ?? '');
      const user = await prisma.user.findUnique({ where: { username: u } });
      if (!user || !user.passwordHash || !(await bcrypt.compare(pw, user.passwordHash))) {
        return NextResponse.json({ error: 'invalid_credentials' }, { status: 401 });
      }
      const res = NextResponse.json({ ok: true, user: publicUser(user) });
      res.cookies.set(sessionCookie(signToken(user.id)));
      return res;
    } catch (err) {
      console.error('[login] error', err);
      return NextResponse.json({ error: 'login_failed' }, { status: 500 });
    }
  }

  // --- REGISTER ---
  if (action === 'register') {
    try {
      const { username, password, displayName, bio, avatar } = await req.json();
      const u = String(username ?? '').trim().toLowerCase();
      const pw = String(password ?? '');
      if (!/^[a-z0-9_]{3,20}$/.test(u)) return NextResponse.json({ error: 'bad_username' }, { status: 400 });
      if (pw.length < 6) return NextResponse.json({ error: 'weak_password' }, { status: 400 });
      const exists = await prisma.user.findUnique({ where: { username: u } });
      if (exists) return NextResponse.json({ error: 'username_taken' }, { status: 409 });
      const safeAvatar =
        typeof avatar === 'string' && ALLOWED_AVATAR.test(avatar)
          ? avatar
          : `https://api.dicebear.com/7.x/thumbs/svg?seed=${encodeURIComponent(u)}`;
      const passwordHash = await bcrypt.hash(pw, 10);
      const user = await prisma.user.create({
        data: {
          username: u,
          displayName: String(displayName ?? '').trim().slice(0, 40) || u,
          bio: String(bio ?? '').trim().slice(0, 160) || null,
          avatar: safeAvatar,
          passwordHash,
        },
      });
      const res = NextResponse.json({ ok: true, user: publicUser(user) }, { status: 201 });
      res.cookies.set(sessionCookie(signToken(user.id)));
      return res;
    } catch (err) {
      console.error('[register] error', err);
      return NextResponse.json({ error: 'register_failed' }, { status: 500 });
    }
  }

  return NextResponse.json({ error: 'unknown_action' }, { status: 400 });
}
