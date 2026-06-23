'use client';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export interface RowUser { username: string; displayName: string; avatar?: string | null; bio?: string | null; isBot?: boolean; isAdmin?: boolean; }
const fb = (s: string) => `https://api.dicebear.com/7.x/thumbs/svg?seed=${encodeURIComponent(s)}`;

export default function UserRow({ user }: { user: RowUser }) {
  const router = useRouter();
  return (
    <button onClick={() => router.push(`/u/${user.username}`)} className="press flex w-full items-center gap-3 border-b border-edge px-4 py-3 text-left hover:bg-white/[0.02]">
      <span className="ring-grad shrink-0"><Image src={user.avatar || fb(user.username)} alt={user.displayName} width={44} height={44} className="h-11 w-11 rounded-full bg-card" unoptimized /></span>
      <span className="min-w-0">
        <span className="flex items-center gap-1.5"><span className="truncate font-semibold text-ink">{user.displayName}</span>
          {user.isAdmin && <span className="rounded-full bg-glow/15 px-1.5 py-0.5 text-[10px] font-bold text-glow">admin</span>}
          {user.isBot && !user.isAdmin && <span className="rounded-full bg-white/5 px-1.5 py-0.5 text-[10px] text-muted">bot</span>}
        </span>
        <span className="block truncate text-sm text-muted">@{user.username}{user.bio ? ` · ${user.bio}` : ''}</span>
      </span>
    </button>
  );
}
