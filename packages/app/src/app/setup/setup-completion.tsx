'use client'

import { DonationButton } from '~/app/_components/donation-button'
import { Button } from '@heroui/react'
import Link from 'next/link'

interface SetupCompletionProps {
  provider: string
  repository: string
  walletPublicKey: string
}

export function SetupCompletion({ provider, repository, walletPublicKey }: SetupCompletionProps) {
  return (
    <div className="w-full max-w-2xl mx-auto space-y-8">
      <div className="text-center">
        <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold mb-2">Setup Complete!</h2>
        <p className="text-gray-400">
          Your {provider === 'github' ? 'repository' : 'account'} is now connected for donations.
        </p>
      </div>

      <div className="bg-gray-800 rounded-lg p-6 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-gray-300">Provider:</span>
          <span className="font-medium capitalize">{provider}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-300">{provider === 'github' ? 'Repository:' : 'Username:'}</span>
          <span className="font-medium">{repository}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-300">Wallet:</span>
          <span className="font-mono text-sm">
            {walletPublicKey.slice(0, 8)}...{walletPublicKey.slice(-8)}
          </span>
        </div>
      </div>

      {provider === 'github' && (
        <div className="bg-blue-900/20 border border-blue-500 rounded-lg p-6">
          <DonationButton walletPublicKey={walletPublicKey} repository={repository} />
        </div>
      )}

      <div className="flex gap-4">
        <Button as={Link} href="/" variant="bordered" className="flex-1">
          Go Home
        </Button>
        <Button as={Link} href={`/${provider}/${repository}`} className="flex-1 bg-blue-600 hover:bg-blue-700">
          View {provider === 'github' ? 'Repository' : 'Profile'}
        </Button>
      </div>
    </div>
  )
}