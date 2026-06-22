import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { signToken, sessionCookie, publicUser } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { username, password, displayName } = await req.json();
    const u = String(username ?? '').trim().toLowerCase();
    const pw = String(password ?? '');

    if (!/^[a-z0-9_]{3,20}$/.test(u)) {
      return NextResponse.json({ error: 'bad_username' }, { status: 400 });
    }
    if (pw.length < 6) {
      return NextResponse.json({ error: 'weak_password' }, { status: 400 });
    }

    const exists = await prisma.user.findUnique({ where: { username: u } });
    if (exists) return NextResponse.json({ error: 'username_taken' }, { status: 409 });

    const passwordHash = await bcrypt.hash(pw, 10);
    const user = await prisma.user.create({
      data: {
        username: u,
        displayName: String(displayName ?? '').trim() || u,
        passwordHash,
        avatar: `https://api.dicebear.com/7.x/thumbs/svg?seed=${encodeURIComponent(u)}`,
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
