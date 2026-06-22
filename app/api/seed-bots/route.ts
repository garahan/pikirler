import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

const ADMIN_SECRET = process.env.ADMIN_SECRET || '123qwe';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get('secret');

  if (secret !== ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const botNames = [
      'Merjen_07', 'Aşyr_Türkmen', 'Lala_92', 'Nazar_55',
      'Gülşat_11', 'Döwlet_88', 'Jeren_33', 'Serdar_44',
      'Mähri_22', 'Yusup_77', 'Ayna_99', 'Begenç_66',
    ];

    const created = [];
    for (const name of botNames) {
      const user = await prisma.user.upsert({
        where: { username: name },
        update: {},
        create: {
          username: name,
          isBot: true,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
        },
      });
      created.push(user);
    }

    const admin = await prisma.user.upsert({
      where: { username: 'pikirler_admin' },
      update: {},
      create: {
        username: 'pikirler_admin',
        isBot: true,
        isAdmin: true,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
      },
    });

    return NextResponse.json({
      success: true,
      botsCreated: created.length,
      adminCreated: admin.username,
      total: created.length + 1,
    });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
