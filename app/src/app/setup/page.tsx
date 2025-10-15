'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { Layout } from '~/app/_components/layout'
import { getUserRepositories, saveUserSetup, getUserSetupsAction } from './actions'
import { type GitHubRepo } from '~/utils/github'
import { Button } from '@heroui/react'
import Link from 'next/link'

interface UserSetup {
  id: string
  userId: string
  provider: string
  repository: string
  walletPublicKey: string
  createdAt: Date | null
}

// Dynamically import components for better loading
const Auth = dynamic(() => import('~/app/_components/auth').then((mod) => ({ default: mod.Auth })), {
  loading: () => <div>Loading auth...</div>,
})

const WalletButton = dynamic(
  () => import('~/app/_components/wallet-button').then((mod) => ({ default: mod.WalletButton })),
  {
    loading: () => <div>Loading wallet...</div>,
  },
)

export default function Setup() {
  const { data: session, status } = useSession()
  const [repositories, setRepositories] = useState<GitHubRepo[]>([])
  const [setups, setSetups] = useState<UserSetup[]>([])
  const [selectedRepo, setSelectedRepo] = useState<string>('')
  const [walletConnected, setWalletConnected] = useState(false)
  const [walletPublicKey, setWalletPublicKey] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    if (session?.user) {
      fetchRepositories().catch(console.error)
      fetchSetups().catch(console.error)
    }
  }, [session])

  const fetchSetups = async () => {
    try {
      const userSetups = await getUserSetupsAction()
      setSetups(userSetups)
    } catch (err) {
      console.error('Failed to fetch setups:', err)
    }
  }

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
    if (!selectedRepo || !walletPublicKey) {
      setError('Please select a repository and connect your wallet')
      return
    }

    try {
      setLoading(true)
      await saveUserSetup(selectedRepo, walletPublicKey)
      // Refresh setups
      await fetchSetups()
      // Reset form
      setSelectedRepo('')
      setWalletConnected(false)
      setWalletPublicKey('')
      alert('Setup completed successfully!')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save setup')
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading') {
    return (
      <Layout>
        <div className="flex min-h-screen items-center justify-center">
          <div>Loading...</div>
        </div>
      </Layout>
    )
  }

  if (!session) {
    return (
      <Layout>
        <div className="flex min-h-screen flex-col items-center justify-center pt-16">
          <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
            <h1 className="text-2xl font-bold">Login Required</h1>
            <p className="text-gray-300">Please login with GitHub to continue</p>
            <Auth />
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="flex min-h-screen flex-col items-center justify-center pt-16">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 max-w-4xl">
          <h1 className="text-3xl font-bold">Setup Your Repository Donations</h1>

          {/* Existing Setups */}
          {setups.length > 0 && (
            <div className="w-full">
              <h2 className="text-xl font-semibold mb-4">Your Existing Setups</h2>
              <div className="overflow-x-auto">
                <table className="w-full bg-gray-800 rounded-lg overflow-hidden">
                  <thead className="bg-gray-700">
                    <tr>
                      <th className="px-4 py-2 text-left">Repository</th>
                      <th className="px-4 py-2 text-left">Wallet</th>
                      <th className="px-4 py-2 text-left">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {setups.map((setup) => (
                      <tr key={setup.id} className="border-t border-gray-600">
                        <td className="px-4 py-2">
                          <Link href={`/${setup.provider}/${setup.repository}`}>{setup.repository}</Link>
                        </td>
                        <td className="px-4 py-2 font-mono text-sm">
                          {setup.walletPublicKey.slice(0, 8)}...{setup.walletPublicKey.slice(-8)}
                        </td>
                        <td className="px-4 py-2">
                          {setup.createdAt ? new Date(setup.createdAt).toLocaleDateString() : 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {error && <div className="text-red-500 bg-red-100 p-4 rounded">{error}</div>}

          {/* Repository Selection */}
          <div className="w-full">
            <h2 className="text-xl font-semibold mb-4">Select Repository</h2>
            {loading ? (
              <div>Loading repositories...</div>
            ) : repositories.length > 0 ? (
              <select
                value={selectedRepo}
                onChange={(e) => setSelectedRepo(e.target.value)}
                className="w-full p-2 border rounded bg-gray-800 text-white"
              >
                <option value="">Choose a repository...</option>
                {repositories.map((repo) => (
                  <option key={repo.id} value={repo.full_name}>
                    {repo.full_name}
                  </option>
                ))}
              </select>
            ) : (
              <div>No public repositories found</div>
            )}
          </div>

          {/* Wallet Connection */}
          <div className="w-full">
            <h2 className="text-xl font-semibold mb-4">Connect Wallet</h2>
            <WalletButton
              onConnect={(publicKey) => {
                setWalletPublicKey(publicKey)
                setWalletConnected(true)
              }}
            />
            {walletConnected && (
              <p className="text-green-500 mt-2">Wallet connected: {walletPublicKey.slice(0, 8)}...</p>
            )}
          </div>

          {/* Save Setup */}
          <Button onClick={handleSaveSetup} disabled={!selectedRepo || !walletConnected || loading} className="w-full">
            {loading ? 'Saving...' : 'Complete Setup'}
          </Button>
        </div>
      </div>
    </Layout>
  )
}
