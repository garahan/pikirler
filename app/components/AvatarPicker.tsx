'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

const STYLES = ['thumbs', 'bottts', 'adventurer', 'fun-emoji', 'notionists', 'lorelei', 'micah', 'shapes'];
const urlFor = (style: string, seed: string) => `https://api.dicebear.com/7.x/${style}/svg?seed=${encodeURIComponent(seed)}`;

export default function AvatarPicker({
  seedHint = '',
  value,
  onChange,
}: {
  seedHint?: string;
  value?: string;
  onChange: (url: string) => void;
}) {
  const [style, setStyle] = useState(STYLES[0]);
  const [seed, setSeed] = useState(seedHint || Math.random().toString(36).slice(2, 8));

  // keep a valid avatar selected as inputs change
  useEffect(() => {
    onChange(urlFor(style, seed || 'pikir'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [style, seed]);

  const current = value || urlFor(style, seed || 'pikir');

  return (
    <div className="flex items-center gap-4">
      <span className="ring-grad shrink-0">
        <Image src={current} alt="avatar" width={64} height={64} className="h-16 w-16 rounded-full bg-midnight" unoptimized />
      </span>
      <div className="min-w-0 flex-1">
        <div className="no-scrollbar flex gap-1.5 overflow-x-auto pb-1">
          {STYLES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStyle(s)}
              className={`press shrink-0 rounded-full border px-2.5 py-1 text-xs ${style === s ? 'border-glow/50 bg-glow/10 text-glow' : 'border-edge text-muted'}`}
            >
              {s}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setSeed(Math.random().toString(36).slice(2, 8))}
          className="press mt-1 rounded-full border border-edge px-3 py-1 text-xs text-accent hover:bg-white/5"
        >
          🎲 Başga görnüş
        </button>
      </div>
    </div>
  );
}
