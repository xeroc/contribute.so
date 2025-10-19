'use client'

import { useState, useEffect } from 'react'
import { Button } from '@heroui/react'
import { getUserRepositories, saveUserSetup } from './githubactions'
import { type GitHubRepo } from '~/utils/github'

interface GithubSetupProps {
  walletPublicKey: string
  onComplete: () => void
}

export function GithubSetup({ walletPublicKey, onComplete }: GithubSetupProps) {
  const [repositories, setRepositories] = useState<GitHubRepo[]>([])
  const [selectedRepo, setSelectedRepo] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    fetchRepositories()
  }, [])

  const fetchRepositories = async () => {
    try {
      setLoading(true)
      const repos = await getUserRepositories()
      setRepositories(repos)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch repositories')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveSetup = async () => {
    if (!selectedRepo) {
      setError('Please select a repository')
      return
    }

    try {
      setLoading(true)
      await saveUserSetup(selectedRepo, walletPublicKey)
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
        <h2 className="text-2xl font-bold mb-2">Connect GitHub Repository</h2>
        <p className="text-gray-400">Select a repository to enable donations</p>
      </div>

      {error && (
        <div className="bg-red-900/50 border border-red-500 text-red-200 p-4 rounded-lg">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-300">
          Choose Repository
        </label>
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-2">Loading repositories...</span>
          </div>
        ) : repositories.length > 0 ? (
          <select
            value={selectedRepo}
            onChange={(e) => setSelectedRepo(e.target.value)}
            className="w-full p-3 border border-gray-600 rounded-lg bg-gray-800 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select a repository...</option>
            {repositories.map((repo) => (
              <option key={repo.id} value={repo.full_name}>
                {repo.full_name}
              </option>
            ))}
          </select>
        ) : (
          <div className="text-center p-8 bg-gray-800 rounded-lg">
            <p className="text-gray-400">No public repositories found</p>
            <p className="text-sm text-gray-500 mt-2">
              Make sure your GitHub account has public repositories
            </p>
          </div>
        )}
      </div>

      <Button
        onClick={handleSaveSetup}
        disabled={!selectedRepo || loading}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600"
        size="lg"
      >
        {loading ? 'Setting up...' : 'Complete GitHub Setup'}
      </Button>
    </div>
  )
}