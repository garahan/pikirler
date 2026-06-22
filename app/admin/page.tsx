'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminPanel() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })

      if (response.ok) {
        setIsAuthenticated(true)
        setError('')
      } else {
        setError('Invalid password')
      }
    } catch (err) {
      setError('Authentication failed')
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="bg-secondary p-8 rounded-lg w-full max-w-md">
          <h1 className="text-2xl font-bold text-accent mb-6">Admin Panel</h1>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              placeholder="Admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 bg-primary border border-border rounded-lg text-text mb-4"
            />
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <button
              type="submit"
              className="w-full bg-accent text-primary font-bold py-2 rounded-lg hover:bg-accent/80"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-primary">
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <h1 className="text-3xl font-bold text-accent mb-8">Admin Panel</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-secondary p-6 rounded-lg border border-border">
            <h2 className="text-xl font-bold text-accent mb-4">Bulk Upload</h2>
            <p className="text-text-muted mb-4">Upload posts from JSON</p>
            <button className="bg-accent text-primary font-bold py-2 px-4 rounded-lg hover:bg-accent/80">
              Upload JSON
            </button>
          </div>

          <div className="bg-secondary p-6 rounded-lg border border-border">
            <h2 className="text-xl font-bold text-accent mb-4">Settings</h2>
            <p className="text-text-muted mb-4">Configure active hours</p>
            <button className="bg-accent text-primary font-bold py-2 px-4 rounded-lg hover:bg-accent/80">
              Edit Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}