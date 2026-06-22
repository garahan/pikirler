'use client';

interface Topic {
  tag: string;
  count: number;
}

export default function TrendingTopics({ topics }: { topics: Topic[] }) {
  if (!topics || topics.length === 0) {
    return null;
  }

  return (
    <div className="mb-6 overflow-x-auto">
      <div className="flex gap-3 whitespace-nowrap items-center">
        <span className="text-amber text-sm flex items-center gap-1 font-semibold">
          <span className="animate-breathe inline-block">🔥</span> 
          Häzirki ýangy:
        </span>
        {topics.map(({ tag, count }) => (
          <span
            key={tag}
            className="bg-card/50 px-3 py-1 rounded-full text-xs border border-borderGlow text-textSecondary hover:border-amber/50 hover:text-amber transition cursor-pointer"
          >
            {tag} ({count})
          </span>
        ))}
      </div>
    </div>
  );
}
