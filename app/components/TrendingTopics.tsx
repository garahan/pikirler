'use client'

import { useState, useEffect } from 'react'

interface TrendingTopic {
  id: string
  topic: string
  count: number
}

export default function TrendingTopics() {
  const [topics, setTopics] = useState<TrendingTopic[]>([])

  useEffect(() => {
    // Fetch trending topics
    const fetchTopics = async () => {
      try {
        // This would fetch from an API endpoint
        // For now, showing placeholder
        setTopics([
          { id: '1', topic: '#thoughts', count: 234 },
          { id: '2', topic: '#ideas', count: 189 },
          { id: '3', topic: '#inspiration', count: 156 },
          { id: '4', topic: '#creativity', count: 142 },
          { id: '5', topic: '#wisdom', count: 98 },
        ])
      } catch (error) {
        console.error('Failed to fetch trending topics:', error)
      }
    }

    fetchTopics()
  }, [])

  return (
    <div className="bg-secondary border border-border rounded-lg p-6 sticky top-4">
      <h2 className="text-xl font-bold text-accent mb-4">Trending</h2>
      <div className="space-y-3">
        {topics.map((topic) => (
          <a
            key={topic.id}
            href={`/search?q=${encodeURIComponent(topic.topic)}`}
            className="block p-3 rounded-lg bg-primary hover:bg-border/50 transition-colors cursor-pointer"
          >
            <p className="font-semibold text-text hover:text-accent">{topic.topic}</p>
            <p className="text-sm text-text-muted">{topic.count} posts</p>
          </a>
        ))}
      </div>
    </div>
  )
}