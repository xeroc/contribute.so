'use client'

import { useState } from 'react'
import { Button } from '@heroui/react'
import { saveUserSetup } from './githubactions'

interface TwitterSetupProps {
  walletPublicKey: string
  onComplete: () => void
}

export function TwitterSetup({ walletPublicKey, onComplete }: TwitterSetupProps) {
  const [username, setUsername] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')

  const handleSaveSetup = async () => {
    if (!username.trim()) {
      setError('Please enter your Twitter username')
      return
    }

    // Remove @ if present
    const cleanUsername = username.replace('@', '')

    try {
      setLoading(true)
      await saveUserSetup(cleanUsername, walletPublicKey, 'twitter')
      onComplete()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save setup')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Connect Twitter Account</h2>
        <p className="text-gray-400">Enter your Twitter username to enable donations</p>
      </div>

      {error && (
        <div className="bg-red-900/50 border border-red-500 text-red-200 p-4 rounded-lg">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-300">
          Twitter Username
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">@</span>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="yourusername"
            className="w-full pl-8 pr-3 py-3 border border-gray-600 rounded-lg bg-gray-800 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <p className="text-sm text-gray-500">
          Enter your Twitter username without the @ symbol
        </p>
      </div>

      <Button
        onClick={handleSaveSetup}
        disabled={!username.trim() || loading}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600"
        size="lg"
      >
        {loading ? 'Setting up...' : 'Complete Twitter Setup'}
      </Button>
    </div>
  )
}