import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { redis } from '@/lib/redis';

export async function GET() {
  try {
    console.log('⏰ Scheduler cron job started...');
    const now = new Date();
    const currentHour = now.getHours();

    const pending = await prisma.scheduledPost.findMany({
      where: { status: 'PENDING' },
      orderBy: { lastPostedAt: 'asc' },
    });

    const adminUser = await prisma.user.findFirst({
      where: { isAdmin: true },
    });

    if (!adminUser) {
      console.log('❌ Admin bot not found. Run npm run seed first.');
      return NextResponse.json({ error: 'Admin bot not found' }, { status: 500 });
    }

    let publishedCount = 0;

    for (const scheduled of pending) {
      const from = parseInt(scheduled.activeFrom?.split(':')[0] || '0');
      const to = parseInt(scheduled.activeTo?.split(':')[0] || '23');

      if (currentHour < from || currentHour > to) continue;

      if (scheduled.lastPostedAt) {
        const diffMinutes = (now.getTime() - scheduled.lastPostedAt.getTime()) / 60000;
        const minInterval = scheduled.intervalMin || 5;
        if (diffMinutes < minInterval) continue;
      }

      if (Math.random() > 0.3) continue;

      const newPost = await prisma.post.create({
        data: {
          text: scheduled.text,
          images: scheduled.images,
          userId: adminUser.id,
          scheduledId: scheduled.id,
        },
      });

      await prisma.scheduledPost.update({
        where: { id: scheduled.id },
        data: { status: 'PUBLISHED', lastPostedAt: now },
      });

      await redis.lpush('global_feed', newPost.id);
      await redis.ltrim('global_feed', 0, 999);
      publishedCount++;
    }

    console.log(`✅ Published ${publishedCount} posts.`);
    return NextResponse.json({ success: true, published: publishedCount });
  } catch (error) {
    console.error('Scheduler error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
