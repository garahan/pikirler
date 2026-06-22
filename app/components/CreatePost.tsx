'use client';

import { useState } from 'react';

export default function CreatePost() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!text.trim()) return;
    setLoading(true);
    
    try {
      const res = await fetch('/api/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      
      if (res.ok) {
        setText('');
        // Hard refresh to show new post (simplistic for prototype)
        window.location.reload();
      }
    } catch (error) {
      console.error('Failed to post:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card mb-6 hover:border-cyan/30 transition">
      <textarea
        className="w-full bg-transparent border-none outline-none resize-none text-textMain placeholder-textSecondary text-lg leading-relaxed"
        rows={3}
        placeholder="Pikiriňizi ýazyň..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        maxLength={500}
      />
      <div className="flex justify-between items-center mt-2">
        <span className="text-xs text-textSecondary">{text.length}/500</span>
        <button
          onClick={handleSubmit}
          disabled={loading || !text.trim()}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Iberilýär...' : '🚀 Paylaş'}
        </button>
      </div>
    </div>
  );
}
