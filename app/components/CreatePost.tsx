'use client'

import { useState } from 'react'

interface CreatePostProps {
  onPostCreated: () => void
}

export default function CreatePost({ onPostCreated }: CreatePostProps) {
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!content.trim()) {
      setError('Please write something!')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      })

      if (response.ok) {
        setContent('')
        onPostCreated()
      } else {
        setError('Failed to post')
      }
    } catch (err) {
      setError('Error posting')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-secondary border border-border rounded-lg p-4 mb-6">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="What's on your mind?"
        className="w-full bg-primary text-text border border-border rounded-lg p-3 mb-3 resize-none focus:outline-none focus:border-accent"
        rows={3}
        maxLength={500}
      />

      <div className="flex justify-between items-center">
        <span className="text-sm text-text-muted">{content.length}/500</span>
        <button
          type="submit"
          disabled={loading}
          className="bg-accent text-primary font-bold py-2 px-6 rounded-lg hover:bg-accent/80 disabled:opacity-50 transition-opacity"
        >
          {loading ? 'Posting...' : 'Post'}
        </button>
      </div>

      {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
    </form>
  )
}