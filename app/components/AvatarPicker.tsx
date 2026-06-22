'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * AvatarPicker
 * Used on the register form:
 *   <AvatarPicker seedHint={username} value={avatar} onChange={setAvatar} />
 *
 * `value` / `onChange` deal with a full DiceBear avatar URL (a string),
 * which is what gets POSTed to /api/auth/register as `avatar` and stored
 * on the User. Shuffle generates a fresh random avatar.
 *
 * NOTE: change AVATAR_STYLE below to whatever style your seeded users and
 * edit-profile modal already use, so new sign-ups match the rest of the app.
 * DiceBear styles: adventurer, avataaars, lorelei, micah, notionists,
 * fun-emoji, thumbs, personas, open-peeps, etc.
 */
const AVATAR_STYLE = 'adventurer';

function randomSeed(): string {
  return Math.random().toString(36).slice(2, 10);
}

function buildUrl(seed: string): string {
  return `https://api.dicebear.com/9.x/${AVATAR_STYLE}/svg?seed=${encodeURIComponent(seed)}`;
}

type Props = {
  seedHint?: string;
  value: string;
  onChange: (url: string) => void;
};

export default function AvatarPicker({ seedHint = '', value, onChange }: Props) {
  const [seed, setSeed] = useState<string>(() => seedHint || randomSeed());
  const didInit = useRef(false);

  // Set an initial avatar once, only if the parent doesn't already have one.
  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;
    if (!value) {
      const s = seedHint || randomSeed();
      setSeed(s);
      onChange(buildUrl(s));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const shuffle = () => {
    const s = randomSeed();
    setSeed(s);
    onChange(buildUrl(s));
  };

  const url = value || buildUrl(seed);

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="rounded-full bg-grad-primary p-[3px] shadow-glowSoft">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt="Profil suraty"
          className="h-20 w-20 rounded-full bg-card object-cover"
        />
      </div>

      <button
        type="button"
        onClick={shuffle}
        className="press inline-flex items-center gap-1.5 rounded-full border border-edge bg-midnight px-4 py-1.5 text-sm text-muted transition-colors hover:text-ink focus:border-glow/50 focus:outline-none"
      >
        <span aria-hidden>🎲</span>
        Üýtget
      </button>
    </div>
  );
}
