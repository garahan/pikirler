'use client';

import { useState } from 'react';

type PostCardProps = {
  post: {
    id: string;
    text: string;
    images: string[];
    createdAt: Date;
    user: { username: string; avatar: string | null; isBot?: boolean };
    replies: { id: string; text: string; user: { username: string } }[];
    likes: { id: string }[];
  };
  onLike: (id: string) => void;
};

export default function PostCard({ post, onLike }: PostCardProps) {
  const [liked, setLiked] = useState(post.likes.length > 0);
  const [likeCount, setLikeCount] = useState(post.likes.length);
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [isReplying, setIsReplying] = useState(false);

  const handleLike = async () => {
    // Optimistic update
    const newLiked = !liked;
    setLiked(newLiked);
    setLikeCount((prev) => (newLiked ? prev + 1 : prev - 1));
    onLike(post.id);

    // Actual API call
    await fetch('/api/like', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId: post.id }),
    });
  };

  const handleReply = async () => {
    if (!replyText.trim()) return;
    setIsReplying(true);
    try {
      await fetch('/api/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId: post.id, text: replyText }),
      });
      setReplyText('');
      setShowReply(false);
      window.location.reload();
    } catch (error) {
      console.error('Reply failed:', error);
    } finally {
      setIsReplying(false);
    }
  };

  // Format time
  const timeAgo = (date: Date) => {
    const diff = Date.now() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'häzir';
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}s`;
    const days = Math.floor(hours / 24);
    return `${days}g`;
  };

  return (
    <div className="card hover:border-cyan/20 transition-all duration-300">
      {/* User Info */}
      <div className="flex items-center gap-3">
        <img
          src={post.user.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
          alt={post.user.username}
          className="w-10 h-10 rounded-full border-2 border-cyan/30 object-cover"
        />
        <div>
          <p className="font-semibold text-textMain flex items-center gap-2">
            {post.user.username}
            {post.user.isBot && (
              <span className="text-xs bg-cyan/20 text-cyan px-2 py-0.5 rounded-full">Bot</span>
            )}
          </p>
          <p className="text-textSecondary text-xs">{timeAgo(post.createdAt)}</p>
        </div>
      </div>

      {/* Text Content */}
      <p className="mt-3 text-textMain leading-relaxed whitespace-pre-wrap text-[15px]">
        {post.text}
      </p>

      {/* Images (optional) */}
      {post.images && post.images.length > 0 && (
        <div className={`grid grid-cols-${Math.min(post.images.length, 2)} gap-1 mt-3`}>
          {post.images.map((url, i) => (
            <img
              key={i}
              src={url}
              alt=""
              className="rounded-lg object-cover max-h-60 w-full"
            />
          ))}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center gap-6 mt-4 text-textSecondary">
        <button
          onClick={handleLike}
          className={`flex items-center gap-1.5 transition-all hover:text-cyan group ${
            liked ? 'text-cyan' : ''
          }`}
        >
          <span className={`text-xl transition-transform ${liked ? 'scale-110' : ''}`}>
            ⚡
          </span>
          <span className="text-sm font-medium">{likeCount}</span>
        </button>

        <button
          onClick={() => setShowReply(!showReply)}
          className="flex items-center gap-1.5 hover:text-cyan transition"
        >
          <span className="text-xl">💬</span>
          <span className="text-sm font-medium">{post.replies.length}</span>
        </button>

        <button className="flex items-center gap-1.5 hover:text-cyan transition">
          <span className="text-xl">🔄</span>
        </button>

        <button className="flex items-center gap-1.5 hover:text-cyan transition ml-auto">
          <span className="text-xl">📌</span>
        </button>
      </div>

      {/* Reply Input */}
      {showReply && (
        <div className="mt-3 flex gap-2">
          <input
            type="text"
            className="flex-1 bg-black/30 rounded-full px-4 py-2 text-sm border border-borderGlow focus:border-cyan outline-none text-textMain placeholder-textSecondary"
            placeholder="Jogap ýaz..."
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleReply()}
          />
          <button
            onClick={handleReply}
            disabled={isReplying || !replyText.trim()}
            className="bg-cyan text-midnight px-4 py-2 rounded-full text-sm font-bold disabled:opacity-50 hover:shadow-glow transition"
          >
            {isReplying ? 'Iberilýär...' : 'Iber'}
          </button>
        </div>
      )}

      {/* Existing Replies */}
      {post.replies.length > 0 && (
        <div className="mt-3 space-y-2 border-t border-borderGlow pt-3">
          {post.replies.slice(0, 3).map((reply) => (
            <div key={reply.id} className="flex items-start gap-2">
              <span className="text-cyan text-xs mt-0.5">↳</span>
              <span className="font-medium text-sm text-textSecondary">
                {reply.user.username}
              </span>
              <span className="text-sm text-textMain break-words">{reply.text}</span>
            </div>
          ))}
          {post.replies.length > 3 && (
            <p className="text-xs text-textSecondary pl-5">
              we başga {post.replies.length - 3} jogap...
            </p>
          )}
        </div>
      )}
    </div>
  );
}
