'use client'

import { useState } from 'react'
import { Snippet, Button } from '@heroui/react'
import { DonationButton } from '~/app/_components/donation-button'
import Link from 'next/link'
import confetti from 'canvas-confetti'
import SubscriptionInfo, { type SetupData } from '../_components/SubscriptionInfo'

interface SetupCompletionProps {
  provider: string
  repository: string
  walletPublicKey: string
}

export function SetupCompletion({ provider, repository, walletPublicKey }: SetupCompletionProps) {
  const [copied, setCopied] = useState(false)
  const url = window.location.origin.includes('localhost')
    ? `http://localhost:3000/${provider}/${repository}`
    : `https://contribute.so/${provider}/${repository}`
  const imgUrl = `https://img.shields.io/badge/%F0%9F%A4%91 contribute.so-${repository}-blue`

  confetti()?.catch(console.log)
  const setupData: SetupData = {
    provider,
    repository,
    fullRepository: repository,
    walletPublicKey: walletPublicKey,
    createdAt: null,
    userName: null,
  }

  const handleCopy = async () => {
    const markdown = `[![🤑](https://img.shields.io/badge/%F0%9F%A4%91-contribute-blue)](${url})`
    await navigator.clipboard.writeText(markdown)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-success rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold mb-2">Setup Complete!</h2>
        <p className="text-default-600">
          Your {provider === 'github' ? 'repository' : 'account'} is now connected for donations.
        </p>

        <SubscriptionInfo setupData={setupData} />

        <div className="bg-content1 rounded-lg p-6 space-y-4">
          <h3 className="text-lg font-semibold">Share Your Donation Link</h3>
          <p className="text-default-600">Use this badge to display your donation link:</p>
          <div className="p-4 rounded-lg flex justify-center">
            <Link href={url}>
              <img src={imgUrl} alt="Contribute.so/{provider}/{repository}" />
            </Link>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Markdown snippet:</h3>
            <Snippet
              variant="bordered"
              symbol=""
              className="w-full"
              classNames={{
                base: 'w-full',
                pre: 'w-full overflow-x-auto whitespace-pre-wrap break-all',
              }}
            >
              <p className="break-all text-left">
                [![🤑]({imgUrl})]({url})
              </p>
            </Snippet>
            <Button onClick={handleCopy} size="sm" className="w-full mt-2">
              {copied ? '✅ Copied!' : '📋 Copy markdown'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
