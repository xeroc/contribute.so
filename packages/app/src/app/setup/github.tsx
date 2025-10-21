'use client'

import { useState, useEffect } from 'react'
import { Select, SelectItem, Button } from '@heroui/react'
import { getUserRepositories, saveUserSetup } from './githubactions'
import { type GitHubRepo } from '~/utils/github'
import { GitFolder } from '../icons'

interface GithubSetupProps {
  walletPublicKey: string
  onComplete: (repository: string) => void
}

export function GithubSetup({ walletPublicKey, onComplete }: GithubSetupProps) {
  const [repositories, setRepositories] = useState<GitHubRepo[]>([])
  const [selectedRepo, setSelectedRepo] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')

  const iconClasses = 'text-xl text-default-500 pointer-events-none shrink-0'

  useEffect(() => {
    fetchRepositories().catch(console.error)
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
      onComplete(selectedRepo)
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
        <p className="text-default-600">Select a repository to enable donations</p>
      </div>

      {error && <div className="bg-danger/50 border border-danger text-danger-foreground p-4 rounded-lg">{error}</div>}

      <div className="space-y-4">
        <label className="block text-sm font-medium text-default-700">Choose Repository</label>
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-2">Loading repositories...</span>
          </div>
        ) : repositories.length > 0 ? (
          <Select
            placeholder="Select a repository..."
            selectedKeys={selectedRepo ? [selectedRepo] : []}
            onSelectionChange={(keys) => setSelectedRepo(Array.from(keys)[0] as string)}
            className="w-full"
          >
            {repositories.map((repo) => (
              <SelectItem
                key={repo.full_name}
                description={repo.description ?? 'No description'}
                startContent={<GitFolder className={iconClasses} />}
              >
                {repo.full_name}
              </SelectItem>
            ))}
          </Select>
        ) : (
          <div className="text-center p-8 bg-content1 rounded-lg">
            <p className="text-default-600">No public repositories found</p>
            <p className="text-sm text-default-600 mt-2">Make sure your GitHub account has public repositories</p>
          </div>
        )}
      </div>

      <Button onClick={handleSaveSetup} disabled={!selectedRepo || loading} className="w-full" size="lg">
        {loading ? 'Setting up...' : 'Complete GitHub Setup'}
      </Button>
    </div>
  )
}
