// First deployment trigger
import { prisma } from '@/lib/db';
import { redis } from '@/lib/redis';
import Feed from '@/components/Feed';
import CreatePost from '@/components/CreatePost';
import TrendingTopics from '@/components/TrendingTopics';

// Revalidate every 60 seconds (ISR)
export const revalidate = 60;

export default async function Home() {
  // 1. Get cached post IDs from Redis
  let postIds: string[] = await redis.lrange('global_feed', 0, 99);
  
  // 2. If Redis is empty, fallback to database
  if (!postIds || postIds.length === 0) {
    const latest = await prisma.post.findMany({
      take: 50,
      orderBy: { createdAt: 'desc' },
      select: { id: true },
    });
    postIds = latest.map((p) => p.id);
    
    // Re-populate Redis cache
    if (postIds.length > 0) {
      await redis.lpush('global_feed', ...postIds);
      await redis.ltrim('global_feed', 0, 999);
    }
  }

  // 3. Fetch full posts with relations (users, replies, likes)
  const posts = await prisma.post.findMany({
    where: { id: { in: postIds.length > 0 ? postIds : ['no-posts'] } },
    include: {
      user: {
        select: { username: true, avatar: true, isBot: true },
      },
      replies: {
        include: {
          user: { select: { username: true } },
        },
        take: 3,
        orderBy: { createdAt: 'asc' },
      },
      likes: {
        select: { id: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  // 4. Extract trending hashtags (Hot Topics)
  const recentPosts = await prisma.post.findMany({
    take: 100,
    orderBy: { createdAt: 'desc' },
    select: { text: true },
  });

  const hashtagMap = new Map<string, number>();
  recentPosts.forEach((p) => {
    const tags = p.text.match(/#[\wçäýöşüňž]+/gi) || [];
    tags.forEach((tag) => {
      const key = tag.toLowerCase();
      hashtagMap.set(key, (hashtagMap.get(key) || 0) + 1);
    });
  });

  const trending = Array.from(hashtagMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([tag, count]) => ({ tag, count }));

  // 5. Sort posts to match Redis order (newest first)
  const sortedPosts = posts.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <main className="max-w-2xl mx-auto px-4 py-6">
      {/* Header */}
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-cyan tracking-tight">Pikirler</h1>
          <p className="text-textSecondary text-sm">Pikirleriň akymy</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-amber text-xl animate-breathe">🔥</span>
          <button className="text-textSecondary hover:text-cyan transition text-sm">
            👤
          </button>
        </div>
      </header>

      {/* Create Post */}
      <CreatePost />

      {/* Trending Topics */}
      <TrendingTopics topics={trending} />

      {/* Feed */}
      <Feed initialPosts={sortedPosts} />
    </main>
  );
}
