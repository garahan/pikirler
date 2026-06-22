import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { signToken, sessionCookie, publicUser } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();
    const u = String(username ?? '').trim().toLowerCase();
    const pw = String(password ?? '');

    const user = await prisma.user.findUnique({ where: { username: u } });
    // generic message — don't reveal whether the username exists
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
