'use client'

import { useState, useEffect } from 'react'
import Feed from './components/Feed'
import CreatePost from './components/CreatePost'
import TrendingTopics from './components/TrendingTopics'

export default function Home() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        const response = await fetch('/api/feed')
        const data = await response.json()
        setPosts(data)
      } catch (error) {
        console.error('Failed to fetch feed:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchFeed()
  }, [])

  return (
    <main className="min-h-screen bg-primary">
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-accent mb-2">Pikirler</h1>
          <p className="text-text-muted">Pikirleriň dünýäsi – The world of thoughts</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <CreatePost onPostCreated={() => {}} />
            {loading ? (
              <div className="text-center py-8 text-text-muted">Loading...</div>
            ) : (
              <Feed posts={posts} />
            )}
          </div>

          <aside className="hidden lg:block">
            <TrendingTopics />
          </aside>
        </div>
      </div>
    </main>
  )
}