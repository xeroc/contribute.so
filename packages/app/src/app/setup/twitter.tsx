'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { saveUserSetup } from './githubactions'

interface TwitterSetupProps {
  walletPublicKey: string
  onComplete: (username: string) => void
}

export function TwitterSetup({ walletPublicKey, onComplete }: TwitterSetupProps) {
  const { data: session } = useSession()
  const [username, setUsername] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    console.log(session)
    if (session?.user?.username) {
      const cleanUsername = session.user.username.replace('@', '')
      setUsername(cleanUsername)
      handleAutoSetup(cleanUsername)
    }
  }, [session])

  const handleAutoSetup = async (cleanUsername: string) => {
    try {
      setLoading(true)
      await saveUserSetup(cleanUsername, walletPublicKey, 'twitter')
      onComplete(cleanUsername)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save setup')
    } finally {
      setLoading(false)
    }
  }

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
      onComplete(cleanUsername)
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
        <p className="text-gray-400">Connecting your Twitter account...</p>
      </div>

      {error && <div className="bg-red-900/50 border border-red-500 text-red-200 p-4 rounded-lg">{error}</div>}

      {loading ? (
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2">Setting up...</span>
        </div>
      ) : username ? (
        <div className="text-center p-8 bg-green-900/20 border border-green-500 rounded-lg">
          <p className="text-green-200">Connected as @{username}</p>
        </div>
      ) : (
        <div className="text-center p-8 bg-gray-800 rounded-lg">
          <p className="text-gray-400">Loading Twitter account...</p>
        </div>
      )}
    </div>
  )
}
