'use client'

import { SubscriptionButton, PaymentInterval } from '@tributary-so/sdk-react'
import { PublicKey } from '@solana/web3.js'
import { BN } from '@coral-xyz/anchor'
import { env } from '~/env'

interface SubscriptionSectionProps {
  walletPublicKey: string
  repository: string
}

export function DonationButton({ walletPublicKey, repository }: SubscriptionSectionProps) {
  let recipient: PublicKey
  let gateway: PublicKey
  try {
    recipient = new PublicKey(walletPublicKey)
    gateway = new PublicKey(env.NEXT_PUBLIC_PAYMENT_GATEWAY_PUBLIC_KEY)
  } catch {
    console.error('Invalid wallet or gateway public key')
    return <div>Invalid configuration</div>
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Support This Repository</h2>
      <SubscriptionButton
        amount={new BN('10000000')}
        token={new PublicKey('4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU')} // USDC mint
        recipient={recipient}
        gateway={gateway}
        interval={PaymentInterval.Weekly}
        maxRenewals={12}
        memo={`Monthly donation to ${repository}`}
        label="Donate $10/month"
        radius="sm"
        size="lg"
        executeImmediately={true}
        // className="bg-gradient-to-r from-[#9945FF] to-[#14F195] bg-clip-text text-transparent font-bold text-xl px-6 py-3 rounded-lg font-semibold border-1"
        className="bg-primary-500 hover:bg-primary-600 text-foreground px-6 py-3 rounded-lg font-semibold"
        onSuccess={(tx) => console.log('Donation successful:', tx)}
        onError={(err) => console.error('Donation failed:', err)}
      />
      <p className="text-sm text-default-600 mt-2">Set up automated monthly donations in USDC via Solana blockchain</p>
    </div>
  )
}
