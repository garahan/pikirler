import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { generateReply } from '@/lib/gemini';

export async function GET() {
  try {
    console.log('🤖 Gemini bot cron job started...');

    const post = await prisma.post.findFirst({
      where: {
        replies: { none: {} },
        user: { isBot: false },
      },
      orderBy: { createdAt: 'desc' },
      include: { user: true },
    });

    if (!post) {
      console.log('📭 No posts found that need replies');
      return NextResponse.json({ message: 'No posts to reply to' });
    }

    const botUsers = await prisma.user.findMany({
      where: { isBot: true },
      take: 10,
    });

    if (botUsers.length === 0) {
      console.log('❌ No bot users found.');
      return NextResponse.json({ error: 'No bot users' }, { status: 500 });
    }

    const randomBot = botUsers[Math.floor(Math.random() * botUsers.length)];

    const replyText = await generateReply(post.text);

    await prisma.reply.create({
      data: {
        text: replyText,
        postId: post.id,
        userId: randomBot.id,
      },
    });

    await prisma.botReplyLog.create({
      data: {
        originalPostId: post.id,
        botUserId: randomBot.id,
        replyText,
      },
    });

    console.log(`✅ Replied to post ${post.id} with bot ${randomBot.username}`);
    return NextResponse.json({ success: true, repliedTo: post.id });
  } catch (error) {
    console.error('Gemini bot error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
