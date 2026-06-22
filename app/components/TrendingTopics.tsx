'use client';

export interface Topic {
  tag: string;
  count: number;
}

export default function TrendingTopics({
  topics,
  active,
  onSelect,
}: {
  topics: Topic[];
  active: string | null;
  onSelect: (tag: string | null) => void;
}) {
  if (!topics.length) return null;

  return (
    <div className="sticky top-[57px] z-20 -mx-4 border-b border-edge bg-midnight/80 px-4 py-2.5 backdrop-blur-md">
      <div className="no-scrollbar flex items-center gap-2 overflow-x-auto">
        <span className="animate-breathe shrink-0 text-base" aria-hidden>🔥</span>

        {active && (
          <button
            onClick={() => onSelect(null)}
            className="press shrink-0 rounded-full border border-edge px-3 py-1 text-xs text-muted"
          >
            ✕ ählisi
          </button>
        )}

        {topics.map((t) => {
          const isActive = active === t.tag;
          return (
            <button
              key={t.tag}
              onClick={() => onSelect(isActive ? null : t.tag)}
              className={`press flex shrink-0 items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-urgent text-midnight shadow-urgent'
                  : 'border border-edge text-ink/90 hover:border-urgent/40 hover:text-urgent'
              }`}
            >
              <span>#{t.tag}</span>
              <span className={isActive ? 'text-midnight/70' : 'text-muted'}>{t.count}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
